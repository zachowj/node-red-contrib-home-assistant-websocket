import { HaConfigOption } from '.';

export default [
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
