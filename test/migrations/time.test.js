const { expect } = require('chai');

const migrations = require('../../src/migrations/time');
const { migrate } = require('../../src/migrations');

const VERSION_UNDEFINED = {
    id: 'node.id',
    type: 'ha-time',
    name: 'label of node',
    server: 'server.id',
    entityId: 'entity.id',
    property: 'state',
    offset: 5,
    offsetType: 'num',
    offsetUnits: 'minutes',
    randomOffset: false,
    repeatDaily: false,
    payload: '$entity().state',
    payloadType: 'jsonata',
    debugenabled: true,
};
const VERSION_0 = {
    ...VERSION_UNDEFINED,
    version: 0,
};

describe('Migrations - Time Node', function () {
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
