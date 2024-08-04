import { expect } from 'chai';

import {
    isMigrationArray,
    migrate,
    Migration,
} from '../../src/helpers/migrate';
import migrations from '../../src/nodes/action/migrations';

isMigrationArray(migrations);

const VERSION_UNDEFINED = {
    type: 'api-call-service',
    name: 'label of node',
    server: 'random.server.id',
    service_domain: 'service_domain',
    service: 'service_action',
    data: JSON.stringify({
        entity_id: 'entity.id1, entity.id2',
        message: 'extra_data',
    }),
    dataType: 'json',
    mergecontext: 'flowvalue',
    output_location: 'payload',
    output_location_type: 'msg',
    mustacheAltTags: false,
};
const VERSION_0 = {
    ...VERSION_UNDEFINED,
    version: 0,
};
const VERSION_1 = {
    ...VERSION_0,
    version: 1,
    entityId: 'entity.id1, entity.id2',
    data: JSON.stringify({
        message: 'extra_data',
    }),
};
const VERSION_2 = {
    ...VERSION_1,
    version: 2,
    outputProperties: [
        {
            property: 'payload',
            propertyType: 'msg',
            value: '',
            valueType: 'data',
        },
    ],
};
const VERSION_3 = {
    ...VERSION_2,
    version: 3,
    queue: 'none',
};
const VERSION_4 = {
    ...VERSION_3,
    version: 4,
    domain: 'service_domain',
    mergeContext: 'flowvalue',
    target: {
        areaId: [],
        deviceId: [],
        entityId: ['entity.id1', 'entity.id2'],
    },
    entityId: undefined,
    service_domain: undefined,
    mergecontext: undefined,
};
const VERSION_5 = {
    ...VERSION_4,
    version: 5,
    areaId: [],
    deviceId: [],
    entityId: ['entity.id1', 'entity.id2'],
    target: undefined,
};

const VERSION_6 = {
    ...VERSION_5,
    version: 6,
    floorId: [],
    labelId: [],
    action: 'service_domain.service_action',
};

describe('Migrations - Call Service Node', function () {
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

        it('extract entity_id out of data and move it to entityId', function () {
            const schema = {
                ...VERSION_0,
                data: JSON.stringify({ entity_id: 'hello' }),
            };
            const expectedSchema = {
                ...VERSION_1,
                entityId: 'hello',
                data: '',
            };
            const migratedSchema = migrate?.up(schema);

            expect(migratedSchema).to.eql(expectedSchema);
        });

        it('extract entity_id out of data and move it to entityId with data only containing left over properties', function () {
            const schema = {
                ...VERSION_0,
                data: JSON.stringify({
                    entity_id: 'hello',
                    brightness: 100,
                    text: 'string',
                }),
            };
            const expectedSchema = {
                ...VERSION_1,
                entityId: 'hello',
                data: JSON.stringify({ brightness: 100, text: 'string' }),
            };
            const migratedSchema = migrate?.up(schema);

            expect(migratedSchema).to.eql(expectedSchema);
        });

        it(`set entityId to empty string when entity_id doesn't exists in data`, function () {
            const schema = {
                ...VERSION_0,
                data: JSON.stringify({
                    brightness: 100,
                    text: 'string',
                }),
            };
            const expectedSchema = {
                ...VERSION_1,
                entityId: '',
                data: JSON.stringify({ brightness: 100, text: 'string' }),
            };
            const migratedSchema = migrate?.up(schema);

            expect(migratedSchema).to.eql(expectedSchema);
        });
    });

    describe('Version 2', function () {
        let migrate: Migration | undefined;

        before(function () {
            migrate = migrations.find((m) => m.version === 2);
        });

        it('should update version 1 to version 2', function () {
            const migratedSchema = migrate?.up(VERSION_1);

            expect(migratedSchema).to.eql(VERSION_2);
        });

        it('should have empty outputProperties when locationType is none', function () {
            const schema = {
                ...VERSION_1,
                output_location_type: 'none',
            };
            const migratedSchema = migrate?.up(schema);

            expect(migratedSchema.outputProperties).to.eql([]);
        });
    });

    describe('Version 3', function () {
        it('should update version 2 to version 3', function () {
            const migrate = migrations.find((m) => m.version === 3);
            const migratedSchema = migrate?.up(VERSION_2);

            expect(migratedSchema).to.eql(VERSION_3);
        });
    });

    describe('Version 4', function () {
        let migrate: Migration | undefined;

        before(function () {
            migrate = migrations.find((m) => m.version === 4);
        });

        it('should update version 3 to version 4', function () {
            const migratedSchema = migrate?.up(VERSION_3);

            expect(migratedSchema).to.eql(VERSION_4);
        });

        describe('entity id property', function () {
            it("should set the target entity to an empty array when the entity id doesn't have a length", function () {
                const schema = {
                    ...VERSION_4,
                    entityId: '',
                };
                const migratedSchema = migrate?.up(schema);

                expect(migratedSchema.target.entityId).to.eql([]);
            });

            it('should set the target entity to an empty array when the entity id is undefined', function () {
                const schema = {
                    ...VERSION_4,
                    entityId: undefined,
                };
                const migratedSchema = migrate?.up(schema);

                expect(migratedSchema.target.entityId).to.eql([]);
            });

            it('should set the target entity to an array of length 1 when the entity id is a single entity', function () {
                const schema = {
                    ...VERSION_4,
                    entityId: 'sun.sun',
                };
                const migratedSchema = migrate?.up(schema);

                expect(migratedSchema.target.entityId).to.have.a.lengthOf(1);
            });
        });
    });

    describe('Version 5', function () {
        let migrate: Migration | undefined;

        before(function () {
            migrate = migrations.find((m) => m.version === 5);
        });

        it('should update version 4 to version 5', function () {
            const migratedSchema = migrate?.up(VERSION_4);

            expect(migratedSchema).to.eql(VERSION_5);
        });

        it('should move targets to the base object', function () {
            const schema = {
                ...VERSION_4,
                target: {
                    areaId: ['living_room'],
                    deviceId: ['1234'],
                    entityId: ['sun.sun'],
                },
            };
            const migratedSchema = migrate?.up(schema);

            expect(migratedSchema.areaId).to.eql(['living_room']);
            expect(migratedSchema.deviceId).to.eql(['1234']);
            expect(migratedSchema.entityId).to.eql(['sun.sun']);
            expect(migratedSchema.target).to.eql(undefined);
        });
    });

    describe('Version 6', function () {
        let migrate: Migration | undefined;

        before(function () {
            migrate = migrations.find((m) => m.version === 6);
        });

        it('should update version 5 to version 6', function () {
            const migratedSchema = migrate?.up(VERSION_5);

            expect(migratedSchema).to.eql(VERSION_6);
        });
    });

    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);
        expect(migratedSchema).to.eql(VERSION_6);
    });
});
