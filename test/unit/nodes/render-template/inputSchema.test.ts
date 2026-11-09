import { inputSchema } from '../../../../src/nodes/render-template';
import { testSchema } from '../../../helpers/inputSchema';

testSchema(
    'render template',
    inputSchema,
    [
        ['template only', { template: '{{ states() }}' }],
        [
            'locations',
            {
                template: 'x',
                resultsLocation: 'payload',
                resultsLocationType: 'global',
                templateLocation: '',
                templateLocationType: 'none',
            },
        ],
    ],
    [
        ['missing template', {}],
        ['empty template', { template: '' }],
        ['empty result location', { template: 'x', resultsLocation: '' }],
        [
            'invalid result location type',
            { template: 'x', resultsLocationType: 'none' },
        ],
        [
            'invalid template location type',
            { template: 'x', templateLocationType: 'json' },
        ],
        ['unknown field', { template: 'x', extra: true }],
    ],
);
