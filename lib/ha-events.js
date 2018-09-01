
'use strict';
const utils        = require('./utils');
const EventEmitter = require('events').EventEmitter;
const EventSource  = require('eventsource');
const debug        = require('debug')('home-assistant:events');

class HaEvents extends EventEmitter {
    constructor(config) {
        super();
        this.config    = config;
        this.streamUrl = `${config.baseUrl}/api/stream`;
        this.esOptions = (config.apiPass)
            ? { headers: { 'x-ha-access': config.apiPass }}
            : {};
        this.connected = false;

        this.setMaxListeners(0);
    }

    startListening(eventOpts = {}) {
        if (this.config.events.transport !== 'sse') { throw new Error('Unsupported transport type'); }
        this.config.events.includeRegex = eventOpts.includeRegex || this.config.events.includeRegex;
        this.config.events.excludeRegex = eventOpts.excludeRegex || this.config.events.excludeRegex;

        this.client = new EventSource(this.streamUrl, this.esOptions);
        this.client.on('message', (evt) => this.onClientMessage(evt));

        this.client.on('open',  ()    => this.onClientOpen());
        this.client.on('close', ()    => this.onClientClose());
        this.client.on('error', (err) => this.onClientError(err));
    }

    onClientMessage(msg) {
        if (!msg || !msg.data || msg.data === 'ping') { return; }

        let event;
        try   { event = JSON.parse(msg.data); }
        catch (e) { this.emit('ha_events:error', e); }

        if (event) {
            const eventType = event.event_type;
            const entityId  = (event.data) ? event.data.entity_id : null;
            const { excludeRegex, includeRegex } = this.config.events;

            const emitEvent = { event_type: eventType, entity_id: entityId, event: event.data };

            // If entity_id was found but is excluded by configured filter then stop further processing
            if (entityId && !(utils.shouldInclude(entityId, includeRegex, excludeRegex))) {
                debug('Skipping entity as entityId was excluded by includeRegex or excludeRegex config option');
                return;
            }

            // Emit on all channel
            this.emit('ha_events:all', emitEvent);

            // Emit on the event type channel
            if (emitEvent.event_type) {
                this.emit(`ha_events:${event.event_type}`, emitEvent);
            }

            // Most specific emit for event_type and entity_id
            if (emitEvent.event_type && emitEvent.entity_id) {
                this.emit(`ha_events:${event.event_type}:${emitEvent.entity_id}`, emitEvent);
            }
        }
    }

    onClientOpen() {
        debug('events connection open');
        this.connected = true;
        this.emit('ha_events:open');
    }

    onClientClose() {
        this.closeClient(null, 'events connection closed, cleaning up connection');
    }

    onClientError(err) {
        this.closeClient(err, 'events connection error, cleaning up connection');
    }

    closeClient(err, logMsg) {
        if (logMsg) { debug(logMsg); }
        if (err)    {
            debug(err);
            this.emit('ha_events:error', err);
        }

        if (this.client && this.client.close) {
            this.connected = false;
            this.client.close();
            this.emit('ha_events:close');
        }

        // TODO: Put in proper exponential retries
        setTimeout(() => this.startListening(), 2000);
    }
}

module.exports = HaEvents;
