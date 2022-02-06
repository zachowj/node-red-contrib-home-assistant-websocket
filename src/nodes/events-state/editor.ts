import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import EntitySelector from '../../editor/components/EntitySelector';
import * as ifState from '../../editor/components/ifstate';
import * as haOutputs from '../../editor/components/output-properties';
import * as exposeNode from '../../editor/exposenode';
import ha from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { HassExposedConfig, OutputProperty } from '../../editor/types';

declare const RED: EditorRED;

interface EventsStateEditorNodeProperties extends EditorNodeProperties {
    server: string;
    version: number;
    exposeToHomeAssistant: boolean;
    haConfig: HassExposedConfig[];
    entityidfilter: string | string[];
    entityidfiltertype: string;
    outputinitially: boolean;
    state_type: 'str' | 'num' | 'bool';
    haltifstate: string;
    halt_if_type: string;
    halt_if_compare: string;
    output_only_on_state_change: boolean;
    for: string;
    forType: string;
    forUnits: string;
    ignorePrevStateNull: boolean;
    ignorePrevStateUnknown: boolean;
    ignorePrevStateUnavailable: boolean;
    ignoreCurrentStateUnknown: boolean;
    ignoreCurrentStateUnavailable: boolean;
    outputProperties: OutputProperty[];
}

const EventsStateEditor: EditorNodeDef<EventsStateEditorNodeProperties> = {
    category: 'home_assistant',
    color: ha.nodeColors.haBlue,
    inputs: 0,
    outputs: 1,
    outputLabels: ["'If State' is true", "'If State' is false"],
    icon: 'ha-events-state-changed.svg',
    paletteLabel: 'events: state',
    label: function () {
        return (
            this.name ||
            `state_changed: ${this.entityidfilter || 'all entities'}`
        );
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        version: { value: RED.settings.get('serverStateChangedVersion', 0) },
        exposeToHomeAssistant: { value: false },
        haConfig: {
            value: [
                { property: 'name', value: '' },
                { property: 'icon', value: '' },
            ],
        },
        entityidfilter: { value: '', required: true },
        entityidfiltertype: { value: 'exact' },
        outputinitially: { value: false },
        state_type: { value: 'str' },
        haltifstate: { value: '' },
        halt_if_type: { value: 'str' },
        halt_if_compare: { value: 'is' },
        outputs: { value: 1 },
        output_only_on_state_change: { value: true },
        for: { value: '0' },
        forType: { value: 'num' },
        forUnits: { value: 'minutes' },
        ignorePrevStateNull: { value: false },
        ignorePrevStateUnknown: { value: false },
        ignorePrevStateUnavailable: { value: false },
        ignoreCurrentStateUnknown: { value: false },
        ignoreCurrentStateUnavailable: { value: false },
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
                    valueType: 'eventData',
                },
                {
                    property: 'topic',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'triggerId',
                },
            ],
            validate: haOutputs.validate,
        },
    },
    oneditprepare: function () {
        ha.setup(this);
        const $entityidfilter = $('#node-input-entityidfilter');

        haServer.init(this, '#node-input-server', () => {
            entitySelector.serverChanged();
        });
        exposeNode.init(this);
        const entitySelector = new EntitySelector({
            filterTypeSelector: '#node-input-entityidfiltertype',
            entityId: this.entityidfilter,
        });
        $('#dialog-form').data('entitySelector', entitySelector);

        let availableEntities: string[] = [];
        haServer.autocomplete('entities', (entities: string[]) => {
            availableEntities = entities;
            $entityidfilter.autocomplete({
                source: availableEntities,
                minLength: 0,
            });
        });

        ifState.init('#node-input-haltifstate', '#node-input-halt_if_compare');

        $('#node-input-for').typedInput({
            default: 'num',
            types: ['num', 'jsonata', 'flow', 'global'],
            typeField: '#node-input-forType',
        });

        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: ['eventData', 'entityId', 'entityState'],
        });
    },
    oneditsave: function () {
        const outputs = $('#node-input-haltifstate').val() ? 2 : 1;
        $('#node-input-outputs').val(outputs);
        this.haConfig = exposeNode.getValues();
        this.outputProperties = haOutputs.getOutputs();
        const entitySelector = $('#dialog-form').data(
            'entitySelector'
        ) as EntitySelector;
        this.entityidfilter = entitySelector.entityId;
        entitySelector.destroy();
    },
    oneditcancel: function () {
        const entitySelector = $('#dialog-form').data(
            'entitySelector'
        ) as EntitySelector;
        entitySelector.destroy();
    },
};

export default EventsStateEditor;
