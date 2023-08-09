import Debug from 'debug';
import { EventEmitter } from 'events';
import {
    ERR_INVALID_AUTH,
    Error,
    MSG_TYPE_AUTH_INVALID,
    MSG_TYPE_AUTH_OK,
    MSG_TYPE_AUTH_REQUIRED,
} from 'home-assistant-js-websocket';
import WebSocket from 'ws';

const debug = Debug('home-assistant:socket');

interface HaWebSocket extends WebSocket {
    haVersion: string;
}

type ConnectionOptions = {
    auth: {
        // eslint-disable-next-line camelcase
        access_token: string;
        type: string;
    };
    connectionDelay: boolean;
    eventBus: EventEmitter;
    rejectUnauthorizedCerts: boolean;
    url: string;
};

/*
 * Pretty much a copy from https://github.com/home-assistant/home-assistant-js-websocket
 */
export default function createSocket({
    auth,
    connectionDelay,
    eventBus,
    rejectUnauthorizedCerts,
    url,
}: ConnectionOptions): Promise<HaWebSocket> {
    debug('[Auth Phase] Initializing', url);

    function connect(
        promResolve: (socket: HaWebSocket) => void,
        promReject: (err: Error) => void
    ) {
        debug('[Auth Phase] New connection', url);
        eventBus.emit('ha_client:connecting');

        const socket = new WebSocket(url, {
            rejectUnauthorized: rejectUnauthorizedCerts,
        }) as HaWebSocket;

        // If invalid auth, we will not try to reconnect.
        let invalidAuth = false;

        const onOpen = async () => {
            try {
                socket.send(JSON.stringify(auth));
            } catch (err) {
                invalidAuth = err === ERR_INVALID_AUTH;
                socket.close();
            }
        };

        const onMessage = (data: WebSocket.RawData, isBinary: boolean) => {
            if (isBinary) return;

            const message = JSON.parse(data.toString());

            debug('[Auth Phase] Received', message);

            switch (message.type) {
                case MSG_TYPE_AUTH_INVALID:
                    invalidAuth = true;
                    socket.close();
                    break;

                case MSG_TYPE_AUTH_OK:
                    socket.off('open', onOpen);
                    socket.off('message', onMessage);
                    socket.off('close', onClose);
                    socket.off('error', onClose);
                    socket.haVersion = message.ha_version;
                    // enable coalesce messages if supported
                    if (atLeastHaVersion(socket.haVersion, 2022, 9)) {
                        socket.send(
                            JSON.stringify({
                                type: 'supported_features',
                                id: 1,
                                features: { coalesce_messages: 1 },
                            })
                        );
                    }
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
            socket.off('close', onClose);
            if (invalidAuth) {
                promReject(ERR_INVALID_AUTH);
                return;
            }

            // Try again in a second
            setTimeout(() => connect(promResolve, promReject), 5000);
        };

        socket.on('open', onOpen);
        socket.on('message', onMessage);
        socket.on('close', onClose);
        socket.on('error', onClose);
    }

    return new Promise<HaWebSocket>((resolve, reject) => {
        // if hass.io, do a 5 second delay so it doesn't spam the hass.io proxy
        // https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/76
        setTimeout(
            () => connect(resolve, reject),
            connectionDelay !== false ? 5000 : 0
        );
    });
}

// https://github.com/home-assistant/home-assistant-js-websocket/blob/95f166b29a09fc1841bd0c1f312391ceb2812520/lib/util.ts#L45
export function atLeastHaVersion(
    version: string,
    major: number,
    minor: number,
    patch?: number
): boolean {
    const [haMajor, haMinor, haPatch] = version.split('.', 3);

    return (
        Number(haMajor) > major ||
        (Number(haMajor) === major &&
            (patch === undefined
                ? Number(haMinor) >= minor
                : Number(haMinor) > minor)) ||
        (patch !== undefined &&
            Number(haMajor) === major &&
            Number(haMinor) === minor &&
            Number(haPatch) >= patch)
    );
}
