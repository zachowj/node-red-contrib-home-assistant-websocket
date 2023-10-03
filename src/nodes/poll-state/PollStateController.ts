import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController, {
    OutputControllerConstructor,
} from '../../common/controllers/OutputController';
import ConfigError from '../../common/errors/ConfigError';
import ComparatorService from '../../common/services/ComparatorService';
import TransformState, { TransformType } from '../../common/TransformState';
import { TypedInputTypes } from '../../const';
import { getTimeInMilliseconds } from '../../helpers/utils';
import { HassEntity } from '../../types/home-assistant';
import { NodeMessage } from '../../types/nodes';
import { PollStateNode } from '.';

interface PollStateNodeConstructor
    extends OutputControllerConstructor<PollStateNode> {
    comparatorService: ComparatorService;
    transformState: TransformState;
}

const ExposeAsController = ExposeAsMixin(OutputController<PollStateNode>);
export default class PollStateController extends ExposeAsController {
    #comparatorService: ComparatorService;
    #timer: NodeJS.Timeout | undefined;
    #transformState: TransformState;
    #updateinterval?: number;

    constructor(props: PollStateNodeConstructor) {
        super(props);
        this.#comparatorService = props.comparatorService;
        this.#transformState = props.transformState;
    }

    async #getInterval() {
        let interval = this.node.config.updateInterval || '0';
        if (this.node.config.updateIntervalType === TypedInputTypes.JSONata) {
            interval = await this.jsonataService.evaluate(interval);
        }

        const intervalMs = getTimeInMilliseconds(
            Number(interval),
            this.node.config.updateIntervalUnits
        );
        if (isNaN(intervalMs)) {
            throw new ConfigError([
                'poll-state.error.interval_not_a_number',
                { interval },
            ]);
        }

        return Number(intervalMs);
    }

    protected onClose(): void {
        if (this.#timer) {
            clearInterval(this.#timer);
            this.#timer = undefined;
        }
    }

    protected getNodeEntityId() {
        return this.node.config.entityId;
    }

    public async onTimer() {
        if (this.isEnabled === false) {
            return;
        }

        const entity = this.homeAssistant.websocket.getStates(
            this.node.config.entityId
        ) as HassEntity;
        if (!entity) {
            throw new ConfigError([
                'poll-state.error.entity_id_not_found',
                { entity_id: this.node.config.entityId },
            ]);
        }

        entity.timeSinceChangedMs =
            Date.now() - new Date(entity.last_changed).getTime();

        if (this.node.config.stateType !== TransformType.String) {
            // Convert and save original state if needed
            entity.original_state = entity.state as string;
            entity.state = this.#transformState.transform(
                this.node.config.stateType as TransformType,
                entity.state as string
            );
        }

        const isIfState = await this.#comparatorService.getComparatorResult(
            this.node.config.ifStateOperator,
            this.node.config.ifState,
            entity.state,
            this.node.config.ifStateType,
            {
                entity,
            }
        );

        const message: NodeMessage = {};
        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                config: this.node.config,
                entity,
                entityState: entity.state,
                triggerId: this.node.config.entityId,
            }
        );

        const statusMessage = `${entity.state}`;

        // Check 'if state' and send to correct output
        if (this.node.config.ifState && !isIfState) {
            this.status.setFailed(statusMessage);
            this.node.send([null, message]);
            return;
        }

        this.status.setSuccess(statusMessage);
        this.node.send([message, null]);
    }

    public async onIntervalUpdate() {
        const interval = await this.#getInterval();
        // create new timer if interval changed
        if (interval !== this.#updateinterval) {
            clearInterval(this.#timer);
            this.#updateinterval = interval;
            this.#timer = setInterval(async () => {
                try {
                    await this.onTimer();
                } catch (e) {
                    this.node.error(e);
                }
            }, this.#updateinterval);
        }
    }
}
