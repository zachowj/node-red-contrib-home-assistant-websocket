import { NodeAPI } from 'node-red';
import { beforeAll, describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';

import HomeAssistantError from '../../../../src/common/errors/HomeAssistantError';
import { getErrorData } from '../../../../src/common/errors/inputErrorHandler';
import { setRED } from '../../../../src/globals';

describe('getErrorData', function () {
    beforeAll(function () {
        const nodeApi = mock<NodeAPI>();
        nodeApi._.mockImplementation((key: string) => key);
        setRED(nodeApi);
    });

    it.each([
        {
            code: 'invalid_format',
            status: 'home-assistant.status.validation_error',
        },
        { code: 'unknown_error', status: 'home-assistant.status.error' },
    ])(
        'uses $status for a Home Assistant $code reply',
        function ({ code, status }) {
            const { error, statusMessage } = getErrorData({
                code,
                message: 'Rejected',
            });

            expect(error).toBeInstanceOf(HomeAssistantError);
            expect(error.message).toBe('Rejected');
            expect(statusMessage).toBe(status);
        },
    );
});
