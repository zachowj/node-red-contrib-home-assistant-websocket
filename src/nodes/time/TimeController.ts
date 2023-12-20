import { CronJob } from 'cron';
import selectn from 'selectn';

import ExposeAsMixin from '../../common/controllers/ExposeAsMixin';
import OutputController from '../../common/controllers/OutputController';
import ConfigError from '../../common/errors/ConfigError';
import { TypedInputTypes } from '../../const';
import { RED } from '../../globals';
import { formatDate } from '../../helpers/date';
import {
    getTimeInMilliseconds,
    isValidDate,
    parseTime,
} from '../../helpers/utils';
import { TimeNode, TimeNodeProperties } from '.';

const DEFAULT_PROPERTY = 'state';

const ExposeAsController = ExposeAsMixin(OutputController<TimeNode>);
export default class TimeController extends ExposeAsController {
    #cronjob: CronJob | null = null;

    #createCronjob(crontab: string | Date) {
        this.#cronjob = CronJob.from({
            cronTime: crontab,
            onTick: async () => {
                try {
                    await this.#onTimer();
                } catch (e) {
                    this.node.error(e);
                    this.status.setError();
                }
            },
            start: true,
        });
    }

    #destoryCronjob() {
        if (this.#cronjob != null) {
            this.#cronjob.stop();
            this.#cronjob = null;
        }
    }

    #checkValidDateString(str?: string | number) {
        if (
            str === undefined ||
            str === 'unavailable' ||
            (typeof str !== 'string' && typeof str !== 'number')
        ) {
            throw new ConfigError(
                str === 'unavailable'
                    ? 'ha-time.status.unavailable'
                    : 'ha-time.status.invalid_property'
            );
        }
    }

    #formatDate(d?: Date) {
        return formatDate({
            date: d,
            options: {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            },
        });
    }

    #getEntity() {
        return this.homeAssistant.websocket.getStates(
            this.node.config.entityId
        );
    }

    async #getOffset() {
        let offset = this.node.config.offset || '0';
        if (this.node.config.offsetType === TypedInputTypes.JSONata) {
            offset = await this.jsonataService.evaluate(offset);
        }
        const offsetMs = getTimeInMilliseconds(
            Number(offset),
            this.node.config.offsetUnits
        );

        if (isNaN(offsetMs)) {
            throw new ConfigError(['ha-time.error.offset_nan', { offset }]);
        }

        return Number(offsetMs);
    }

    #getRandomOffset(crontab: Date, offset: number) {
        // if not repeating stay ahead of current time
        if (!this.node.config.repeatDaily && Math.sign(offset) === -1) {
            const cronTimestamp = crontab.getTime();
            const maxOffset =
                Math.max(Date.now(), cronTimestamp + offset) - cronTimestamp;
            return maxOffset * Math.random();
        }

        return offset * Math.random();
    }

    #getDays() {
        const days = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6,
        } as const;

        const selectedDays = Object.keys(days).reduce((acc, day) => {
            if (this.node.config[day as keyof TimeNodeProperties]) {
                acc.push(days[day as keyof typeof days]);
            }
            return acc;
        }, [] as number[]);

        if (selectedDays.length === 0) {
            throw new ConfigError('ha-time.error.no_days_selected');
        }

        return selectedDays.length === 7 ? '*' : selectedDays.join(',');
    }

    async #onTimer() {
        if (this.isEnabled === false) return;

        const now = new Date();
        const entity = this.#getEntity();

        const msg = {};
        await this.setCustomOutputs(this.node.config.outputProperties, msg, {
            config: this.node.config,
            entity,
            entityState: entity?.state,
            triggerId: entity?.entity_id,
        });

        if (this.node.config.repeatDaily) {
            const sentTime = this.#formatDate(now);
            // convert luxon to date
            const nextTime = this.#formatDate(
                this.#cronjob?.nextDate().toJSDate()
            );
            this.status.setSuccess([
                'ha-time.status.sent_and_next',
                {
                    sentTime,
                    nextTime,
                },
            ]);
        } else {
            this.status.setSuccess('ha-time.status.sent');
        }

        this.node.send(msg);
    }

    protected onClose() {
        this.#destoryCronjob();
    }

    public async onStateChanged() {
        const property = this.node.config.property || DEFAULT_PROPERTY;
        const entity = this.#getEntity();
        const dateString = selectn(property, entity);
        let crontab;
        let offset;

        this.#destoryCronjob();

        // Validate inputs
        this.#checkValidDateString(dateString);
        offset = await this.#getOffset();
        const digits = parseTime(dateString);

        // Doesn't match time format 00:00:00
        if (!digits) {
            if (!isValidDate(dateString)) {
                throw new ConfigError(
                    ['ha-time.error.invalid_date', { date: dateString }],
                    'ha-time.status.invalid_date'
                );
            }
            crontab = new Date(dateString);
        } else {
            crontab = new Date();
            crontab.setHours(digits.hour);
            crontab.setMinutes(digits.minutes);
            crontab.setSeconds(digits.seconds);
        }

        // plus minus offset
        if (offset !== 0) {
            if (this.node.config.randomOffset) {
                offset = this.#getRandomOffset(crontab, offset);
            }
            const timestamp = crontab.getTime() + offset;
            crontab.setTime(timestamp);
        }

        // Create repeating crontab string
        if (this.node.config.repeatDaily) {
            const days = this.#getDays();
            crontab = `${crontab.getSeconds()} ${crontab.getMinutes()} ${crontab.getHours()} * * ${days}`;
        } else if (crontab.getTime() < Date.now()) {
            this.node.warn(
                RED._('ha-time.error.in_the_past', {
                    date: dateString,
                })
            );
            this.status.setFailed('ha-time.status.in_the_past');
            return;
        }

        this.#createCronjob(crontab);

        const nextTime = this.#formatDate(this.#cronjob?.nextDate().toJSDate());
        this.status.setText(RED._('ha-time.status.next_at', { nextTime }));
    }
}
