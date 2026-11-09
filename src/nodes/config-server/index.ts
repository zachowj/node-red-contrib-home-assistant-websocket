import { NodeEvent } from '../../common/events/Events';
import createNode from '../../helpers/createNode';
import { migrate } from '../../helpers/migrate';
import {
    closeHomeAssistant,
    createHomeAssistantClient,
    Credentials,
} from '../../homeAssistant';
import { NodeDone, ServerNode, ServerNodeConfig } from '../../types/nodes';

export interface ExposedNodes {
    [nodeId: string]: boolean;
}

export default function configServerNode(
    this: ServerNode<Credentials>,
    config: ServerNodeConfig,
) {
    createNode(this, config);
    this.config = migrate(config);
    this.exposedNodes = {};

    createHomeAssistantClient(this);

    this.on(NodeEvent.Close, (_removed: boolean, done: NodeDone) => {
        closeHomeAssistant(this.id)
            .catch((err: Error) => {
                this.error(err);
            })
            .finally(() => {
                // @ts-expect-error - set context second argument is optional
                this.context().global.set('homeassistant');
                done();
            });
    });
}
