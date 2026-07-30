import { compareVersions } from 'compare-versions';

import {
    COMPANION_MIN_VERSION_ENTITY_AVAILABLE,
    TypedInputTypes,
} from '../const';

/** Default Available config (migration / new nodes): always send available true with state. */
export function isDefaultAvailableConfig(
    available: string,
    availableType: string,
): boolean {
    return availableType === TypedInputTypes.Boolean && available === 'true';
}

export function companionSupportsEntityAvailable(version: string): boolean {
    if (!version || version === '0.0.0') {
        return false;
    }
    try {
        return (
            compareVersions(version, COMPANION_MIN_VERSION_ENTITY_AVAILABLE) >=
            0
        );
    } catch {
        return false;
    }
}
