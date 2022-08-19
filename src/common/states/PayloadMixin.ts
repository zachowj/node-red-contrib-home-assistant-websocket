import { GConstructor } from '../../types/mixins';
import State from './State';

export default function PayloadMixin<TBase extends GConstructor<State>>(
    Base: TBase
) {
    return class extends Base {
        #lastPayload: any;

        setLastPayload(payload: any): void {
            this.#lastPayload = payload;
        }

        getLastPayload(): any {
            return this.#lastPayload;
        }
    };
}
