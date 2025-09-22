import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { mock, MockProxy, mockReset } from 'vitest-mock-extended';

import Status from '../../../../src/common/status/Status';
import { BaseNode, ServerNodeConfig } from '../../../../src/types/nodes';

describe('Status', function () {
    let nodeStub: MockProxy<BaseNode>;
    let serverNodeConfigStub: MockProxy<ServerNodeConfig>;

    beforeAll(function () {
        nodeStub = mock<BaseNode>();
        nodeStub.status.mockReturnValue();
        serverNodeConfigStub = mock<ServerNodeConfig>();
    });

    afterEach(function () {
        mockReset(nodeStub);
        mockReset(serverNodeConfigStub);
    });

    describe('set', function () {
        it('should call updateStatus with defaults and set lastStatus', function () {
            const status = new Status({
                config: serverNodeConfigStub,
                node: nodeStub,
            });
            const expectedStatus = {};
            status.set();

            expect(nodeStub.status).toHaveBeenCalledWith(expectedStatus);
        });
    });

    describe('setText', function () {
        it('status should only contain the text property', function () {
            const status = new Status({
                config: serverNodeConfigStub,
                node: nodeStub,
            });

            const expectedStatus = { text: 'hello' };
            status.setText(expectedStatus.text);

            expect(nodeStub.status).toHaveBeenCalledWith(expectedStatus);
        });
    });
});
