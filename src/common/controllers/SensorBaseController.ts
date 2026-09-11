import { NodeMessage } from 'node-red';
import slugify from 'slugify';

import InputOutputController, {
    InputOutputControllerOptions,
    InputProperties,
} from '../../common/controllers/InputOutputController';
import NoConnectionError from '../../common/errors/NoConnectionError';
import { DataSource, ParsedMessage } from '../../common/services/InputService';
import {
    COMPANION_MIN_VERSION_ENTITY_AVAILABLE,
    TypedInputTypes,
} from '../../const';
import {
    companionSupportsEntityAvailable,
    isDefaultAvailableConfig,
} from '../../helpers/entityAvailable';
import { parseAvailableValue } from '../../helpers/utils';
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

function formatAvailableValue(value: unknown): string {
    if (typeof value === 'string') {
        return value;
    }
    try {
        const encoded = JSON.stringify(value);
        return encoded === undefined ? String(value) : encoded;
    } catch {
        return String(value);
    }
}

interface Attribute {
    property: string;
    value: any;
    valueType: TypedInputTypes;
}

export interface SensorBaseNodeProperties extends EntityBaseNodeProperties {
    state: string;
    stateType: string;
    available: string;
    availableType: string;
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

        // Two gates (editor config vs msg override) — both reject on old companions.
        const usesCustomAvailable = !isDefaultAvailableConfig(
            this.node.config.available,
            this.node.config.availableType,
        );
        if (usesCustomAvailable) {
            this.#assertCompanionSupportsAvailable();
        }
        const availableOverridden =
            this.node.config.inputOverride !== 'block' &&
            (parsedMessage.available?.source === DataSource.Message ||
                parsedMessage.availableType?.source === DataSource.Message);
        if (availableOverridden) {
            this.#assertCompanionSupportsAvailable();
        }

        const availableOrMissing = await this.#resolveAvailable(
            parsedMessage,
            message,
        );

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

        const attributes = await this.#resolveAttributes(
            parsedMessage,
            message,
        );

        // Constants and resolved msg paths send; missing paths are omitted.
        // Old companions: omit default bool/true (V3). Custom config / overrides
        // already threw above.
        let available = availableOrMissing;
        if (
            available !== undefined &&
            !companionSupportsEntityAvailable(
                this.homeAssistant.integrationVersion,
            )
        ) {
            available = undefined;
        }

        if (
            state === undefined &&
            attributes === undefined &&
            available === undefined
        ) {
            this.status.set({
                fill: 'grey',
                shape: 'dot',
                text: '',
            });
            send(message);
            done();
            return;
        }

        let payload: EntityMessage | undefined;
        try {
            payload = await this.integration?.updateStateAndAttributes(
                state,
                attributes,
                available,
            );
        } catch (err) {
            if (isHomeAssistantApiError(err)) {
                throw new HomeAssistantError(err, 'home-assistant.error.error');
            }

            throw new Error(`Error updating entity. ${JSON.stringify(err)}`);
        }

        if (available === false) {
            this.status.setUnavailable();
        } else if (state !== undefined) {
            this.status.setSuccess(state);
        } else {
            this.status.setSuccess();
        }
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

    #assertCompanionSupportsAvailable(): void {
        if (
            companionSupportsEntityAvailable(
                this.homeAssistant.integrationVersion,
            )
        ) {
            return;
        }
        throw new InputError(
            [
                'home-assistant.error.companion_version_required',
                {
                    min_version: COMPANION_MIN_VERSION_ENTITY_AVAILABLE,
                    version: this.homeAssistant.integrationVersion,
                },
            ],
            'home-assistant.status.companion_version',
        );
    }

    /**
     * Resolve Available from config/message.
     * @returns `boolean` when a value was present and valid; `undefined` when
     * the typed-input path was missing (omit from the wire).
     * Throws when a value was present but not a clear boolean.
     */
    async #resolveAvailable(
        parsedMessage: ParsedMessage,
        message: NodeMessage,
    ): Promise<boolean | undefined> {
        let available = parsedMessage.available?.value;
        let availableType = parsedMessage.availableType?.value;
        if (this.node.config.inputOverride === 'block') {
            available = this.node.config.available;
            availableType = this.node.config.availableType;
        } else if (
            parsedMessage.available?.source === DataSource.Message &&
            availableType !== 'message'
        ) {
            // Message already carries the raw value; pass through like state
            availableType = 'str';
        }

        const raw = await this.typedInputService.getValue(
            available,
            availableType,
            { message },
        );

        // Path/context missing — omit Available from this update
        if (raw === undefined) {
            return undefined;
        }

        const parsed = parseAvailableValue(raw);
        if (parsed === undefined) {
            throw new InputError(
                [
                    'home-assistant.error.invalid_available',
                    { value: formatAvailableValue(raw) },
                ],
                'home-assistant.status.invalid_input',
            );
        }
        return parsed;
    }

    /**
     * Resolve attributes from config/message.
     * @returns a non-empty object to send, or `undefined` to omit attributes.
     */
    async #resolveAttributes(
        parsedMessage: ParsedMessage,
        message: NodeMessage,
    ): Promise<Record<string, any> | undefined> {
        const attributeRows = this.#getAttributes(parsedMessage);
        if (!attributeRows.length) {
            return undefined;
        }

        let attr: Record<string, any> = {};
        try {
            attr = await attributeRows.reduce(
                async (acc, cur) => {
                    const attrs = await acc;
                    const property = slugify(cur.property, {
                        replacement: '_',
                        remove: /[^A-Za-z0-9-_~ ]/,
                        lower: true,
                    });
                    if (!property) {
                        return attrs;
                    }

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

        return Object.keys(attr).length ? attr : undefined;
    }

    #getAttributes(parsedMessage: ParsedMessage): Attribute[] {
        let attributes: Attribute[] = [];
        if (
            parsedMessage.attributes?.source !== 'message' ||
            this.node.config.inputOverride === 'block'
        ) {
            attributes = this.node.config.attributes ?? [];
        } else {
            const value = parsedMessage.attributes.value;
            if (value === undefined || value === null) {
                return this.node.config.inputOverride === 'merge'
                    ? [...(this.node.config.attributes ?? [])]
                    : [];
            }
            if (this.node.config.inputOverride === 'merge') {
                const keys = Object.keys(value).map((e) => e.toLowerCase());
                this.node.config.attributes.forEach((ele) => {
                    if (!keys.includes(ele.property.toLowerCase())) {
                        attributes.push(ele);
                    }
                });
            }
            for (const [prop, val] of Object.entries(value)) {
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
