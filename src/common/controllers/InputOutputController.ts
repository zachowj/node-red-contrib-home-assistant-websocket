import Joi from 'joi';
import { NodeMessageInFlow } from 'node-red';

import {
    BaseNode,
    NodeDone,
    NodeMessage,
    NodeProperties,
    NodeSend,
} from '../../types/nodes';
import { inputErrorHandler } from '../errors/inputErrorHandler';
import { NodeEvent } from '../events/Events';
import Integration from '../integration/Integration';
import InputService, { ParsedMessage } from '../services/InputService';
import OutputController, {
    OutputControllerConstructor,
} from './OutputController';

export interface InputOutputControllerOptions<
    T extends BaseNode,
    C extends NodeProperties
> extends OutputControllerConstructor<T> {
    inputService: InputService<C>;
    integration?: Integration;
}

export interface InputProperties {
    done: NodeDone;
    message: NodeMessage;
    parsedMessage: ParsedMessage;
    send: NodeSend;
}

type OptionalInputHandler = (
    message: NodeMessageInFlow,
    send: NodeSend
) => Promise<boolean> | boolean;

interface OptionalInput {
    schema: Joi.ObjectSchema;
    handler: OptionalInputHandler;
}

export default class InputOutputController<
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
        if (this.#optionalInputs.size) {
            for (const [, { schema, handler }] of this.#optionalInputs) {
                let validSchema = false;
                try {
                    validSchema = InputService.validateSchema(schema, message);
                } catch (e) {} // silent fail

                if (validSchema) {
                    try {
                        if (await handler(message, send)) {
                            done();
                            return;
                        }
                    } catch (error) {
                        inputErrorHandler(error, { done, status: this.status });
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
            inputErrorHandler(e, { done, status: this.status });
        }
    }

    protected onInput?({
        done,
        message,
        parsedMessage,
        send,
    }: InputProperties): Promise<void>;

    public addOptionalInput(
        key: string,
        schema: Joi.ObjectSchema,
        handler: OptionalInputHandler
    ) {
        this.#optionalInputs.set(key, {
            schema,
            handler,
        });
    }

    protected removeOptionalInput(key: string) {
        this.#optionalInputs.delete(key);
    }
}
