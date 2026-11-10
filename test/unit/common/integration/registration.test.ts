import { EventEmitter } from 'events';
import { NodeAPI } from 'node-red';
import { beforeAll, describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';

import UnidirectionalEntityIntegration from '../../../../src/common/integration/UnidirectionalEntityIntegration';
import ValueEntityIntegration from '../../../../src/common/integration/ValueEntityIntegration';
import { LastPayloadData } from '../../../../src/common/services/StorageService';
import State from '../../../../src/common/State';
import Status from '../../../../src/common/status/Status';
import { EntityType } from '../../../../src/const';
import { setRED } from '../../../../src/globals';
import HomeAssistant from '../../../../src/homeAssistant/HomeAssistant';
import HttpAPI from '../../../../src/homeAssistant/Http';
import WebsocketAPI from '../../../../src/homeAssistant/Websocket';
import { EntityConfigNode } from '../../../../src/nodes/entity-config';

const REJECTED = { code: 'invalid_format', message: 'Not a number' };

function createSetup(
    lastPayload: LastPayloadData | undefined,
    entityType = EntityType.Sensor,
) {
    let stored = lastPayload;
    const state = mock<State>();
    state.getLastPayload.mockImplementation(() => stored);
    state.setLastPayload.mockImplementation(async (payload) => {
        stored = payload;
    });
    const entityConfigNode = mock<EntityConfigNode>();
    entityConfigNode.id = 'entity_config_node';
    entityConfigNode.config = {
        server: 'server_1',
        entityType,
        resend: true,
        haConfig: [],
    } as unknown as EntityConfigNode['config'];
    entityConfigNode.context.mockReturnValue(mock());
    const websocket = mock<WebsocketAPI>();
    websocket.integrationVersion = '4.2.4';
    const homeAssistant = new HomeAssistant({
        websocketAPI: websocket,
        httpAPI: mock<HttpAPI>(),
        eventBus: new EventEmitter(),
    });
    const status = mock<Status>();

    return {
        entityConfigNode,
        homeAssistant,
        state,
        status,
        stored: () => stored,
        websocket,
    };
}

function createSensor(setup: ReturnType<typeof createSetup>) {
    const integration = new UnidirectionalEntityIntegration({
        clientEvents: mock(),
        homeAssistant: setup.homeAssistant,
        state: setup.state,
        entityConfigNode: setup.entityConfigNode,
    });
    integration.setStatus(setup.status);
    return integration;
}

// register() is protected; Integration.init() calls it once connected
function register(integration: UnidirectionalEntityIntegration) {
    return (integration as unknown as { register(): Promise<void> }).register();
}

describe('registration with a stored state', function () {
    beforeAll(function () {
        const nodeApi = mock<NodeAPI>();
        nodeApi._.mockImplementation((key: string) => key);
        setRED(nodeApi);
    });

    it('drops a rejected stored state and registers without it', async function () {
        const setup = createSetup({ state: 'abc', attributes: { room: 'a' } });
        setup.websocket.send
            .mockRejectedValueOnce(REJECTED)
            .mockResolvedValueOnce(undefined as never);
        const integration = createSensor(setup);

        await register(integration);

        expect(setup.websocket.send).toHaveBeenCalledTimes(2);
        expect(setup.websocket.send.mock.calls[0][0]).toHaveProperty(
            'state',
            'abc',
        );
        expect(setup.websocket.send.mock.calls[1][0]).not.toHaveProperty(
            'state',
        );
        expect(setup.stored()).toEqual({ attributes: { room: 'a' } });
        expect(setup.entityConfigNode.warn).toHaveBeenCalledWith(
            expect.stringContaining('Not a number'),
        );
        expect(integration.isRegistered).toBe(true);
    });

    it('drops a rejected stored value for a value entity', async function () {
        const setup = createSetup(
            { state: 'c', attributes: {} },
            EntityType.Select,
        );
        const unsubscribe = async () => {};
        setup.websocket.subscribeMessage
            .mockRejectedValueOnce(REJECTED)
            .mockResolvedValueOnce(unsubscribe);
        const integration = new ValueEntityIntegration({
            clientEvents: mock(),
            homeAssistant: setup.homeAssistant,
            state: setup.state,
            entityConfigNode: setup.entityConfigNode,
        });

        await register(integration);

        expect(setup.websocket.subscribeMessage).toHaveBeenCalledTimes(2);
        expect(
            setup.websocket.subscribeMessage.mock.calls[1][1],
        ).not.toHaveProperty('state');
        expect(setup.stored()).toEqual({ attributes: {} });
        expect(integration.isRegistered).toBe(true);
    });

    it('fails without another retry when the retry is rejected too', async function () {
        const setup = createSetup({ state: 'abc' });
        setup.websocket.send.mockRejectedValue(REJECTED);
        const integration = createSensor(setup);

        await register(integration);

        expect(setup.websocket.send).toHaveBeenCalledTimes(2);
        expect(setup.status.setFailed).toHaveBeenCalledWith(
            'home-assistant.status.error_registering',
        );
        expect(integration.isRegistered).toBe(false);
    });

    it.each([
        {
            name: 'another error',
            lastPayload: { state: 'abc' },
            error: { code: 'unknown_error', message: 'Unknown error' },
        },
        {
            name: 'a rejection without a stored state',
            lastPayload: { attributes: { room: 'a' } },
            error: REJECTED,
        },
    ])('does not retry after $name', async function ({ lastPayload, error }) {
        const setup = createSetup(lastPayload);
        setup.websocket.send.mockRejectedValue(error);
        const integration = createSensor(setup);

        await register(integration);

        expect(setup.websocket.send).toHaveBeenCalledOnce();
        expect(setup.stored()).toEqual(lastPayload);
        expect(setup.status.setFailed).toHaveBeenCalledWith(
            'home-assistant.status.error_registering',
        );
        expect(setup.entityConfigNode.error).toHaveBeenCalledWith(
            `Error registering entity. Error Message: ${error.message}`,
        );
    });
});
