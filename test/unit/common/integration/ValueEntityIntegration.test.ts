import { EventEmitter } from 'events';
import { describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';

import ValueEntityIntegration from '../../../../src/common/integration/ValueEntityIntegration';
import State from '../../../../src/common/State';
import HomeAssistant from '../../../../src/homeAssistant/HomeAssistant';
import HttpAPI from '../../../../src/homeAssistant/Http';
import WebsocketAPI from '../../../../src/homeAssistant/Websocket';
import { EntityConfigNode } from '../../../../src/nodes/entity-config';

describe('ValueEntityIntegration', function () {
    it('does not cache a value when Home Assistant rejects the update', async function () {
        const state = mock<State>();
        const entityConfigNode = mock<EntityConfigNode>();
        entityConfigNode.id = 'entity_config_node';
        entityConfigNode.config = {
            server: 'server_1',
        } as EntityConfigNode['config'];
        const websocket = mock<WebsocketAPI>();
        websocket.integrationVersion = '4.2.4';
        websocket.send.mockRejectedValue(new Error('Rejected update'));
        const homeAssistant = new HomeAssistant({
            websocketAPI: websocket,
            httpAPI: mock<HttpAPI>(),
            eventBus: new EventEmitter(),
        });

        const integration = new ValueEntityIntegration({
            clientEvents: mock(),
            homeAssistant,
            state,
            entityConfigNode,
        });

        await expect(
            integration.updateValue('special / value'),
        ).rejects.toThrow('Rejected update');
        expect(state.setLastPayload).not.toHaveBeenCalled();
    });
});
