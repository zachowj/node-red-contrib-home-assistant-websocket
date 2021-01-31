const debug = require('debug')('home-assistant:socket');
const WebSocket = require('ws');
const {
    ERR_INVALID_AUTH,
    MSG_TYPE_AUTH_INVALID,
    MSG_TYPE_AUTH_OK,
    MSG_TYPE_AUTH_REQUIRED,
} = require('home-assistant-js-websocket');

/*
 * Pretty much a copy from https://github.com/home-assistant/home-assistant-js-websocket
 */
module.exports = function createSocket({
    auth,
    connectionDelay,
    eventBus,
    rejectUnauthorizedCerts,
    url,
}) {
    debug('[Auth Phase] Initializing', url);

    function connect(promResolve, promReject) {
        debug('[Auth Phase] New connection', url);
        eventBus.emit('ha_client:connecting');

        const socket = new WebSocket(url, {
            rejectUnauthorized: rejectUnauthorizedCerts,
        });

        // If invalid auth, we will not try to reconnect.
        let invalidAuth = false;

        const onOpen = async (event) => {
            try {
                socket.send(JSON.stringify(auth));
            } catch (err) {
                invalidAuth = err === ERR_INVALID_AUTH;
                socket.close();
            }
        };

        const onMessage = async (event) => {
            const message = JSON.parse(event.data);

            debug('[Auth Phase] Received', message);

            switch (message.type) {
                case MSG_TYPE_AUTH_INVALID:
                    invalidAuth = true;
                    socket.close();
                    break;

                case MSG_TYPE_AUTH_OK:
                    socket.removeEventListener('open', onOpen);
                    socket.removeEventListener('message', onMessage);
                    socket.removeEventListener('close', onClose);
                    socket.removeEventListener('error', onClose);
                    promResolve(socket);
                    break;

                default:
                    if (message.type !== MSG_TYPE_AUTH_REQUIRED) {
                        debug('[Auth Phase] Unhandled message', message);
                    }
            }
        };

        const onClose = () => {
            // If we are in error handler make sure close handler doesn't also fire.
            socket.removeEventListener('close', onClose);
            if (invalidAuth) {
                promReject(ERR_INVALID_AUTH);
                return;
            }

            // Try again in a second
            setTimeout(() => connect(promResolve, promReject), 5000);
        };

        socket.addEventListener('open', onOpen);
        socket.addEventListener('message', onMessage);
        socket.addEventListener('close', onClose);
        socket.addEventListener('error', onClose);
    }

    return new Promise((resolve, reject) => {
        // if hass.io, do a 5 second delay so it doesn't spam the hass.io proxy
        // https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/76
        setTimeout(
            () => connect(resolve, reject),
            connectionDelay !== false ? 5000 : 0
        );
    });
};
