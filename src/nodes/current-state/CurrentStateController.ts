import InputOutputController, {
    InputOutputControllerOptions,
    InputProperties,
} from '../../common/controllers/InputOutputController';
import InputError from '../../common/errors/InputError';
import ComparatorService from '../../common/services/ComparatorService';
import { Provides } from '../../common/services/TypedInputService';
import TransformState from '../../common/TransformState';
import { ComparatorType } from '../../const';
import { renderTemplate } from '../../helpers/mustache';
import { getTimeInMilliseconds } from '../../helpers/utils';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { NodeMessage } from '../../types/nodes';
import { CurrentStateNode, CurrentStateNodeProperties } from '.';

interface CurrentStateControllerConstructor extends InputOutputControllerOptions<
    CurrentStateNode,
    CurrentStateNodeProperties
> {
    comparatorService: ComparatorService;
    homeAssistant: HomeAssistant;
    transformState: TransformState;
}

export default class CurrentStateController extends InputOutputController<
    CurrentStateNode,
    CurrentStateNodeProperties,
    Provides<'entity' | 'triggerId'>
> {
    #comparatorService: ComparatorService;
    #homeAssistant: HomeAssistant;
    #transformState: TransformState;

    constructor(params: CurrentStateControllerConstructor) {
        super(params);
        this.#comparatorService = params.comparatorService;
        this.#homeAssistant = params.homeAssistant;
        this.#transformState = params.transformState;
    }

    protected async onInput({
        message,
        parsedMessage,
        send,
        done,
    }: InputProperties) {
        const entityId = renderTemplate(
            parsedMessage.entityId.value,
            message,
            this.node.context(),
            this.#homeAssistant.websocket.getStates(),
        );

        const state = this.#homeAssistant.websocket.getState(entityId);
        if (!state) {
            throw new InputError(
                `Entity could not be found in cache for entityId: ${entityId}`,
                'not found',
            );
        }

        const entity = state;
        const stateValue = this.#transformState.transform(
            this.node.config.state_type,
            entity.state,
        );

        let isIfState = await this.#comparatorService.getComparatorResult(
            this.node.config.halt_if_compare,
            this.node.config.halt_if,
            stateValue as string,
            this.node.config.halt_if_type,
            {
                message,
                entity,
            },
        );

        if (this.#checkForDuration(isIfState)) {
            const forDurationMs = await this.#getForDurationMs(message);
            if (forDurationMs > 0) {
                isIfState =
                    Date.now() - new Date(entity.last_changed).getTime() >
                    forDurationMs;
            }
        }

        await this.setCustomOutputs(
            this.node.config.outputProperties,
            message,
            {
                entity,
                triggerId: entityId,
            },
        );

        if (
            (this.node.config.halt_if ||
                this.node.config.halt_if_type === 'habool') &&
            !isIfState
        ) {
            this.status.setFailed(entity.state.toString());
            send([null, message]);
            done();
            return;
        }

        this.status.setSuccess(entity.state.toString());
        send([message, null]);
        done();
    }

    #checkForDuration(isIfState: boolean) {
        return (
            isIfState &&
            (this.node.config.halt_if.length > 0 ||
                this.node.config.halt_if_type === 'habool') &&
            [
                ComparatorType.Is,
                ComparatorType.IsNot,
                ComparatorType.Includes,
                ComparatorType.DoesNotInclude,
            ].includes(this.node.config.halt_if_compare)
        );
    }

    async #getForDurationMs(message: NodeMessage) {
        if (this.node.config.for === '') return 0;
        const value = await this.typedInputService.getValue(
            this.node.config.for,
            this.node.config.forType,
            { message },
        );

        if (isNaN(value) || value < 0) {
            throw new InputError(
                `Invalid for value: ${value}`,
                'home-assistant.status.error',
            );
        }

        return getTimeInMilliseconds(value, this.node.config.forUnits);
    }
}
