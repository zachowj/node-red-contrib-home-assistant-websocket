import { EventEmitter } from 'events';
import { NodeContext } from 'node-red';
import { describe, expect, it, vi } from 'vitest';
import { mock, mockDeep } from 'vitest-mock-extended';

import { createControllerDependencies } from '../../../../src/common/controllers/helpers';
import { InputProperties } from '../../../../src/common/controllers/InputOutputController';
import InputService, {
    DataSource,
    ParsedMessage,
} from '../../../../src/common/services/InputService';
import NodeRedContextService, {
    ContextLocation,
} from '../../../../src/common/services/NodeRedContextService';
import Status from '../../../../src/common/status/Status';
import HomeAssistant from '../../../../src/homeAssistant/HomeAssistant';
import { ClientState } from '../../../../src/homeAssistant/Websocket';
import {
    GetHistoryNode,
    GetHistoryNodeProperties,
} from '../../../../src/nodes/get-history';
import {
    EntityFilterType,
    OutputType,
} from '../../../../src/nodes/get-history/const';
import GetHistoryController from '../../../../src/nodes/get-history/GetHistoryController';
import { NodeMessage } from '../../../../src/types/nodes';

class TestNode extends EventEmitter {
    config: GetHistoryNodeProperties;
    debug = vi.fn();
    context = vi.fn().mockReturnValue(mockDeep<NodeContext>());

    constructor(config: GetHistoryNodeProperties) {
        super();
        this.config = config;
    }
}

describe('GetHistoryController', () => {
    it('uses message dates when relative time is enabled in the config', async () => {
        const startDate = '2024-01-04T00:00:00.000Z';
        const endDate = '2024-01-05T00:00:00.000Z';
        const node = new TestNode({
            id: 'get-history',
            type: 'api-get-history',
            name: 'Get history',
            z: 'flow',
            version: 1,
            startdate: '',
            enddate: '',
            entityId: 'binary_sensor.central_heating_state',
            entityIdType: EntityFilterType.Equals,
            useRelativeTime: true,
            relativeTime: '1 day',
            flatten: true,
            outputType: OutputType.Array,
            outputLocationType: ContextLocation.Msg,
            outputLocation: 'payload',
        });
        const homeAssistant = mockDeep<HomeAssistant>({
            isConnected: true,
            websocket: {
                connectionState: ClientState.Connected,
                getStates: () => ({}),
            },
        });
        homeAssistant.http.getHistory.mockResolvedValue([]);

        const inputService = mock<InputService<GetHistoryNodeProperties>>();
        inputService.parse.mockReturnValue({
            startDate: {
                key: 'startDate',
                value: startDate,
                source: DataSource.Message,
            },
            endDate: {
                key: 'endDate',
                value: endDate,
                source: DataSource.Message,
            },
            entityId: {
                key: 'entityId',
                value: 'binary_sensor.central_heating_state',
                source: DataSource.Config,
            },
            entityIdType: {
                key: 'entityIdType',
                value: EntityFilterType.Equals,
                source: DataSource.Config,
            },
            relativeTime: {
                key: 'relativeTime',
                value: '1 day',
                source: DataSource.Config,
            },
            flatten: {
                key: 'flatten',
                value: true,
                source: DataSource.Config,
            },
        } satisfies ParsedMessage);

        const controller = new GetHistoryController({
            inputService,
            node: node as unknown as GetHistoryNode,
            status: mock<Status>(),
            ...createControllerDependencies(
                node as unknown as GetHistoryNode,
                homeAssistant,
            ),
            nodeRedContextService: mock<NodeRedContextService>(),
        });
        const message: NodeMessage = { payload: {} };
        const send = vi.fn();
        const done = vi.fn();

        await (
            controller as unknown as {
                onInput: (properties: InputProperties) => Promise<void>;
            }
        ).onInput({
            message,
            parsedMessage: inputService.parse(message),
            send,
            done,
        });

        expect(homeAssistant.http.getHistory).toHaveBeenCalledWith(
            startDate,
            'binary_sensor.central_heating_state',
            endDate,
            true,
        );
        expect(send).toHaveBeenCalledWith(message);
        expect(done).toHaveBeenCalledWith();
    });
});
