import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { Credentials } from '../../homeAssistant';
import { ServerNode, ServerNodeConfig } from '../../types/nodes';
import ConfigServer from './controller';

export default function configServerNode(
    this: ServerNode<Credentials>,
    config: ServerNodeConfig
) {
    RED.nodes.createNode(this, config);
    this.config = migrate(config);
    this.controller = new ConfigServer({
        node: this,
        config: this.config,
    });
    this.controller.init();
}
