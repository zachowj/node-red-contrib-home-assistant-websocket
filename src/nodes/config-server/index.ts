import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import {
    closeHomeAssistant,
    createHomeAssistantClient,
    Credentials,
} from '../../homeAssistant';
import { ServerNode, ServerNodeConfig } from '../../types/nodes';

export interface ExposedNodes {
    [nodeId: string]: boolean;
}

export default function configServerNode(
    this: ServerNode<Credentials>,
    config: ServerNodeConfig
) {
    RED.nodes.createNode(this, config);
    this.config = migrate(config);
    this.exposedNodes = {};

    createHomeAssistantClient(this);

    this.on('close', () => {
        closeHomeAssistant(this.id);
    });
}
