import State from '../State';
import BidirectionalIntegration from './BidirectionalEntityIntegration';
import { EntityMessage } from './UnidirectionalEntityIntegration';

export default class ValueEntityIntegration extends BidirectionalIntegration {
    protected getStateData(state?: State): Partial<EntityMessage> {
        const lastPayload = state?.getLastPayload();
        if (!lastPayload) {
            return {};
        }

        return lastPayload;
    }
}
