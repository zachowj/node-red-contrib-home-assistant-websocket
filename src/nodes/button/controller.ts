import { RED } from '../../globals';
import { Status } from '../../helpers/status';
import { addEventListeners, removeEventListeners } from '../../helpers/utils';
import { HassEntity } from '../../types/home-assistant';
import { EntityNode, EntityNodeDef } from '../../types/nodes';
import BaseNode from '../BaseNode';

const nodeDefaults = {
    config: {
        entityConfig: {
            isNode: true,
        },
        outputProperties: {},
    },
};

export default class ButtonController extends BaseNode {
    status!: Status;
    nodeConfig!: EntityNodeDef;

    constructor({
        node,
        config,
        status,
    }: {
        node: EntityNode;
        config: EntityNodeDef;
        status: Status;
    }) {
        super({ node, config, RED, status, nodeOptions: nodeDefaults });

        addEventListeners(
            { triggered: this.onTrigger },
            this.nodeConfig?.entityConfig?.controller
        );
    }

    onTrigger = (data: { entity: HassEntity }) => {
        this.status.setSuccess('pressed');
        const message = {};
        this.setCustomOutputs(this.nodeConfig.outputProperties, message, {
            config: this.nodeConfig,
            entity: data.entity,
            entityState: data.entity.state,
            triggerId: data.entity.entity_id,
        });
        this.send(message);
    };

    onClose() {
        this.removeEventListeners();
    }

    removeEventListeners() {
        removeEventListeners(
            { triggered: this.onTrigger },
            this.nodeConfig?.entityConfig?.controller
        );
    }
}
