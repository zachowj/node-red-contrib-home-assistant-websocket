const EventsNode = require('../../lib/events-node');
var countRegister;
module.exports = function (RED) {
    const nodeOptions = {
        config: {
            event_type: {},
            button_name: {},
            button_event: {}
        }
    };

    class ServerEventsNode extends EventsNode {

        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);
            if (this.nodeConfig.button_event == "i1002") {
                this.nodeConfig.button_event = 1002;
            } else if (this.nodeConfig.button_event == "i4002") {
                this.nodeConfig.button_event = 4002;
            } else if (this.nodeConfig.button_event == "i5002") {
                this.nodeConfig.button_event = 5002;
            }

            this.addEventClientListener({
                event: 'ha_events:deconz_event',
                //event: 'ha_events:all',
                handler: this.onHaEventsAll.bind(this)
            });
        }

        RegisterButtonPress(name, button) {
            countRegister[name + button] = new Date();
        }

        CanReRun(name, button) {
            if (!countRegister) {
                // console.log("Init register");
                countRegister = {};
                return true;
            }
            else {
                if (!countRegister[name + button]) {
                    // console.log("Did not find " + name+button);
                    return true;
                } else {
                    var lastRan = countRegister[name + button];
                    // console.log("Found " + name+button);
                    // console.log(" ... which last ran " + lastRan);
                    var difference = (new Date() - lastRan); // IN MS
                    if (difference > 1500) {
                        // console.log(" ... and can re-run now.");
                        return true;
                    } else {
                        // console.log(" ... and can NOT re-run now!");
                        return false;
                    }
                }
            }
        }

        onHaEventsAll(evt) {
            // console.log(evt.event);
            if (evt.event.id == this.nodeConfig.button_name && 
                evt.event.event == this.nodeConfig.button_event && 
                this.CanReRun(evt.event.id, this.nodeConfig.button_event)) 
            {
                this.RegisterButtonPress(evt.event.id, this.nodeConfig.button_event);
                this.send({event_type: evt.event_type, topic: evt.event_type, payload: evt});
                this.setStatusSuccess(evt.event_type);
                
                // console.log("-----------MATCH--------------------------------------");
                // console.log("Button Name:" + this.nodeConfig.button_name);
                // console.log("Matched Button Event:" + this.nodeConfig.button_event);
                // console.log("------------------------------------------------------");
            }
        }

        clientEvent(type, data) {
            if (
                !this.nodeConfig.event_type ||
                this.nodeConfig.event_type === 'home_assistant_client'
            ) {
                this.send({
                    event_type: 'home_assistant_client',
                    topic: `home_assistant_client:${type}`,
                    payload: type,
                    data: data
                });

                if (type === 'states_loaded' || type === 'services_loaded') {
                    this.setStatusSuccess(type);
                }
            }
        }

        onClientStatesLoaded() {
            this.clientEvent('states_loaded');
        }

        onClientServicesLoaded() {
            this.clientEvent('services_loaded');
        }

        onHaEventsClose() {
            super.onHaEventsClose();
            this.clientEvent('disconnected');
        }

        onHaEventsOpen() {
            super.onHaEventsOpen();
            this.clientEvent('connected');
        }

        onHaEventsConnecting() {
            super.onHaEventsConnecting();
            this.clientEvent('connecting');
        }

        onHaEventsError(err) {
            super.onHaEventsError(err);
            if (err) {
                this.clientEvent('error', err.message);
            }
        }
    }

    RED.nodes.registerType('server-deconz-events', ServerEventsNode);
};
