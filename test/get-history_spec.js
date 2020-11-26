const helper = require('node-red-node-test-helper');

const getHistory = require('../nodes/get-history/get-history.js');

helper.init(require.resolve('node-red'));

describe('get-history node', function () {
    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('should be loaded', function (done) {
        const flow = [
            { id: 'n1', type: 'api-get-history', name: 'get-history' },
        ];
        helper.load(getHistory, flow, function () {
            const n1 = helper.getNode('n1');
            n1.should.have.property('name', 'get-history');
            done();
        });
    });
});
