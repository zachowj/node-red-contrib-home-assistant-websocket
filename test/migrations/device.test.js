const { expect } = require('chai');

const migrations = require('../../src/nodes/device/migrations').default;
const { migrate } = require('../../src/helpers/migrate');

const VERSION_UNDEFINED = {
    id: 'node.id',
    type: 'ha-device',
    name: 'label of node',
    server: 'server.id',
    exposeToHomeAssistant: false,
    haConfig: [
        { property: 'name', value: '' },
        { property: 'icon', value: '' },
    ],
    inputs: 0,
    deviceType: 'trigger',
    device: 'device-id',
    capabilities: [],
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
            value: '',
            valueType: 'triggerId',
        },
    ],
};
const VERSION_0 = {
    ...VERSION_UNDEFINED,
    version: 0,
};

describe('Migrations - Device Node', function () {
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
