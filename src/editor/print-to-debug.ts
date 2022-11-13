import { EditorRED } from 'node-red';

declare const RED: EditorRED;

export function printToDebugPanel(_topic: string, obj: any) {
    // @ts-expect-error - debug does exist on RED
    RED.debug.handleDebugMessage(obj);
}
