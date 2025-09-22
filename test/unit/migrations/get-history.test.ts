import { describe, expect, it } from 'vitest';

import { isMigrationArray, migrate } from '../../../src/helpers/migrate';
import migrations from '../../../src/nodes/get-history/migrations';

isMigrationArray(migrations);

const VERSION_UNDEFINED = {
    id: 'node.id',
    type: 'api-get-history',
    name: 'label of node',
    server: 'server.id',
    startdate: '',
    enddate: '',
    entityid: '',
    entityidtype: '',
    useRelativeTime: false,
    relativeTime: '',
    flatten: true,
};
const VERSION_0 = {
    ...VERSION_UNDEFINED,
    version: 0,
    output_type: 'array',
    output_location_type: 'msg',
    output_location: 'payload',
};
const VERSION_1 = {
    ...VERSION_0,
    version: 1,
    startDate: '',
    endDate: '',
    entityId: '',
    entityIdType: 'equals',
    outputType: 'array',
    outputLocationType: 'msg',
    outputLocation: 'payload',

    startdate: undefined,
    enddate: undefined,
    entityid: undefined,
    entityidtype: undefined,
    output_type: undefined,
    output_location_type: undefined,
    output_location: undefined,
};

describe('Migrations - Get History Node', function () {
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
            const migratedSchema = migrate?.up(VERSION_0);
            expect(migratedSchema).toEqual(VERSION_1);
        });
    });

    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);
        expect(migratedSchema).toEqual(VERSION_1);
    });
});
