import { MessageBase } from 'home-assistant-js-websocket';
import WebSocket, { Server } from 'ws';

const sendResult = (
    ws: WebSocket,
    {
        id,
        result,
        success,
    }: { id?: number; result?: Record<string, any>; success?: boolean }
) => {
    const str = JSON.stringify({
        type: 'result',
        id,
        success: success ?? true,
        result,
    });
    ws.send(str);
};

const defaults = {
    haVersion: '2021.3.0',
};

export default class HaServer {
    #accessToken: string;
    #host: string;
    #port: number;
    #server?: Server;
    #lastMessage?: MessageBase;
    #resolveConnection!: () => void;
    #rejectConnection!: (reason?: any) => void;
    #haVersion = defaults.haVersion;

    waitForConnection!: Promise<void>;

    constructor({
        host,
        port,
        accessToken,
    }: {
        host: string;
        port: number;
        accessToken: string;
    }) {
        this.#accessToken = accessToken;
        this.#host = host;
        this.#port = port;

        this.restore();
    }

    get lastMessage() {
        return this.#lastMessage;
    }

    start(cb: () => void) {
        this.#server = new Server({ host: this.#host, port: this.#port });

        this.#server.on('connection', (ws) => {
            ws.on('message', (message, isBinary) => {
                if (isBinary) {
                    console.error('binary message received');
                    return;
                }
                // console.log('received: %s', message);
                const data: MessageBase = JSON.parse(message.toString());
                this.#lastMessage = data;
                switch (data.type) {
                    case 'auth':
                        ws.send(
                            JSON.stringify({
                                type: 'auth_ok',
                                ha_version: this.#haVersion,
                            })
                        );
                        if (data.access_token !== this.#accessToken) {
                            this.#rejectConnection('Invalid access token');
                        }
                        break;
                    case 'auth/current_user':
                        sendResult(ws, {
                            id: data.id,
                            result: {
                                id: 'user1',
                                is_owner: true,
                                is_admin: true,
                            },
                        });

                        break;
                    case 'subscribe_events': {
                        switch (data.event_type) {
                            case 'state_changed':
                                break;
                            case 'nodered':
                                sendResult(ws, { id: data.id, result: {} });
                                break;
                            case 'component_loaded':
                            case 'core_config_updated':
                            case 'service_registered':
                            case 'service_removed':
                            case 'area_registry_updated':
                            case 'device_registry_updated':
                            case 'entity_registry_updated':
                                break;
                        }
                        break;
                    }
                    case 'get_config':
                    case 'get_states':
                    case 'get_services':
                    case 'config/area_registry/list':
                    case 'config/device_registry/list':
                        break;
                    case 'config/entity_registry/list':
                        // Last subscription can start testing
                        this.#resolveConnection();
                        break;
                }
            });
        });

        this.#server.on('listening', cb);
    }

    stop(cb: () => void) {
        if (this.#server) {
            this.#server.close();
            for (const ws of this.#server.clients) {
                ws.terminate();
            }
        }
        this.#rejectConnection?.();
        cb?.();
    }

    restore(cb?: () => void) {
        this.#haVersion = defaults.haVersion;

        this.waitForConnection = new Promise<void>((resolve, reject) => {
            this.#resolveConnection = resolve;
            this.#rejectConnection = reject;
        });
        cb?.();
    }

    setHaVersion(haVersion: string) {
        this.#haVersion = haVersion;
    }
}
