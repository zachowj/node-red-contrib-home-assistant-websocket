import { HassExposedConfig } from '../../editor/types';

export function createHaConfig(config: HassExposedConfig[]) {
    return config
        .filter((c) => c.value.length)
        .reduce(
            (acc, c) => ({ ...acc, [c.property]: c.value }),
            {} as Record<string, any>
        );
}
