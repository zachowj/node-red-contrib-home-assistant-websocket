const expect = require('chai').expect;
const helper = require('node-red-node-test-helper');

const fireEvent = require('../../src/index');

helper.init(require.resolve('node-red'));

describe('fire-event node', function () {
    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('should be loaded', function (done) {
        const flow = [{ id: 'n1', type: 'ha-fire-event', name: 'fire-event' }];
        helper.load(fireEvent, flow, function () {
            const n1 = helper.getNode('n1');
            expect(n1).to.have.property('name', 'fire-event');
            done();
        });
    });

    // Merge Context: Payload Data > Flow Data >  Global Data > Config Data ( payload data property always wins if provided )
    /*
    it('should pass config data through', function(done) {
        var flow = [
            {
                id: 'n1',
                type: 'ha-fire-event',
                name: 'fire-event',
                event: 'test',
                data: { foo: 'bar' },
                wires: [['n2']]
            },
            { id: 'n2', type: 'helper' }
        ];

        helper.load(fireEvent, flow, function() {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');

            n2.on('input', function(msg) {
                msg.payload.should.have.property('event', 'test');
                msg.payload.data.should.have.property('foo', 'bar');
                done();
            });

            n1.receive({ payload: 'foo', topic: 'bar' });
        });
    });

    it('should pass config event through but empty config data', function(done) {
        var flow = [
            {
                id: 'n1',
                type: 'ha-fire-event',
                name: 'fire-event',
                event: 'test',
                wires: [['n2']]
            },
            { id: 'n2', type: 'helper' }
        ];

        helper.load(fireEvent, flow, function() {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');

            n2.on('input', function(msg) {
                msg.payload.should.have.property('event', 'test');
                msg.payload.should.have.property('data', {});
                done();
            });

            n1.receive({ payload: 'foo', topic: 'bar' });
        });
    });

    it('should merge global data and pass through', function(done) {
        var flow = [
            {
                id: 'n1',
                type: 'ha-fire-event',
                name: 'fire-event',
                event: 'test',
                data: { foo: 'bar' },
                mergecontext: 'mergeName',
                z: 'flowA',
                wires: [['n2']]
            },
            { id: 'n2', type: 'helper', z: 'flowA' }
        ];

        helper.load(fireEvent, flow, function() {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');

            n1.context().global.set('mergeName', { foo: 'baz' });

            n2.on('input', function(msg) {
                msg.payload.data.should.have.property('foo', 'baz');
                done();
            });

            n1.receive({ payload: 'foo', topic: 'bar' });
        });
    });

    it('should merge flow data and pass through', function(done) {
        var flow = [
            {
                id: 'n1',
                type: 'ha-fire-event',
                name: 'fire-event',
                event: 'test',
                data: { foo: 'bar' },
                mergecontext: 'mergeName',
                z: 'flowA',
                wires: [['n2']]
            },
            { id: 'n2', type: 'helper', z: 'flowA' }
        ];

        helper.load(fireEvent, flow, function() {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');

            n1.context().global.set('mergeName', { foo: 'baz' });
            n1.context().flow.set('mergeName', { foo: 'zxc' });

            n2.on('input', function(msg) {
                msg.payload.data.should.have.property('foo', 'zxc');
                done();
            });

            n1.receive({ payload: 'foo', topic: 'bar' });
        });
    });

    it('should merge payload data and pass through', function(done) {
        var flow = [
            {
                id: 'n1',
                type: 'ha-fire-event',
                name: 'fire-event',
                event: 'test',
                data: { foo: 'bar' },
                mergecontext: 'mergeName',
                z: 'flowA',
                wires: [['n2']]
            },
            { id: 'n2', type: 'helper', z: 'flowA' }
        ];

        helper.load(fireEvent, flow, function() {
            var n1 = helper.getNode('n1');
            var n2 = helper.getNode('n2');

            n1.context().global.set('mergeName', { foo: 'baz' });
            n1.context().flow.set('mergeName', { foo: 'zxc' });

            n2.on('input', function(msg) {
                msg.payload.data.should.have.property('foo', 'toto');
                done();
            });

            n1.receive({ payload: { data: { foo: 'toto' } }, topic: 'bar' });
        });
    });
    */
});
