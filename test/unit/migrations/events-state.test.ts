import { beforeAll, describe, expect, it } from 'vitest';

import {
    isMigrationArray,
    migrate,
    Migration,
} from '../../../src/helpers/migrate';
import migrations from '../../../src/nodes/events-state/migrations';

isMigrationArray(migrations);

const VERSION_UNDEFINED = {
    id: 'node.id',
    type: 'server-state-changed',
    name: 'label of node',
    server: 'server.id',
    entityidfilter: '',
    entityidfiltertype: 'exact',
    outputinitially: false,
    haltifstate: '',
    outputs: 1,
    output_only_on_state_change: true,
};
const VERSION_0 = {
    ...VERSION_UNDEFINED,
    version: 0,
    state_type: 'str',
    halt_if_type: 'str',
    halt_if_compare: 'is',
};
const VERSION_1 = {
    ...VERSION_0,
    version: 1,
    ignorePrevStateNull: false,
    ignorePrevStateUnknown: false,
    ignorePrevStateUnavailable: false,
    ignoreCurrentStateUnknown: false,
    ignoreCurrentStateUnavailable: false,
};
const VERSION_2 = {
    ...VERSION_1,
    version: 2,
    for: '0',
    forType: 'num',
    forUnits: 'minutes',
};
const VERSION_3 = {
    ...VERSION_2,
    version: 3,
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
const VERSION_4 = {
    ...VERSION_3,
    version: 4,
};
const VERSION_5 = {
    ...VERSION_4,
    version: 5,
    entityId: VERSION_UNDEFINED.entityidfilter,
    entityIdType: VERSION_UNDEFINED.entityidfiltertype,
    ifState: VERSION_UNDEFINED.haltifstate,
    ifStateType: VERSION_0.halt_if_type,
    ifStateOperator: VERSION_0.halt_if_compare,
    outputInitially: VERSION_UNDEFINED.outputinitially,
    stateType: VERSION_0.state_type,
    outputOnlyOnStateChange: VERSION_UNDEFINED.output_only_on_state_change,
    exposeAsEntityConfig: '',

    entityidfilter: undefined,
    entityidfiltertype: undefined,
    haltifstate: undefined,
    halt_if_type: undefined,
    halt_if_compare: undefined,
    outputinitially: undefined,
    state_type: undefined,
    output_only_on_state_change: undefined,
    exposeToHomeAssistant: undefined,
    haConfig: undefined,
};
const VERSION_6 = {
    ...VERSION_5,
    version: 6,
    entities: {
        entity: [VERSION_UNDEFINED.entityidfilter],
        substring: [],
        regex: [],
    },
    entityId: undefined,
    entityIdType: undefined,
};

describe('Migrations - Events: State Node', function () {
    describe('Version 0', function () {
        it('should add version 0 to schema when no version is defined', function () {
            const migrate = migrations.find((m) => m.version === 0);
            const migratedSchema = migrate?.up(VERSION_UNDEFINED);

            expect(migratedSchema).toEqual(VERSION_0);
        });

        it(`should only set defaults if property is undefined for state_type, halt_if_type, and half_if_compare`, function () {
            const schema = {
                ...VERSION_UNDEFINED,
                state_type: 'num',
                half_if_compare: 'is not',
                halt_if_type: 'num',
            };
            const expectedSchema = {
                ...VERSION_0,
                state_type: 'num',
                half_if_compare: 'is not',
                halt_if_type: 'num',
            };
            const migrate = migrations.find((m) => m.version === 0);
            const migratedSchema = migrate?.up(schema);

            expect(migratedSchema).toEqual(expectedSchema);
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

    describe('Version 4', function () {
        let migrate: Migration | undefined;

        beforeAll(function () {
            migrate = migrations.find((m) => m.version === 4);
        });

        it('should add version 3 to version 4', function () {
            const migratedSchema = migrate?.up(VERSION_3);
            expect(migratedSchema).toEqual(VERSION_4);
        });

        it('should convert comma delimited entity list to array and change type to list', function () {
            const schema = {
                ...VERSION_3,
                entityidfilter: 'entity.id,entity2.id, entity3.id',
                entityidfiltertype: 'substring',
            };
            const migratedSchema = migrate?.up(schema);
            expect(migratedSchema.entityidfilter).toEqual([
                'entity.id',
                'entity2.id',
                'entity3.id',
            ]);
            expect(migratedSchema.entityidfiltertype).toEqual('list');
        });

        it('should only contain one entity if there is a trailing comma', function () {
            const schema = {
                ...VERSION_3,
                entityidfilter: 'entity.id,',
                entityidfiltertype: 'substring',
            };
            const migratedSchema = migrate?.up(schema);
            expect(migratedSchema.entityidfilter).toHaveLength(1);
        });
    });

    describe('Version 5', function () {
        it('should update version 4 to version 5', function () {
            const migrate = migrations.find((m) => m.version === 5);
            const migratedSchema = migrate?.up(VERSION_4);

            expect(migratedSchema).toEqual(VERSION_5);
        });
    });

    describe('Version 6', function () {
        it('should update version 5 to version 6', function () {
            const migrate = migrations.find((m) => m.version === 6);
            const migratedSchema = migrate?.up(VERSION_5);

            expect(migratedSchema).toEqual(VERSION_6);
        });

        it('should convert a substring type to a entities substring array', function () {
            const schema = {
                ...VERSION_5,
                entityId: 'entity.id',
                entityIdType: 'substring',
            };
            const migratedSchema = migrate(schema);
            expect(migratedSchema.entities.substring).toEqual(['entity.id']);
        });

        it('should convert a regex type to a entities regex array', function () {
            const schema = {
                ...VERSION_5,
                entityId: 'entity.id',
                entityIdType: 'regex',
            };
            const migratedSchema = migrate(schema);
            expect(migratedSchema.entities.regex).toEqual(['entity.id']);
        });

        it('should convert a list type to a entities entity array', function () {
            const schema = {
                ...VERSION_5,
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
        expect(migratedSchema).toEqual(VERSION_6);
    });
});
