import { EventEmitter } from 'events';
import { readFileSync } from 'fs';
import { set as lodashSet } from 'lodash';
import { NodeAPI } from 'node-red';
import { join } from 'path';
import selectn from 'selectn';
import { beforeAll, vi } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';

import { createControllerDependencies } from '../../src/common/controllers/helpers';
import UnidirectionalEntityIntegration from '../../src/common/integration/UnidirectionalEntityIntegration';
import InputService from '../../src/common/services/InputService';
import storageService from '../../src/common/services/StorageService';
import State from '../../src/common/State';
import Status from '../../src/common/status/Status';
import { EntityType, TypedInputTypes } from '../../src/const';
import { setRED } from '../../src/globals';
import HomeAssistant from '../../src/homeAssistant/HomeAssistant';
import HttpAPI from '../../src/homeAssistant/Http';
import WebsocketAPI, { ClientState } from '../../src/homeAssistant/Websocket';
import { inputs, inputSchema } from '../../src/nodes/binary-sensor';
import BinarySensorController from '../../src/nodes/binary-sensor/BinarySensorController';
import type { SelectorType } from '../../src/nodes/config-server/editor';
import {
    EntityConfigNode,
    EntityConfigNodeProperties,
} from '../../src/nodes/entity-config';
import SensorController from '../../src/nodes/sensor/SensorController';
import {
    NodeDone,
    NodeMessage,
    NodeSend,
    ServerNodeConfig,
} from '../../src/types/nodes';

type NodeKind = 'sensor' | 'binary_sensor';

const errorLocale = JSON.parse(
    readFileSync(join(process.cwd(), 'src/common/errors/locale.json'), 'utf8'),
) as Record<string, any>;
const statusLocale = JSON.parse(
    readFileSync(join(process.cwd(), 'src/common/status/locale.json'), 'utf8'),
) as Record<string, any>;

function translateKey(key: string, params?: Record<string, unknown>): string {
    const catalogs = [errorLocale, statusLocale];
    let template: unknown = key;
    for (const catalog of catalogs) {
        const resolved = key.split('.').reduce<any>((acc, part) => {
            if (acc && typeof acc === 'object' && part in acc) {
                return acc[part];
            }
            return undefined;
        }, catalog);
        if (typeof resolved === 'string') {
            template = resolved;
            break;
        }
    }

    let message = typeof template === 'string' ? template : key;
    if (params) {
        for (const [param, value] of Object.entries(params)) {
            message = message.split(`__${param}__`).join(String(value));
        }
    }
    return message;
}
const defaultServerConfig: ServerNodeConfig = {
    id: 'server_config',
    type: 'server',
    name: 'server',
    z: 'flow',
    version: 0,
    addon: false,
    rejectUnauthorizedCerts: true,
    ha_boolean: ['y', 'yes', 'true', 'on', 'home', 'open'],
    connectionDelay: false,
    cacheJson: true,
    heartbeat: false,
    heartbeatInterval: 30,
    areaSelector: 'id' as SelectorType,
    deviceSelector: 'id' as SelectorType,
    entitySelector: 'id' as SelectorType,
    statusSeparator: ' ',
    statusYear: 'hidden',
    statusMonth: 'short',
    statusDay: 'numeric',
    statusHourCycle: 'h23',
    statusTimeFormat: 'h:m',
    enableGlobalContextStore: false,
};

class MockRuntimeNode extends EventEmitter {
    id = 'runtime_node';
    config: any;
    status = vi.fn();
    debug = vi.fn();
    warn = vi.fn();
    error = vi.fn();

    context() {
        return {
            flow: {
                get: vi.fn(),
                set: vi.fn(),
            },
            global: {
                get: vi.fn(),
                set: vi.fn(),
            },
            get: vi.fn(),
            set: vi.fn(),
        };
    }
}

function setupTestRed() {
    const nodeApiStub = mock<NodeAPI>();
    nodeApiStub._.mockImplementation(
        (key: string, params?: Record<string, unknown>) =>
            translateKey(key, params),
    );
    (nodeApiStub as any).util = {
        evaluateJSONataExpression: vi.fn(),
        getMessageProperty: (message: NodeMessage, property: string) =>
            selectn(property, message),
        parseContextStore: (property: string) => ({
            key: property,
            store: undefined,
        }),
        prepareJSONataExpression: vi.fn(),
        setObjectProperty: (
            message: NodeMessage,
            property: string,
            value: any,
        ) => {
            lodashSet(message, property, value);
        },
    };
    (nodeApiStub as any).settings = {
        userDir: '/tmp',
    };
    setRED(nodeApiStub);
}

export function setupControllerTestHarnessGlobals() {
    beforeAll(async () => {
        setupTestRed();
        await storageService.init();
    });
}

function createBaseConfig(kind: NodeKind) {
    return {
        id: 'node_1',
        type: kind === 'sensor' ? 'ha-sensor' : 'ha-binary-sensor',
        name: `${kind}-node`,
        z: 'flow_1',
        version: 0,
        entityType: kind,
        available: 'true',
        availableType: TypedInputTypes.Boolean,
        attributes: [],
        inputOverride: 'allow' as const,
        outputProperties: [],
        resend: false,
        state: 'payload',
        stateType: TypedInputTypes.Message,
    };
}

export interface ControllerHarness {
    homeAssistant: HomeAssistant;
    node: MockRuntimeNode;
    websocket: MockProxy<WebsocketAPI>;
    asyncInput(message: NodeMessage): Promise<{
        done: ReturnType<typeof vi.fn<NodeDone>>;
        send: ReturnType<typeof vi.fn<NodeSend>>;
    }>;
    reset(): void;
}

export function createControllerHarness({
    kind,
    configOverrides,
    integrationVersion = '4.2.4',
}: {
    kind: NodeKind;
    configOverrides?: Record<string, any>;
    integrationVersion?: string;
}): ControllerHarness {
    const node = new MockRuntimeNode();
    node.config = {
        ...createBaseConfig(kind),
        ...configOverrides,
    };

    const websocket = mock<WebsocketAPI>();
    websocket.send.mockResolvedValue(undefined as never);
    websocket.connectionState = ClientState.Connected;
    websocket.integrationVersion = integrationVersion;
    websocket.isHomeAssistantRunning = true;

    const homeAssistant = new HomeAssistant({
        websocketAPI: websocket,
        httpAPI: mock<HttpAPI>(),
        eventBus: new EventEmitter(),
    });

    const entityConfigNode =
        new MockRuntimeNode() as unknown as EntityConfigNode;
    entityConfigNode.id = 'entity_config_node';
    entityConfigNode.config = {
        entityType:
            kind === 'sensor' ? EntityType.Sensor : EntityType.BinarySensor,
        server: 'server_1',
        deviceConfig: '',
        resend: false,
        haConfig: [],
    } as EntityConfigNodeProperties;

    const state = new State(entityConfigNode);
    const integration = new UnidirectionalEntityIntegration({
        clientEvents: mock<any>(),
        homeAssistant,
        state,
        entityConfigNode,
    });
    entityConfigNode.integration = integration;

    const status = new Status({
        config: defaultServerConfig,
        node: node as any,
    });
    const controllerDeps = createControllerDependencies(
        node as any,
        homeAssistant,
    );
    const inputService = new InputService({
        inputs,
        nodeConfig: node.config,
        schema: inputSchema,
    });

    if (kind === 'sensor') {
        // eslint-disable-next-line no-new
        new SensorController({
            inputService,
            node: node as any,
            status,
            integration,
            ...controllerDeps,
        });
    } else {
        // eslint-disable-next-line no-new
        new BinarySensorController({
            inputService,
            node: node as any,
            status,
            integration,
            ...controllerDeps,
        });
    }

    const inputHandler = node.listeners('input')[0] as (
        message: NodeMessage,
        send: NodeSend,
        done: NodeDone,
    ) => Promise<void>;

    return {
        homeAssistant,
        node,
        websocket,
        async asyncInput(message: NodeMessage) {
            const send = vi.fn<NodeSend>();
            const done = vi.fn<NodeDone>();
            await inputHandler(message, send, done);
            return { send, done };
        },
        reset() {
            node.status.mockClear();
            websocket.send.mockClear();
        },
    };
}
