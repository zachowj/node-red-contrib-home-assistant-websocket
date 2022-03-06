import { EditorRED } from 'node-red';

import { entityFilter } from './entity-filter';

declare const RED: EditorRED;

export const setupEditors = () => {
    RED.editor.registerTypeEditor('ha_entity_filter', entityFilter);
};
