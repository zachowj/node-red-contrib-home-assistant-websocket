import { describe, expect, it } from 'vitest';

import { isMigrationArray, migrate } from '../../src/helpers/migrate';
import migrations from '../../src/nodes/get-entities/migrations';

isMigrationArray(migrations);

const VERSION_UNDEFINED = {
    id: 'node.id',
    type: 'ha-get-entities',
    name: 'label of node',
    server: 'server.id',
    rules: [{ property: '', logic: 'is', value: '', valueType: 'str' }],
    output_type: 'array',
    output_empty_results: false,
    output_location_type: 'msg',
    output_location: 'payload',
    output_results_count: 1,
};
const VERSION_0 = {
    ...VERSION_UNDEFINED,
    version: 0,
};
const VERSION_1 = {
    ...VERSION_0,
    version: 1,
    outputType: 'array',
    outputEmptyResults: false,
    outputLocationType: 'msg',
    outputLocation: 'payload',
    outputResultsCount: 1,
    // deprecated
    output_type: undefined,
    output_empty_results: undefined,
    output_location_type: undefined,
    output_location: undefined,
    output_results_count: undefined,
};

describe('Migrations - Get Entities Node', function () {
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
