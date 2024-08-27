import { describe, expect, it } from 'vitest';

import { isMigrationArray, migrate } from '../../src/helpers/migrate';
import migrations from '../../src/nodes/tag/migrations';

isMigrationArray(migrations);

const VERSION_UNDEFINED = {
    id: 'node.id',
    type: 'ha-tag',
    name: 'label of node',
    server: 'server.id',
    tags: ['tag.id1', 'tag.id2'],
    devices: ['device.id'],
};
const VERSION_0 = {
    ...VERSION_UNDEFINED,
    version: 0,
};
const VERSION_1 = {
    ...VERSION_0,
    version: 1,
    outputProperties: [
        {
            property: 'payload',
            propertyType: 'msg',
            value: '',
            valueType: 'eventData',
        },
        {
            property: 'topic',
            propertyType: 'msg',
            value: '',
            valueType: 'triggerId',
        },
    ],
};
const VERSION_2 = {
    ...VERSION_1,
    version: 2,
    exposeAsEntityConfig: '',
    exposeToHomeAssistant: undefined,
    haConfig: undefined,
};

describe('Migrations - Tag Node', function () {
    describe('Version 0', function () {
        it('should add version 0 to schema when no version is defined', function () {
            const migrate = migrations.find((m) => m.version === 0);
            const migratedSchema = migrate?.up(VERSION_UNDEFINED);
            expect(migratedSchema).toEqual(VERSION_0);
        });
    });

    describe('Version 1', function () {
        it('should update version 0 to version 1', function () {
            const migrate = migrations.find((m) => m.version === 1);
            const migratedSchema = migrate?.up(VERSION_UNDEFINED);
            expect(migratedSchema).toEqual(VERSION_1);
        });
    });

    describe('Version 2', function () {
        it('should update version 0 to version 2', function () {
            const migrate = migrations.find((m) => m.version === 2);
            const migratedSchema = migrate?.up(VERSION_1);
            expect(migratedSchema).toEqual(VERSION_2);
        });
    });

    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);
        expect(migratedSchema).toEqual(VERSION_2);
    });
});
