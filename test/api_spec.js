const helper = require('node-red-node-test-helper');
const api = require('../nodes/api/api.js');

helper.init(require.resolve('node-red'));

describe('api node', function() {
    beforeEach(function(done) {
        helper.startServer(done);
    });

    afterEach(function(done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('should be loaded', function(done) {
        var flow = [{ id: 'n1', type: 'ha-api', name: 'API' }];
        helper.load(api, flow, function() {
            var n1 = helper.getNode('n1');
            n1.should.have.property('name', 'API');
            done();
        });
    });
});
