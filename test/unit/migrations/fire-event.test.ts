import { describe, expect, it } from 'vitest';

import { isMigrationArray, migrate } from '../../../src/helpers/migrate';
import migrations from '../../../src/nodes/fire-event/migrations';

isMigrationArray(migrations);

const VERSION_UNDEFINED = {
    id: 'node.id',
    type: 'ha-fire-event',
    name: 'label of node',
    server: 'server.id',
    event: 'test_event',
    data: JSON.stringify({ abc: 123 }),
    dataType: 'jsonata',
};
const VERSION_0 = {
    ...VERSION_UNDEFINED,
    version: 0,
};

describe('Migrations - Fire Event Node', function () {
    describe('Version 0', function () {
        it('should add version 0 to schema when no version is defined', function () {
            const migrate = migrations.find((m) => m.version === 0);
            const migratedSchema = migrate?.up(VERSION_UNDEFINED);
            expect(migratedSchema).toEqual(VERSION_0);
        });
    });

    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);
        expect(migratedSchema).toEqual(VERSION_0);
    });
});
