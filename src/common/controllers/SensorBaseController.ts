import slugify from 'slugify';

import InputOutputController, {
    InputOutputControllerOptions,
    InputProperties,
} from '../../common/controllers/InputOutputController';
import InvalidPropertyValueError from '../../common/errors/InvalidPropertyValueError';
import NoConnectionError from '../../common/errors/NoConnectionError';
import { DataSource, ParsedMessage } from '../../common/services/InputService';
import { TypedInputTypes } from '../../const';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import {
    BaseNode,
    EntityBaseNodeProperties,
    OutputProperty,
} from '../../types/nodes';
import BaseError from '../errors/BaseError';
import HomeAssistantError, {
    isHomeAssistantApiError,
} from '../errors/HomeAssistantError';
import InputError from '../errors/InputError';
import UnidirectionalEntityIntegration, {
    EntityMessage,
} from '../integration/UnidirectionalEntityIntegration';

interface Attribute {
    property: string;
    value: any;
    valueType: TypedInputTypes;
}

export interface SensorBaseNodeProperties extends EntityBaseNodeProperties {
    state: string;
    stateType: string;
    attributes: Attribute[];
    resend: boolean;
    inputOverride: 'allow' | 'block' | 'merge';
    outputProperties: OutputProperty[];
}

export interface SensorBaseNode extends BaseNode {
    config: SensorBaseNodeProperties;
}

export interface SensorBaseControllerOptions<
    T extends SensorBaseNode,
    P extends SensorBaseNodeProperties,
> extends InputOutputControllerOptions<T, P> {
    homeAssistant: HomeAssistant;
}

interface Attribute {
    property: string;
    value: any;
    valueType: TypedInputTypes;
}

export default abstract class SensorBase<
    T extends SensorBaseNode,
    P extends SensorBaseNodeProperties,
> extends InputOutputController<T, P> {
    protected readonly integration?: UnidirectionalEntityIntegration;

    async onInput({ parsedMessage, message, send, done }: InputProperties) {
        if (!this.integration?.isConnected) {
            throw new NoConnectionError();
        }

        if (!this.integration.isIntegrationLoaded) {
            throw new InputError(
                'home-assistant.error.integration_not_loaded',
                'home-assistant.error.error',
            );
        }

        let state = parsedMessage.state.value;
        let stateType = parsedMessage.stateType.value;
        if (this.node.config.inputOverride === 'block') {
            state = this.node.config.state;
            stateType = this.node.config.stateType;
        } else if (
            parsedMessage.state.source === DataSource.Message &&
            stateType !== 'message'
        ) {
            // Set default for state from input to string
            stateType = 'str';
        }

        state = await this.typedInputService.getValue(state, stateType, {
            message,
        });

        if (state === undefined) {
            throw new InvalidPropertyValueError(
                'home-assistant.error.invalid_state',
                'home-assistant.error.error',
            );
        }

        const attributes = this.#getAttributes(parsedMessage);
        let attr: Record<string, any> = {};
        try {
            attr = await attributes.reduce(
                async (acc, cur) => {
                    const attrs = await acc;
                    // Change string to lower-case and remove unwanted characters
                    const property = slugify(cur.property, {
                        replacement: '_',
                        remove: /[^A-Za-z0-9-_~ ]/,
                        lower: true,
                    });

                    attrs[property] = await this.typedInputService.getValue(
                        cur.value,
                        cur.valueType,
                        { message },
                    );
                    return attrs;
                },
                Promise.resolve({}) as Promise<Record<string, any>>,
            );
        } catch (e) {
            if (e instanceof BaseError) {
                throw e;
            }
            throw new InputError(`Attribute: ${e}`);
        }

        let payload: EntityMessage | undefined;
        try {
            payload = await this.integration?.updateStateAndAttributes(
                state,
                attr,
            );
            this.status.setSuccess(payload?.state);
        } catch (err) {
            if (isHomeAssistantApiError(err)) {
                throw new HomeAssistantError(err, 'home-assistant.error.error');
            }

            throw new Error(
                `Error updating state and attributes. ${JSON.stringify(err)}`,
            );
        }

        this.status.setSuccess(state);
        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                config: this.node.config,
                data: payload,
            },
        );
        send(message);
        done();
    }

    #getAttributes(parsedMessage: ParsedMessage): Attribute[] {
        let attributes = [];
        if (
            parsedMessage.attributes.source !== 'message' ||
            this.node.config.inputOverride === 'block'
        ) {
            attributes = this.node.config.attributes;
        } else {
            if (this.node.config.inputOverride === 'merge') {
                const keys = Object.keys(parsedMessage.attributes.value).map(
                    (e) => e.toLowerCase(),
                );
                this.node.config.attributes.forEach((ele) => {
                    if (!keys.includes(ele.property.toLowerCase())) {
                        attributes.push(ele);
                    }
                });
            }
            for (const [prop, val] of Object.entries(
                parsedMessage.attributes.value,
            )) {
                attributes.push({
                    property: prop,
                    value: val,
                    valueType: TypedInputTypes.String,
                });
            }
        }
        return attributes;
    }
}
