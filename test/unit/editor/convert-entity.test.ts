import { EditorRED } from 'node-red';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mock, MockProxy, mockReset } from 'vitest-mock-extended';

import { EntityType, NodeType } from '../../../src/const';
import {
    convertEntityNode,
    EntityProperties,
} from '../../../src/editor/convert-entity';

declare global {
    // eslint-disable-next-line no-var
    var RED: EditorRED;
}
const NODE_DATA: EntityProperties = {
    id: 'oldId',
    type: NodeType.Entity,
    z: 'zId',
    name: 'i am name',
    server: 'serverId',
    version: 2,
    debugenabled: false,
    outputs: 1,
    entityType: EntityType.Sensor,
    config: [
        { property: 'name', value: 'name1' },
        { property: 'device_class', value: 'devcie1' },
        { property: 'icon', value: 'icon33' },
        { property: 'unit_of_measurement', value: 'uom' },
        { property: 'state_class', value: 'state1123' },
        { property: 'last_reset', value: 'last34234' },
    ],
    state: 'payload',
    stateType: 'msg',
    attributes: [],
    resend: true,
    outputLocation: 'payload',
    outputLocationType: 'none',
    inputOverride: 'allow',
    outputOnStateChange: false,
    outputPayload: '',
    outputPayloadType: 'none',
    x: 50,
    y: 100,
    wires: [['otherNodeId']],
};

const EXPECTED_CONFIG_NODE = {
    type: 'ha-entity-config',
    id: 'oldId',
    server: 'serverId',
    deviceConfig: '',
    name: 'sensor config for i am name',
    version: 0,
    entityType: 'sensor',
    haConfig: [
        { property: 'name', value: 'name1' },
        { property: 'device_class', value: 'devcie1' },
        { property: 'icon', value: 'icon33' },
        { property: 'unit_of_measurement', value: 'uom' },
        { property: 'state_class', value: 'state1123' },
        { property: 'last_reset', value: 'last34234' },
    ],
    resend: true,
};

const EXPECTED_BASE_NODE = {
    id: '123',
    version: 0,
    inputs: 1,
    name: 'i am name',
    entityConfig: 'oldId',
    g: undefined,
    x: 50,
    y: 100,
    z: 'zId',
    outputProperties: [],
};

const EXPECTED_SENSOR_NODE = {
    ...EXPECTED_BASE_NODE,
    type: NodeType.Sensor,
    outputs: 1,
    state: 'payload',
    stateType: 'msg',
    attributes: [],
    inputOverride: 'allow',
};

const EXPECTED_SWITCH_NODE = {
    ...EXPECTED_BASE_NODE,
    type: NodeType.Switch,
    outputs: 2,
    outputOnStateChange: false,
    enableInput: true,
};

describe('convert-entity', function () {
    let RED: MockProxy<EditorRED>;

    beforeEach(function () {
        const newId = '123';

        RED = mock<EditorRED>();

        RED.group.addToGroup = vi.fn();
        RED.group.removeFromGroup = vi.fn();

        // @ts-expect-error - function is not defined in types
        RED.nodes.getNodeLinks = vi.fn().mockReturnValue([]);
        RED.nodes.group = vi.fn();
        RED.nodes.id = vi.fn().mockReturnValue(newId);
        RED.nodes.import = vi.fn();
        RED.nodes.moveNodeToTab = vi.fn();
        RED.nodes.node = vi.fn().mockReturnValueOnce(null).mockReturnValue({
            id: newId,
        });
        RED.nodes.remove = vi.fn();

        RED.settings.get = vi.fn().mockReturnValue(0);

        RED.view.redraw = vi.fn();

        global.RED = RED;
    });

    afterEach(function () {
        mockReset(RED);
    });

    it('should remove old entity node and create config node and sensor node', function () {
        convertEntityNode(NODE_DATA);
        expect(RED.nodes.remove).toBeCalledWith('oldId');
        expect(RED.nodes.moveNodeToTab).toHaveBeenCalled();
        expect(RED.nodes.import).toBeCalledWith(EXPECTED_CONFIG_NODE);
        expect(RED.nodes.import).toBeCalledWith(EXPECTED_SENSOR_NODE);
        expect(RED.view.redraw).toBeCalledWith(true);
    });

    describe('config node creation', function () {
        it('should create config node with name', function () {
            const data = { ...NODE_DATA, name: 'my name' };
            convertEntityNode(data);
            const expected = {
                ...EXPECTED_CONFIG_NODE,
                name: 'sensor config for my name',
            };
            expect(RED.nodes.import).toHaveBeenCalledWith(expected);
        });
    });

    it("should remove and add to group if it's in a group", function () {
        RED.nodes.node = vi
            .fn()
            .mockReturnValueOnce(null)
            .mockReturnValue({ id: '123' });
        const data = { ...NODE_DATA, g: 'groupId' };
        convertEntityNode(data);
        expect(RED.group.removeFromGroup).toHaveBeenCalled();
        expect(RED.group.addToGroup).toHaveBeenCalled();
        expect(RED.nodes.group).toHaveBeenCalledTimes(2);
        expect(RED.nodes.group).toHaveBeenCalledWith('groupId');
    });

    describe('binary sensor/sensor', function () {
        it('should import state, stateType, attributes and inputOverride', function () {
            const data = {
                ...NODE_DATA,
                state: '123',
                stateType: 'num',
                attributes: [
                    {
                        property: 'attr1',
                        value: 'val1',
                        valueType: 'str',
                    },
                    {
                        property: 'attr2',
                        value: '123',
                        valueType: 'num',
                    },
                ],
                inputOverride: 'block',
            };
            convertEntityNode(data);
            const expected = {
                ...EXPECTED_SENSOR_NODE,
                state: '123',
                stateType: 'num',
                attributes: [
                    { property: 'attr1', value: 'val1', valueType: 'str' },
                    {
                        property: 'attr2',
                        value: '123',
                        valueType: 'num',
                    },
                ],
                inputOverride: 'block',
            };
            expect(RED.nodes.import).toHaveBeenCalledWith(expected);
        });

        it('should convert sensor output properties', function () {
            const data = {
                ...NODE_DATA,
                outputLocationType: 'msg',
                outputLocation: 'payload',
            };
            convertEntityNode(data);
            const expected = {
                ...EXPECTED_SENSOR_NODE,
                outputProperties: [
                    {
                        property: 'payload',
                        propertyType: 'msg',
                        value: '',
                        valueType: 'data',
                    },
                ],
            };
            expect(RED.nodes.import).toHaveBeenCalledWith(expected);
        });

        describe('binary sensor', function () {
            it('should create node of type ha-binary-sensor', function () {
                const data = {
                    ...NODE_DATA,
                    entityType: EntityType.BinarySensor,
                };
                convertEntityNode(data);
                const expected = {
                    ...EXPECTED_SENSOR_NODE,
                    type: NodeType.BinarySensor,
                };
                expect(RED.nodes.import).toHaveBeenCalledWith(expected);
            });
        });

        describe('sensor', function () {
            it('should create node of type ha-sensor', function () {
                const data = { ...NODE_DATA, entityType: EntityType.Sensor };
                convertEntityNode(data);
                const expected = {
                    ...EXPECTED_SENSOR_NODE,
                    type: NodeType.Sensor,
                };
                expect(RED.nodes.import).toHaveBeenCalledWith(expected);
            });
        });
    });

    describe('switch', function () {
        it('should set defaults', function () {
            const data = { ...NODE_DATA, entityType: EntityType.Switch };
            convertEntityNode(data);
            expect(RED.nodes.import).toHaveBeenCalledWith(EXPECTED_SWITCH_NODE);
        });

        it('should set outputOnStateChange to true', function () {
            const data = {
                ...NODE_DATA,
                entityType: EntityType.Switch,
                outputOnStateChange: true,
            };
            convertEntityNode(data);
            const expected = {
                ...EXPECTED_SWITCH_NODE,
                outputOnStateChange: true,
            };
            expect(RED.nodes.import).toHaveBeenCalledWith(expected);
        });

        it('should set outputOnStateChange to false', function () {
            const data = {
                ...NODE_DATA,
                entityType: EntityType.Switch,
                outputOnStateChange: false,
            };
            convertEntityNode(data);
            const expected = {
                ...EXPECTED_SWITCH_NODE,
                outputOnStateChange: false,
            };
            expect(RED.nodes.import).toHaveBeenCalledWith(expected);
        });

        it('should convert switch output properties', function () {
            const data = {
                ...NODE_DATA,
                entityType: EntityType.Switch,
                outputPayload: '123',
                outputPayloadType: 'num',
            };
            convertEntityNode(data);
            const expected = {
                ...EXPECTED_SWITCH_NODE,
                outputProperties: [
                    {
                        property: 'payload',
                        propertyType: 'msg',
                        value: '123',
                        valueType: 'num',
                    },
                ],
            };
            expect(RED.nodes.import).toHaveBeenCalledWith(expected);
        });
    });
});
