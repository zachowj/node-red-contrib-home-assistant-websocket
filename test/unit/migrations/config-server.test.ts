import { beforeAll, describe, expect, it } from 'vitest';

import {
    isMigrationArray,
    migrate,
    Migration,
} from '../../../src/helpers/migrate';
import migrations from '../../../src/nodes/config-server/migrations';

isMigrationArray(migrations);

const VERSION_UNDEFINED = {
    id: 'node.id',
    type: 'server',
    name: 'label of node',
    addon: false,
};
const VERSION_0 = {
    ...VERSION_UNDEFINED,
    version: 0,
};
const VERSION_1 = {
    ...VERSION_0,
    version: 1,
    rejectUnauthorizedCerts: true,
    ha_boolean: 'y|yes|true|on|home|open',
    connectionDelay: true,
    cacheJson: true,
};
const VERSION_2 = {
    ...VERSION_1,
    version: 2,
    heartbeat: false,
    heartbeatInterval: 30,
};
const VERSION_3 = {
    ...VERSION_2,
    version: 3,
    areaSelector: 'friendlyName',
    deviceSelector: 'friendlyName',
    entitySelector: 'friendlyName',
};
const VERSION_4 = {
    ...VERSION_3,
    version: 4,
    areaSelector: 'friendlyName',
    deviceSelector: 'friendlyName',
    entitySelector: 'friendlyName',
    statusSeparator: 'at: ',
    statusYear: 'hidden',
    statusMonth: 'short',
    statusDay: 'numeric',
    statusHourCycle: 'h23',
    statusTimeFormat: 'h:m',
};
const VERSION_5 = {
    ...VERSION_4,
    version: 5,
    enableGlobalContextStore: true,
};
const VERSION_6 = {
    ...VERSION_5,
    version: 6,
    ha_boolean: ['y', 'yes', 'true', 'on', 'home', 'open'],
};

describe('Migrations - Server Config Node', function () {
    describe('Version 0', function () {
        let migrate: Migration | undefined;

        beforeAll(function () {
            migrate = migrations.find((m) => m.version === 0);
        });

        it('should add version 0 to schema when no version is defined', function () {
            const migratedSchema = migrate?.up(VERSION_UNDEFINED);
            expect(migratedSchema).toEqual(VERSION_0);
        });
    });

    describe('Version 1', function () {
        it('should update version 0 to version 1', function () {
            const migrate = migrations.find((m) => m.version === 1);
            const migratedSchema = migrate?.up(VERSION_0);
            expect(migratedSchema).toEqual(VERSION_1);
        });
    });

    describe('Version 2', function () {
        it('should update version 1 to version 2', function () {
            const migrate = migrations.find((m) => m.version === 2);
            const migratedSchema = migrate?.up(VERSION_1);
            expect(migratedSchema).toEqual(VERSION_2);
        });
    });

    describe('Version 3', function () {
        it('should update version 2 to version 3', function () {
            const migrate = migrations.find((m) => m.version === 3);
            const migratedSchema = migrate?.up(VERSION_2);
            expect(migratedSchema).toEqual(VERSION_3);
        });
    });

    describe('Version 4', function () {
        it('should update version 3 to version 4', function () {
            const migrate = migrations.find((m) => m.version === 4);
            const migratedSchema = migrate?.up(VERSION_3);
            expect(migratedSchema).toEqual(VERSION_4);
        });
    });

    describe('Version 5', function () {
        it('should update version 4 to version 5', function () {
            const migrate = migrations.find((m) => m.version === 5);
            const migratedSchema = migrate?.up(VERSION_4);
            expect(migratedSchema).toEqual(VERSION_5);
        });
    });

    describe('Version 6', function () {
        it('should update version 5 to version 6', function () {
            const migrate = migrations.find((m) => m.version === 6);
            const migratedSchema = migrate?.up(VERSION_5);
            expect(migratedSchema).toEqual(VERSION_6);
        });
    });

    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);
        expect(migratedSchema).toEqual(VERSION_6);
    });
});
