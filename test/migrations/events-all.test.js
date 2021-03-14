const { expect } = require('chai');

const migrations = require('../../src/migrations/events-all');
const { migrate } = require('../../src/migrations');

const VERSION_UNDEFINED = {
    id: 'node.id',
    type: 'server-events',
    name: 'node label',
    server: 'server.id',
    event_type: '',
};
const VERSION_0 = {
    ...VERSION_UNDEFINED,
    version: 0,
    waitForRunning: true,
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
            value: '$eventData().event_type',
            valueType: 'jsonata',
        },
        {
            property: 'event_type',
            propertyType: 'msg',
            value: '$eventData().event_type',
            valueType: 'jsonata',
        },
    ],
};

describe('Migrations - Events: All Node', function () {
    describe('Version 0', function () {
        it('should add version 0 to schema when no version is defined', function () {
            const migrate = migrations.find((m) => m.version === 0);
            const migratedSchema = migrate.up(VERSION_UNDEFINED);

            expect(migratedSchema).to.eql(VERSION_0);
        });
        it(`should only add waitForRunning if it's undefined`, function () {
            const schema = { ...VERSION_UNDEFINED, waitForRunning: false };
            const expectedSchema = {
                ...VERSION_0,
                waitForRunning: false,
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
    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);
        expect(migratedSchema).to.eql(VERSION_1);
    });
});
