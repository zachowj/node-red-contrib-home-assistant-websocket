import { Node, NodeDef } from 'node-red';

import storageService from '../common/services/StorageService';
import { RED } from '../globals';

export default function createNode(node: Node, config: NodeDef): void {
    RED.nodes.createNode(node, config);
    storageService.attach(node).catch((error) => node.error(error as Error));
}
