import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController, {
    OutputControllerConstructor,
} from '../../common/controllers/OutputController';
import ConfigError from '../../common/errors/ConfigError';
import { getErrorData } from '../../common/errors/inputErrorHandler';
import ComparatorService from '../../common/services/ComparatorService';
import { Provides } from '../../common/services/TypedInputService';
import TransformState, { TransformType } from '../../common/TransformState';
import { TypedInputTypes } from '../../const';
import { getTimeInMilliseconds } from '../../helpers/utils';
import { NodeMessage } from '../../types/nodes';
import { PollStateNode } from '.';

interface PollStateNodeConstructor extends OutputControllerConstructor<PollStateNode> {
    comparatorService: ComparatorService;
    transformState: TransformState;
}

const ExposeAsController = ExposeAsMixin(
    OutputController<PollStateNode, Provides<'entity' | 'triggerId'>>,
);
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
            this.node.config.updateIntervalUnits,
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

        const state = this.homeAssistant.websocket.getState(
            this.node.config.entityId,
        );
        if (!state) {
            throw new ConfigError([
                'poll-state.error.entity_id_not_found',
                { entity_id: this.node.config.entityId },
            ]);
        }

        const entity = state;
        const stateValue = this.#transformState.transform(
            this.node.config.stateType as TransformType,
            entity.state,
        );

        const isIfState = await this.#comparatorService.getComparatorResult(
            this.node.config.ifStateOperator,
            this.node.config.ifState,
            stateValue,
            this.node.config.ifStateType,
            {
                entity,
            },
        );

        const message: NodeMessage = {};
        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                entity,
                triggerId: this.node.config.entityId,
            },
        );

        const statusMessage = `${entity.state}`;

        // Check 'if state' and send to correct output
        if (
            (this.node.config.ifState ||
                this.node.config.ifStateType === 'habool') &&
            !isIfState
        ) {
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
                await this.onTimer().catch((e) => {
                    const { error, statusMessage } = getErrorData(e);
                    this.status.setError(statusMessage);
                    this.node.error(error);
                });
            }, this.#updateinterval);
        }
    }
}
