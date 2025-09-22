import { describe, expect, it } from 'vitest';

import { NodeType } from '../../../src/const';
import { getExposedSettings } from '../../../src/helpers/exposed-settings';
import { getCurrentVersion } from '../../../src/helpers/migrate';

describe('getExposedSettings', function () {
    it('should return settings for a node type', function () {
        const result = getExposedSettings(NodeType.Sensor);
        expect(result).toEqual({
            settings: {
                haSensorVersion: {
                    value: 0,
                    exportable: true,
                },
            },
        });
    });

    it('should return settings for a server node type', function () {
        const result = getExposedSettings(NodeType.Server);
        expect(result).toEqual({
            settings: {
                serverVersion: {
                    value: getCurrentVersion(NodeType.Server),
                    exportable: true,
                },
            },
            credentials: {
                host: { type: 'text' },
                access_token: { type: 'text' },
            },
        });
    });
});
