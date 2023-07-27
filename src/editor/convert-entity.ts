// TODO: Remove for version 1.0
import { EditorRED } from 'node-red';

import { EntityType, NodeType } from '../const';
import { HassExposedConfig } from './types';

declare const RED: EditorRED;

interface WireNode {
    id: string;
    z: string;
}
interface Wire {
    source: WireNode;
    target: WireNode;
    sourcePort: number;
}
interface Wires {
    source: Wire[];
    target: Wire[];
}
interface EntityAttribute {
    property: string;
    value: string;
    valueType: string;
}
export interface EntityProperties {
    type: NodeType.Entity;
    id: string;
    name: string;
    server: string;
    version: number;
    debugenabled: boolean;
    outputs: number;
    g?: string;
    x: number;
    y: number;
    z: string;
    entityType: EntityType;
    config: HassExposedConfig[];
    state: string;
    stateType: string;
    attributes: EntityAttribute[];
    resend: boolean;
    outputLocation: string;
    outputLocationType: string;
    inputOverride: string;
    outputOnStateChange: boolean;
    outputPayload: string;
    outputPayloadType: string;
    wires: string[][];
}

const createEntityConfigNode = (node: EntityProperties) => {
    RED.nodes.import({
        type: NodeType.EntityConfig,
        id: node.id,
        server: node.server,
        deviceConfig: '',
        name: `${node.entityType.replace('_', ' ')} config for ${
            node.name || node.id
        }`,
        version: RED.settings.get('haEntityConfigVersion', 0),
        entityType: node.entityType,
        haConfig: node.config ?? [],
        resend: node.resend ?? false,
    });
};

const convertToSeperateEntityNode = (data: EntityProperties, newId: string) => {
    let node: Record<string, unknown> = {
        id: newId,
        name: data.name,
        inputs: 1,
        outputs: 1,
        version: 0,
        g: data.g,
        x: data.x,
        y: data.y,
        z: data.z,
        entityConfig: data.id,
    };

    switch (data.entityType) {
        case EntityType.BinarySensor:
        case EntityType.Sensor:
            node = {
                ...node,
                type:
                    data.entityType === EntityType.Sensor
                        ? NodeType.Sensor
                        : NodeType.BinarySensor,
                state: data.state ?? 'payload',
                stateType: data.stateType ?? 'msg',
                attributes: data.attributes ?? [],
                inputOverride: data.inputOverride ?? 'allow',
                outputProperties:
                    data.outputLocationType === 'none'
                        ? []
                        : [
                              {
                                  property: data.outputLocation,
                                  propertyType: data.outputLocationType,
                                  value: '',
                                  valueType: 'data',
                              },
                          ],
            };
            break;
        case EntityType.Switch:
        default:
            node = {
                ...node,
                type: NodeType.Switch,
                outputs: 2,
                outputOnStateChange: data.outputOnStateChange ?? false,
                enableInput: true,
                outputProperties:
                    data.outputPayloadType === 'none'
                        ? []
                        : [
                              {
                                  property: 'payload',
                                  propertyType: 'msg',
                                  value: data.outputPayload,
                                  valueType: data.outputPayloadType,
                              },
                          ],
            };
            break;
    }

    RED.nodes.import(node);
};

const addLinks = (newId: string, wires: Wires) => {
    let type: keyof Wires;
    for (type in wires) {
        wires[type].forEach((wire) => {
            // Replace the old node id with the new node id
            RED.nodes.addLink({ ...wire, [type]: RED.nodes.node(newId) });
        });
    }
};

const generateId = () => {
    let id: string;
    do {
        id = RED.nodes.id();
    } while (RED.nodes.node(id));
    return id;
};

export const convertEntityNode = (node: EntityProperties) => {
    // Save the wires so we can add them to the new node
    const wires = {
        // @ts-expect-error - function is not defined in types
        source: RED.nodes.getNodeLinks(node.id),
        // @ts-expect-error - function is not defined in types
        target: RED.nodes.getNodeLinks(node.id, 1),
    };

    const newId = generateId();
    // If the node is in a group remove it so NR doesn't think the new config node is in the group
    if (node.g) {
        const oldEntityNode = RED.nodes.node(node.id);
        if (oldEntityNode) {
            RED.group.removeFromGroup(RED.nodes.group(node.g), oldEntityNode);
        }
    }
    RED.nodes.remove(node.id);
    createEntityConfigNode(node);
    convertToSeperateEntityNode(node, newId);
    addLinks(newId, wires);
    const entityNode = RED.nodes.node(newId);
    if (entityNode) {
        RED.nodes.moveNodeToTab(entityNode, node.z);
        if (node.g) {
            RED.group.addToGroup(RED.nodes.group(node.g), entityNode);
        }
        // @ts-expect-error - changed defined as readonly
        entityNode.changed = true;
    }
    RED.view.redraw(true);
};

export const convertEventNode = (node: any) => {
    // Save the wires so we can add them to the new node
    const wires = {
        // @ts-expect-error - function is not defined in types
        source: RED.nodes.getNodeLinks(node.id),
        // @ts-expect-error - function is not defined in types
        target: RED.nodes.getNodeLinks(node.id, 1),
    };

    const newId = generateId();
    // If the node is in a group remove it so NR doesn't think the new config node is in the group
    if (node.g) {
        const oldEntityNode = RED.nodes.node(node.id);
        if (oldEntityNode) {
            RED.group.removeFromGroup(RED.nodes.group(node.g), oldEntityNode);
        }
    }
    RED.nodes.remove(node.id);
    RED.nodes.import({
        type: NodeType.EntityConfig,
        id: node.id,
        server: node.server,
        deviceConfig: '',
        name: `exposed as for ${node.name || node.id}`,
        version: RED.settings.get('haEntityConfigVersion', 0),
        entityType: EntityType.Switch,
        haConfig: node.haConfig ?? [],
        resend: false,
    });
    RED.nodes.import({ ...node, id: newId, exposeAsEntityConfig: node.id });
    addLinks(newId, wires);
    const entityNode = RED.nodes.node(newId);
    if (entityNode) {
        RED.nodes.moveNodeToTab(entityNode, node.z);
        if (node.g) {
            RED.group.addToGroup(RED.nodes.group(node.g), entityNode);
        }
        // @ts-expect-error - changed defined as readonly
        entityNode.changed = true;
    }
    RED.view.redraw(true);

    return newId;
};
