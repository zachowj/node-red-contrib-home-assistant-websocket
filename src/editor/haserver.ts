import { HassEntity, HassServices } from 'home-assistant-js-websocket';
import { EditorNodeInstance, EditorRED } from 'node-red';

import { NodeType } from '../const';
import { ConfigServerEditorNodeProperties } from '../nodes/config-server/editor';
import {
    HassArea,
    HassAreas,
    HassDevices,
    HassFloor,
    HassLabel,
} from '../types/home-assistant';
import * as haData from './data';
import { HassNodeProperties, HassTargetDomains } from './types';

declare const RED: EditorRED;

let $server: JQuery;
let serverId: string;
let node: EditorNodeInstance<HassNodeProperties>;
let limitNotification = false;

function setDefault() {
    let defaultServer: string | undefined;
    RED.nodes.eachConfig((n: any) => {
        if (n.type === NodeType.Server && !defaultServer) defaultServer = n.id;

        return true;
    });
    if (defaultServer) $server.val(defaultServer);
}

export function init(
    n: EditorNodeInstance<HassNodeProperties>,
    server: string,
    onChange?: (serverId: string) => void,
) {
    $server = $(server);
    node = n;

    if (!node.server) {
        setDefault();
    }
    serverId = $server.val() as string;
    // Delay the listener so only get one event on load
    setTimeout(() => {
        $server.on('change', () => {
            serverId = $server.val() as string;
            onChange?.(serverId);
        });
    }, 500);
}
export function getSelectedServerId() {
    return serverId;
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

export function getItems(type: string, callback: (items: any) => void) {
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
    { params = {} },
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

export const getAreaNameById = (areaId?: string): string => {
    return haData.getAreaNameById(serverId, areaId);
};

export const getAreas = (): HassAreas => {
    return haData.getAreas(serverId);
};

export const getDevices = (): HassDevices => {
    return haData.getDevices(serverId);
};

export const getEntity = (entityId: string): HassEntity => {
    return haData.getEntity(serverId, entityId);
};

export const getEntityRegistry = () => {
    return haData.getEntityRegistry(serverId);
};

export const getEntities = (): HassEntity[] => {
    return Object.values(haData.getEntities(serverId));
};

export const getFloors = (): HassFloor[] => {
    return haData.getFloors(serverId);
};

export const getLabels = (): HassLabel[] => {
    return haData.getLabels(serverId);
};

export const getServices = (): HassServices => {
    return haData.getServices(serverId);
};

export const getTargetDomains = (): HassTargetDomains => {
    return haData.getTargetDomains(serverId);
};

export const getUiSettings = () => {
    const node = RED.nodes.node(
        serverId,
    ) as EditorNodeInstance<ConfigServerEditorNodeProperties>;

    return {
        areaSelector: node?.areaSelector,
        deviceSelector: node?.deviceSelector,
        entitySelector: node?.entitySelector,
        status: {
            separator: node?.statusSeparator,
            year: node?.statusYear,
            month: node?.statusMonth,
            day: node?.statusDay,
            hourCycle: node?.statusHourCycle,
            timeFormat: node?.statusTimeFormat,
        },
    };
};
