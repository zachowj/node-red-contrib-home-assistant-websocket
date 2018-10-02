const test = require('tape');
const helper = require('node-red/test/nodes/helper');
const ConfigServerNode = require('../../nodes/config-server/config-server');
const ServerEventsNode = require('../../nodes/server-events-all/server-events-all');

test('before: start-server', function(t) {
    helper.startServer(() => t.end());
});

test('Simple Node: should load', function(t) {
    let flow = [
        { id: 'n1', type: 'server-events', server: 'n2', wires: [] },
        {
            id: 'n2',
            type: 'server',
            name: 'ha-server',
            url: 'http://localhost:1234',
            pass: '123'
        }
    ];

    helper.load([ServerEventsNode, ConfigServerNode], flow, function() {
        const n1 = helper.getNode('n1');
        t.equals(
            n1.type,
            'server-events',
            'simple node should instantiate with type "simple-node"'
        );
        helper.unload();
        t.end();
    });
});

// test('Simple Node: should send lowercased payload', function(t) {
//     let flow = [
//         { id: 'n1', type: 'simple-node', server: 'n2', wires: [ ['n3'] ] },
//         { id: 'n2', type: 'config-node', host: 'localhost', port: '1234' },
//         { id: 'n3', type: 'helper' }
//     ];

//     helper.load([ConfigNode, SimpleNode], flow, function() {
//         const n1 = helper.getNode('n1');
//         const n3 = helper.getNode('n3');

//         n3.on('input', function(msg) {
//             t.equals(msg.topic,   expectedMsg.topic,   'topics should match');
//             t.equals(msg.payload, expectedMsg.payload.toLowerCase(), 'payload should be lowercased match');
//             t.end();
//         });

//         const expectedMsg = { topic: 'test', payload: 'ABC' };
//         n1.receive(expectedMsg);
//     });
// });

test('after: stop-server', function(t) {
    helper.stopServer();
    t.end();
});
