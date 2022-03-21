import Debug from 'debug';
import { Connection } from 'home-assistant-js-websocket';

const debug = Debug('home-assistant:ws:heartbeat');

export type StopHeartbeat = () => void;

const HEARTBEAT_TIMEOUT = 5000;
const MIN_HEARTBEAT_INTERVAL = 10000;

export const startHeartbeat = (
    client: Connection,
    interval: number,
    host: string
): StopHeartbeat => {
    let beatTimeoutId: NodeJS.Timeout;

    const heartbeatIntervalId = setInterval(
        async () => {
            beatTimeoutId = setTimeout(() => {
                debug(`No pong received from ${host} attempting to reconnect`);
                client.reconnect(true);
            }, HEARTBEAT_TIMEOUT);

            debug(`Ping sent to ${host}`);
            try {
                await client.ping();
                clearTimeout(beatTimeoutId);
                debug(`Pong received from ${host}`);
            } catch (e) {}
        },
        // mininum of a 10 second heartbeat
        Math.max(MIN_HEARTBEAT_INTERVAL, interval * 1000)
    );

    return () => {
        clearInterval(heartbeatIntervalId);
        clearTimeout(beatTimeoutId);
    };
};
