const Api = require('./nodes/Api');
const CallService = require('./nodes/CallService');
const ConfigServer = require('./nodes/ConfigServer');
const CurrentState = require('./nodes/CurrentState');
const Entity = require('./nodes/Entity');
const EventsAll = require('./nodes/EventsAll');
const EventsState = require('./nodes/EventsState');
const FireEvent = require('./nodes/FireEvent');
const GetEntities = require('./nodes/GetEntities');
const GetHistory = require('./nodes/GetHistory');
const PollState = require('./nodes/PollState');
const RenderTemplate = require('./nodes/RenderTemplate');
const Time = require('./nodes/Time');
const TriggerState = require('./nodes/TriggerState');
const WaitUntil = require('./nodes/WaitUntil');
const Webhook = require('./nodes/Webhook');
const Zone = require('./nodes/Zone');
const { createRoutes } = require('./routes');

module.exports = function (RED) {
    createRoutes(RED);

    function apiNode(config) {
        RED.nodes.createNode(this, config);

        this.config = config;
        this.controller = new Api({ node: this, config, RED });
    }

    function callServiceNode(config) {
        RED.nodes.createNode(this, config);

        this.config = config;
        this.controller = new CallService({ node: this, config, RED });
    }

    function configServerNode(config) {
        RED.nodes.createNode(this, config);

        this.config = config;
        this.controller = new ConfigServer({ node: this, config, RED });
        this.controller.init();
    }

    function currentStateNode(config) {
        RED.nodes.createNode(this, config);

        this.config = config;
        this.controller = new CurrentState({ node: this, config, RED });
    }

    function entityNode(config) {
        RED.nodes.createNode(this, config);

        this.config = config;
        this.controller = new Entity({ node: this, config, RED });
    }

    function eventsAllNode(config) {
        RED.nodes.createNode(this, config);

        this.config = config;
        this.controller = new EventsAll({ node: this, config, RED });
    }

    function eventsStateNode(config) {
        RED.nodes.createNode(this, config);

        this.config = config;
        this.controller = new EventsState({ node: this, config, RED });
    }

    function fireEventNode(config) {
        RED.nodes.createNode(this, config);

        this.config = config;
        this.controller = new FireEvent({ node: this, config, RED });
    }

    function getEntitiesNode(config) {
        RED.nodes.createNode(this, config);

        this.config = config;
        this.controller = new GetEntities({ node: this, config, RED });
    }

    function getHistoryNode(config) {
        RED.nodes.createNode(this, config);

        this.config = config;
        this.controller = new GetHistory({ node: this, config, RED });
    }

    function pollStateNode(config) {
        RED.nodes.createNode(this, config);

        this.config = config;
        this.controller = new PollState({ node: this, config, RED });
    }

    function renderTemplateNode(config) {
        RED.nodes.createNode(this, config);

        this.config = config;
        this.controller = new RenderTemplate({ node: this, config, RED });
    }

    function timeNode(config) {
        RED.nodes.createNode(this, config);

        this.config = config;
        this.controller = new Time({ node: this, config, RED });
    }

    function triggerStateNode(config) {
        RED.nodes.createNode(this, config);

        this.config = config;
        this.controller = new TriggerState({ node: this, config, RED });
    }

    function waitUntilNode(config) {
        RED.nodes.createNode(this, config);

        this.config = config;
        this.controller = new WaitUntil({ node: this, config, RED });
    }

    function webhookNode(config) {
        RED.nodes.createNode(this, config);

        this.config = config;
        this.controller = new Webhook({ node: this, config, RED });
    }

    function zoneNode(config) {
        RED.nodes.createNode(this, config);

        this.config = config;
        this.controller = new Zone({ node: this, config, RED });
    }

    RED.nodes.registerType('server', configServerNode, {
        credentials: {
            host: { type: 'text' },
            access_token: { type: 'text' },
        },
    });
    RED.nodes.registerType('server-events', eventsAllNode);
    RED.nodes.registerType('server-state-changed', eventsStateNode);
    RED.nodes.registerType('trigger-state', triggerStateNode);
    RED.nodes.registerType('poll-state', pollStateNode);
    RED.nodes.registerType('ha-time', timeNode);
    RED.nodes.registerType('ha-webhook', webhookNode);
    RED.nodes.registerType('ha-zone', zoneNode);
    RED.nodes.registerType('api-call-service', callServiceNode);
    RED.nodes.registerType('ha-entity', entityNode);
    RED.nodes.registerType('ha-fire-event', fireEventNode);
    RED.nodes.registerType('api-current-state', currentStateNode);
    RED.nodes.registerType('ha-get-entities', getEntitiesNode);
    RED.nodes.registerType('api-get-history', getHistoryNode);
    RED.nodes.registerType('api-render-template', renderTemplateNode);
    RED.nodes.registerType('ha-wait-until', waitUntilNode);
    RED.nodes.registerType('ha-api', apiNode);
};
