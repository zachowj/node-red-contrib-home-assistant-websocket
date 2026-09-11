import { describe, expect, it } from 'vitest';

import {
    companionSupportsEntityAvailable,
    isDefaultAvailableConfig,
} from '../../../src/helpers/entityAvailable';

describe('entityAvailable helpers', function () {
    it('treats bool/true as the default Available config', function () {
        expect(isDefaultAvailableConfig('true', 'bool')).toBe(true);
        expect(isDefaultAvailableConfig('false', 'bool')).toBe(false);
        expect(isDefaultAvailableConfig('payload.connected', 'msg')).toBe(
            false,
        );
    });

    it('requires companion 4.2.4+ for custom Available', function () {
        expect(companionSupportsEntityAvailable('0.0.0')).toBe(false);
        expect(companionSupportsEntityAvailable('4.2.3')).toBe(false);
        expect(companionSupportsEntityAvailable('4.2.4')).toBe(true);
        expect(companionSupportsEntityAvailable('4.3.0')).toBe(true);
    });
});
