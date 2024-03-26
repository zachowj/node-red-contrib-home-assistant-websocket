import { expect } from 'chai';

import { isMigrationArray, migrate } from '../../src/helpers/migrate';
import migrations from '../../src/nodes/poll-state/migrations';

isMigrationArray(migrations);

const VERSION_UNDEFINED = {
    id: 'node.id',
    type: 'poll-state',
    name: 'label of node',
    server: 'server.id',
    updateinterval: '60',
    updateIntervalUnits: 'seconds',
    outputinitially: false,
    outputonchanged: false,
    entity_id: '',
    state_type: 'str',
    halt_if: '',
    halt_if_type: 'str',
    halt_if_compare: 'is',
    outputs: 1,
};
const VERSION_0 = {
    ...VERSION_UNDEFINED,
    version: 0,
};
const VERSION_1 = {
    ...VERSION_0,
    version: 1,
    state_type: 'str',
    halt_if_type: 'str',
    halt_if_compare: 'is',
    updateIntervalUnits: 'seconds',
};
const VERSION_2 = {
    ...VERSION_1,
    version: 2,
    updateIntervalType: 'num',
};
const VERSION_3 = {
    ...VERSION_2,
    version: 3,
    entityId: '',
    exposeAsEntityConfig: '',
    ifState: '',
    ifStateType: 'str',
    ifStateOperator: 'is',
    outputInitially: false,
    outputOnChanged: false,
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
    stateType: 'str',
    updateInterval: '60',

    // deprecated
    entity_id: undefined,
    updateinterval: undefined,
    outputinitially: undefined,
    outputonchanged: undefined,
    state_type: undefined,
    halt_if: undefined,
    halt_if_type: undefined,
    halt_if_compare: undefined,
    exposeToHomeAssistant: undefined,
    haConfig: undefined,
};

describe('Migrations - Poll State Node', function () {
    describe('Version 0', function () {
        it('should add version 0 to schema when no version is defined', function () {
            const migrate = migrations.find((m) => m.version === 0);
            const migratedSchema = migrate?.up(VERSION_UNDEFINED);
            expect(migratedSchema).to.eql(VERSION_0);
        });
    });

    describe('Version 1', function () {
        it('should update version 0 to version 1 setting new defaults', function () {
            const migrate = migrations.find((m) => m.version === 1);
            const migratedSchema = migrate?.up(VERSION_0);
            expect(migratedSchema).to.eql(VERSION_1);
        });
    });

    describe('Version 2', function () {
        it('should update version 1 to version 2 setting new defaults', function () {
            const migrate = migrations.find((m) => m.version === 2);
            const migratedSchema = migrate?.up(VERSION_1);
            expect(migratedSchema).to.eql(VERSION_2);
        });
    });

    describe('Version 3', function () {
        it('should update version 2 to version 3 setting new defaults', function () {
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
