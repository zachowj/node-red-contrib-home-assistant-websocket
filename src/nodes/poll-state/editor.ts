import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import { TransformType } from '../../common/TransformState';
import {
    ComparatorType,
    EntityType,
    NodeType,
    TimeUnit,
    TypedInputTypes,
} from '../../const';
import { hassAutocomplete } from '../../editor/components/hassAutocomplete';
import * as ifState from '../../editor/components/ifstate';
import * as haOutputs from '../../editor/components/output-properties';
import {
    DeprecatedSettingType,
    renderDeprecatedSettings,
} from '../../editor/deprecated_settings';
import * as exposeNode from '../../editor/exposenode';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { i18n } from '../../editor/i18n';
import { insertSocialBar } from '../../editor/socialbar';
import { OutputProperty } from '../../editor/types';
import { saveEntityType } from '../entity-config/editor/helpers';

declare const RED: EditorRED;

interface PollStateEditorNodeProperties extends EditorNodeProperties {
    server: string;
    version: number;
    exposeAsEntityConfig: string;
    updateInterval: string;
    updateIntervalType: TypedInputTypes.Number | TypedInputTypes.JSONata;
    updateIntervalUnits: TimeUnit.Seconds | TimeUnit.Minutes | TimeUnit.Hours;
    outputInitially: boolean;
    outputOnChanged: boolean;
    entityId: string;
    stateType: TransformType;
    ifState: string;
    ifStateType: TypedInputTypes;
    ifStateOperator: ComparatorType;
    outputProperties: OutputProperty[];

    // deprecated
    exposeToHomeAssistant: undefined;
    haConfig: undefined;
    updateinterval: undefined;
    outputinitially: undefined;
    outputonchanged: undefined;
    entity_id: undefined;
    state_type: undefined;
    halt_if: undefined;
    halt_if_type: undefined;
    halt_if_compare: undefined;
}

const PollStateEditor: EditorNodeDef<PollStateEditorNodeProperties> = {
    category: NodeCategory.HomeAssistant,
    color: NodeColor.HaBlue,
    inputs: 0,
    outputs: 1,
    outputLabels: [
        i18n('poll-state.output_label.if_state_true'),
        i18n('poll-state.output_label.if_state_false'),
    ],
    icon: 'ha-poll-state.svg',
    paletteLabel: 'poll state',
    label: function () {
        return this.name || `poll state: ${this.entityId}`;
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: NodeType.Server, required: true },
        version: { value: RED.settings.get('pollStateVersion', 0) },
        exposeAsEntityConfig: {
            value: '',
            type: NodeType.EntityConfig,
            // @ts-ignore - DefinitelyTyped is missing this property
            filter: (config) => config.entityType === EntityType.Switch,
            required: false,
        },
        updateInterval: { value: '60' },
        updateIntervalType: { value: TypedInputTypes.Number },
        updateIntervalUnits: { value: TimeUnit.Seconds },
        outputInitially: { value: false },
        outputOnChanged: { value: false },
        entityId: { value: '', required: true },
        stateType: { value: TransformType.String },
        ifState: { value: '' },
        ifStateType: { value: TypedInputTypes.String },
        ifStateOperator: { value: ComparatorType.Is },
        outputs: { value: 1 },
        outputProperties: {
            value: [
                {
                    property: 'payload',
                    propertyType: TypedInputTypes.Message,
                    value: '',
                    valueType: 'entityState',
                },
                {
                    property: 'data',
                    propertyType: TypedInputTypes.Message,
                    value: '',
                    valueType: 'entity',
                },
                {
                    property: 'topic',
                    propertyType: TypedInputTypes.Message,
                    value: '',
                    valueType: 'triggerId',
                },
            ],
            validate: haOutputs.validate,
        },

        // deprecated
        exposeToHomeAssistant: { value: undefined },
        haConfig: { value: undefined },
        updateinterval: { value: undefined },
        outputinitially: { value: undefined },
        outputonchanged: { value: undefined },
        entity_id: { value: undefined },
        state_type: { value: undefined },
        halt_if: { value: undefined },
        halt_if_type: { value: undefined },
        halt_if_compare: { value: undefined },
    },
    oneditprepare: function () {
        ha.setup(this);
        haServer.init(this, '#node-input-server');
        exposeNode.init(this);
        hassAutocomplete({ root: '#node-input-entityId' });
        saveEntityType(EntityType.Switch, 'exposeAsEntityConfig');

        $('#node-input-updateInterval').typedInput({
            types: [TypedInputTypes.Number, TypedInputTypes.JSONata],
            typeField: '#node-input-updateIntervalType',
        });

        ifState.init(
            '#node-input-ifState',
            '#node-input-ifStateType',
            '#node-input-ifStateOperator',
        );
        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: ['entity', 'entityId', 'entityState'],
        });

        insertSocialBar('poll-state');
        renderDeprecatedSettings(this, [DeprecatedSettingType.StateType]);
    },
    oneditsave: function () {
        const outputs = $('#node-input-ifState').val() ? 2 : 1;
        $('#node-input-outputs').val(outputs);
        this.outputProperties = haOutputs.getOutputs();
    },
};

export default PollStateEditor;
