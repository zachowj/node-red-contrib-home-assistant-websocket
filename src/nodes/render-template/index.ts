import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { Status } from '../../helpers/status';
import { checkValidServerConfig } from '../../helpers/utils';
import { BaseNode, NodeProperties } from '../../types/nodes';
import RenderTemplate from './controller';

export default function renderTemplateNode(
    this: BaseNode,
    config: NodeProperties
) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    checkValidServerConfig(this, this.config.server);
    const status = new Status(this);
    this.controller = new RenderTemplate({
        node: this,
        config: this.config,
        RED,
        status,
    });
}
