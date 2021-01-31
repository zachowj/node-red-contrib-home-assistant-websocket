const helper = require('node-red-node-test-helper');

const currentState = require('../src/index');

helper.init(require.resolve('node-red'));

describe('current-state node', function () {
    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('should be loaded', function (done) {
        const flow = [
            { id: 'n1', type: 'api-current-state', name: 'current-state' },
        ];
        helper.load(currentState, flow, function () {
            const n1 = helper.getNode('n1');
            n1.should.have.property('name', 'current-state');
            done();
        });
    });
});
