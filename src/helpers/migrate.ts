import api from '../nodes/api/migrations';
import binarySensor from '../nodes/binary-sensor/migrations';
import callService from '../nodes/call-service/migrations';
import configServer from '../nodes/config-server/migrations';
import currentState from '../nodes/current-state/migrations';
import device from '../nodes/device/migrations';
import entity from '../nodes/entity/migrations';
import entityConfig from '../nodes/entity-config/migrations';
import eventsAll from '../nodes/events-all/migrations';
import eventsState from '../nodes/events-state/migrations';
import fireEvent from '../nodes/fire-event/migrations';
import getEntities from '../nodes/get-entities/migrations';
import getHistory from '../nodes/get-history/migrations';
import pollState from '../nodes/poll-state/migrations';
import renderTemplate from '../nodes/render-template/migrations';
import sensor from '../nodes/sensor/migrations';
import tag from '../nodes/tag/migrations';
import time from '../nodes/time/migrations';
import triggerState from '../nodes/trigger-state/migrations';
import waitUntil from '../nodes/wait-until/migrations';
import webhook from '../nodes/webhook/migrations';
import zone from '../nodes/zone/migrations';

interface Migration {
    version: number;
    up: (node: any) => any;
}

const nodeTypeTranslation: Record<string, Migration[]> = {
    'ha-api': api,
    'ha-binary-sensor': binarySensor,
    'api-call-service': callService,
    server: configServer,
    'api-current-state': currentState,
    'ha-device': device,
    'ha-entity': entity,
    'ha-entity-config': entityConfig,
    'server-events': eventsAll,
    'server-state-changed': eventsState,
    'ha-fire-event': fireEvent,
    'ha-get-entities': getEntities,
    'api-get-history': getHistory,
    'poll-state': pollState,
    'api-render-template': renderTemplate,
    'ha-sensor': sensor,
    'trigger-state': triggerState,
    'ha-tag': tag,
    'ha-time': time,
    'ha-wait-until': waitUntil,
    'ha-webhook': webhook,
    'ha-zone': zone,
};

type NodeTypeKey = keyof typeof nodeTypeTranslation;

export function migrate(schema: any): any {
    const currentVersion = getCurrentVersion(
        schema.type as unknown as NodeTypeKey
    );
    if (schema.version !== undefined && schema.version >= currentVersion) {
        return schema;
    }

    const currentMigration = findMigration(
        schema.type as unknown as NodeTypeKey,
        schema.version
    )?.up;

    if (currentMigration) {
        const newSchema = currentMigration(schema);

        return migrate(newSchema);
    }

    return schema;
}

function findMigration(
    nodeType: NodeTypeKey,
    version = -1
): Migration | undefined {
    const migrations = getMigrationsByType(nodeType);
    const migration = migrations.find((m) => m.version === Number(version) + 1);

    return migration;
}

function getMigrationsByType(nodeType: NodeTypeKey): Migration[] {
    return nodeTypeTranslation[nodeType];
}

export function getCurrentVersion(nodeType: NodeTypeKey): number {
    const migrations = getMigrationsByType(nodeType) ?? [];
    const currentVersion = migrations.reduce((acc, i) => {
        return i.version > acc ? i.version : acc;
    }, 0);

    return currentVersion;
}
