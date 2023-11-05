import { HaConfigOption } from '.';

export default [
    {
        id: 'entity_category',
        type: 'select',
        values: ['', 'config', 'diagnostic'],
    },
    {
        id: 'options',
        type: 'editableList',
        values: ['option1'],
    },
] as HaConfigOption[];
