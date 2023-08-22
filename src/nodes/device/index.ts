import { createControllerDependencies } from '../../common/controllers/helpers';
import ConfigError from '../../common/errors/ConfigError';
import ClientEvents from '../../common/events/ClientEvents';
import Events from '../../common/events/Events';
import { IntegrationEvent } from '../../common/integration/Integration';
import InputService from '../../common/services/InputService';
import State from '../../common/State';
import EventsStatus from '../../common/status/EventStatus';
import Status from '../../common/status/Status';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getExposeAsConfigNode, getServerConfigNode } from '../../helpers/node';
import { getHomeAssistant } from '../../homeAssistant';
import {
    HassDeviceCapability,
    HassDeviceTrigger,
} from '../../types/home-assistant';
import {
    BaseNode,
    BaseNodeProperties,
    OutputProperty,
} from '../../types/nodes';
import DeviceActionController from './DeviceActionController';
import DeviceIntegration from './DeviceIntegration';
import DeviceTriggerController from './DeviceTriggerController';

enum DeviceType {
    Action = 'action',
    Trigger = 'trigger',
}

export interface DeviceNodeProperties extends BaseNodeProperties {
    deviceType: DeviceType;
    device: string;
    event?: HassDeviceTrigger;
    capabilities?: HassDeviceCapability[];
    outputProperties: OutputProperty[];
    exposeAsEntityConfig: string;
}

export interface DeviceNode extends BaseNode {
    config: DeviceNodeProperties;
}

export default function neviceNode(
    this: DeviceNode,
    config: DeviceNodeProperties
) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    const serverConfigNode = getServerConfigNode(this.config.server);
    const homeAssistant = getHomeAssistant(serverConfigNode);

    const controllerDeps = createControllerDependencies(this, homeAssistant);

    let controller: DeviceActionController | DeviceTriggerController;
    let status: Status;
    switch (this.config.deviceType) {
        case DeviceType.Action: {
            status = new Status({
                config: serverConfigNode.config,
                node: this,
            });

            const inputService = new InputService<DeviceNodeProperties>({
                nodeConfig: this.config,
            });

            controller = new DeviceActionController({
                inputService,
                node: this,
                status,
                ...controllerDeps,
            });

            break;
        }
        case DeviceType.Trigger: {
            const clientEvents = new ClientEvents({
                node: this,
                emitter: homeAssistant.eventBus,
            });
            const exposeAsConfigNode = getExposeAsConfigNode(
                this.config.exposeAsEntityConfig
            );
            status = new EventsStatus({
                clientEvents,
                config: serverConfigNode.config,
                exposeAsEntityConfigNode: exposeAsConfigNode,
                node: this,
            });
            const nodeEvents = new Events({ node: this, emitter: this });
            const integration = new DeviceIntegration({
                node: this,
                clientEvents,
                homeAssistant,
                state: new State(this),
            });

            controller = new DeviceTriggerController({
                exposeAsConfigNode,
                node: this,
                status,
                ...controllerDeps,
            });

            nodeEvents.addListener(
                IntegrationEvent.Trigger,
                controller.onTrigger.bind(controller)
            );

            clientEvents.setStatus(status);
            exposeAsConfigNode?.integration.setStatus(status);
            integration.setStatus(status);
            integration.init();
            break;
        }
        default:
            throw new ConfigError([
                'ha-deivce.error.invalid_device_type',
                { device_type: this.config.deviceType },
            ]);
    }
}
