import { NodeAPI } from 'node-red';

export let RED: NodeAPI;

export function setRED(val: NodeAPI): void {
    RED = val;
}
