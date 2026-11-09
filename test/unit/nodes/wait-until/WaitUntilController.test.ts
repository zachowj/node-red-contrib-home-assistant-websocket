import { EventEmitter } from 'events';
import { NodeContext } from 'node-red';
import { describe, expect, it, vi } from 'vitest';
import { mock, mockDeep } from 'vitest-mock-extended';

import { IdSelectorType } from '../../../../src/common/const';
import { createControllerDependencies } from '../../../../src/common/controllers/helpers';
import { InputProperties } from '../../../../src/common/controllers/InputOutputController';
import ClientEvents from '../../../../src/common/events/ClientEvents';
import ComparatorService from '../../../../src/common/services/ComparatorService';
import {
    DataSource,
    ParsedMessage,
} from '../../../../src/common/services/InputService';
import Status from '../../../../src/common/status/Status';
import {
    ComparatorType,
    TimeUnit,
    TypedInputTypes,
} from '../../../../src/const';
import HomeAssistant from '../../../../src/homeAssistant/HomeAssistant';
import {
    WaitUntilNode,
    WaitUntilNodeProperties,
} from '../../../../src/nodes/wait-until';
import WaitUntilController from '../../../../src/nodes/wait-until/WaitUntilController';

class TestNode extends EventEmitter {
    config: WaitUntilNodeProperties;
    debug = vi.fn();
    warn = vi.fn();

    constructor(config: WaitUntilNodeProperties) {
        super();
        this.config = config;
    }

    context() {
        return mockDeep<NodeContext>();
    }
}

describe('WaitUntilController', () => {
    it('renders configured entity templates independently for each input', async () => {
        const entities = {
            [IdSelectorType.Entity]: ['{{ payload.entity_id }}'],
            [IdSelectorType.Substring]: [],
            [IdSelectorType.Regex]: [],
        };
        const node = new TestNode({
            id: 'wait-until',
            type: 'ha-wait-until',
            name: 'Wait until',
            z: 'flow',
            version: 3,
            entities,
            property: 'state',
            comparator: ComparatorType.Is,
            value: 'off',
            valueType: TypedInputTypes.String,
            timeout: '0',
            timeoutType: TypedInputTypes.Number,
            timeoutUnits: TimeUnit.Seconds,
            checkCurrentState: false,
            blockInputOverrides: false,
            outputProperties: [],
        });
        const homeAssistant = mockDeep<HomeAssistant>({
            websocket: {
                getStates: () => ({}),
            },
        });
        const clientEvents = mock<ClientEvents>();
        const controller = new WaitUntilController({
            node: node as unknown as WaitUntilNode,
            status: mock<Status>(),
            inputService: mock(),
            comparatorService: mock<ComparatorService>(),
            clientEvents,
            ...createControllerDependencies(
                node as unknown as WaitUntilNode,
                homeAssistant,
            ),
        });
        const onInput = (
            controller as unknown as {
                onInput: (properties: InputProperties) => Promise<void>;
            }
        ).onInput.bind(controller);
        const parsedMessage = (): ParsedMessage => ({
            entities: {
                key: 'entities',
                value: node.config.entities,
                source: DataSource.Config,
            },
            entityId: {
                key: 'entityId',
                value: undefined,
                source: DataSource.Missing,
            },
            property: {
                key: 'property',
                value: 'state',
                source: DataSource.Config,
            },
            comparator: {
                key: 'comparator',
                value: ComparatorType.Is,
                source: DataSource.Config,
            },
            value: {
                key: 'value',
                value: 'off',
                source: DataSource.Config,
            },
            valueType: {
                key: 'valueType',
                value: TypedInputTypes.String,
                source: DataSource.Config,
            },
            timeout: {
                key: 'timeout',
                value: '0',
                source: DataSource.Config,
            },
            timeoutUnits: {
                key: 'timeoutUnits',
                value: TimeUnit.Seconds,
                source: DataSource.Config,
            },
            checkCurrentState: {
                key: 'checkCurrentState',
                value: false,
                source: DataSource.Config,
            },
        });

        for (const entityId of ['light.kitchen', 'light.kitchen_cooking']) {
            await onInput({
                message: { payload: { entity_id: entityId } },
                parsedMessage: parsedMessage(),
                send: vi.fn(),
                done: vi.fn(),
            });
        }

        expect(
            clientEvents.addListener.mock.calls.map(([event]) => event),
        ).toEqual([
            'ha_events:state_changed:light.kitchen',
            'ha_events:state_changed:light.kitchen_cooking',
        ]);
        expect(node.config.entities[IdSelectorType.Entity]).toEqual([
            '{{ payload.entity_id }}',
        ]);
    });
});
