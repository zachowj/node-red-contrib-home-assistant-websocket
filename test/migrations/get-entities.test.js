const { expect } = require('chai');

const migrations = require('../../src/migrations/get-entities');
const { migrate } = require('../../src/migrations');

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

describe('Migrations - Get Entities Node', function () {
    describe('Version 0', function () {
        it('should add version 0 to schema when no version is defined', function () {
            const migrate = migrations.find((m) => m.version === 0);
            const migratedSchema = migrate.up(VERSION_UNDEFINED);
            expect(migratedSchema).to.eql(VERSION_0);
        });
    });
    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);
        expect(migratedSchema).to.eql(VERSION_0);
    });
});
