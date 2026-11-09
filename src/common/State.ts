import { BaseNode, NodeDone } from '../types/nodes';
import { NodeEvent } from './events/Events';
import storageService, { LastPayloadData } from './services/StorageService';

export default class State {
    #enabled = false;
    #lastPayload?: LastPayloadData;
    #node: BaseNode;
    #closed = false;
    #loaded = false;
    readonly ready: Promise<void>;

    constructor(node: BaseNode) {
        this.#node = node;
        if (storageService.isReady()) {
            this.#restore();
            this.ready = Promise.resolve();
        } else {
            this.ready = storageService.attach(node).then(() => {
                this.#restore();
                if (!this.#closed) this.#emitChange();
            });
        }
        this.ready.catch((error) => node.error(error));

        node.on(NodeEvent.Close, this.#onClose.bind(this));
    }

    async #onClose(removed: boolean, done: NodeDone) {
        this.#closed = true;
        try {
            if (removed) await storageService.removeNodeData(this.#node.id);
            done();
        } catch (error) {
            done(error as Error);
        }
    }

    isEnabled(): boolean {
        this.#restore();
        return this.#enabled;
    }

    isClosed(): boolean {
        return this.#closed;
    }

    async setEnabled(state: boolean) {
        if (!this.#loaded) await this.ready;
        this.#enabled = state;
        await storageService
            .saveNodeData(this.#node.id, 'isEnabled', state)
            .catch(this.#node.error);
        this.#emitChange();
    }

    async setLastPayload(payload: LastPayloadData) {
        if (!this.#loaded) await this.ready;
        this.#lastPayload = payload;
        await storageService
            .saveNodeData(this.#node.id, 'lastPayload', payload)
            .catch(this.#node.error);
        this.#emitChange();
    }

    getLastPayload(): LastPayloadData | undefined {
        this.#restore();
        return this.#lastPayload;
    }

    #restore(): void {
        if (this.#loaded || !storageService.isReady()) return;
        this.#enabled =
            storageService.getNodeData(this.#node.id, 'isEnabled') ?? true;
        this.#lastPayload = storageService.getNodeData(
            this.#node.id,
            'lastPayload',
        );
        this.#loaded = true;
    }

    #emitChange(): void {
        this.#node.emit(NodeEvent.StateChanged, {
            isEnabled: this.isEnabled(),
            lastPayload: this.getLastPayload(),
        });
    }
}
