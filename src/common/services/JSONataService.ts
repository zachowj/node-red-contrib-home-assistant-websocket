import { HassEntity } from 'home-assistant-js-websocket';
import { Expression } from 'jsonata';
import { random, sampleSize } from 'lodash';
import { Node } from 'node-red';

import { RED } from '../../globals';
import { validEntityId } from '../../helpers/utils';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { HassArea, HassDevice } from '../../types/home-assistant';
import JSONataError from '../errors/JSONataError';

function evaluateJSONataExpression(
    expr: Expression,
    message: Record<string, any>,
) {
    return new Promise<any>((resolve, reject) => {
        RED.util.evaluateJSONataExpression(expr as any, message, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

function isJSONataError(error: unknown): error is JSONataError {
    if (typeof error !== 'object' || !error) return false;

    return (
        'code' in error &&
        'message' in error &&
        'stack' in error &&
        'token' in error
    );
}

export default class JSONataService {
    readonly #homeAssistant?: HomeAssistant;
    readonly #node: Node;

    constructor({
        homeAssistant,
        node,
    }: {
        homeAssistant?: HomeAssistant;
        node: Node;
    }) {
        this.#homeAssistant = homeAssistant;
        this.#node = node;
    }

    async evaluate(expression: string, objs: Record<string, any> = {}) {
        let expr: Expression;
        try {
            expr = RED.util.prepareJSONataExpression(expression, this.#node);
        } catch (err) {
            if (isJSONataError(err)) {
                throw new JSONataError(err);
            }
            throw err;
        }
        const { entity, message, prevEntity } = objs;

        expr.assign('areas', this.areas.bind(this));
        expr.assign('areaDevices', this.areaDevices.bind(this));
        expr.assign('areaEntities', this.areaEntities.bind(this));
        expr.assign('deviceEntities', this.deviceEntities.bind(this));
        expr.assign('device', this.device.bind(this));
        expr.assign('entity', () => entity);
        expr.assign(
            'entities',
            (val: string) => this.#homeAssistant?.websocket?.getStates(val),
        );
        expr.assign('outputData', (obj: string) => {
            if (!obj) {
                const filtered = Object.keys(objs).reduce(
                    (acc, key) => {
                        // ignore message as it already accessable
                        if (key !== 'message' && objs[key] !== undefined) {
                            acc[key] = objs[key];
                        }
                        return acc;
                    },
                    {} as Record<string, any>,
                );
                return filtered;
            }

            return objs[obj];
        });
        expr.assign('prevEntity', () => prevEntity);
        expr.assign('randomNumber', random);
        expr.assign('sampleSize', sampleSize);

        try {
            // await here to catch JSONataError
            return await evaluateJSONataExpression(expr, message);
        } catch (err) {
            if (isJSONataError(err)) {
                throw new JSONataError(err);
            }
            throw err;
        }
    }

    /**
     * This method retrieves all devices associated with a specific area ID.
     * It first retrieves the area using the provided area ID.
     * If the area exists, it retrieves all devices.
     * It then iterates over each device, checking if it is associated with the area.
     * If the device is associated with the area, it is added to the list of devices in the area.
     * If the area does not exist, or if there are no devices associated with the area, it returns an empty array.
     *
     * @param areaId - The ID of the area for which to retrieve the devices.
     * @returns An array of devices associated with the area, or an empty array if the area does not exist or has no associated devices.
     */
    areaDevices(areaId: string): HassDevice[] {
        const areas = this.#homeAssistant?.websocket?.getAreas(areaId);
        const devicesInArea: HassDevice[] = [];
        if (areas) {
            const devices = this.#homeAssistant?.websocket?.getDevices();
            if (devices) {
                devices.forEach((device) => {
                    if (device.area_id === areaId) {
                        devicesInArea.push(device);
                    }
                });
            }
        }

        return devicesInArea;
    }

    /**
     * This method retrieves all entities associated with a specific area ID.
     * It first retrieves the area using the provided area ID.
     * If the area exists, it retrieves all entities and devices.
     * It then iterates over each entity, checking if it is associated with the area either directly or through a device.
     * If the entity is associated with the area, it is added to the list of entities in the area.
     * If the area does not exist, or if there are no entities associated with the area, it returns an empty array.
     *
     * @param areaId - The ID of the area for which to retrieve the entities.
     * @returns An array of entities associated with the area, or an empty array if the area does not exist or has no associated entities.
     */
    areaEntities(areaId: string): HassEntity[] {
        const areas = this.#homeAssistant?.websocket?.getAreas(areaId);
        const entitiesInArea: HassEntity[] = [];
        if (areas) {
            const entityRegistry =
                this.#homeAssistant?.websocket?.getEntities();
            if (entityRegistry) {
                const devices = this.#homeAssistant?.websocket?.getDevices();
                entityRegistry.forEach((entry) => {
                    const entity = this.#homeAssistant?.websocket?.getStates(
                        entry.entity_id,
                    );
                    if (entity) {
                        if (entry.area_id === areaId) {
                            entitiesInArea.push(entity);
                        } else {
                            const device = devices?.find(
                                (device) => device.id === entry.device_id,
                            );
                            if (device?.area_id === areaId) {
                                entitiesInArea.push(entity);
                            }
                        }
                    }
                });
            }
        }

        return entitiesInArea;
    }

    /**
     * This method retrieves an area based on a provided lookup value, or all areas if no lookup value is provided.
     * The lookup value can be an area ID, an entity ID, or a device ID.
     * If no lookup value is provided, it retrieves all areas.
     * If the lookup value is an area ID, it directly retrieves the area and returns its name.
     * If the lookup value is an entity ID, it retrieves the entity and checks if it has an area ID or a device ID.
     * If the entity has an area ID, it retrieves the area and returns its name.
     * If the entity has a device ID, it retrieves the device and checks if it has an area ID. If it does, it retrieves the area and returns its name.
     * If the lookup value is a device ID, it retrieves the device and checks if it has an area ID. If it does, it retrieves the area and returns its name.
     * If the lookup value does not match any area, entity, or device, or if the matched entity or device does not have an area, it returns undefined.
     *
     * @param lookup - The lookup value, which can be an area ID, an entity ID, or a device ID.
     * @returns The name of the area, or undefined if the lookup value does not match any area, entity, or device, or if the matched entity or device does not have an area.
     */
    areas(lookup: string): HassArea | undefined;
    areas(): HassArea[];
    areas(lookup?: unknown): unknown {
        if (typeof lookup !== 'string') {
            return this.#homeAssistant?.websocket?.getAreas();
        }

        const areas = this.#homeAssistant?.websocket?.getAreas();
        const area = areas?.find((area) => area.area_id === lookup);
        if (area) {
            return area;
        }

        if (validEntityId(lookup)) {
            const entity = this.#homeAssistant?.websocket?.getEntities(lookup);

            if (entity) {
                // check if entity has area id and return area name
                if (entity.area_id) {
                    const area = areas?.find(
                        (area) => area.area_id === entity.area_id,
                    );

                    if (area) {
                        return area;
                    }
                }

                // check if entity has device id and return area name
                if (entity.device_id) {
                    const device = this.#homeAssistant?.websocket?.getDevices(
                        entity.device_id,
                    );
                    if (device) {
                        if (device.area_id) {
                            const area = areas?.find(
                                (area) => area.area_id === device.area_id,
                            );
                            if (area) {
                                return area;
                            }
                        }
                    }
                }
            }
        }

        // fallback to see if lookup is a device id
        const devices = this.#homeAssistant?.websocket?.getDevices();
        const device = devices?.find((device) => device.id === lookup);
        if (device) {
            if (device.area_id) {
                const area = areas?.find(
                    (area) => area.area_id === device.area_id,
                );
                if (area) {
                    return area;
                }
            }
        }
    }

    /**
     * This method retrieves a device based on a provided lookup value.
     * The lookup value can be an entity ID or a device name.
     * If the lookup value is an entity ID, it retrieves the entity and checks if it has a device ID.
     * If the entity has a device ID, it retrieves the device that matches the device ID.
     * If the lookup value is a device name, it retrieves the device that matches the name.
     * If the lookup value does not match any entity or device, it returns undefined.
     *
     * @param lookup - The lookup value, which can be an entity ID or a device name.
     * @returns The device associated with the entity or the device that matches the name, or undefined if the lookup value does not match any entity or device.
     */
    device(lookup: string): HassDevice | undefined {
        const entities = this.#homeAssistant?.websocket?.getEntities(lookup);
        const devices = this.#homeAssistant?.websocket?.getDevices();
        if (entities) {
            if (devices) {
                return devices.find(
                    (device) => device.id === entities.device_id,
                );
            }
        }

        const device = devices?.find(
            (device) =>
                device.name_by_user === lookup || device.name === lookup,
        );
        if (device) {
            return device;
        }
    }

    /**
     * This method retrieves all entities associated with a specific device.
     * It first retrieves the device using the provided device ID.
     * If the device exists, it retrieves all entities.
     * It then filters the entities to include only those associated with the device.
     * If the device does not exist, or if there are no entities associated with the device, it returns an empty array.
     *
     * @param deviceId - The ID of the device for which to retrieve the entities.
     * @returns An array of entities associated with the device, or an empty array if the device does not exist or has no associated entities.
     */
    deviceEntities(deviceId: string): HassEntity[] {
        const devices = this.#homeAssistant?.websocket?.getDevices(deviceId);
        let entities: HassEntity[] = [];
        if (devices) {
            const entityRegistry =
                this.#homeAssistant?.websocket?.getEntities();
            if (entityRegistry) {
                entities = entityRegistry.reduce((acc, entry) => {
                    if (entry.device_id === deviceId) {
                        const entity =
                            this.#homeAssistant?.websocket?.getStates(
                                entry.entity_id,
                            );
                        if (entity) {
                            acc.push(entity);
                        }
                    }
                    return acc;
                }, [] as HassEntity[]);
            }
        }
        return entities;
    }
}
