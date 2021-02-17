const expect = require('chai').expect;
const helper = require('node-red-node-test-helper');

const renderTemplate = require('../src/index');

helper.init(require.resolve('node-red'));

describe('render-template node', function () {
    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('should be loaded', function (done) {
        const flow = [
            { id: 'n1', type: 'api-render-template', name: 'render-template' },
        ];
        helper.load(renderTemplate, flow, function () {
            const n1 = helper.getNode('n1');
            expect(n1).to.have.property('name', 'render-template');
            done();
        });
    });
});
