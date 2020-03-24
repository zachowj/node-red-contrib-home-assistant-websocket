'use strict';
const axios = require('axios');
const debug = require('debug')('home-assistant:api');
const https = require('https');

const { shouldInclude } = require('./utils');

class HaHttp {
    constructor(config) {
        this.config = config;
        const apiOpts = { baseURL: config.baseUrl + '/api' };
        apiOpts.headers = config.legacy
            ? config.apiPass
                ? { 'x-ha-access': config.apiPass }
                : {}
            : { Authorization: 'Bearer ' + config.apiPass };

        if (!config.rejectUnauthorizedCerts) {
            apiOpts.httpsAgent = new https.Agent({
                rejectUnauthorized: false,
            });
        }

        this.client = axios.create(apiOpts);
    }

    getHistory(
        timestamp,
        filterEntityId,
        endTimestamp,
        { include, exclude, flatten } = {}
    ) {
        let path = 'history/period';

        if (timestamp) {
            path = path + `/${timestamp}`;
        }
        const params = {};
        if (filterEntityId) {
            params.filter_entity_id = filterEntityId;
        }
        if (endTimestamp) {
            params.end_time = endTimestamp;
        }

        // History returns an array for each entity_id and that array contains objects for each history item
        return this._get(path, params).then((result) => {
            if (!include && !exclude && !flatten) {
                return result;
            }

            // Filter out results by regex, include/exclude should already be an instance of RegEx
            if (include || exclude) {
                result = result.reduce((acc, entityArr) => {
                    const entityId =
                        entityArr && entityArr.length > 0
                            ? entityArr[0].entity_id
                            : null;

                    if (entityId && shouldInclude(entityId, include, exclude)) {
                        acc.push(entityArr);
                    }
                    return acc;
                }, []);
            }

            // Instead of returning the data from home assistant ( array for each entity_id ) return one flattened array
            // of one item per history entry
            if (flatten) {
                result = result
                    .reduce((acc, entityArray) => {
                        acc = acc.concat(entityArray);
                        return acc;
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

            return result;
        });
    }

    getConfig() {
        return this._get('config');
    }

    getDiscoveryInfo() {
        return this._get('discovery_info');
    }

    fireEvent(event, data) {
        return this._post(`events/${event}`, data);
    }

    getErrorLog() {
        return this._get('error_log');
    }

    // TODO: Test, entity_id should be `camera.some_cam_entity`
    getCameraImage(cameraEntityId) {
        return this._get(`camera_proxy/${cameraEntityId}`);
    }

    renderTemplate(templateString) {
        return this._post('template', { template: templateString }, 'text');
    }

    _post(path, data = {}, responseType = 'json') {
        debug(`POST: ${this.config.baseUrl}/${path}`);

        this.client.defaults.responseType = responseType;

        return this.client
            .post(path, data)
            .then((res) => res.data || '')
            .catch((err) => {
                debug(`POST: request error: ${err.toString()}`);
                throw err;
            });
    }

    _get(path, params = {}, responseType = 'json') {
        debug(`GET: ${this.config.baseUrl}/${path}`);

        this.client.defaults.responseType = responseType;

        return this.client
            .request({ url: path, params: params })
            .then((res) => res.data || '')
            .catch((err) => {
                debug(`GET: request error: ${err.toString()}`);
                throw err;
            });
    }
}

module.exports = HaHttp;
