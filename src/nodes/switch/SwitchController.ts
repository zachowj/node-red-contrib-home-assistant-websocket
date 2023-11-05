import InputOutputController, {
    InputOutputControllerOptions,
    InputProperties,
} from '../../common/controllers/InputOutputController';
import Events from '../../common/events/Events';
import BidirectionalIntegration, {
    StateChangePayload,
    TriggerPayload,
} from '../../common/integration/BidirectionalEntityIntegration';
import { RED } from '../../globals';
import { NodeMessage } from '../../types/nodes';
import { EntityConfigNode } from '../entity-config';
import { SwitchNode, SwitchNodeProperties } from '.';

enum OutputType {
    Input = 'input',
    StateChange = 'stateChange',
}

interface SwitchNodeConstructor
    extends InputOutputControllerOptions<SwitchNode, SwitchNodeProperties> {
    entityConfigEvents: Events;
    entityConfigNode: EntityConfigNode;
}

export default class SwitchController extends InputOutputController<
    SwitchNode,
    SwitchNodeProperties
> {
    #entityConfigNode: EntityConfigNode;
    #integration: BidirectionalIntegration;

    constructor(props: SwitchNodeConstructor) {
        super(props);
        this.#entityConfigNode = props.entityConfigNode;
        this.#integration = this.#entityConfigNode
            .integration as BidirectionalIntegration;
    }

    get #isSwitchEntityEnabled(): boolean {
        return this.#entityConfigNode.state.isEnabled();
    }

    set #isSwitchEntityEnabled(value: boolean) {
        this.#entityConfigNode.state.setEnabled(value);
    }

    protected async onInput({
        message,
        parsedMessage,
        send,
        done,
    }: InputProperties) {
        if (typeof parsedMessage.enable.value === 'boolean') {
            this.#isSwitchEntityEnabled = parsedMessage.enable.value;
            try {
                await this.#integration.updateHomeAssistant();
            } catch (e) {
                done(e as Error);
            }
            done();
            return;
        }

        message.outputType = OutputType.Input;
        if (this.#isSwitchEntityEnabled) {
            this.status.setSuccess(OutputType.Input);
            send(message);
        } else {
            this.status.setFailed(OutputType.Input);
            send([null, message]);
        }
    }

    public async onStateChange(payload: StateChangePayload) {
        if (!payload.changed || !this.node.config.outputOnStateChange) return;

        const message: NodeMessage = {};

        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                config: this.node.config,
                entity: {
                    state: this.#isSwitchEntityEnabled,
                },
                entityState: this.#isSwitchEntityEnabled,
            }
        );

        if (this.#isSwitchEntityEnabled) {
            this.node.send([message, null]);
        } else {
            this.node.send([null, message]);
        }
    }

    public onTrigger(data: TriggerPayload) {
        const message: NodeMessage = { topic: 'triggered', ...data.message };

        const status = RED._('ha-switch.status.triggered');
        if (this.#isSwitchEntityEnabled) {
            this.status.setSuccess(status);
            this.node.send(message);
        } else {
            this.status.setFailed(status);
            this.node.send([null, message]);
        }
    }
}
