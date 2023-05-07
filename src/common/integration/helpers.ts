import { HassExposedConfig } from '../../editor/types';

export function createHaConfig(config: HassExposedConfig[]) {
    return config.reduce((acc, c) => {
        if (c.value === '') return acc;
        return { ...acc, [c.property]: c.value };
    }, {} as Record<string, any>);
}
