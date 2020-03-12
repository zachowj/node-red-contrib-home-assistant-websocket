const currentState = require('../nodes/get-entities/get-entities.js');

const helper = require('node-red-node-test-helper');

helper.init(require.resolve('node-red'));

describe('get-entities node', function() {
    beforeEach(function(done) {
        helper.startServer(done);
    });

    afterEach(function(done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('should be loaded', function(done) {
        var flow = [
            { id: 'n1', type: 'ha-get-entities', name: 'get-entities' }
        ];
        helper.load(currentState, flow, function() {
            var n1 = helper.getNode('n1');
            n1.should.have.property('name', 'get-entities');
            done();
        });
    });
});
