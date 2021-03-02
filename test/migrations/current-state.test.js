const { expect } = require('chai');

const migrations = require('../../src/migrations/current-state');
const { migrate } = require('../../src/migrations');

const VERSION_UNDEFINED = {
    type: 'api-current-state',
    halt_if: '',
    halt_if_type: 'str',
    halt_if_compare: 'is',
    entity_id: '',
    override_topic: true,
    override_data: true,
};
const VERSION_0 = {
    ...VERSION_UNDEFINED,
    version: 0,
};
const VERSION_1 = {
    ...VERSION_0,
    version: 1,
    entity_location: 'data',
    override_data: 'msg',
    override_payload: 'msg',
    state_location: 'payload',
    state_type: 'str',
    blockInputOverrides: false,
};

describe('Migrations - Current State Node', function () {
    describe('version 0', function () {
        it('should update undefined version to version 0', function () {
            const migrate = migrations.find((m) => m.version === 0);
            const migratedSchema = migrate.up(VERSION_UNDEFINED);

            expect(migratedSchema).to.eql(VERSION_0);
        });
    });
    describe('Version 1', function () {
        it('should update version 0 to version 1', function () {
            const migrate = migrations.find((m) => m.version === 1);
            const migratedSchema = migrate.up(VERSION_0);

            expect(migratedSchema).to.eql(VERSION_1);
        });
        it('should set override_payload and override_data to none when each is false', function () {
            const schema = {
                ...VERSION_UNDEFINED,
                override_payload: false,
                override_data: false,
            };
            const expectedSchema = {
                ...VERSION_1,
                override_payload: 'none',
                override_data: 'none',
            };
            const migrate = migrations.find((m) => m.version === 1);
            const migratedSchema = migrate.up(schema);

            expect(migratedSchema).to.eql(expectedSchema);
        });
    });
    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);

        expect(migratedSchema).to.eql(VERSION_1);
    });
});
