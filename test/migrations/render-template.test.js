const { expect } = require('chai');

const migrations =
    require('../../src/nodes/render-template/migrations').default;
const { migrate } = require('../../src/helpers/migrate');

const VERSION_UNDEFINED = {
    id: 'node.id',
    type: 'api-render-template',
    name: 'label of node',
    server: 'server.id',
    template: '{{states.sun}}',
};
const VERSION_0 = {
    ...VERSION_UNDEFINED,
    version: 0,
    resultsLocation: 'payload',
    resultsLocationType: 'msg',
    templateLocation: 'template',
    templateLocationType: 'msg',
};

describe('Migrations - Render Template Node', function () {
    describe('Version 0', function () {
        it('should add version 0 to schema when no version is defined', function () {
            const migrate = migrations.find((m) => m.version === 0);
            const migratedSchema = migrate.up(VERSION_UNDEFINED);
            expect(migratedSchema).to.eql(VERSION_0);
        });
        it(`should only set defaults if property is undefined for templateLocationType and resultsLocationType`, function () {
            const schema = {
                ...VERSION_UNDEFINED,
                templateLocationType: 'flow',
                templateLocation: 'template2',
                resultsLocationType: 'flow',
                resultsLocation: 'payload2',
            };
            const expectedSchema = {
                ...VERSION_0,
                templateLocationType: 'flow',
                templateLocation: 'template2',
                resultsLocationType: 'flow',
                resultsLocation: 'payload2',
            };
            const migrate = migrations.find((m) => m.version === 0);
            const migratedSchema = migrate.up(schema);

            expect(migratedSchema).to.eql(expectedSchema);
        });
    });
    it('should update an undefined version to current version', function () {
        const migratedSchema = migrate(VERSION_UNDEFINED);
        expect(migratedSchema).to.eql(VERSION_0);
    });
});
