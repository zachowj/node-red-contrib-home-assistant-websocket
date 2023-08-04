const { expect } = require('chai');

const migrations = require('../../src/nodes/sentence/migrations').default;
const { migrate } = require('../../src/helpers/migrate');

const VERSION_0 = {
    id: 'node.id',
    type: 'ha-sentence',
    name: 'label of node',
    server: 'server.id',
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
    ],
    version: 0,
};
const VERSION_1 = {
    ...VERSION_0,
    version: 1,
    exposeAsEntityConfig: '',
};

describe('Migrations - Sentence Node', function () {
    describe('Version 1', function () {
        it('should update version 0 to version 1', function () {
            const migrate = migrations.find((m) => m.version === 1);
            const migratedSchema = migrate.up(VERSION_0);
            expect(migratedSchema).to.eql(VERSION_1);
        });
    });
    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_0);
        expect(migratedSchema).to.eql(VERSION_1);
    });
});
