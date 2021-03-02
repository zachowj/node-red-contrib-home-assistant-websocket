const { expect } = require('chai');

const migrations = require('../../src/migrations/api');
const { migrate } = require('../../src/migrations');

const VERSION_UNDEFINED = {
    id: 'node.id',
    type: 'ha-api',
    name: 'label of node',
    server: 'server.id',
    debugenabled: false,
    protocol: 'websocket',
    method: 'get',
    path: '',
    data: JSON.stringify({
        type: 'get_config',
    }),
    dataType: 'jsonata',
    location: 'payload',
    locationType: 'msg',
    responseType: 'json',
};

const VERSION_0 = {
    ...VERSION_UNDEFINED,
    version: 0,
};

describe('Migrations - API Node', function () {
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
