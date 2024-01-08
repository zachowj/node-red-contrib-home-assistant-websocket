import { createControllerDependencies } from '../../common/controllers/helpers';
import ClientEvents from '../../common/events/ClientEvents';
import EventsStatus from '../../common/status/EventStatus';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getExposeAsConfigNode, getServerConfigNode } from '../../helpers/node';
import { getHomeAssistant } from '../../homeAssistant';
import { BaseNode, BaseNodeProperties } from '../../types/nodes';
import ZoneController from './ZoneController';

export interface ZoneNodeProperties extends BaseNodeProperties {
    entities: string[];
    event: 'enter' | 'leave' | 'enter_leave';
    zones: string[];
    exposeAsEntityConfig: string;
}

export interface ZoneNode extends BaseNode {
    config: ZoneNodeProperties;
}

export default function zoneNode(this: ZoneNode, config: ZoneNodeProperties) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    const serverConfigNode = getServerConfigNode(this.config.server);
    const homeAssistant = getHomeAssistant(serverConfigNode);
    const exposeAsConfigNode = getExposeAsConfigNode(
        this.config.exposeAsEntityConfig,
    );
    const clientEvents = new ClientEvents({
        node: this,
        emitter: homeAssistant.eventBus,
    });

    const status = new EventsStatus({
        clientEvents,
        config: serverConfigNode.config,
        exposeAsEntityConfigNode: exposeAsConfigNode,
        node: this,
    });
    clientEvents.setStatus(status);
    exposeAsConfigNode?.integration.setStatus(status);
    const controllerDeps = createControllerDependencies(this, homeAssistant);

    const controller = new ZoneController({
        node: this,
        status,
        ...controllerDeps,
    });
    controller.setExposeAsConfigNode(exposeAsConfigNode);

    for (const entity of this.config.entities) {
        clientEvents.addListener(
            `ha_events:state_changed:${entity}`,
            controller.onStateChanged.bind(controller),
        );
    }
}
