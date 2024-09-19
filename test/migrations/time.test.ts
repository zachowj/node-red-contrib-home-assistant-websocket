import { merge } from 'lodash';
import { beforeAll, describe, expect, it } from 'vitest';

import {
    isMigrationArray,
    migrate,
    Migration,
} from '../../src/helpers/migrate';
import migrations from '../../src/nodes/time/migrations';

isMigrationArray(migrations);

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
const VERSION_1 = {
    ...VERSION_0,
    version: 1,
    sunday: true,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
};
const VERSION_2 = {
    ...VERSION_1,
    version: 2,
    payload: undefined,
    payloadType: undefined,
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
            valueType: 'entity',
        },
        {
            property: 'topic',
            propertyType: 'msg',
            value: '',
            valueType: 'triggerId',
        },
    ],
};
const VERSION_3 = {
    ...VERSION_2,
    version: 3,
    exposeAsEntityConfig: '',
    debugenabled: undefined,
    exposeToHomeAssistant: undefined,
    haConfig: undefined,
};
const VERSION_4 = {
    ...VERSION_3,
    version: 4,
    ignorePastDate: false,
};

describe('Migrations - Time Node', function () {
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
        let migrate: Migration | undefined;

        beforeAll(function () {
            migrate = migrations.find((m) => m.version === 2);
        });

        it('should update version 1 to version 2', function () {
            const migratedSchema = migrate?.up(VERSION_1);
            expect(migratedSchema).toEqual(VERSION_2);
        });

        it('payload value should update to same value in outputProperties', function () {
            const schema = {
                ...VERSION_1,
                payload: 'abc',
                payloadType: 'jsonata',
            };
            const expectedSchema = merge({}, VERSION_2, {
                outputProperties: [
                    {
                        property: 'payload',
                        propertyType: 'msg',
                        value: 'abc',
                        valueType: 'jsonata',
                    },
                ],
            });
            const migratedSchema = migrate?.up(schema);
            expect(migratedSchema).toEqual(expectedSchema);
        });

        it('payload number type should update to number type in outputProperties', function () {
            const schema = {
                ...VERSION_1,
                payload: '123',
                payloadType: 'num',
            };
            const expectedSchema = merge({}, VERSION_2, {
                outputProperties: [
                    {
                        property: 'payload',
                        propertyType: 'msg',
                        value: '123',
                        valueType: 'num',
                    },
                ],
            });
            const migratedSchema = migrate?.up(schema);
            expect(migratedSchema).toEqual(expectedSchema);
        });
    });

    describe('Version 3', function () {
        it('should update version 2 to version 3', function () {
            const migrate = migrations.find((m) => m.version === 3);
            const migratedSchema = migrate?.up(VERSION_2);
            expect(migratedSchema).toEqual(VERSION_3);
        });
    });

    describe('Version 4', function () {
        it('should update version 3 to version 4', function () {
            const migrate = migrations.find((m) => m.version === 4);
            const migratedSchema = migrate?.up(VERSION_3);
            expect(migratedSchema).toEqual(VERSION_4);
        });
    });

    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);
        expect(migratedSchema).toEqual(VERSION_4);
    });
});
