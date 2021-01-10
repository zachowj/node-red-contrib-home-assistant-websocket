const selectn = require('selectn');
const { CronJob } = require('cron');

const EventsHaNode = require('../../lib/events-ha-node');
const {
    isValidDate,
    getTimeInMilliseconds,
    parseTime,
    getEntitiesFromJsonata,
} = require('../../lib/utils');
const {
    TYPEDINPUT_BOOL,
    TYPEDINPUT_DATE,
    TYPEDINPUT_JSONATA,
    TYPEDINPUT_NUM,
    TYPEDINPUT_STR,
    STATUS_COLOR_BLUE,
    STATUS_COLOR_GREEN,
} = require('../../lib/const');

const DEFAULT_PROPERTY = 'state';

module.exports = function (RED) {
    const nodeOptions = {
        config: {
            entityId: {},
            property: {},
            offset: {},
            offsetType: {},
            offsetUnits: {},
            randomOffset: {},
            repeatDaily: {},
            payload: {},
            payloadType: {},
        },
    };

    class Time extends EventsHaNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
            this.cronjob = null;

            if (this.isHomeAssistantRunning) {
                this.onStateChanged();
            } else {
                this.addEventClientListener(
                    'ha_client:running',
                    this.onStateChanged.bind(this)
                );
            }
            this.addEventClientListener(
                `ha_events:state_changed:${this.nodeConfig.entityId}`,
                this.onStateChanged.bind(this)
            );

            if (this.nodeConfig.offsetType === TYPEDINPUT_JSONATA) {
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
            if (this.isEnabled === false || !this.isHomeAssistantRunning) {
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
                        throw new Error(RED._('ha-time.errors.invalid_date'));
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
                this.setStatusFailed(e.message);
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
                crontab = `${crontab.getSeconds()} ${crontab.getMinutes()} ${crontab.getHours()} * * *`;
            } else if (crontab.getTime() < Date.now()) {
                this.debugToClient(`date in the past`);
                this.setStatusFailed(RED._('ha-time.status.in_the_past'));
                return;
            }

            this.createCronjob(crontab);

            const nextTime = this.formatDate(this.cronjob.nextDates().toDate());
            this.setStatus({
                text: RED._('ha-time.status.next_at', { nextTime }),
                fill: STATUS_COLOR_BLUE,
            });
        }

        onInput(msg, send, done) {
            const now = new Date();
            const entity = this.getEntity();
            msg = {
                topic: this.nodeConfig.entityId,
                payload: this.getPayloadValue(
                    this.nodeConfig.payloadType,
                    this.nodeConfig.payload
                ),
                data: entity,
            };

            if (this.nodeConfig.repeatDaily) {
                const sentTime = this.formatDate(now);
                const nextTime = this.formatDate(
                    this.cronjob.nextDates().toDate()
                );
                this.setStatus({
                    text: RED._('ha-time.status.sent_and_next', {
                        sentTime,
                        nextTime,
                    }),
                    fill: STATUS_COLOR_GREEN,
                });
            } else {
                this.setStatusSuccess(RED._('ha-time.status.sent'));
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
            const node = this;
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
                throw new Error(RED._(errorMessage));
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
                    this.node.error(RED._('ha-time.errors.jsonata_error'));
                    throw new Error('error');
                }
            }
            const offsetMs = getTimeInMilliseconds(
                offset,
                this.nodeConfig.offsetUnits
            );

            if (isNaN(offsetMs)) {
                this.node.error(RED._('ha-time.errors.offset_nan', { offset }));
                throw new Error(RED._('ha-time.status.error'));
            }

            return Number(offsetMs);
        }

        getRandomOffset(crontab, offset) {
            // if not repeating stay ahead of current time
            if (!this.nodeConfig.repeating && Math.sign(offset) === -1) {
                const cronTimestamp = crontab.getTime();
                const maxOffset =
                    Math.max(Date.now(), cronTimestamp + offset) -
                    cronTimestamp;
                return maxOffset * Math.random();
            }

            return offset * Math.random();
        }

        getPayloadValue(type, val) {
            let value = val;
            switch (type) {
                case TYPEDINPUT_BOOL:
                    value = val === 'true';
                    break;
                case TYPEDINPUT_DATE:
                    value = Date.now();
                    break;
                case TYPEDINPUT_JSONATA: {
                    if (!val.length) {
                        value = '';
                        break;
                    }
                    try {
                        value = this.evaluateJSONata(val, {}, this.getEntity());
                    } catch (e) {
                        this.node.error(
                            RED._('ha-time.errors.invalid_jsonata_payload')
                        );
                        value = this.getEntity().state;
                    }
                    break;
                }
                case TYPEDINPUT_NUM:
                case TYPEDINPUT_STR:
                default:
                    value = this.getCastValue(type, val);
                    break;
            }
            return value;
        }

        getEntity() {
            return this.nodeConfig.server.homeAssistant.getStates(
                this.nodeConfig.entityId
            );
        }
    }

    RED.nodes.registerType('ha-time', Time);
};
