const cloneDeep = require('lodash.clonedeep');

const EventsHaNode = require('../../lib/events-ha-node');
const {
    ZONE_ENTER,
    ZONE_LEAVE,
    ZONE_ENTER_OR_LEAVE,
} = require('../../lib/const');
const { getLocationData, getZoneData, inZone } = require('../../lib/utils');

module.exports = function (RED) {
    const nodeOptions = {
        config: {
            entities: {},
            event: {},
            zones: {},
        },
    };

    class Zone extends EventsHaNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);

            for (const entity of this.nodeConfig.entities) {
                this.addEventClientListener(
                    `ha_events:state_changed:${entity}`,
                    this.onStateChanged.bind(this)
                );
            }
        }

        onStateChanged(evt) {
            if (this.isEnabled === false || !this.isHomeAssistantRunning) {
                return;
            }
            const { entity_id: entityId, event } = cloneDeep(evt);

            const zones = this.getValidZones(event.old_state, event.new_state);

            if (!zones.length) {
                this.setStatusFailed(entityId);
                return;
            }

            event.new_state.timeSinceChangedMs =
                Date.now() - new Date(event.new_state.last_changed).getTime();

            const msg = {
                topic: entityId,
                payload: event.new_state.state,
                data: event,
                zones,
            };
            const statusMessage = `${entityId} ${
                this.nodeConfig.event
            } ${zones.map((z) => z.entity_id).join(',')}`;
            this.setStatusSuccess(statusMessage);
            this.send(msg);
        }

        getValidZones(fromState, toState) {
            const config = this.nodeConfig;
            const fromLocationData = getLocationData(fromState);
            const toLocationData = getLocationData(toState);
            if (!fromLocationData || !toLocationData) return [];
            const zones = this.getZones();
            const validZones = zones.filter((zone) => {
                const zoneData = getZoneData(zone);
                if (!zoneData) return false;
                const fromMatch = inZone(fromLocationData, zoneData);
                const toMatch = inZone(toLocationData, zoneData);

                return (
                    (config.event === ZONE_ENTER && !fromMatch && toMatch) ||
                    (config.event === ZONE_LEAVE && fromMatch && !toMatch) ||
                    (config.event === ZONE_ENTER_OR_LEAVE &&
                        fromMatch !== toMatch)
                );
            });

            return validZones;
        }

        getZones() {
            const node = this;
            const entities = this.nodeConfig.server.homeAssistant.getStates();
            const zones = [];
            for (const entityId in entities) {
                if (node.nodeConfig.zones.includes(entityId)) {
                    zones.push(entities[entityId]);
                }
            }

            return zones;
        }
    }
    RED.nodes.registerType('ha-zone', Zone);
};
