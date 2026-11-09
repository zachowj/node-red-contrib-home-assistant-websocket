import { describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { PropertySelectorType } from '../../src/common/const';
import { createControllerDependencies } from '../../src/common/controllers/helpers';
import ComparatorService from '../../src/common/services/ComparatorService';
import Status from '../../src/common/status/Status';
import { ComparatorType, TypedInputTypes } from '../../src/const';
import GetEntitiesController from '../../src/nodes/get-entities/GetEntitiesController';
import { setupControllerTestHarnessGlobals } from '../helpers/controllerTestHarness';
import {
    entity,
    FakeNode,
    inputService,
    seed,
    sendInput,
} from '../helpers/controllerTestUtils';

setupControllerTestHarnessGlobals();

describe('get-entities label filters', function () {
    it('excludes entities matching a negative label condition', async function () {
        const { homeAssistant, websocket } = seed({
            'light.solar_outdoor': entity('light.solar_outdoor', 'on'),
            'light.solar_indoor': entity('light.solar_indoor', 'on'),
        });
        websocket.labels = [
            {
                label_id: 'solar',
                name: 'solar',
                color: null,
                description: null,
                icon: null,
            },
            {
                label_id: 'outdoor',
                name: 'outdoor',
                color: null,
                description: null,
                icon: null,
            },
        ];
        websocket.entities = new Map([
            [
                'light.solar_outdoor',
                {
                    entity_id: 'light.solar_outdoor',
                    labels: ['solar', 'outdoor'],
                } as never,
            ],
            [
                'light.solar_indoor',
                { entity_id: 'light.solar_indoor', labels: ['solar'] } as never,
            ],
        ]);
        const node = new FakeNode({});
        // eslint-disable-next-line no-new
        new GetEntitiesController({
            node: node as any,
            status: mock<Status>(),
            inputService: inputService({
                rules: {
                    value: [
                        {
                            condition: PropertySelectorType.Label,
                            property: 'name',
                            logic: ComparatorType.Is,
                            value: 'solar',
                            valueType: TypedInputTypes.String,
                        },
                        {
                            condition: PropertySelectorType.Label,
                            property: 'name',
                            logic: ComparatorType.IsNot,
                            value: 'outdoor',
                            valueType: TypedInputTypes.String,
                        },
                    ],
                },
                outputType: { value: 'array' },
                outputEmptyResults: { value: true },
                outputLocationType: { value: 'msg' },
                outputLocation: { value: 'payload' },
                outputResultsCount: { value: 1 },
            }),
            comparatorService: mock<ComparatorService>(),
            ...createControllerDependencies(node as any, homeAssistant),
        });

        const { send } = await sendInput(node, { payload: {} });

        expect(send.mock.calls[0][0].payload).toEqual([
            expect.objectContaining({ entity_id: 'light.solar_indoor' }),
        ]);
    });
});
