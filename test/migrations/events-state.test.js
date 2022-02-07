const { expect } = require('chai');

const migrations = require('../../src/nodes/events-state/migrations').default;
const { migrate } = require('../../src/helpers/migrate');

const VERSION_UNDEFINED = {
    id: 'node.id',
    type: 'server-state-changed',
    name: 'label of node',
    server: 'server.id',
    entityidfilter: '',
    entityidfiltertype: 'exact',
    outputinitially: false,
    haltifstate: '',
    outputs: 1,
    output_only_on_state_change: true,
};
const VERSION_0 = {
    ...VERSION_UNDEFINED,
    version: 0,
    state_type: 'str',
    halt_if_type: 'str',
    halt_if_compare: 'is',
};
const VERSION_1 = {
    ...VERSION_0,
    version: 1,
    ignorePrevStateNull: false,
    ignorePrevStateUnknown: false,
    ignorePrevStateUnavailable: false,
    ignoreCurrentStateUnknown: false,
    ignoreCurrentStateUnavailable: false,
};
const VERSION_2 = {
    ...VERSION_1,
    version: 2,
    for: '0',
    forType: 'num',
    forUnits: 'minutes',
};
const VERSION_3 = {
    ...VERSION_2,
    version: 3,
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
const VERSION_4 = {
    ...VERSION_3,
    version: 4,
};

describe('Migrations - Events: State Node', function () {
    describe('Version 0', function () {
        it('should add version 0 to schema when no version is defined', function () {
            const migrate = migrations.find((m) => m.version === 0);
            const migratedSchema = migrate.up(VERSION_UNDEFINED);

            expect(migratedSchema).to.eql(VERSION_0);
        });
        it(`should only set defaults if property is undefined for state_type, halt_if_type, and half_if_compare`, function () {
            const schema = {
                ...VERSION_UNDEFINED,
                state_type: 'num',
                half_if_compare: 'is not',
                halt_if_type: 'num',
            };
            const expectedSchema = {
                ...VERSION_0,
                state_type: 'num',
                half_if_compare: 'is not',
                halt_if_type: 'num',
            };
            const migrate = migrations.find((m) => m.version === 0);
            const migratedSchema = migrate.up(schema);

            expect(migratedSchema).to.eql(expectedSchema);
        });
    });
    describe('Version 1', function () {
        it('should update version 0 to version 1', function () {
            const migrate = migrations.find((m) => m.version === 1);
            const migratedSchema = migrate.up(VERSION_0);

            expect(migratedSchema).to.eql(VERSION_1);
        });
    });
    describe('Version 2', function () {
        it('should update version 1 to version 2', function () {
            const migrate = migrations.find((m) => m.version === 2);
            const migratedSchema = migrate.up(VERSION_1);

            expect(migratedSchema).to.eql(VERSION_2);
        });
    });
    describe('Version 3', function () {
        it('should update version 2 to version 3', function () {
            const migrate = migrations.find((m) => m.version === 3);
            const migratedSchema = migrate.up(VERSION_2);

            expect(migratedSchema).to.eql(VERSION_3);
        });
    });
    describe('Version 4', function () {
        let migrate = null;
        before(function () {
            migrate = migrations.find((m) => m.version === 4);
        });
        it('should add version 3 to version 4', function () {
            const migratedSchema = migrate.up(VERSION_3);
            expect(migratedSchema).to.eql(VERSION_4);
        });
        it('should convert comma delimited entity list to array and change type to list', function () {
            const schema = {
                ...VERSION_3,
                entityidfilter: 'entity.id,entity2.id, entity3.id',
                entityidfiltertype: 'substring',
            };
            const migratedSchema = migrate.up(schema);
            expect(migratedSchema.entityidfilter).to.eql([
                'entity.id',
                'entity2.id',
                'entity3.id',
            ]);
            expect(migratedSchema.entityidfiltertype).to.eql('list');
        });
        it('should only contain one entity if there is a trailing comma', function () {
            const schema = {
                ...VERSION_3,
                entityidfilter: 'entity.id,',
                entityidfiltertype: 'substring',
            };
            const migratedSchema = migrate.up(schema);
            expect(migratedSchema.entityidfilter).to.have.lengthOf(1);
        });
    });
    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);
        expect(migratedSchema).to.eql(VERSION_4);
    });
});
