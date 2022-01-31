import { EditorNodeDef, EditorRED } from 'node-red';

import { hassAutocomplete } from '../../editor/components/hassAutocomplete';
import * as ifState from '../../editor/components/ifstate';
import * as haOutputs from '../../editor/components/output-properties';
import ha from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { HassNodeProperties, OutputProperty } from '../../editor/types';

declare const RED: EditorRED;

interface CurrentStateEditorNodeProperties extends HassNodeProperties {
    halt_if: string;
    halt_if_type: string;
    halt_if_compare: string;
    entity_id: string;
    state_type: string;
    blockInputOverrides: boolean;
    outputProperties: OutputProperty[];
    for: string;
    forType: string;
    forUnits: string;

    // deprecated but needed in config for old imports to work
    override_topic: boolean;
    state_location: string;
    override_payload: string;
    entity_location: string;
    override_data: string;
}

const CurrentStateEditor: EditorNodeDef<CurrentStateEditorNodeProperties> = {
    category: 'home_assistant',
    color: ha.nodeColors.haBlue,
    inputs: 1,
    outputs: 1,
    outputLabels: function (index) {
        if (this.halt_if) {
            if (index === 0) return "'If State' is true";
            if (index === 1) return "'If State' is false";
        }
    },
    icon: 'ha-current-state.svg',
    paletteLabel: 'current state',
    label: function () {
        return this.name || `current_state: ${this.entity_id}`;
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        version: { value: RED.settings.get('apiCurrentStateVersion', 0) },
        outputs: { value: 1 },
        halt_if: { value: '' },
        halt_if_type: { value: 'str' },
        halt_if_compare: { value: 'is' },
        entity_id: { value: '' },
        state_type: { value: 'str' },
        blockInputOverrides: { value: false },
        outputProperties: {
            value: [
                {
                    property: 'payload',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'entityState',
                },
                {
                    property: 'data',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'entity',
                },
            ],
            validate: haOutputs.validate,
        },
        for: { value: '0' },
        forType: { value: 'num' },
        forUnits: { value: 'minutes' },

        // deprecated but needed in config for old imports to work
        override_topic: { value: false },
        state_location: { value: 'payload' },
        override_payload: { value: 'msg' }, // state location type
        entity_location: { value: 'data' },
        override_data: { value: 'msg' }, // entity location types
    },
    oneditprepare: function () {
        ha.setup(this);
        haServer.init(this, '#node-input-server');
        hassAutocomplete({ root: '#node-input-entity_id' });

        ifState.init(
            '#node-input-halt_if',
            '#node-input-halt_if_compare',
            'currentState'
        );

        $('#node-input-halt_if_compare').on(
            'change',
            function (this: HTMLSelectElement) {
                const show = [
                    'is',
                    'is_not',
                    'includes',
                    'does_not_include',
                ].includes(this.value);
                $('#for-row').toggle(show);
            }
        );

        $('#node-input-for').typedInput({
            default: 'num',
            types: ['num', 'jsonata', 'msg', 'flow', 'global'],
            typeField: '#node-input-forType',
        });

        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: ['entity', 'entityId', 'entityState'],
        });
    },
    oneditsave: function () {
        const outputs = $('#node-input-halt_if').val() ? 2 : 1;
        $('#node-input-outputs').val(outputs);
        this.outputProperties = haOutputs.getOutputs();
    },
};

export default CurrentStateEditor;
