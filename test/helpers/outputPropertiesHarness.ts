import { EventEmitter } from 'events';
import jsonata from 'jsonata';
import { set as lodashSet } from 'lodash';
import { NodeAPI } from 'node-red';
import selectn from 'selectn';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { createControllerDependencies } from '../../src/common/controllers/helpers';
import Status from '../../src/common/status/Status';
import { EntityStateCastType, TypedInputTypes } from '../../src/const';
import { setRED } from '../../src/globals';
import HomeAssistant from '../../src/homeAssistant/HomeAssistant';
import { NodeMessage, OutputProperty } from '../../src/types/nodes';

export const HA_BOOLEANS = ['on', 'yes'];

export class FakeOutputNode extends EventEmitter {
    id = 'node_1';
    status = vi.fn();
    debug = vi.fn();
    warn = vi.fn();
    error = vi.fn();
    send = vi.fn();
    flowStore = new Map<string, unknown>();
    globalStore = new Map<string, unknown>();
    wires: unknown[][] = [];

    constructor(public config: Record<string, any>) {
        super();
    }

    context() {
        const store = (map: Map<string, unknown>) => ({
            get: (key: string) => map.get(key),
            set: (key: string, val: unknown) => map.set(key, val),
        });
        return {
            flow: store(this.flowStore),
            global: store(this.globalStore),
        };
    }
}

export function setupOutputPropertiesRed() {
    const nodeApi = mock<NodeAPI>();
    (nodeApi as any).util = {
        getMessageProperty: (message: NodeMessage, property: string) =>
            selectn(property, message),
        setObjectProperty: (msg: NodeMessage, property: string, value: any) =>
            lodashSet(msg, property, value),
        parseContextStore: (property: string) => ({
            key: property,
            store: undefined,
        }),
        prepareJSONataExpression: (expression: string) => jsonata(expression),
        evaluateJSONataExpression: (
            expr: jsonata.Expression,
            message: unknown,
            callback: (err: unknown, res?: unknown) => void,
        ) => {
            expr.evaluate(message).then(
                (res) => callback(undefined, res),
                (err) => callback(err),
            );
        },
    };
    (nodeApi as any).nodes = {
        getNode: () => ({
            config: { addon: true, ha_boolean: HA_BOOLEANS },
        }),
    };
    setRED(nodeApi);
}

export function createOutputControllerDeps(node: FakeOutputNode) {
    return {
        node: node as any,
        status: mock<Status>(),
        ...createControllerDependencies(node as any, mock<HomeAssistant>()),
    };
}

export const outputProperty = (
    valueType: TypedInputTypes | string,
    value = '',
    propertyType: 'msg' | 'flow' | 'global' = 'msg',
    property = 'out',
): OutputProperty =>
    ({ property, propertyType, value, valueType }) as OutputProperty;

export interface OutputCase {
    name: string;
    valueType: TypedInputTypes;
    value?: string;
    expected: unknown;
    flow?: Record<string, unknown>;
    global?: Record<string, unknown>;
}

export const entityStateCases = (state: string): OutputCase[] => [
    {
        name: 'entityState string',
        valueType: TypedInputTypes.EntityState,
        value: EntityStateCastType.String,
        expected: state,
    },
    {
        name: 'entityState number',
        valueType: TypedInputTypes.EntityState,
        value: EntityStateCastType.Number,
        expected: Number(state),
    },
    {
        name: 'entityState boolean',
        valueType: TypedInputTypes.EntityState,
        value: EntityStateCastType.Boolean,
        expected:
            state === 'true' ||
            (!isNaN(Number(state)) && Boolean(Number(state))),
    },
    {
        name: 'entityState ha_boolean',
        valueType: TypedInputTypes.EntityState,
        value: EntityStateCastType.HA_Boolean,
        expected: HA_BOOLEANS.includes(state),
    },
];

export interface OutputPropertiesSuite {
    title: string;
    // Builds the node + controller and triggers its output path.
    run: (
        outputProperties: OutputProperty[],
        node: FakeOutputNode,
    ) => Promise<NodeMessage | undefined>;
    // Config the node is created with, also what `config` outputs are compared against.
    config?: Record<string, unknown>;
    // Value types specific to this controller (the data it passes as extras).
    specific?: OutputCase[];
}

const T = TypedInputTypes;

const commonCases: OutputCase[] = [
    { name: 'str', valueType: T.String, value: 'hello', expected: 'hello' },
    { name: 'num', valueType: T.Number, value: '42', expected: 42 },
    { name: 'bool true', valueType: T.Boolean, value: 'true', expected: true },
    {
        name: 'bool false',
        valueType: T.Boolean,
        value: 'false',
        expected: false,
    },
    {
        name: 'json',
        valueType: T.JSON,
        value: '{"a":[1,2]}',
        expected: { a: [1, 2] },
    },
    {
        name: 'json invalid',
        valueType: T.JSON,
        value: '{nope',
        expected: undefined,
    },
    { name: 'none', valueType: T.None, expected: undefined },
    { name: 're', valueType: T.Regex, value: '^a+$', expected: '^a+$' },
    { name: 'env', valueType: T.Enviroment, value: 'X', expected: 'X' },
    {
        name: 'jsonata',
        valueType: T.JSONata,
        value: '1 + 2',
        expected: 3,
    },
    {
        name: 'jsonata empty',
        valueType: T.JSONata,
        value: '',
        expected: undefined,
    },
    {
        name: 'flow context',
        valueType: T.Flow,
        value: 'flowKey',
        flow: { flowKey: 'from-flow' },
        expected: 'from-flow',
    },
    {
        name: 'global context',
        valueType: T.Global,
        value: 'globalKey',
        global: { globalKey: 'from-global' },
        expected: 'from-global',
    },
    {
        name: 'msg (new message has no input)',
        valueType: T.Message,
        value: 'payload',
        expected: undefined,
    },
];

export function describeOutputProperties(suite: OutputPropertiesSuite) {
    describe(`${suite.title} output properties`, function () {
        beforeAll(setupOutputPropertiesRed);

        const makeNode = () =>
            new FakeOutputNode({
                name: 'test',
                server: 'server_1',
                outputProperties: [],
                ...suite.config,
            });

        async function runCase(testCase: OutputCase) {
            const node = makeNode();
            for (const [k, v] of Object.entries(testCase.flow ?? {})) {
                node.flowStore.set(k, v);
            }
            for (const [k, v] of Object.entries(testCase.global ?? {})) {
                node.globalStore.set(k, v);
            }
            const msg = await suite.run(
                [outputProperty(testCase.valueType, testCase.value)],
                node,
            );
            return { msg, node };
        }

        it.each([...commonCases, ...(suite.specific ?? [])])(
            'valueType $name',
            async function (testCase) {
                const { msg } = await runCase(testCase);
                expect(msg?.out).toEqual(testCase.expected);
            },
        );

        it('date sets the current timestamp', async function () {
            const before = Date.now();
            const { msg } = await runCase({
                name: 'date',
                valueType: T.Date,
                expected: undefined,
            });
            expect(msg?.out).toBeGreaterThanOrEqual(before);
            expect(msg?.out).toBeLessThanOrEqual(Date.now());
        });

        it('config outputs a copy of the full node config', async function () {
            const { msg, node } = await runCase({
                name: 'config',
                valueType: T.Config,
                expected: undefined,
            });
            expect(msg?.out).toEqual(node.config);
            expect(msg?.out).not.toBe(node.config);
        });

        it('config outputs a nested config value', async function () {
            const { msg, node } = await runCase({
                name: 'config name',
                valueType: T.Config,
                value: 'name',
                expected: undefined,
            });
            expect(msg?.out).toEqual(node.config.name);
        });

        it('writes to msg, flow and global targets', async function () {
            const node = makeNode();
            const msg = await suite.run(
                [
                    outputProperty(T.String, 'a', 'msg', 'nested.value'),
                    outputProperty(T.String, 'b', 'flow', 'flowOut'),
                    outputProperty(T.String, 'c', 'global', 'globalOut'),
                ],
                node,
            );

            expect(msg).toMatchObject({ nested: { value: 'a' } });
            expect(node.flowStore.get('flowOut')).toBe('b');
            expect(node.globalStore.get('globalOut')).toBe('c');
        });

        it('applies properties in order', async function () {
            const node = makeNode();
            const msg = await suite.run(
                [
                    outputProperty(T.String, 'first', 'msg', 'out'),
                    outputProperty(T.String, 'second', 'msg', 'out'),
                ],
                node,
            );

            expect(msg?.out).toBe('second');
        });

        it('sends the message with no output properties', async function () {
            const node = makeNode();
            const msg = await suite.run([], node);

            expect(msg).toBeDefined();
            expect(node.send).toHaveBeenCalled();
        });
    });
}
