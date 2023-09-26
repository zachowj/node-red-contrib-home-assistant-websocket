import ConfigError from '../../common/errors/ConfigError';
import BidirectionalIntegration, {
    IntegrationMessage,
} from '../../common/integration/BidrectionalIntegration';
import { MessageType } from '../../common/integration/Integration';
import { DeviceCapabilityType, TimeUnit } from '../../const';
import {
    HassDeviceCapability,
    HassDeviceTrigger,
} from '../../types/home-assistant';
import { DeviceNode } from '.';

interface DeviceIntegrationMessage extends IntegrationMessage {
    type: MessageType.DeviceTrigger;
    node_id: string;
    device_trigger: unknown;
}

interface TriggerData extends HassDeviceTrigger {
    [key: string]: unknown;
}

export default class DeviceIntegration extends BidirectionalIntegration<DeviceNode> {
    #getTriggerData() {
        if (!this.node.config.event) {
            throw new ConfigError('ha-device.error.invalid_device_config');
        }

        const trigger: TriggerData = { ...this.node.config.event };
        if (this.node.config.capabilities?.length) {
            this.node.config.capabilities.forEach((cap) => {
                trigger[cap.name] = this.#getCapabilitiesValue(cap);
            });
        }

        return trigger;
    }

    #getCapabilitiesValue(cap: HassDeviceCapability) {
        switch (cap.type) {
            case DeviceCapabilityType.PositiveTimePeriod: {
                const unit = cap.unit || TimeUnit.Seconds;
                return { [unit]: cap.value };
            }
            case DeviceCapabilityType.Float:
                return Number(cap.value);
            case DeviceCapabilityType.String:
            default:
                return cap.value;
        }
    }

    protected getDiscoveryPayload(): DeviceIntegrationMessage {
        return {
            type: MessageType.DeviceTrigger,
            node_id: this.node.id,
            device_trigger: this.#getTriggerData(),
        };
    }
}
