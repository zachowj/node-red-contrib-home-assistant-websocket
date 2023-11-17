import { expect } from 'chai';

import {
    isMigrationArray,
    migrate,
    Migration,
} from '../../src/helpers/migrate';
import migrations from '../../src/nodes/api/migrations';

isMigrationArray(migrations);

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

const VERSION_1 = {
    ...VERSION_0,
    version: 1,
    outputProperties: [
        {
            property: 'payload',
            propertyType: 'msg',
            value: '',
            valueType: 'results',
        },
    ],
    // deprecated
    location: undefined,
    locationType: undefined,
};

describe('Migrations - API Node', function () {
    describe('Version 0', function () {
        it('should add version 0 to schema when no version is defined', function () {
            const migrate = migrations.find((m) => m.version === 0);
            const migratedSchema = migrate?.up(VERSION_UNDEFINED);

            expect(migratedSchema).to.eql(VERSION_0);
        });
    });
    describe('Version 1', function () {
        let migrate: Migration | undefined;
        before(function () {
            migrate = migrations.find((m) => m.version === 1);
        });
        it('should update version 0 to version 1', function () {
            const migratedSchema = migrate?.up(VERSION_0);
            expect(migratedSchema).to.eql(VERSION_1);
        });
        it('should create empty outputProperties if locationType was none', function () {
            const schema = {
                ...VERSION_0,
                locationType: 'none',
            };
            const expectedSchema = {
                ...VERSION_1,
                outputProperties: [],
            };
            const migratedSchema = migrate?.up(schema);

            expect(migratedSchema).to.eql(expectedSchema);
        });
    });
    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);

        expect(migratedSchema).to.eql(VERSION_1);
    });
});
