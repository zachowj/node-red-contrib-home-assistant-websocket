import { beforeAll, describe, expect, it } from 'vitest';

import {
    isMigrationArray,
    migrate,
    Migration,
} from '../../src/helpers/migrate';
import migrations from '../../src/nodes/trigger-state/migrations';

isMigrationArray(migrations);

const VERSION_UNDEFINED = {
    id: 'node.id',
    type: 'trigger-state',
    name: 'label of node',
    server: 'server.id',
    entityid: 'entity.id',
    entityidfiltertype: 'exact',
    debugenabled: false,
    constraints: [
        {
            targetType: 'this_entity',
            targetValue: '',
            propertyType: 'current_state',
            propertyValue: 'new_state.state',
            comparatorType: 'is',
            comparatorValueDatatype: 'str',
            comparatorValue: 'on',
        },
    ],
    outputs: 2,
    customoutputs: [],
    outputinitially: false,
    state_type: 'str',
};
const VERSION_0 = {
    ...VERSION_UNDEFINED,
    version: 0,
};
const VERSION_1 = {
    ...VERSION_0,
    version: 1,
    inputs: 1,
    enableInput: true,
};
const VERSION_2 = {
    ...VERSION_1,
    version: 2,
};
const VERSION_3 = {
    ...VERSION_2,
    version: 3,
    entityId: 'entity.id',
    entityIdType: 'exact',
    debugEnabled: false,
    customOutputs: [],
    outputInitially: false,
    stateType: 'str',
    exposeAsEntityConfig: '',

    entityid: undefined,
    entityidfiltertype: undefined,
    debugenabled: undefined,
    customoutputs: undefined,
    outputinitially: undefined,
    state_type: undefined,
};
const VERSION_4 = {
    ...VERSION_3,
    version: 4,
    stateType: 'str',
};
const VERSION_5 = {
    ...VERSION_4,
    version: 5,
    entities: {
        entity: ['entity.id'],
        substring: [],
        regex: [],
    },
    entityId: undefined,
    entityIdType: undefined,
};

describe('Migrations - Trigger State Node', function () {
    describe('Version 0', function () {
        it('should add version 0 to schema when no version is defined', function () {
            const migrate = migrations.find((m) => m.version === 0);
            const migratedSchema = migrate?.up(VERSION_UNDEFINED);
            expect(migratedSchema).toEqual(VERSION_0);
        });
    });

    describe('Version 1', function () {
        it('should add property inputs equal to 1 and enabledInput equal to true', function () {
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

        it('should add version 1 to version 2', function () {
            const migratedSchema = migrate?.up(VERSION_1);
            expect(migratedSchema).toEqual(VERSION_2);
        });

        it('should convert comma delimited entity list to array and change type to list', function () {
            const schema = {
                ...VERSION_1,
                entityid: 'entity.id,entity2.id, entity3.id',
                entityidfiltertype: 'substring',
            };
            const migratedSchema = migrate?.up(schema);
            expect(migratedSchema.entityid).toEqual([
                'entity.id',
                'entity2.id',
                'entity3.id',
            ]);
            expect(migratedSchema.entityidfiltertype).toEqual('list');
        });

        it('should only contain one entity if there is a trailing comma', function () {
            const schema = {
                ...VERSION_1,
                entityid: 'entity.id,',
                entityidfiltertype: 'substring',
            };
            const migratedSchema = migrate?.up(schema);
            expect(migratedSchema.entityid).toHaveLength(1);
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

    describe('Version 5', function () {
        it('should update version 4 to version 5', function () {
            const migrate = migrations.find((m) => m.version === 5);
            const migratedSchema = migrate?.up(VERSION_4);

            expect(migratedSchema).toEqual(VERSION_5);
        });

        it('should convert a substring type to a entities substring array', function () {
            const schema = {
                ...VERSION_4,
                entityId: 'entity.id',
                entityIdType: 'substring',
            };
            const migratedSchema = migrate(schema);
            expect(migratedSchema.entities.substring).toEqual(['entity.id']);
        });

        it('should convert a regex type to a entities regex array', function () {
            const schema = {
                ...VERSION_4,
                entityId: 'entity.id',
                entityIdType: 'regex',
            };
            const migratedSchema = migrate(schema);
            expect(migratedSchema.entities.regex).toEqual(['entity.id']);
        });

        it('should convert a list type to a entities entity array', function () {
            const schema = {
                ...VERSION_4,
                entityId: ['entity.id', 'entity2.id'],
                entityIdType: 'list',
            };
            const migratedSchema = migrate(schema);
            expect(migratedSchema.entities.entity).toEqual([
                'entity.id',
                'entity2.id',
            ]);
        });
    });

    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);
        expect(migratedSchema).toEqual(VERSION_5);
    });
});
