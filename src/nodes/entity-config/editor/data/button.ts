import { HaConfigOption } from '.';

export default [
    {
        id: 'entity_category',
        type: 'select',
        values: ['', 'config', 'diagnostic'],
    },
    {
        id: 'device_class',
        type: 'select',
        values: ['', 'restart', 'update'],
    },
] as HaConfigOption[];
