import chai, { expect } from 'chai';
import { EditorRED } from 'node-red';
import sinonChai from 'sinon-chai';
import sinon, { StubbedInstance, stubInterface } from 'ts-sinon';

import { EntityType, NodeType } from '../../src/const';
import {
    convertEntityNode,
    EntityProperties,
} from '../../src/editor/convert-entity';
import { resetStubInterface } from '../helpers';

chai.use(sinonChai);

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
    let RED: StubbedInstance<EditorRED>;

    beforeEach(function () {
        const newId = '123';

        RED = stubInterface<EditorRED>();

        RED.group.addToGroup = sinon.stub();
        RED.group.removeFromGroup = sinon.stub();

        // @ts-expect-error - function is not defined in types
        RED.nodes.getNodeLinks = sinon.stub().returns([]);
        RED.nodes.group = sinon.stub();
        RED.nodes.id = sinon.stub().returns(newId);
        RED.nodes.import = sinon.stub();
        RED.nodes.moveNodeToTab = sinon.stub();
        RED.nodes.node = sinon
            .stub()
            .onFirstCall()
            .returns(null)
            .onSecondCall()
            .returns({ id: newId });
        RED.nodes.remove = sinon.stub();

        RED.settings.get = sinon.stub().returns(0);

        RED.view.redraw = sinon.stub();

        global.RED = RED;
    });

    afterEach(function () {
        resetStubInterface(RED);
    });

    it('should remove old entity node and create config node and sensor node', function () {
        convertEntityNode(NODE_DATA);
        expect(RED.nodes.remove).to.have.been.calledWith('oldId');
        expect(RED.nodes.moveNodeToTab).to.have.been.called;
        expect(RED.nodes.import).to.have.been.calledWith(EXPECTED_CONFIG_NODE);
        expect(RED.nodes.import).to.have.been.calledWith(EXPECTED_SENSOR_NODE);
        expect(RED.view.redraw).to.have.been.calledWith(true);
    });

    describe('config node creation', function () {
        it('should create config node with name', function () {
            const data = { ...NODE_DATA, name: 'my name' };
            convertEntityNode(data);
            const expected = {
                ...EXPECTED_CONFIG_NODE,
                name: 'sensor config for my name',
            };
            expect(RED.nodes.import).to.have.been.calledWith(expected);
        });
    });

    it("should remove and add to group if it's in a group", function () {
        RED.nodes.node = sinon
            .stub()
            .onFirstCall()
            .returns(null)
            .onSecondCall()
            .returns({ id: '123' })
            .onThirdCall()
            .returns({ id: '123' });
        const data = { ...NODE_DATA, g: 'groupId' };
        convertEntityNode(data);
        expect(RED.group.removeFromGroup).to.have.been.called;
        expect(RED.group.addToGroup).to.have.been.called;
        expect(RED.nodes.group).to.have.been.calledTwice;
        expect(RED.nodes.group).to.have.been.calledWith('groupId');
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
            expect(RED.nodes.import).to.have.been.calledWith(expected);
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
            expect(RED.nodes.import).to.have.been.calledWith(expected);
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
                expect(RED.nodes.import).to.have.been.calledWith(expected);
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
                expect(RED.nodes.import).to.have.been.calledWith(expected);
            });
        });
    });

    describe('switch', function () {
        it('should set defaults', function () {
            const data = { ...NODE_DATA, entityType: EntityType.Switch };
            convertEntityNode(data);
            expect(RED.nodes.import).to.have.been.calledWith(
                EXPECTED_SWITCH_NODE,
            );
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
            expect(RED.nodes.import).to.have.been.calledWith(expected);
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
            expect(RED.nodes.import).to.have.been.calledWith(expected);
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
            expect(RED.nodes.import).to.have.been.calledWith(expected);
        });
    });
});
