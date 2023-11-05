import { HaConfigOption } from '.';

const binarySensorDeviceClasses = [
    'battery',
    'battery_charging',
    'co',
    'cold',
    'connectivity',
    'door',
    'garage_door',
    'gas',
    'heat',
    'light',
    'lock',
    'moisture',
    'motion',
    'moving',
    'occupancy',
    'opening',
    'plug',
    'power',
    'presence',
    'problem',
    'running',
    'safety',
    'smoke',
    'sound',
    'tamper',
    'update',
    'vibration',
    'window',
] as const;

export default [
    {
        id: 'entity_category',
        type: 'select',
        values: ['', 'config', 'diagnostic'],
    },
    {
        id: 'device_class',
        type: 'select',
        values: ['', ...binarySensorDeviceClasses],
    },
] as HaConfigOption[];
