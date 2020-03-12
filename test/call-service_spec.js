const helper = require('node-red-node-test-helper');

const callService = require('../nodes/call-service/call-service.js');

helper.init(require.resolve('node-red'));

describe('call-service node', function() {
    beforeEach(function(done) {
        helper.startServer(done);
    });

    afterEach(function(done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('should be loaded', function(done) {
        var flow = [
            { id: 'n1', type: 'api-call-service', name: 'call-service' }
        ];
        helper.load(callService, flow, function() {
            var n1 = helper.getNode('n1');
            n1.should.have.property('name', 'call-service');
            done();
        });
    });
});
