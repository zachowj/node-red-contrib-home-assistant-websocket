const { expect } = require('chai');

const migrations = require('../../src/nodes/config-server/migrations').default;
const { migrate } = require('../../src/helpers/migrate');

const VERSION_UNDEFINED = {
    id: 'node.id',
    type: 'server',
    name: 'label of node',
    addon: false,
};
const VERSION_0 = {
    ...VERSION_UNDEFINED,
    version: 0,
};
const VERSION_1 = {
    ...VERSION_0,
    version: 1,
    rejectUnauthorizedCerts: true,
    ha_boolean: 'y|yes|true|on|home|open',
    connectionDelay: true,
    cacheJson: true,
};
const VERSION_2 = {
    ...VERSION_1,
    version: 2,
    heartbeat: false,
    heartbeatInterval: 30,
};

describe('Migrations - Server Config Node', function () {
    describe('Version 0', function () {
        let migrate = null;
        before(function () {
            migrate = migrations.find((m) => m.version === 0);
        });
        it('should add version 0 to schema when no version is defined', function () {
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
    });
    describe('Version 2', function () {
        it('should update version 1 to version 2', function () {
            const migrate = migrations.find((m) => m.version === 2);
            const migratedSchema = migrate.up(VERSION_1);
            expect(migratedSchema).to.eql(VERSION_2);
        });
    });
    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);
        expect(migratedSchema).to.eql(VERSION_2);
    });
});
