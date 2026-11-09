import { expect, it } from 'vitest';

import InputService from '../../../../src/common/services/InputService';
import {
    ComparatorType,
    EntityFilterType,
    TimeUnit,
} from '../../../../src/const';
import { defaultInputSchema } from '../../../../src/nodes/wait-until';
import { resetSchema } from '../../../../src/nodes/wait-until/WaitUntilController';
import { testSchema } from '../../../helpers/inputSchema';

testSchema(
    'wait until',
    defaultInputSchema,
    [
        ['missing optional fields', {}],
        [
            'entity selector',
            { entities: { entity: ['light.a'], substring: [], regex: [] } },
        ],
        ['substring selector', { entities: { substring: ['light'] } }],
        ['regex selector', { entities: { regex: ['^light'] } }],
        [
            'options and unknown top-level field',
            {
                property: 'state',
                comparator: 'is',
                value: 0,
                valueType: 'str',
                timeout: '',
                timeoutUnits: 'seconds',
                checkCurrentState: 'true',
                entityId: ['light.a'],
                entityIdFilterType: 'list',
                extra: true,
            },
        ],
        [
            'string override and numeric timeout',
            { entityId: 'light.a', timeout: 5 },
        ],
    ],
    [
        [
            'empty selectors',
            { entities: { entity: [], substring: [], regex: [] } },
        ],
        ['empty selector object', { entities: {} }],
        ['invalid selector item', { entities: { entity: [1] } }],
        ['unknown selector', { entities: { entity: ['light.a'], other: [] } }],
        ['invalid property', { property: '' }],
        ['invalid comparator', { comparator: 'other' }],
        ['invalid value', { value: false }],
        ['invalid value type', { valueType: '' }],
        ['invalid timeout', { timeout: {} }],
        ['invalid timeout unit', { timeoutUnits: 'weeks' }],
        ['invalid check current state', { checkCurrentState: 'yes' }],
        ['invalid entity override', { entityId: [1] }],
        ['invalid filter type', { entityIdFilterType: 'other' }],
    ],
);

testSchema(
    'wait until reset message',
    resetSchema,
    [
        ['null reset', { reset: null }],
        ['false reset and other fields', { reset: false, payload: 'x' }],
        ['object reset', { reset: {} }],
    ],
    [
        ['missing reset', { payload: 'x' }],
        ['undefined reset', { reset: undefined }],
    ],
);

it.each(Object.values(ComparatorType))(
    'accepts comparator %s',
    function (comparator) {
        expect(
            InputService.validateSchema(defaultInputSchema, { comparator }),
        ).toBe(true);
    },
);

it.each(Object.values(TimeUnit))(
    'accepts wait-until time unit %s',
    function (timeoutUnits) {
        expect(
            InputService.validateSchema(defaultInputSchema, { timeoutUnits }),
        ).toBe(true);
    },
);

it.each(Object.values(EntityFilterType))(
    'accepts wait-until filter type %s',
    function (entityIdFilterType) {
        expect(
            InputService.validateSchema(defaultInputSchema, {
                entityIdFilterType,
            }),
        ).toBe(true);
    },
);

it('preserves the custom error for empty wait-until selectors', function () {
    expect(() =>
        InputService.validateSchema(defaultInputSchema, { entities: {} }),
    ).toThrow('ha-wait-until.error.no_entities_provided');
});
