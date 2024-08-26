import { storageService } from '../globals';
import { BaseNode, NodeDone } from '../types/nodes';
import { NodeEvent } from './events/Events';
import { LastPayloadData } from './services/Storage';

export default class State {
    #enabled = true;
    #lastPayload?: LastPayloadData;
    #node: BaseNode;

    constructor(node: BaseNode) {
        this.#node = node;
        this.#enabled =
            storageService.getNodeData(node.id, 'isEnabled') ?? true;
        this.#lastPayload = storageService.getNodeData(node.id, 'lastPayload');

        node.on(NodeEvent.Close, this.#onClose.bind(this));
    }

    async #onClose(removed: boolean, done: NodeDone) {
        if (removed) {
            await storageService.removeNodeData(this.#node.id).catch(done);
        }
        done();
    }

    isEnabled(): boolean {
        return this.#enabled;
    }

    async setEnabled(state: boolean) {
        this.#enabled = state;
        await storageService
            .saveNodeData(this.#node.id, 'isEnabled', state)
            .catch(this.#node.error);
        this.#emitChange();
    }

    async setLastPayload(payload: LastPayloadData) {
        this.#lastPayload = payload;
        await storageService
            .saveNodeData(this.#node.id, 'lastPayload', payload)
            .catch(this.#node.error);
        this.#emitChange();
    }

    getLastPayload(): LastPayloadData | undefined {
        return this.#lastPayload;
    }

    #emitChange(): void {
        this.#node.emit(NodeEvent.StateChanged, {
            isEnabled: this.#enabled,
            lastPayload: this.#lastPayload,
        });
    }
}
