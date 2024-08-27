import { describe, expect, it } from 'vitest';

import { isMigrationArray, migrate } from '../../src/helpers/migrate';
import migrations from '../../src/nodes/sentence/migrations';

isMigrationArray(migrations);

const VERSION_0 = {
    id: 'node.id',
    type: 'ha-sentence',
    name: 'label of node',
    version: 0,
    sentenses: [
        "[it's ]party time",
        'happy (new year|birthday)',
        'hello world',
    ],
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
            valueType: 'triggerId',
        },
        {
            property: 'sentences',
            propertyType: 'msg',
            value: 'sentences',
            valueType: 'config',
        },
        {
            property: 'result',
            propertyType: 'msg',
            value: '',
            valueType: 'results',
        },
    ],
};
const VERSION_1 = {
    ...VERSION_0,
    version: 1,
    response: '',
    exposeAsEntityConfig: '',
};

describe('Migrations - Sentense Node', function () {
    describe('Version 1', function () {
        it('should update version 0 to version 1', function () {
            const migrate = migrations.find((m) => m.version === 1);
            const migratedSchema = migrate?.up(VERSION_0);
            expect(migratedSchema).toEqual(VERSION_1);
        });
    });

    it('should update an version 0 to current version', function () {
        const migratedSchema = migrate(VERSION_0);
        expect(migratedSchema).toEqual(VERSION_1);
    });
});
