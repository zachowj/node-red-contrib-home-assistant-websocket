const api = require('./api');
const callService = require('./call-service');
const configServer = require('./config-server');
const currentState = require('./current-state');
const device = require('./device');
const entity = require('./entity');
const eventsAll = require('./events-all');
const eventsState = require('./events-state');
const fireEvent = require('./fire-event');
const getEntities = require('./get-entities');
const getHistory = require('./get-history');
const pollState = require('./poll-state');
const renderTemplate = require('./render-template');
const tag = require('./tag');
const time = require('./time');
const triggerState = require('./trigger-state');
const waitUntil = require('./wait-until');
const webhook = require('./webhook');
const zone = require('./zone');

const nodeTypeTranslation = {
    'ha-api': api,
    'api-call-service': callService,
    server: configServer,
    'api-current-state': currentState,
    'ha-device': device,
    'ha-entity': entity,
    'server-events': eventsAll,
    'server-state-changed': eventsState,
    'ha-fire-event': fireEvent,
    'ha-get-entities': getEntities,
    'api-get-history': getHistory,
    'poll-state': pollState,
    'api-render-template': renderTemplate,
    'trigger-state': triggerState,
    'ha-tag': tag,
    'ha-time': time,
    'ha-wait-until': waitUntil,
    'ha-webhook': webhook,
    'ha-zone': zone,
};

function migrate(schema) {
    const currentVersion = getCurrentVersion(schema.type);
    if (schema.version !== undefined && schema.version >= currentVersion) {
        return schema;
    }

    const currentMigration = findMigration(schema.type, schema.version).up;
    const newSchema = currentMigration(schema);

    return migrate(newSchema);
}

function findMigration(nodeType, version = -1) {
    const migrations = getMigrationsByType(nodeType);
    const migration = migrations.find((m) => m.version === Number(version) + 1);

    return migration;
}

function getMigrationsByType(nodeType) {
    return nodeTypeTranslation[nodeType];
}

function getCurrentVersion(nodeType) {
    const migrations = getMigrationsByType(nodeType) || [];
    const currentVersion = migrations.reduce((acc, i) => {
        return i.version > acc ? i.version : acc;
    }, 0);

    return currentVersion;
}

module.exports = {
    getCurrentVersion,
    migrate,
};
