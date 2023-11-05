import { HaConfigOption } from '.';

export default [
    {
        id: 'entity_category',
        type: 'select',
        values: ['', 'config', 'diagnostic'],
    },
    {
        id: 'mode',
        type: 'select',
        values: ['text', 'password'],
    },
    {
        id: 'min_length',
        type: 'number',
    },
    {
        id: 'max_length',
        type: 'number',
    },
    {
        id: 'pattern',
        type: 'string',
    },
] as HaConfigOption[];
