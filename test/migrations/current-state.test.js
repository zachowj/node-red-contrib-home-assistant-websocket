const { expect } = require('chai');

const migrations = require('../../src/nodes/current-state/migrations').default;
const { migrate } = require('../../src/helpers/migrate');

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
const VERSION_2 = {
    ...VERSION_1,
    version: 2,
    outputProperties: [
        {
            property: 'payload',
            propertyType: 'msg',
            value: '',
            valueType: 'entityState',
        },
        {
            property: 'data',
            propertyType: 'msg',
            value: '',
            valueType: 'entity',
        },
        {
            property: 'topic',
            propertyType: 'msg',
            value: '',
            valueType: 'triggerId',
        },
    ],
    override_topic: undefined,
    entity_location: undefined,
    override_data: undefined,
    override_payload: undefined,
    state_location: undefined,
};
const VERSION_3 = {
    ...VERSION_2,
    version: 3,
    for: 0,
    forType: 'num',
    forUnits: 'minutes',
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
    describe('Version 2', function () {
        it('should update version 1 to version 2', function () {
            const migrate = migrations.find((m) => m.version === 2);
            const migratedSchema = migrate.up(VERSION_1);

            expect(migratedSchema).to.eql(VERSION_2);
        });
        it('should set outputProperties to emtpy array', function () {
            const schema = {
                ...VERSION_1,
                override_data: 'none',
                override_payload: 'none',
                override_topic: false,
            };
            const expectedSchema = {
                ...VERSION_2,
                outputProperties: [],
            };
            const migrate = migrations.find((m) => m.version === 2);
            const migratedSchema = migrate.up(schema);

            expect(migratedSchema).to.eql(expectedSchema);
        });
    });
    describe('Version 3', function () {
        it('should update version 2 to version 3', function () {
            const migrate = migrations.find((m) => m.version === 3);
            const migratedSchema = migrate.up(VERSION_2);

            expect(migratedSchema).to.eql(VERSION_3);
        });
    });
    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);

        expect(migratedSchema).to.eql(VERSION_3);
    });
});
