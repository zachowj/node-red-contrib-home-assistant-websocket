import { shuffle } from 'lodash';
import selectn from 'selectn';

import InputOutputController, {
    InputOutputControllerOptions,
    InputProperties,
} from '../../common/controllers/InputOutputController';
import SendSplitMixin from '../../common/controllers/SendSplitMixin';
import ComparatorService from '../../common/services/ComparatorService';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { HassEntity } from '../../types/home-assistant';
import { i18nKeyandParams } from '../../types/i18n';
import { GetEntitiesNode, GetEntitiesNodeProperties } from '.';
import { OutputType } from './const';

interface GetEntitiesControllerConstructor
    extends InputOutputControllerOptions<
        GetEntitiesNode,
        GetEntitiesNodeProperties
    > {
    comparatorService: ComparatorService;
    homeAssistant: HomeAssistant;
}

const SendSplitController = SendSplitMixin(
    InputOutputController<GetEntitiesNode, GetEntitiesNodeProperties>
);
export default class GetEntitiesController extends SendSplitController {
    #comparatorService: ComparatorService;
    #homeAssistant: HomeAssistant;

    constructor(params: GetEntitiesControllerConstructor) {
        super(params);
        this.#comparatorService = params.comparatorService;
        this.#homeAssistant = params.homeAssistant;
    }

    protected async onInput({
        message,
        parsedMessage,
        send,
        done,
    }: InputProperties) {
        let noPayload = false;

        const states = this.#homeAssistant.websocket.getStates();
        const entities: HassEntity[] = [];
        const entityArray = Object.values(states) as HassEntity[];
        for (const entity of entityArray) {
            const rules = parsedMessage.rules.value;

            entity.timeSinceChangedMs =
                Date.now() - new Date(entity.last_changed).getTime();

            let entityMatched = true;
            for (const rule of rules) {
                const value = selectn(rule.property, entity);
                const result =
                    await this.#comparatorService.getComparatorResult(
                        rule.logic,
                        rule.value,
                        value,
                        rule.valueType,
                        {
                            message,
                            entity,
                        }
                    );
                if (
                    (rule.logic !== 'jsonata' && value === undefined) ||
                    !result
                ) {
                    entityMatched = false;
                    break;
                }
            }

            if (entityMatched) {
                entities.push(entity);
            }
        }

        let statusText: i18nKeyandParams = [
            'ha-get-entities.status.number_of_results',
            { count: entities.length },
        ];
        let payload: number | HassEntity | HassEntity[] = [];

        switch (parsedMessage.outputType.value) {
            case OutputType.Count:
                payload = entities.length;
                break;
            case OutputType.Split:
                if (entities.length === 0) {
                    noPayload = true;
                    break;
                }

                this.status.setSuccess(statusText);
                this.sendSplit(message, entities, send);
                done();
                return;
            case OutputType.Random: {
                if (entities.length === 0) {
                    noPayload = true;
                    break;
                }
                const maxReturned =
                    Number(parsedMessage.outputResultsCount.value) || 1;
                const max =
                    entities.length <= maxReturned
                        ? entities.length
                        : maxReturned;
                const shuffledEntities = shuffle(entities);
                payload = shuffledEntities.slice(0, max);
                if (maxReturned === 1) {
                    payload = payload[0];
                    statusText = [
                        'ha-get-entities.status.number_of_random_resuls',
                        { count: 1 },
                    ];
                } else {
                    statusText = [
                        'ha-get-entities.status.number_of_random_resuls',
                        { count: Array.isArray(payload) ? payload.length : 0 },
                    ];
                }

                break;
            }
            case OutputType.Array:
            default:
                if (
                    entities.length === 0 &&
                    !parsedMessage.outputEmptyResults.value
                ) {
                    noPayload = true;
                }

                payload = entities;
                break;
        }

        if (noPayload) {
            this.status.setFailed('ha-get-entities.status.no_results');
            done();
            return;
        }

        this.status.setSuccess(statusText);

        this.contextService.set(
            payload,
            parsedMessage.outputLocationType.value,
            parsedMessage.outputLocation.value,
            message
        );

        send(message);
        done();
    }
}
