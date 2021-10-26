const { expect } = require('chai');

const migrations = require('../../src/migrations/trigger-state');
const { migrate } = require('../../src/migrations');

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
    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);
        expect(migratedSchema).to.eql(VERSION_1);
    });
});
