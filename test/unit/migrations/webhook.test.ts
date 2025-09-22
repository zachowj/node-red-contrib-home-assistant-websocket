import { describe, expect, it } from 'vitest';

import { isMigrationArray, migrate } from '../../../src/helpers/migrate';
import migrations from '../../../src/nodes/webhook/migrations';

isMigrationArray(migrations);

const VERSION_UNDEFINED = {
    id: 'node.id',
    type: 'ha-webhook',
    name: 'label of node',
    server: 'server.id',
    outputs: 1,
    webhookId: 'id for webhook',
    payloadLocation: 'payload',
    payloadLocationType: 'msg',
    headersLocation: 'headers',
    headersLocationType: 'msg',
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
            property: 'topic',
            propertyType: 'msg',
            value: '',
            valueType: 'triggerId',
        },
        {
            property: 'payload',
            propertyType: 'msg',
            value: '',
            valueType: 'data',
        },
        {
            property: 'headers',
            propertyType: 'msg',
            value: '',
            valueType: 'headers',
        },
    ],
    payloadLocation: undefined,
    payloadLocationType: undefined,
    headersLocation: undefined,
    headersLocationType: undefined,
};
const VERSION_2 = {
    ...VERSION_1,
    version: 2,
    method_post: true,
    method_put: true,
    method_get: false,
    method_head: false,
};
const VERSION_3 = {
    ...VERSION_2,
    version: 3,
    exposeAsEntityConfig: '',
};

describe('Migrations - Webhook Node', function () {
    describe('Version 0', function () {
        it('should add version 0 to schema when no version is defined', function () {
            const migrate = migrations.find((m) => m.version === 0);
            const migratedSchema = migrate?.up(VERSION_UNDEFINED);
            expect(migratedSchema).toEqual(VERSION_0);
        });
    });

    describe('Version 1', function () {
        it('should update version 0 to version 1', function () {
            const migrate = migrations.find((m) => m.version === 1);
            const migratedSchema = migrate?.up(VERSION_0);
            expect(migratedSchema).toEqual(VERSION_1);
        });
    });

    describe('Version 2', function () {
        it('should update version 1 to version 2', function () {
            const migrate = migrations.find((m) => m.version === 2);
            const migratedSchema = migrate?.up(VERSION_1);
            expect(migratedSchema).toEqual(VERSION_2);
        });
    });

    describe('Version 3', function () {
        it('should update version 2 to version 3', function () {
            const migrate = migrations.find((m) => m.version === 3);
            const migratedSchema = migrate?.up(VERSION_2);
            expect(migratedSchema).toEqual(VERSION_3);
        });
    });

    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);
        expect(migratedSchema).toEqual(VERSION_3);
    });
});
