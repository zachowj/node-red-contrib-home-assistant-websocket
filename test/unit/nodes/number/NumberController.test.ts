import { EventEmitter } from 'events';
import { describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { createControllerDependencies } from '../../../../src/common/controllers/helpers';
import ValueEntityIntegration from '../../../../src/common/integration/ValueEntityIntegration';
import InputService from '../../../../src/common/services/InputService';
import Status from '../../../../src/common/status/Status';
import { TypedInputTypes, ValueIntegrationMode } from '../../../../src/const';
import HomeAssistant from '../../../../src/homeAssistant/HomeAssistant';
import {
    inputs,
    inputSchema,
    NumberNode,
    NumberNodeProperties,
} from '../../../../src/nodes/number';
import NumberController from '../../../../src/nodes/number/NumberController';
import { NodeDone, NodeMessage, NodeSend } from '../../../../src/types/nodes';
import { setupControllerTestHarnessGlobals } from '../../../helpers/controllerTestHarness';

setupControllerTestHarnessGlobals();

class TestNode extends EventEmitter {
    id = 'number_node';
    config = {
        mode: ValueIntegrationMode.Set,
        value: 'payload',
        valueType: TypedInputTypes.Message,
        outputProperties: [],
    } as unknown as NumberNodeProperties;

    debug = vi.fn();
    status = vi.fn();

    context() {
        return { flow: { get: vi.fn() }, global: { get: vi.fn() } };
    }
}

function createNumberController(haConfig: Record<string, unknown> = {}) {
    const node = new TestNode();
    const integration = mock<ValueEntityIntegration>({
        isConnected: true,
        isIntegrationLoaded: true,
    });
    integration.getEntityHomeAssistantConfigValue.mockImplementation(
        (key) => haConfig[key] as string | number | undefined,
    );
    integration.updateValue.mockResolvedValue(undefined);
    // eslint-disable-next-line no-new
    new NumberController({
        node: node as unknown as NumberNode,
        status: mock<Status>(),
        inputService: new InputService<NumberNodeProperties>({
            inputs,
            nodeConfig: node.config,
            schema: inputSchema,
        }),
        integration,
        ...createControllerDependencies(
            node as unknown as NumberNode,
            mock<HomeAssistant>(),
        ),
    });
    const inputHandler = node.listeners('input')[0] as (
        message: NodeMessage,
        send: NodeSend,
        done: NodeDone,
    ) => Promise<void>;

    return {
        integration,
        async input(payload: unknown) {
            const done = vi.fn<NodeDone>();
            await inputHandler({ payload }, vi.fn<NodeSend>(), done);
            return { done };
        },
    };
}

describe('NumberController', function () {
    it.each([NaN, Infinity, -Infinity])(
        'rejects %s without sending it',
        async function (value) {
            const { integration, input } = createNumberController();

            const { done } = await input(value);

            expect(integration.updateValue).not.toHaveBeenCalled();
            expect(done).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    message: 'ha-number.error.value_not_number',
                }),
            );
        },
    );

    it.each([
        {
            name: 'below a min of 0 becomes 0',
            haConfig: { min_value: 0 },
            value: -5,
            sent: 0,
        },
        {
            name: 'above a max of 0 becomes 0',
            haConfig: { max_value: 0 },
            value: 5,
            sent: 0,
        },
        { name: 'no limits', haConfig: {}, value: -5, sent: -5 },
        {
            name: 'empty limits',
            haConfig: { min_value: '', max_value: '' },
            value: -5,
            sent: -5,
        },
    ])(
        'keeps a value inside its limits: $name',
        async function ({ haConfig, value, sent }) {
            const { integration, input } = createNumberController(haConfig);

            await input(value);

            expect(integration.updateValue).toHaveBeenCalledExactlyOnceWith(
                sent,
            );
        },
    );
});
