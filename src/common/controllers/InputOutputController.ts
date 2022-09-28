import Joi from 'joi';
import { NodeMessageInFlow } from 'node-red';

import { RED } from '../../globals';
import {
    BaseNode,
    NodeDone,
    NodeMessage,
    NodeProperties,
    NodeSend,
} from '../../types/nodes';
import BaseError from '../errors/BaseError';
import { NodeEvent } from '../events/Events';
import Integration from '../integration/Integration';
import InputService, { ParsedMessage } from '../services/InputService';
import OutputController, { OutputControllerOptions } from './OutputController';

export interface InputOutputControllerOptions<
    T extends BaseNode,
    C extends NodeProperties
> extends OutputControllerOptions<T> {
    inputService: InputService<C>;
    integration?: Integration;
}

export interface InputProperties {
    done: NodeDone;
    message: NodeMessage;
    parsedMessage: ParsedMessage;
    send: NodeSend;
}

interface OptionalInput {
    schema: Joi.ObjectSchema;
    handler: (message: NodeMessageInFlow, send: NodeSend) => boolean;
}

export default abstract class InputOutputController<
    T extends BaseNode,
    K extends NodeProperties
> extends OutputController<T> {
    #optionalInputs = new Map<string, OptionalInput>();

    protected readonly inputService: InputService<K>;
    protected readonly integration?: Integration;

    constructor(params: InputOutputControllerOptions<T, K>) {
        super(params);
        this.inputService = params.inputService;
        this.integration = params.integration;
        params.node.on(NodeEvent.Input, this.#preOnInput.bind(this));
    }

    async #preOnInput(
        message: NodeMessageInFlow,
        send: NodeSend,
        done: NodeDone
    ) {
        // Run optional inputs
        if (!this.#optionalInputs.size) {
            for (const [, { schema, handler }] of this.#optionalInputs) {
                let validSchema = false;
                try {
                    validSchema = InputService.validateSchema(schema, message);
                } catch (e) {
                    // silent fail
                }
                if (validSchema) {
                    try {
                        if (handler(message, send)) {
                            done();
                            return;
                        }
                    } catch (error) {
                        this.#inputErrorHandler(error, done);
                    }
                }
            }
        }

        const parsedMessage = this.inputService.parse(message);

        try {
            this.inputService.validate(parsedMessage);

            await this.onInput?.({
                parsedMessage,
                message,
                send,
                done,
            });
        } catch (e) {
            this.#inputErrorHandler(e, done);
        }
    }

    protected abstract onInput?({
        done,
        message,
        parsedMessage,
        send,
    }: InputProperties): Promise<void>;

    #inputErrorHandler(e: unknown, done?: NodeDone) {
        let statusMessage = RED._('home-assistant.status.error');
        if (e instanceof Joi.ValidationError) {
            statusMessage = RED._('home-assistant.status.validation_error');
            done?.(e);
        } else if (e instanceof BaseError) {
            statusMessage = e.statusMessage;
            done?.(e);
        } else if (e instanceof Error) {
            done?.(e);
        } else if (typeof e === 'string') {
            done?.(new Error(e));
        } else {
            done?.(new Error(`Unrecognised error: ${e}`));
        }
        this.status.setFailed(statusMessage);
    }

    addOptionalInput(
        key: string,
        schema: Joi.ObjectSchema,
        callback: () => boolean
    ) {
        this.#optionalInputs.set(key, {
            schema,
            handler: callback,
        });
    }

    removeOptionalInput(key: string) {
        this.#optionalInputs.delete(key);
    }
}
