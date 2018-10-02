const serialize = require('serialize-javascript');

class TimedTask {
    constructor(o) {
        this.id = o.id;
        this.task = o.task;
        this.onStart = o.onStart;
        this.onComplete = o.onComplete;
        this.onCancel = o.onCancel;
        this.onFailed = o.onFailed;

        const now = this.getNow();
        if (o.runsAt && o.runsAt <= now)
            throw new Error(
                'Cannot schedule a task which is set to run in the past'
            );

        let runsIn = o.runsAt ? o.runsAt - now : o.runsIn;

        this.schedule(runsIn);
    }

    schedule(runsInMs) {
        this.cancel();
        this.scheduledAt = this.getNow();
        this.runsAt = this.scheduledAt + runsInMs;
        this.timer = setTimeout(this.start.bind(this), runsInMs);
    }

    getNow() {
        return Date.now();
    }

    cancel() {
        if (this.timer) {
            if (typeof this.onCancel === 'function') this.onCancel();
            clearTimeout(this.timer);
            ['timer', 'scheduledAt', 'runsAt'].forEach(k => (this[k] = null));
        }
    }

    getRunsAtDate() {
        return new Date(this.runsAt);
    }

    async start() {
        if (typeof this.onStart === 'function') this.onStart();
        try {
            await this.task();
            this.onComplete();
        } catch (e) {
            if (typeof this.onFailed === 'function') {
                this.cancel();
                this.onFailed(e);
            } else {
                throw e;
            }
        }
    }
    static create(o) {
        return new TimedTask(o);
    }

    static createFromSerialized(str) {
        const taskObj = eval('(' + str + ')'); // eslint-disable-line
        return new TimedTask(taskObj);
    }

    serialize() {
        return serialize(this);
    }

    // Called by stringify with serialize
    toJSON() {
        const {
            id,
            runsAt,
            task,
            onStart,
            onComplete,
            onCancel,
            onFailed
        } = this;
        return { id, runsAt, task, onStart, onComplete, onCancel, onFailed };
    }
}

module.exports = TimedTask;
