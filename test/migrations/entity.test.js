const { expect } = require('chai');

const migrations = require('../../src/nodes/entity/migrations').default;
const { migrate } = require('../../src/helpers/migrate');

const VERSION_UNDEFINED = {
    id: 'node.id',
    type: 'ha-entity',
    name: 'label of node',
    server: 'server.id',
    debugenabled: false,
    outputs: 1,
    entityType: 'sensor',
    config: [
        { property: 'name', value: '' },
        { property: 'device_class', value: '' },
        { property: 'icon', value: '' },
        { property: 'unit_of_measurement', value: '' },
    ],
    state: 'payload',
    stateType: 'msg',
    attributes: [],
    resend: true,
    outputLocation: 'payload',
    outputLocationType: 'none',
    outputOnStateChange: false,
    outputPayload: '$entity().state ? "on": "off"',
    outputPayloadType: 'jsonata',
};
const VERSION_0 = {
    ...VERSION_UNDEFINED,
    version: 0,
};
const VERSION_1 = {
    ...VERSION_0,
    version: 1,
    inputOverride: 'allow',
};
const VERSION_2 = {
    ...VERSION_1,
    version: 2,
    inputOverride: 'allow',
    config: [
        { property: 'name', value: '' },
        { property: 'device_class', value: '' },
        { property: 'icon', value: '' },
        { property: 'unit_of_measurement', value: '' },
        { property: 'state_class', value: '' },
        { property: 'last_reset', value: '' },
    ],
};

describe('Migrations - Entity Node', function () {
    describe('Version 0', function () {
        it('should add version 0 to schema when no version is defined', function () {
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
    });
    describe('Version 2', function () {
        it('should update version 1 to version 2', function () {
            const migrate = migrations.find((m) => m.version === 1);
            const migratedSchema = migrate.up(VERSION_0);

            expect(migratedSchema).to.eql(VERSION_1);
        });
    });
    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);
        expect(migratedSchema).to.eql(VERSION_2);
    });
});
