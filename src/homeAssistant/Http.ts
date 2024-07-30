import axios, { AxiosInstance, AxiosRequestConfig, ResponseType } from 'axios';
import Debug from 'debug';
import { HassEntity } from 'home-assistant-js-websocket';
import https from 'https';

import HomeAssistantError from '../common/errors/HomeAssistantError';
import { Credentials } from './';

const debug = Debug('home-assistant:http');

export type HttpConfig = Credentials & {
    rejectUnauthorizedCerts: boolean;
};

export default class Http {
    #client: AxiosInstance;

    constructor(config: HttpConfig) {
        const apiOpts: AxiosRequestConfig = {
            baseURL: `${config.host}/api`,
            headers: { Authorization: `Bearer ${config.access_token}` },
        };

        if (!config.rejectUnauthorizedCerts) {
            apiOpts.httpsAgent = new https.Agent({
                rejectUnauthorized: false,
            });
        }

        this.#client = axios.create(apiOpts);
    }

    async getHistory(
        timestamp?: string | null,
        filterEntityId?: string | null,
        endTimestamp?: string | null,
        flatten: boolean = false,
    ): Promise<HassEntity[][] | HassEntity[]> {
        let path = 'history/period';

        if (timestamp) {
            path = `${path}/${timestamp}`;
        }

        const params: { filter_entity_id?: string; end_time?: string } = {};
        if (filterEntityId) {
            params.filter_entity_id = filterEntityId;
        }
        if (endTimestamp) {
            params.end_time = endTimestamp;
        }

        // History returns an array for each entity_id and that array contains objects for each history item
        const results = await this.get<HassEntity[][]>(path, params);

        // Instead of returning the data from home assistant ( array for each entity_id ) return one flattened array
        // of one item per history entry
        if (flatten) {
            return results
                .reduce((acc: HassEntity[], entityArr: HassEntity[]) => {
                    return [...acc, ...entityArr];
                }, [])
                .sort((a, b) => {
                    if (a.last_updated < b.last_updated) {
                        return -1;
                    }
                    if (a.last_updated > b.last_updated) {
                        return 1;
                    }
                    return 0;
                });
        }

        return results;
    }

    renderTemplate(templateString: string): Promise<string> {
        return this.post<string>(
            'template',
            { template: templateString },
            'text',
        );
    }

    async post<T>(
        path: string,
        data: any = {},
        responseType: ResponseType = 'json',
    ): Promise<T> {
        debug(`HTTP POST: ${this.#client.defaults.baseURL}/${path}`);

        const response = await this.#client
            .request({
                method: 'post',
                url: path,
                data,
                responseType,
            })
            .catch((err) => {
                debug(`POST: request error: ${err.toString()}`);
                if (err.response?.data?.message) {
                    throw new HomeAssistantError(err.response.data);
                }
                throw err;
            });

        return responseType === 'json'
            ? (response.data ?? '')
            : (response.data as any);
    }

    async get<T>(
        path: string,
        params: any = {},
        responseType: ResponseType = 'json',
    ): Promise<T> {
        debug(`HTTP GET: ${this.#client.defaults.baseURL}/${path}`);

        const response = await this.#client
            .request({ method: 'get', url: path, params, responseType })
            .catch((err) => {
                debug(`GET: request error: ${err.toString()}`);
                if (err.response?.data?.message) {
                    throw new HomeAssistantError(err.response.data);
                }
                throw err;
            });

        return responseType === 'json'
            ? (response.data ?? '')
            : (response.data as any);
    }

    async put<T>(
        path: string,
        data: any = {},
        responseType: ResponseType = 'json',
    ): Promise<T> {
        debug(`HTTP PUT: ${this.#client.defaults.baseURL}/${path}`);

        const response = await this.#client
            .request({
                method: 'put',
                url: path,
                data,
                responseType,
            })
            .catch((err) => {
                debug(`PUT: request error: ${err.toString()}`);
                if (err.response?.data?.message) {
                    throw new HomeAssistantError(err.response.data);
                }
                throw err;
            });

        return responseType === 'json'
            ? (response.data ?? '')
            : (response.data as any);
    }

    async delete<T>(
        path: string,
        data: any = {},
        responseType: ResponseType = 'json',
    ): Promise<T> {
        debug(`HTTP DELETE: ${this.#client.defaults.baseURL}/${path}`);

        const response = await this.#client
            .request({
                method: 'delete',
                url: path,
                data,
                responseType,
            })
            .catch((err) => {
                debug(`DELETE: request error: ${err.toString()}`);
                if (err.response?.data?.message) {
                    throw new HomeAssistantError(err.response.data);
                }
                throw err;
            });

        return responseType === 'json'
            ? (response.data ?? '')
            : (response.data as any);
    }
}
