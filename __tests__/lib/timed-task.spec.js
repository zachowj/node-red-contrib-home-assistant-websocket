const test = require('tape');
const TimedTask = require('../../lib/timed-task');

const NOW = 0;

TimedTask.prototype.getNow = () => NOW;

const options = () => ({
    id: 'my timed task',
    runsIn: 1,
    task: () => '1',
    onStart: () => '2',
    onComplete: () => '3',
    onCancel: () => '4',
    onFailed: e => '5'
});

test('TimedTask: should instantiate', function(t) {
    const opts = options();
    const tt = new TimedTask(opts);
    t.equal(tt.id, opts.id, 'ids should work');
    t.equal(tt.runsAt, NOW + opts.runsIn, 'runsAt should be calculated');
    t.equal(typeof tt.task, 'function');
    t.end();
});

test('TimedTask: should run task', function(t) {
    const opts = options();
    const onDone = () => t.end();
    opts.task = () => (t.pass('task called when scheduled'), onDone()); // eslint-disable-line
    new TimedTask(opts); // eslint-disable-line
});

test('TimedTask: should call onStart and onComplete', function(t) {
    const opts = options();

    const onDone = () => t.end();
    opts.onStart = () => t.pass('onStart called');
    opts.onComplete = () => (t.pass('on complete called'), onDone());   // eslint-disable-line

    new TimedTask(opts); // eslint-disable-line
});

test('TimedTask: should serialize', function(t) {
    const tt = new TimedTask(options());
    const str = tt.serialize();
    const expectedStr = `{"id":"my timed task","runsAt":1,"task":()  => '1',"onStart":()  => '2',"onComplete":()  => '3',"onCancel":()  => '4',"onFailed":(e) => '5'}`;
    t.equal(str, expectedStr, 'serialized string is correct');
    t.end();
});

test('TimedTask: should deserialize', function(t) {
    const opts = options();
    const tt = new TimedTask(opts);
    const str = tt.serialize();
    const timedTask = TimedTask.createFromSerialized(str);

    t.equals(timedTask.id, opts.id, 'deserialized id is equal');
    t.equals(
        typeof timedTask.task,
        'function',
        'task function is deserialized correctly'
    );

    t.end();
});
