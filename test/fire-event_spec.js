const helper = require('node-red-node-test-helper');
const fireEvent = require('../nodes/fire-event/fire-event.js');

helper.init(require.resolve('node-red'));

describe('fire-event Node', function() {
    beforeEach(function(done) {
        helper.startServer(done);
    });

    afterEach(function(done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('should be loaded', function(done) {
        var flow = [{ id: 'n1', type: 'ha-fire-event', name: 'fire-event' }];
        helper.load(fireEvent, flow, function() {
            var n1 = helper.getNode('n1');
            n1.should.have.property('name', 'fire-event');
            done();
        });
    });
});
