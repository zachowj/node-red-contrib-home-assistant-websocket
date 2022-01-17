import { HassEntity } from 'home-assistant-js-websocket';
import { EditorNodeInstance, EditorRED } from 'node-red';

import { HassArea } from '../types/home-assistant';
import * as haData from './data';
import { HassNodeProperties } from './types';

declare const RED: EditorRED;

let $server: JQuery;
let serverId: string;
let node: EditorNodeInstance<HassNodeProperties>;
let limitNotification = false;

function setDefault() {
    let defaultServer: string | undefined;
    RED.nodes.eachConfig((n: any) => {
        if (n.type === 'server' && !defaultServer) defaultServer = n.id;

        return true;
    });
    if (defaultServer) $server.val(defaultServer);
}

export function init(
    n: EditorNodeInstance<HassNodeProperties>,
    server: string
) {
    $server = $(server);
    node = n;

    if (!node.server) {
        setDefault();
    }
}

export function autocomplete(type: string, callback: (items: any) => void) {
    // If a server is selected populate drop downs
    let selectedServerId = $server.val() as string;
    if (node.server || (selectedServerId && selectedServerId !== '_ADD_')) {
        serverId = node.server || selectedServerId;
        getItems(type, callback);
    }

    $server.on('change', () => {
        serverId = $server.val() as string;
        if (serverId !== selectedServerId) {
            selectedServerId = serverId;
            getItems(type, callback);
        }
    });
}

function getItems(type: string, callback: (items: any) => void) {
    // If no server added yet just return
    if (serverId === '_ADD_') return;

    $.getJSON(`homeassistant/${type}/${serverId}`)
        .done((items) => {
            callback(items);
        })
        .fail((jqxhr) => {
            if (jqxhr.status === 503 && limitNotification === false) {
                limitNotification = true;
                RED.notify(node._('config-server.errors.server_deploy'));
                setTimeout(() => (limitNotification = false), 2000);
            }
        });
}

export function getJSON(
    callback: (results: any) => void,
    type: string,
    { params = {} }
) {
    let url = `homeassistant/${type}/${$server.val()}`;
    if (!$.isEmptyObject(params)) {
        url += `?${$.param(params)}`;
    }
    $.getJSON(url).done((results) => {
        callback(results);
    });
}

export function fetch<T>(type: string, params: any = {}) {
    let url = `homeassistant/${type}/${$server.val()}`;
    if (!$.isEmptyObject(params)) {
        url += `?${$.param(params)}`;
    }
    return new Promise<T>((resolve, reject) => {
        $.getJSON(url)
            .done((results) => resolve(results as T))
            .fail((err) => reject(err));
    });
}

export const getAreaById = (areaId: string): HassArea | undefined => {
    const areas = haData.getAreas(serverId);
    if (areas?.length) {
        return areas.find((a) => a.area_id === areaId);
    }
};

export const getEntities = (): HassEntity[] => {
    return Object.values(haData.getEntities(serverId));
};
