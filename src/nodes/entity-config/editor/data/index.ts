import binarySensor from './binary-sensor';
import button from './button';
import number from './number';
import select from './select';
import sensor from './sensor';
import switchData from './switch';
import text from './text';

export interface HaConfigOption {
    id: string;
    type: string;
    values?: string[];
}

export const defaultHaConfigOptions: HaConfigOption[] = [
    { id: 'name', type: 'string' },
    { id: 'icon', type: 'string' },
    { id: 'entity_picture', type: 'string' },
];

export const haConfigOptions = {
    button,
    binary_sensor: binarySensor,
    number,
    select,
    sensor,
    switch: switchData,
    text,
};
