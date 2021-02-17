const expect = require('chai').expect;
const helper = require('node-red-node-test-helper');

const currentState = require('../src/index');

helper.init(require.resolve('node-red'));

describe('get-entities node', function () {
    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('should be loaded', function (done) {
        const flow = [
            { id: 'n1', type: 'ha-get-entities', name: 'get-entities' },
        ];
        helper.load(currentState, flow, function () {
            const n1 = helper.getNode('n1');
            expect(n1).to.have.property('name', 'get-entities');
            done();
        });
    });
});
