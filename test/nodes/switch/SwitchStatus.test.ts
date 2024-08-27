import { NodeAPI } from 'node-red';
import {
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import { mock, MockProxy, mockReset } from 'vitest-mock-extended';

import Events from '../../../src/common/events/Events';
import State from '../../../src/common/State';
import { setRED } from '../../../src/globals';
import { EntityConfigNode } from '../../../src/nodes/entity-config';
import { SwitchNode, SwitchNodeProperties } from '../../../src/nodes/switch';
import SwitchStatus from '../../../src/nodes/switch/SwitchStatus';
import { ServerNodeConfig } from '../../../src/types/nodes';

const fakeNow = new Date(2012, 0, 12, 12, 12, 12);

describe('SwitchEntityStatus', function () {
    let entityConfigEvents: MockProxy<Events>;
    let entityConfigNode: MockProxy<EntityConfigNode>;
    let nodeStub: MockProxy<SwitchNode>;
    let nodeApiStub: MockProxy<NodeAPI>;
    let serverNodeConfigStub: MockProxy<ServerNodeConfig>;
    let stateStub: MockProxy<State>;
    let switchNodeConfigStub: MockProxy<SwitchNodeProperties>;

    let status: SwitchStatus;

    beforeAll(function () {
        entityConfigEvents = mock<Events>();
        entityConfigNode = mock<EntityConfigNode>();
        nodeApiStub = mock<NodeAPI>();
        nodeStub = mock<SwitchNode>();
        serverNodeConfigStub = mock<ServerNodeConfig>();
        stateStub = mock<State>();
        switchNodeConfigStub = mock<SwitchNodeProperties>();

        setRED(nodeApiStub);
    });

    beforeEach(function () {
        mockReset(entityConfigEvents);
        mockReset(entityConfigNode);
        mockReset(nodeStub);
        mockReset(nodeApiStub);
        mockReset(serverNodeConfigStub);
        mockReset(stateStub);
        mockReset(switchNodeConfigStub);

        nodeApiStub._.mockReturnValue('0');
        nodeStub.status.mockReturnValue();
        vi.useFakeTimers();
        vi.setSystemTime(fakeNow);

        nodeStub.config = switchNodeConfigStub;

        serverNodeConfigStub.statusSeparator = 'at ';
        serverNodeConfigStub.statusYear = 'hidden';
        serverNodeConfigStub.statusMonth = 'short';
        serverNodeConfigStub.statusDay = 'numeric';
        serverNodeConfigStub.statusHourCycle = 'h23';
        serverNodeConfigStub.statusTimeFormat = 'h:m';

        entityConfigNode.state = stateStub;

        status = new SwitchStatus({
            entityConfigEvents,
            entityConfigNode,
            config: serverNodeConfigStub,
            node: nodeStub,
        });
    });

    afterEach(function () {
        vi.useRealTimers();
    });

    describe('set', function () {
        it('default status should be a yellow dot', function () {
            const expectedStatus = {
                fill: 'yellow',
                shape: 'dot',
                text: '',
            };
            status.set();

            expect(nodeStub.status).toHaveBeenCalledOnce();
            expect(nodeStub.status).toHaveBeenCalledWith(expectedStatus);
        });
    });
});
