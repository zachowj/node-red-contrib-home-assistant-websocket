import { NodeMessage } from 'node-red';

import { BaseNode, NodeDone, NodeSend } from '../../types/nodes';
import InputService, { Results } from '../services/InputService';
import OutputController, { OutputControllerOptions } from './OutputController';

interface InputOutputControllerOptions<T> extends OutputControllerOptions<T> {
    inputService: InputService;
}
export default abstract class InputOutputController<
    T extends BaseNode
> extends OutputController<T> {
    protected readonly inputService: InputService;

    constructor({
        nodeRedContextService,
        inputService,
        node,
        state,
        status,
        typedInputService,
    }: InputOutputControllerOptions<T>) {
        super({
            nodeRedContextService,
            node,
            state,
            status,
            typedInputService,
        });
        this.inputService = inputService;
        node.on('input', this.preOnInput.bind(this));
    }

    private preOnInput(message: NodeMessage, send: NodeSend, done: NodeDone) {
        const parsedMessage = this.inputService.parse({}, message);

        try {
            this.inputService.validate({}, message);

            this.onInput?.({
                parsedMessage,
                message,
                send,
                done,
            });
        } catch (e) {
            // TODO: catch all errors and report them to the client
            // TODO: handle validation errors, created a new validation error type
            this.status.setFailed('Error');
            done(e as Error);
        }
    }

    protected abstract onInput?({
        done,
        message,
        parsedMessage,
        send,
    }: {
        done: NodeDone;
        message: NodeMessage;
        parsedMessage?: Results;
        send: NodeSend;
    }): void;
}
