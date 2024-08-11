import { HassServiceTarget } from 'home-assistant-js-websocket';
import { merge } from 'lodash';
import selectn from 'selectn';

import InputOutputController, {
    InputProperties,
} from '../../common/controllers/InputOutputController';
import InputError from '../../common/errors/InputError';
import NoConnectionError from '../../common/errors/NoConnectionError';
import { DataSource } from '../../common/services/InputService';
import { TypedInputTypes } from '../../const';
import { RED } from '../../globals';
import { generateRenderTemplate } from '../../helpers/mustache';
import { isNodeRedEnvVar } from '../../helpers/utils';
import { NodeMessage } from '../../types/nodes';
import { ActionNode, ActionNodeProperties } from '.';
import { Queue, QueueItem } from './const';

export default class ActionController extends InputOutputController<
    ActionNode,
    ActionNodeProperties
> {
    #queue: QueueItem[] = [];
    #hasDeprecatedWarned = false;

    protected async onInput({
        message,
        parsedMessage,
        send,
        done,
    }: InputProperties) {
        if (
            !this.homeAssistant.websocket.isConnected &&
            this.node.config.queue === Queue.None
        ) {
            throw new NoConnectionError();
        }

        const states = this.homeAssistant.websocket.getStates();

        const render = generateRenderTemplate(
            message,
            this.node.context(),
            states,
        );

        let action: string = parsedMessage.action.value;
        // TODO: Remove in version 1.0
        if (parsedMessage.action.source === DataSource.Transformed) {
            if (!this.#hasDeprecatedWarned) {
                this.#hasDeprecatedWarned = true;
                this.node.warn(
                    RED._('ha-action.error.domain_service_deprecated'),
                );
            }
        } else if (parsedMessage.action.source === DataSource.Config) {
            action = render(action);
        }

        const [domain, service] = action.toLowerCase().split('.');
        if (!domain || !service) {
            throw new InputError([
                'ha-action.error.invalid_action_format',
                { action },
            ]);
        }
        const target = this.#getTargetData(parsedMessage.target.value, message);

        const mergedData = await this.#mergeContextData(
            selectn('payload.data', message),
            message,
            render,
        );

        const queueItem: QueueItem = {
            domain,
            service,
            data: Object.keys(mergedData).length ? mergedData : undefined,
            target,
            message,
            done,
            send,
        };

        if (!this.homeAssistant.isConnected) {
            switch (this.node.config.queue) {
                case Queue.First:
                    if (this.#queue.length === 0) {
                        this.#queue = [queueItem];
                    }
                    break;
                case Queue.All:
                    this.#queue.push(queueItem);
                    break;
                case Queue.Last:
                    this.#queue = [queueItem];
                    break;
            }
            this.node.debug(
                `Queueing: ${JSON.stringify({
                    domain,
                    service,
                    target,
                    data: mergedData,
                })}`,
            );
            this.status.setText(`${this.#queue.length} queued`);
            return;
        }

        await this.#processInput(queueItem);
    }

    public async onClientReady() {
        while (this.#queue.length) {
            const item = this.#queue.pop();
            if (item) {
                await this.#processInput(item);
            }
        }
    }

    /**
     * Parses a JSON string into an object.
     *
     * @param data - The JSON string to parse.
     * @returns The parsed object.
     * @throws {InputError} If the JSON string is invalid.
     */
    #parseJSON(data: string) {
        try {
            return JSON.parse(data);
        } catch (e) {
            throw new InputError([
                'ha-action.error.invalid_json',
                { json: data },
            ]);
        }
    }

    /**
     * Checks if the provided data is a valid context data.
     *
     * @param data - The data to be checked.
     * @returns A boolean indicating whether the data is valid or not.
     */
    #isValidContextData(data: unknown): data is Record<string, string> {
        return (
            typeof data === 'object' &&
            !Array.isArray(data) &&
            data !== undefined &&
            data !== null
        );
    }

    /**
     * Merges the payload, message context, and rendered template data to create a final data object.
     * The priority order for merging is 'Config, Global Ctx, Flow Ctx, Payload' with the rightmost value winning.
     *
     * @param payload - The payload data to merge (default: {}).
     * @param message - The NodeMessage object containing the message context.
     * @param render - The function used to render the template.
     * @returns The merged data object.
     */
    async #mergeContextData(
        payload: Record<string, string> = {},
        message: NodeMessage,
        render: (template: string, altTags?: boolean) => string,
    ) {
        let configData: Record<string, unknown> = {};
        if (this.node.config.data.length) {
            switch (this.node.config.dataType) {
                case TypedInputTypes.JSONata:
                    configData = await this.jsonataService.evaluate(
                        this.node.config.data,
                        {
                            message,
                        },
                    );
                    break;
                case TypedInputTypes.JSON:
                    configData = this.#parseJSON(
                        render(
                            this.node.config.data,
                            this.node.config.mustacheAltTags,
                        ),
                    );

                    break;
            }
        }

        // Calculate payload to send end priority ends up being 'Config, Global Ctx, Flow Ctx, Payload' with right most winning
        let contextData: Record<string, string> = {};
        if (this.node.config.mergeContext) {
            const ctx = this.node.context();
            const flowVal = ctx.flow.get(this.node.config.mergeContext);
            const globalVal = ctx.global.get(this.node.config.mergeContext);

            if (this.#isValidContextData(globalVal)) {
                contextData = globalVal;
            }

            if (this.#isValidContextData(flowVal)) {
                contextData = { ...contextData, ...flowVal };
            }
        }

        return { ...configData, ...contextData, ...payload };
    }

    /**
     * Retrieves the target data for the service call.
     * @param payload The payload containing the target data.
     * @param message The NodeMessage object.
     * @returns The processed target data.
     */
    #getTargetData(payload: HassServiceTarget, message: NodeMessage) {
        const render = generateRenderTemplate(
            message,
            this.node.context(),
            this.homeAssistant.websocket.getStates(),
        );

        const map: Record<string, string> = {
            floorId: 'floor_id',
            areaId: 'area_id',
            deviceId: 'device_id',
            entityId: 'entity_id',
            labelId: 'label_id',
        };
        const configTarget: Record<string, any> = {};

        for (const key in map) {
            const prop = map[key];
            const target = this.node.config[
                key as keyof ActionNodeProperties
            ] as string[];
            configTarget[prop] = target ? [...target] : undefined;
            if (Array.isArray(configTarget[prop])) {
                // If length is 0 set it to undefined so the target can be overridden from the data field
                if (configTarget[prop].length === 0) {
                    configTarget[prop] = undefined;
                } else {
                    // Render env vars or mustache templates
                    configTarget[prop].forEach(
                        (target: string, index: number) => {
                            configTarget[prop][index] = isNodeRedEnvVar(target)
                                ? RED.util.evaluateNodeProperty(
                                      target,
                                      'env',
                                      this.node,
                                      message,
                                  )
                                : render(target);
                        },
                    );
                    // If prop has a length of 1 convert it to a string
                    if (configTarget[prop].length === 1) {
                        configTarget[prop] = configTarget[prop][0];
                    }
                }
            } else if (configTarget[prop] !== undefined) {
                configTarget[prop] = render(configTarget[prop]);
                if (prop === 'entity_id') {
                    // Convert possible comma delimited list to array
                    configTarget.entity_id = configTarget.entity_id.reduce(
                        (acc: string[], curr: string) =>
                            acc.concat(
                                curr.indexOf(',')
                                    ? curr.split(',').map((e) => e.trim())
                                    : curr,
                            ),
                        [],
                    );
                }
            }
        }
        const targets = merge(configTarget, payload);
        // remove undefined values
        Object.keys(targets).forEach(
            (key) => targets[key] === undefined && delete targets[key],
        );

        return targets;
    }

    async #processInput(queueItem: QueueItem) {
        const { domain, service, data, message, target, done, send } =
            queueItem;

        this.status.setSending();
        const debug = { domain, service, target, data };
        this.debugToClient(debug);
        this.node.debug(`Calling Service: ${JSON.stringify(debug)}`);
        const response = await this.homeAssistant.websocket.callService(
            domain,
            service,
            data,
            target,
        );

        this.status.setSuccess([
            'ha-action.status.service_called',
            { domain, service },
        ]);

        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                config: this.node.config,
                data: {
                    domain,
                    service,
                    data,
                    target,
                },
                results: response?.response,
            },
        );

        send(message);
        done();
    }
}
