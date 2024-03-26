import { expect } from 'chai';

import { isMigrationArray, migrate } from '../../src/helpers/migrate';
import migrations from '../../src/nodes/device/migrations';

isMigrationArray(migrations);

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
const VERSION_1 = {
    ...VERSION_0,
    version: 1,
    exposeAsEntityConfig: '',
    exposeToHomeAssistant: undefined,
    haConfig: undefined,
};

describe('Migrations - Device Node', function () {
    describe('Version 0', function () {
        it('should add version 0 to schema when no version is defined', function () {
            const migrate = migrations.find((m) => m.version === 0);
            const migratedSchema = migrate?.up(VERSION_UNDEFINED);
            expect(migratedSchema).to.eql(VERSION_0);
        });
    });

    describe('Version 1', function () {
        it('should add version 1 to schema when no version is defined', function () {
            const migrate = migrations.find((m) => m.version === 1);
            const migratedSchema = migrate?.up(VERSION_0);
            expect(migratedSchema).to.eql(VERSION_1);
        });
    });

    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);
        expect(migratedSchema).to.eql(VERSION_1);
    });
});
