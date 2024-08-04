import { NodeType } from '../const';
import action from '../nodes/action/migrations';
import api from '../nodes/api/migrations';
import binarySensor from '../nodes/binary-sensor/migrations';
import configServer from '../nodes/config-server/migrations';
import currentState from '../nodes/current-state/migrations';
import device from '../nodes/device/migrations';
import deviceConfig from '../nodes/device-config/migrations';
import entity from '../nodes/entity/migrations';
import entityConfig from '../nodes/entity-config/migrations';
import eventsAll from '../nodes/events-all/migrations';
import eventsCalendar from '../nodes/events-calendar/migrations';
import eventsState from '../nodes/events-state/migrations';
import fireEvent from '../nodes/fire-event/migrations';
import getEntities from '../nodes/get-entities/migrations';
import getHistory from '../nodes/get-history/migrations';
import number from '../nodes/number/migrations';
import pollState from '../nodes/poll-state/migrations';
import renderTemplate from '../nodes/render-template/migrations';
import select from '../nodes/select/migrations';
import sensor from '../nodes/sensor/migrations';
import sentence from '../nodes/sentence/migrations';
import switchMigration from '../nodes/switch/migrations';
import tag from '../nodes/tag/migrations';
import text from '../nodes/text/migrations';
import time from '../nodes/time/migrations';
import triggerState from '../nodes/trigger-state/migrations';
import waitUntil from '../nodes/wait-until/migrations';
import webhook from '../nodes/webhook/migrations';
import zone from '../nodes/zone/migrations';

export interface Migration {
    version: number;
    up: (node: any) => any;
}

const nodeTypeTranslation: Partial<Record<NodeType, Migration[]>> = {
    [NodeType.API]: api,
    [NodeType.BinarySensor]: binarySensor,
    [NodeType.Action]: action,
    [NodeType.Server]: configServer,
    [NodeType.CurrentState]: currentState,
    [NodeType.Device]: device,
    [NodeType.DeviceConfig]: deviceConfig,
    [NodeType.Entity]: entity,
    [NodeType.EntityConfig]: entityConfig,
    [NodeType.EventsAll]: eventsAll,
    [NodeType.EventsCalendar]: eventsCalendar,
    [NodeType.EventsState]: eventsState,
    [NodeType.FireEvent]: fireEvent,
    [NodeType.GetEntities]: getEntities,
    [NodeType.GetHistory]: getHistory,
    [NodeType.Number]: number,
    [NodeType.PollState]: pollState,
    [NodeType.RenderTemplate]: renderTemplate,
    [NodeType.Select]: select,
    [NodeType.Sensor]: sensor,
    [NodeType.Sentence]: sentence,
    [NodeType.Switch]: switchMigration,
    [NodeType.TriggerState]: triggerState,
    [NodeType.Tag]: tag,
    [NodeType.Text]: text,
    [NodeType.Time]: time,
    [NodeType.WaitUntil]: waitUntil,
    [NodeType.Webhook]: webhook,
    [NodeType.Zone]: zone,
};

type NodeTypeKey = keyof typeof nodeTypeTranslation;

export function migrate(schema: any): any {
    const currentVersion = getCurrentVersion(
        schema.type as unknown as NodeTypeKey,
    );
    if (schema.version !== undefined && schema.version >= currentVersion) {
        return schema;
    }

    const currentMigration = findMigration(
        schema.type as unknown as NodeTypeKey,
        schema.version,
    )?.up;

    if (currentMigration) {
        const newSchema = currentMigration(schema);

        return migrate(newSchema);
    }

    return schema;
}

function findMigration(
    nodeType: NodeTypeKey,
    version = -1,
): Migration | undefined {
    const migrations = getMigrationsByType(nodeType);
    const migration = migrations?.find(
        (m) => m.version === Number(version) + 1,
    );

    return migration;
}

function getMigrationsByType(nodeType: NodeTypeKey): Migration[] | undefined {
    return nodeTypeTranslation[nodeType];
}

export function getCurrentVersion(nodeType: NodeTypeKey): number {
    const migrations = getMigrationsByType(nodeType) ?? [];
    const currentVersion = migrations.reduce((acc, i) => {
        return i.version > acc ? i.version : acc;
    }, 0);

    return currentVersion;
}

export function isMigrationArray(
    migrations: unknown,
): migrations is Migration[] {
    if (!Array.isArray(migrations)) {
        throw new Error('Migrations must be an array');
    }

    return migrations.every((m) => {
        if (typeof m.version !== 'number') {
            throw new Error('Migration version must be a number');
        }
        if (typeof m.up !== 'function') {
            throw new Error('Migration up must be a function');
        }

        return true;
    });
}
