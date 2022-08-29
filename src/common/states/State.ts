interface LastPayload {
    state: any;
    attributes: Record<string, any>;
}

export default class State {
    #enabled = true;
    #lastPayload: any;

    isEnabled(): boolean {
        return this.#enabled;
    }

    setEnabled(state: boolean): void {
        this.#enabled = state;
    }

    setLastPayload(payload: LastPayload): void {
        this.#lastPayload = payload;
    }

    getLastPayload(): LastPayload {
        return this.#lastPayload;
    }
}
