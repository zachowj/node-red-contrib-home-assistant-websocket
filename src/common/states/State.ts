export default class State {
    #enabled = true;

    isEnabled(): boolean {
        return this.#enabled;
    }

    setEnabled(state: boolean): void {
        this.#enabled = state;
    }
}
