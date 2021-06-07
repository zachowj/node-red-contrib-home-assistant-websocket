import Api = require('./controllers/Api');
import CallService = require('./controllers/CallService');
import ConfigServer = require('./controllers/ConfigServer');
import CurrentState = require('./controllers/CurrentState');
import DeviceAction = require('./controllers/device/DeviceAction');
import DeviceTrigger = require('./controllers/device/DeviceTrigger');
import EventsAll = require('./controllers/EventsAll');
import EventsState = require('./controllers/EventsState');
import FireEvent = require('./controllers/FireEvent');
import GetEntities = require('./controllers/GetEntities');
import GetHistory = require('./controllers/GetHistory');
import PollState = require('./controllers/PollState');
import RenderTemplate = require('./controllers/RenderTemplate');
import Sensor = require('./controllers/entity/Sensor');
import Switch = require('./controllers/entity/Switch');
import Tag = require('./controllers/Tag');
import Time = require('./controllers/Time');
import TriggerState = require('./controllers/TriggerState');
import WaitUntil = require('./controllers/WaitUntil');
import Webhook = require('./controllers/Webhook');
import Zone = require('./controllers/Zone');
import { Status, EventsStatus, SwitchEntityStatus } from './helpers/status';
import { createRoutes } from './routes';
import { getExposedSettings } from './helpers/exposed-settings';
import { migrate } from './migrations';
import { setRED } from './globals';
import { NodeAPI, NodeDef } from 'node-red';
import { BaseNode, ConfigNode, DeviceNode, EntityNode } from './types/nodes';

module.exports = function (RED: NodeAPI) {
    setRED(RED);
    createRoutes();

    function apiNode(this: BaseNode, config: NodeDef) {
        RED.nodes.createNode(this, config);

        this.config = migrate(config);
        const status = new Status(this);
        this.controller = new Api({
            node: this,
            config: this.config,
            RED,
            status,
        });
    }

    function callServiceNode(this: BaseNode, config: NodeDef) {
        RED.nodes.createNode(this, config);

        this.config = migrate(config);
        const status = new Status(this);
        this.controller = new CallService({
            node: this,
            config: this.config,
            RED,
            status,
        });
    }

    function configServerNode(this: ConfigNode, config: NodeDef) {
        RED.nodes.createNode(this, config);

        this.config = migrate(config);
        this.controller = new ConfigServer({
            node: this,
            config: this.config,
            RED,
        });
        this.controller.init();
    }

    function currentStateNode(this: BaseNode, config: NodeDef) {
        RED.nodes.createNode(this, config);

        this.config = migrate(config);
        const status = new Status(this);
        this.controller = new CurrentState({
            node: this,
            config: this.config,
            RED,
            status,
        });
    }

    function deviceNode(this: DeviceNode, config: NodeDef) {
        RED.nodes.createNode(this, config);

        this.config = migrate(config);
        const params = {
            node: this,
            config: this.config,
            RED,
        };
        switch (this.config.deviceType) {
            case 'action': {
                const status = new Status(this);
                this.controller = new DeviceAction({ ...params, status });
                break;
            }
            case 'trigger': {
                const status = new EventsStatus(this);
                this.controller = new DeviceTrigger({ ...params, status });
                break;
            }
            default:
                this.status({ text: 'Error' });
                throw new Error(
                    `Invalid entity type: ${this.config.deviceType}`
                );
        }
    }

    function entityNode(this: EntityNode, config: NodeDef) {
        RED.nodes.createNode(this, config);

        this.config = migrate(config);

        switch (this.config.entityType) {
            case 'binary_sensor':
            case 'sensor': {
                const status = new Status(this);
                this.controller = new Sensor({
                    node: this,
                    config: this.config,
                    RED,
                    status,
                });

                break;
            }
            case 'switch': {
                const status = new SwitchEntityStatus(this);
                this.controller = new Switch({
                    node: this,
                    config: this.config,
                    RED,
                    status,
                });
                break;
            }
            default:
                this.status({ text: 'Error' });
                throw new Error(
                    `Invalid entity type: ${this.config.entityType}`
                );
        }
    }

    function eventsAllNode(this: BaseNode, config: NodeDef) {
        RED.nodes.createNode(this, config);

        this.config = migrate(config);
        const status = new EventsStatus(this);
        this.controller = new EventsAll({
            node: this,
            config: this.config,
            RED,
            status,
        });
    }

    function eventsStateNode(this: BaseNode, config: NodeDef) {
        RED.nodes.createNode(this, config);

        this.config = migrate(config);
        const status = new EventsStatus(this);
        this.controller = new EventsState({
            node: this,
            config: this.config,
            RED,
            status,
        });
    }

    function fireEventNode(this: BaseNode, config: NodeDef) {
        RED.nodes.createNode(this, config);

        this.config = migrate(config);
        const status = new Status(this);
        this.controller = new FireEvent({
            node: this,
            config: this.config,
            RED,
            status,
        });
    }

    function getEntitiesNode(this: BaseNode, config: NodeDef) {
        RED.nodes.createNode(this, config);

        this.config = migrate(config);
        const status = new Status(this);
        this.controller = new GetEntities({
            node: this,
            config: this.config,
            RED,
            status,
        });
    }

    function getHistoryNode(this: BaseNode, config: NodeDef) {
        RED.nodes.createNode(this, config);

        this.config = migrate(config);
        const status = new Status(this);
        this.controller = new GetHistory({
            node: this,
            config: this.config,
            RED,
            status,
        });
    }

    function pollStateNode(this: BaseNode, config: NodeDef) {
        RED.nodes.createNode(this, config);

        this.config = migrate(config);
        const status = new EventsStatus(this);
        this.controller = new PollState({
            node: this,
            config: this.config,
            RED,
            status,
        });
    }

    function renderTemplateNode(this: BaseNode, config: NodeDef) {
        RED.nodes.createNode(this, config);

        this.config = migrate(config);
        const status = new Status(this);
        this.controller = new RenderTemplate({
            node: this,
            config: this.config,
            RED,
            status,
        });
    }

    function tagNode(this: BaseNode, config: NodeDef) {
        RED.nodes.createNode(this, config);

        this.config = migrate(config);
        const status = new EventsStatus(this);
        this.controller = new Tag({
            node: this,
            config: this.config,
            RED,
            status,
        });
    }

    function timeNode(this: BaseNode, config: NodeDef) {
        RED.nodes.createNode(this, config);

        this.config = migrate(config);
        const status = new EventsStatus(this);
        this.controller = new Time({
            node: this,
            config: this.config,
            RED,
            status,
        });
    }

    function triggerStateNode(this: BaseNode, config: NodeDef) {
        RED.nodes.createNode(this, config);

        this.config = migrate(config);
        const status = new EventsStatus(this);
        this.controller = new TriggerState({
            node: this,
            config: this.config,
            RED,
            status,
        });
    }

    function waitUntilNode(this: BaseNode, config: NodeDef) {
        RED.nodes.createNode(this, config);

        this.config = migrate(config);
        const status = new Status(this);
        this.controller = new WaitUntil({
            node: this,
            config: this.config,
            RED,
            status,
        });
    }

    function webhookNode(this: BaseNode, config: NodeDef) {
        RED.nodes.createNode(this, config);

        this.config = migrate(config);
        const status = new EventsStatus(this);
        this.controller = new Webhook({
            node: this,
            config: this.config,
            RED,
            status,
        });
    }

    function zoneNode(this: BaseNode, config: NodeDef) {
        RED.nodes.createNode(this, config);

        this.config = migrate(config);
        const status = new EventsStatus(this);
        this.controller = new Zone({
            node: this,
            config: this.config,
            RED,
            status,
        });
    }

    const nodes = {
        'ha-api': apiNode,
        'api-call-service': callServiceNode,
        server: configServerNode,
        'api-current-state': currentStateNode,
        'ha-device': deviceNode,
        'ha-entity': entityNode,
        'server-events': eventsAllNode,
        'server-state-changed': eventsStateNode,
        'ha-fire-event': fireEventNode,
        'ha-get-entities': getEntitiesNode,
        'api-get-history': getHistoryNode,
        'poll-state': pollStateNode,
        'api-render-template': renderTemplateNode,
        'trigger-state': triggerStateNode,
        'ha-tag': tagNode,
        'ha-time': timeNode,
        'ha-wait-until': waitUntilNode,
        'ha-webhook': webhookNode,
        'ha-zone': zoneNode,
    };

    for (const type in nodes) {
        // @ts-ignore
        RED.nodes.registerType(type, nodes[type], getExposedSettings(type));
    }
};
