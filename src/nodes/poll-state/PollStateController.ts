import ExposeAsController, {
    ExposeAsControllerConstructor,
} from '../../common/controllers/EposeAsController';
import ConfigError from '../../common/errors/ConfigError';
import ComparatorService from '../../common/services/ComparatorService';
import TransformState, { TransformType } from '../../common/TransformState';
import { TypedInputTypes } from '../../const';
import { RED } from '../../globals';
import { getTimeInMilliseconds } from '../../helpers/utils';
import { HassEntity } from '../../types/home-assistant';
import { NodeMessage } from '../../types/nodes';
import { PollStateNode } from '.';

interface PollStateNodeConstructor
    extends ExposeAsControllerConstructor<PollStateNode> {
    comparatorService: ComparatorService;
    transformState: TransformState;
}

export default class PollStateController extends ExposeAsController<PollStateNode> {
    #comparatorService: ComparatorService;
    #timer: NodeJS.Timeout | undefined;
    #transformState: TransformState;
    #updateinterval?: number;

    constructor(props: PollStateNodeConstructor) {
        super(props);
        this.#comparatorService = props.comparatorService;
        this.#transformState = props.transformState;
    }

    #getInterval() {
        let interval = this.node.config.updateInterval || '0';
        if (this.node.config.updateIntervalType === TypedInputTypes.JSONata) {
            interval = this.jsonataService.evaluate(interval);
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

    public onTimer(triggered = false) {
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

        const isIfState = this.#comparatorService.getComparatorResult(
            this.node.config.ifStateOperator,
            this.node.config.ifState,
            entity.state,
            this.node.config.ifStateType,
            {
                entity,
            }
        );

        const statusMessage = `${entity.state}${
            triggered === true
                ? ` (${RED._('home-assistant.status.triggered')})`
                : ''
        }`;

        const message: NodeMessage = {};
        this.setCustomOutputs(this.node.config.outputProperties, message, {
            config: this.node.config,
            entity,
            entityState: entity.state,
            triggerId: this.node.config.entityId,
        });

        // Check 'if state' and send to correct output
        if (this.node.config.ifState && !isIfState) {
            this.status.setFailed(statusMessage);
            this.node.send([null, message]);
            return;
        }

        this.status.setSuccess(statusMessage);
        this.node.send([message, null]);
    }

    public onIntervalUpdate() {
        const interval = this.#getInterval();
        // create new timer if interval changed
        if (interval !== this.#updateinterval) {
            clearInterval(this.#timer);
            this.#updateinterval = interval;
            this.#timer = setInterval(() => {
                try {
                    this.onTimer();
                } catch (e) {
                    this.node.error(e);
                }
            }, this.#updateinterval);
        }
    }

    public onTriggered() {
        this.onTimer(true);
    }
}
