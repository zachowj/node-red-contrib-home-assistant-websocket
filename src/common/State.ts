import { BaseNode, NodeDone } from '../types/nodes';
import Storage, { LastPayloadData } from './Storage';

export default class State {
    #enabled = true;
    #lastPayload?: LastPayloadData;
    #node: BaseNode;

    constructor(node: BaseNode) {
        this.#node = node;
        this.#enabled = Storage.getNodeData(node.id, 'isEnabled') ?? true;
        this.#lastPayload = Storage.getNodeData(node.id, 'lastPayload');

        node.on('close', this.#onClose.bind(this));
    }

    async #onClose(removed: boolean, done: NodeDone) {
        if (removed) {
            await Storage.removeNodeData(this.#node.id).catch(done);
        }
        done();
    }

    isEnabled(): boolean {
        return this.#enabled;
    }

    async setEnabled(state: boolean) {
        this.#enabled = state;
        await Storage.saveNodeData(this.#node.id, 'isEnabled', state).catch(
            this.#node.error
        );
    }

    async setLastPayload(payload: LastPayloadData) {
        this.#lastPayload = payload;
        await Storage.saveNodeData(this.#node.id, 'lastPayload', payload).catch(
            this.#node.error
        );
    }

    getLastPayload(): LastPayloadData | undefined {
        return this.#lastPayload;
    }
}
