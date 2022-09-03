import binarySensor from './binary-sensor';
import button from './button';
import sensor from './sensor';
import switchData from './switch';

export const defaultHaConfigOptions = [
    { id: 'name', type: 'string' },
    { id: 'icon', type: 'string' },
    {
        id: 'entity_category',
        type: 'select',
        values: ['', 'config', 'diagnostic'],
    },
];

export const haConfigOptions = {
    button,
    binary_sensor: binarySensor,
    sensor,
    switch: switchData,
};
