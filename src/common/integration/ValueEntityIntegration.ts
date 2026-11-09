import { HaEvent } from '../../homeAssistant';
import { getErrorData } from '../errors/inputErrorHandler';
import State from '../State';
import BidirectionalEntityIntegration, {
    HaEventMessage,
} from './BidirectionalEntityIntegration';
import { IntegrationEvent } from './Integration';
import { EntityMessage } from './UnidirectionalEntityIntegration';

export default class ValueEntityIntegration extends BidirectionalEntityIntegration {
    protected onHaEventMessage(evt: HaEventMessage) {
        super.onHaEventMessage(evt);

        if (evt.type === HaEvent.ValueChange) {
            const value = evt.value;
            const previousValue = this.state.getLastPayload()?.state;

            this.updateValue(value).catch((err) => {
                this.entityConfigNode.error(
                    `Error updating entity. Error Message: ${getErrorData(err).error.message}`,
                );
            });
            this.entityConfigNode.emit(
                IntegrationEvent.ValueChange,
                value,
                previousValue,
            );
        }
    }

    protected getStateData(state?: State): Partial<EntityMessage> {
        const lastPayload = state?.getLastPayload();
        if (!lastPayload) {
            return {};
        }

        return lastPayload;
    }

    public async updateValue(value: string | number) {
        await this.updateHomeAssistant(value);
        await this.state.setLastPayload({
            state: value,
            attributes: {},
        });
    }
}
