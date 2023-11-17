import { expect } from 'chai';

import {
    isMigrationArray,
    migrate,
    Migration,
} from '../../src/helpers/migrate';
import migrations from '../../src/nodes/events-all/migrations';

isMigrationArray(migrations);

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
            value: '$outputData("eventData").event_type',
            valueType: 'jsonata',
        },
        {
            property: 'event_type',
            propertyType: 'msg',
            value: '$outputData("eventData").event_type',
            valueType: 'jsonata',
        },
    ],
};
const VERSION_2 = {
    ...VERSION_1,
    version: 2,
    eventType: '',
    event_type: undefined,
};
const VERSION_3 = {
    ...VERSION_2,
    version: 3,
    exposeAsEntityConfig: '',
    exposeToHomeAssistant: undefined,
    haConfig: undefined,
};

describe('Migrations - Events: All Node', function () {
    describe('Version 0', function () {
        let migrate: Migration | undefined;
        before(function () {
            migrate = migrations.find((m) => m.version === 0);
        });
        it('should add version 0 to schema when no version is defined', function () {
            const migratedSchema = migrate?.up(VERSION_UNDEFINED);

            expect(migratedSchema).to.eql(VERSION_0);
        });
        it(`should only add waitForRunning if it's undefined`, function () {
            const schema = { ...VERSION_UNDEFINED, waitForRunning: false };
            const expectedSchema = {
                ...VERSION_0,
                waitForRunning: false,
            };
            const migratedSchema = migrate?.up(schema);

            expect(migratedSchema).to.eql(expectedSchema);
        });
    });
    describe('Version 1', function () {
        it('should update version 0 to version 1', function () {
            const migrate = migrations.find((m) => m.version === 1);
            const migratedSchema = migrate?.up(VERSION_0);

            expect(migratedSchema).to.eql(VERSION_1);
        });
    });
    describe('Version 2', function () {
        it('should update version 1 to version 2', function () {
            const migrate = migrations.find((m) => m.version === 2);
            const migratedSchema = migrate?.up(VERSION_1);
            expect(migratedSchema).to.eql(VERSION_2);
        });
        it('should move event_type to eventType', function () {
            const migrate = migrations.find((m) => m.version === 2);
            const migratedSchema = migrate?.up({
                ...VERSION_1,
                event_type: 'event_name',
            });
            const expectedSchema = {
                ...VERSION_2,
                eventType: 'event_name',
            };
            expect(migratedSchema).to.eql(expectedSchema);
        });
    });
    describe('Version 3', function () {
        it('should update version 2 to version 3', function () {
            const migrate = migrations.find((m) => m.version === 3);
            const migratedSchema = migrate?.up(VERSION_2);
            expect(migratedSchema).to.eql(VERSION_3);
        });
    });
    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);
        expect(migratedSchema).to.eql(VERSION_3);
    });
});
