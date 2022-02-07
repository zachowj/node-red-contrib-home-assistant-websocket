const { expect } = require('chai');

const migrations = require('../../src/nodes/trigger-state/migrations').default;
const { migrate } = require('../../src/helpers/migrate');

const VERSION_UNDEFINED = {
    id: 'node.id',
    type: 'trigger-state',
    name: 'label of node',
    server: 'server.id',
    entityid: 'entity.id',
    entityidfiltertype: 'exact',
    debugenabled: false,
    constraints: [
        {
            targetType: 'this_entity',
            targetValue: '',
            propertyType: 'current_state',
            propertyValue: 'new_state.state',
            comparatorType: 'is',
            comparatorValueDatatype: 'str',
            comparatorValue: 'on',
        },
    ],
    outputs: 2,
    customoutputs: [],
    outputinitially: false,
    state_type: 'str',
};
const VERSION_0 = {
    ...VERSION_UNDEFINED,
    version: 0,
};
const VERSION_1 = {
    ...VERSION_0,
    version: 1,
    inputs: 1,
    enableInput: true,
};
const VERSION_2 = {
    ...VERSION_1,
    version: 2,
};

describe('Migrations - Trigger State Node', function () {
    describe('Version 0', function () {
        it('should add version 0 to schema when no version is defined', function () {
            const migrate = migrations.find((m) => m.version === 0);
            const migratedSchema = migrate.up(VERSION_UNDEFINED);
            expect(migratedSchema).to.eql(VERSION_0);
        });
    });
    describe('Version 1', function () {
        it('should add property inputs equal to 1 and enabledInput equal to true', function () {
            const migrate = migrations.find((m) => m.version === 1);
            const migratedSchema = migrate.up(VERSION_0);
            expect(migratedSchema).to.eql(VERSION_1);
        });
    });
    describe('Version 2', function () {
        let migrate = null;
        before(function () {
            migrate = migrations.find((m) => m.version === 2);
        });
        it('should add version 1 to version 2', function () {
            const migratedSchema = migrate.up(VERSION_1);
            expect(migratedSchema).to.eql(VERSION_2);
        });
        it('should convert comma delimited entity list to array and change type to list', function () {
            const schema = {
                ...VERSION_1,
                entityid: 'entity.id,entity2.id, entity3.id',
                entityidfiltertype: 'substring',
            };
            const migratedSchema = migrate.up(schema);
            expect(migratedSchema.entityid).to.eql([
                'entity.id',
                'entity2.id',
                'entity3.id',
            ]);
            expect(migratedSchema.entityidfiltertype).to.eql('list');
        });
        it('should only contain one entity if there is a trailing comma', function () {
            const schema = {
                ...VERSION_1,
                entityid: 'entity.id,',
                entityidfiltertype: 'substring',
            };
            const migratedSchema = migrate.up(schema);
            expect(migratedSchema.entityid).to.have.lengthOf(1);
        });
    });
    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);
        expect(migratedSchema).to.eql(VERSION_2);
    });
});
