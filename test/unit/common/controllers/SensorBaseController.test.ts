import { EventEmitter } from 'events';
import { describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { createControllerDependencies } from '../../../../src/common/controllers/helpers';
import SensorBaseController, {
    SensorBaseNode,
    SensorBaseNodeProperties,
} from '../../../../src/common/controllers/SensorBaseController';
import InputService from '../../../../src/common/services/InputService';
import Status from '../../../../src/common/status/Status';
import HomeAssistant from '../../../../src/homeAssistant/HomeAssistant';
import { inputs, inputSchema } from '../../../../src/nodes/binary-sensor';

class TestNode extends EventEmitter {
    config: SensorBaseNodeProperties;
    debug = vi.fn();

    constructor(config: SensorBaseNodeProperties) {
        super();
        this.config = config;
    }
}

class TestSensorController extends SensorBaseController<
    SensorBaseNode,
    SensorBaseNodeProperties
> {}

describe('SensorBaseController', function () {
    it('ignores message overrides when inputOverride is block', function () {
        const node = new TestNode({
            state: 'payload.selected',
            stateType: 'msg',
            available: 'true',
            availableType: 'bool',
            attributes: [],
            inputOverride: 'block',
        } as SensorBaseNodeProperties);
        const homeAssistant = mock<HomeAssistant>();
        const inputService = new InputService<SensorBaseNodeProperties>({
            inputs,
            nodeConfig: node.config,
            schema: inputSchema,
        });

        const controller = new TestSensorController({
            node: node as unknown as SensorBaseNode,
            status: mock<Status>(),
            inputService,
            ...createControllerDependencies(
                node as unknown as SensorBaseNode,
                homeAssistant,
            ),
        });
        expect(controller).toBeInstanceOf(TestSensorController);

        const parsedMessage = inputService.parse({
            payload: {
                state: { text: 'not the configured state' },
                selected: 'configured state',
            },
        });

        expect(parsedMessage.state.value).toBe('payload.selected');
        expect(() => inputService.validate(parsedMessage)).not.toThrow();
    });
});
