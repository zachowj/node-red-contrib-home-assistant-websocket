const selectn = require('selectn');
const { CronJob } = require('cron');

const EventsHaNode = require('./EventsHaNode');
const {
    isValidDate,
    getTimeInMilliseconds,
    parseTime,
    getEntitiesFromJsonata,
} = require('../helpers/utils');
const { STATUS_COLOR_GREEN } = require('../helpers/status');
const { TYPEDINPUT_JSONATA } = require('../const');

const DEFAULT_PROPERTY = 'state';

const nodeOptions = {
    config: {
        entityId: {},
        property: {},
        offset: {},
        offsetType: {},
        offsetUnits: {},
        randomOffset: {},
        repeatDaily: {},
        sunday: {},
        monday: {},
        tuesday: {},
        wednesday: {},
        thursday: {},
        friday: {},
        saturday: {},
        outputProperties: {},
    },
};

class Time extends EventsHaNode {
    constructor({ node, config, RED, status }) {
        super({ node, config, RED, status, nodeOptions });
        this.cronjob = null;

        if (this.isHomeAssistantRunning) {
            this.onStateChanged();
        }
        this.addEventClientListener(
            'ha_client:ready',
            this.onStateChanged.bind(this)
        );

        this.addEventClientListener(
            `ha_events:state_changed:${this.nodeConfig.entityId}`,
            this.onStateChanged.bind(this)
        );

        if (
            this.nodeConfig.offsetType === TYPEDINPUT_JSONATA &&
            this.nodeConfig.offset.length > 12
        ) {
            const ids = getEntitiesFromJsonata(this.nodeConfig.offset);
            ids.forEach((id) => {
                this.addEventClientListener(
                    `ha_events:state_changed:${id}`,
                    this.onStateChanged.bind(this)
                );
            });
        }
    }

    onStateChanged() {
        if (this.isEnabled === false) {
            return;
        }
        const property = this.nodeConfig.property || DEFAULT_PROPERTY;
        const entity = this.getEntity();
        const dateString = selectn(property, entity);
        let crontab;
        let offset;

        this.destoryCronjob();

        // Validate inputs
        try {
            this.checkValidDateString(dateString);
            offset = this.getOffset();
            const digits = parseTime(dateString);

            // Doesn't match time format 00:00:00
            if (digits === null) {
                if (!isValidDate(dateString)) {
                    this.debugToClient(`Invalid date`);
                    throw new Error(this.RED._('ha-time.status.invalid_date'));
                }
                crontab = new Date(dateString);
            } else {
                crontab = new Date();
                crontab.setHours(digits.hour);
                crontab.setMinutes(digits.minutes);
                crontab.setSeconds(digits.seconds);
            }
        } catch (e) {
            this.debugToClient(e.message);
            this.status.setFailed(e.message);
            return;
        }

        // plus minus offset
        if (offset !== 0) {
            if (this.nodeConfig.randomOffset) {
                offset = this.getRandomOffset(crontab, offset);
            }
            const timestamp = crontab.getTime() + offset;
            crontab.setTime(timestamp);
        }

        // Create repeating crontab string
        if (this.nodeConfig.repeatDaily) {
            const days = this.getDays();
            if (!days) {
                this.status.setFailed(
                    this.RED._('ha-time.status.no_days_selected')
                );
                return;
            }
            crontab = `${crontab.getSeconds()} ${crontab.getMinutes()} ${crontab.getHours()} * * ${days}`;
        } else if (crontab.getTime() < Date.now()) {
            this.debugToClient(`date in the past`);
            this.status.setFailed(this.RED._('ha-time.status.in_the_past'));
            return;
        }

        this.createCronjob(crontab);

        const nextTime = this.formatDate(this.cronjob.nextDates().toDate());
        this.status.setText(this.RED._('ha-time.status.next_at', { nextTime }));
    }

    onInput({ send, done }) {
        const now = new Date();
        const entity = this.getEntity();

        const msg = {};
        try {
            this.setCustomOutputs(this.nodeConfig.outputProperties, msg, {
                config: this.nodeConfig,
                entity,
                entityState: entity.state,
                triggerId: entity.entity_id,
            });
        } catch (e) {
            this.status.setFailed('error');
            this.node.error(e.message);
            return;
        }

        if (this.nodeConfig.repeatDaily) {
            const sentTime = this.formatDate(now);
            const nextTime = this.formatDate(this.cronjob.nextDates().toDate());
            this.status.set({
                text: this.RED._('ha-time.status.sent_and_next', {
                    sentTime,
                    nextTime,
                }),
                fill: STATUS_COLOR_GREEN,
            });
        } else {
            this.status.setSuccess(this.RED._('ha-time.status.sent'));
        }
        send(msg);
        done();
    }

    formatDate(d) {
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const seconds = d.getSeconds().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    onClose(removed) {
        super.onClose(removed);
        this.destoryCronjob();
    }

    onHaEventMessage(evt) {
        super.onHaEventMessage(evt);

        if (this.isEnabled) {
            this.onStateChanged();
        } else {
            this.destoryCronjob();
        }
    }

    registerEntity(status = true) {
        // Don't update status after registering
        super.registerEntity(false);
    }

    createCronjob(crontab) {
        const node = this.node;
        this.cronjob = new CronJob({
            cronTime: crontab,
            onTick: () => {
                node.emit('input', {});
            },
            start: true,
        });
    }

    destoryCronjob() {
        if (this.cronjob != null) {
            this.cronjob.stop();
            delete this.cronjob;
        }
    }

    checkValidDateString(str) {
        if (
            str === undefined ||
            str === 'unavailable' ||
            (typeof str !== 'string' && typeof str !== 'number')
        ) {
            const errorMessage =
                str === 'unavailable'
                    ? 'ha-time.status.unavailable'
                    : 'ha-time.status.invalid_property';
            throw new Error(this.RED._(errorMessage));
        }
    }

    // calculate offset if jsonata
    // then convert it to milliseconds
    getOffset() {
        let offset = this.nodeConfig.offset || '0';
        if (this.nodeConfig.offsetType === TYPEDINPUT_JSONATA) {
            try {
                offset = this.evaluateJSONata(offset);
            } catch (e) {
                this.node.error(
                    this.RED._('ha-time.errors.jsonata_error', {
                        message: e.message,
                    })
                );
                throw new Error('error');
            }
        }
        const offsetMs = getTimeInMilliseconds(
            offset,
            this.nodeConfig.offsetUnits
        );

        if (isNaN(offsetMs)) {
            this.node.error(
                this.RED._('ha-time.errors.offset_nan', { offset })
            );
            throw new Error(this.RED._('ha-time.status.error'));
        }

        return Number(offsetMs);
    }

    getRandomOffset(crontab, offset) {
        // if not repeating stay ahead of current time
        if (!this.nodeConfig.repeating && Math.sign(offset) === -1) {
            const cronTimestamp = crontab.getTime();
            const maxOffset =
                Math.max(Date.now(), cronTimestamp + offset) - cronTimestamp;
            return maxOffset * Math.random();
        }

        return offset * Math.random();
    }

    getEntity() {
        return this.homeAssistant.getStates(this.nodeConfig.entityId);
    }

    getDays() {
        const days = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6,
        };

        const selectedDays = Object.keys(days).reduce((acc, day) => {
            if (this.nodeConfig[day]) {
                acc.push(days[day]);
            }
            return acc;
        }, []);

        return selectedDays.length === 7 ? '*' : selectedDays.join(',');
    }
}

module.exports = Time;
