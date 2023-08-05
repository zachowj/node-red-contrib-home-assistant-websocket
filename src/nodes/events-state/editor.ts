import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import { TransformType } from '../../common/TransformState';
import {
    ComparatorType,
    EntityType,
    NodeType,
    TypedInputTypes,
} from '../../const';
import EntitySelector from '../../editor/components/EntitySelector';
import * as ifState from '../../editor/components/ifstate';
import * as haOutputs from '../../editor/components/output-properties';
import * as exposeNode from '../../editor/exposenode';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { OutputProperty } from '../../editor/types';
import { saveEntityType } from '../entity-config/editor/helpers';

declare const RED: EditorRED;

interface EventsStateEditorNodeProperties extends EditorNodeProperties {
    server: string;
    version: number;
    exposeAsEntityConfig: string;
    entityId: string | string[];
    entityIdType: string;
    outputInitially: boolean;
    stateType: TransformType;
    ifState: string;
    ifStateType: TypedInputTypes;
    ifStateOperator: string;
    outputOnlyOnStateChange: boolean;
    for: string;
    forType: string;
    forUnits: string;
    ignorePrevStateNull: boolean;
    ignorePrevStateUnknown: boolean;
    ignorePrevStateUnavailable: boolean;
    ignoreCurrentStateUnknown: boolean;
    ignoreCurrentStateUnavailable: boolean;
    outputProperties: OutputProperty[];

    // deprecated but needed for migration
    entityidfilter: undefined;
    entityidfiltertype: undefined;
    outputinitially: undefined;
    state_type: undefined;
    haltifstate: undefined;
    halt_if_type: undefined;
    halt_if_compare: undefined;
    output_only_on_state_change: undefined;
}

const EventsStateEditor: EditorNodeDef<EventsStateEditorNodeProperties> = {
    category: NodeCategory.HomeAssistant,
    color: NodeColor.HaBlue,
    inputs: 0,
    outputs: 1,
    outputLabels: ["'If State' is true", "'If State' is false"],
    icon: 'ha-events-state-changed.svg',
    paletteLabel: 'events: state',
    label: function () {
        return this.name || `state_changed: ${this.entityId || 'all entities'}`;
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: NodeType.Server, required: true },
        version: { value: RED.settings.get('serverStateChangedVersion', 0) },
        outputs: { value: 1 },
        exposeAsEntityConfig: {
            value: '',
            type: NodeType.EntityConfig,
            // @ts-ignore - DefinitelyTyped is missing this property
            filter: (config) => config.entityType === EntityType.Switch,
            required: false,
        },
        entityId: { value: '', required: true },
        entityIdType: { value: 'exact' },
        outputInitially: { value: false },
        stateType: { value: TransformType.String },
        ifState: { value: '' },
        ifStateType: { value: TypedInputTypes.String },
        ifStateOperator: { value: ComparatorType.Is },
        outputOnlyOnStateChange: { value: true },
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
                    propertyType: TypedInputTypes.Message,
                    value: '',
                    valueType: 'entityState',
                },
                {
                    property: 'data',
                    propertyType: TypedInputTypes.Message,
                    value: '',
                    valueType: 'eventData',
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

        // deprecated but needed for migration
        exposeToHomeAssistant: { value: undefined },
        haConfig: { value: undefined },
        entityidfilter: { value: undefined },
        entityidfiltertype: { value: undefined },
        outputinitially: { value: undefined },
        state_type: { value: undefined },
        haltifstate: { value: undefined },
        halt_if_type: { value: undefined },
        halt_if_compare: { value: undefined },
        output_only_on_state_change: { value: undefined },
    },
    oneditprepare: function () {
        ha.setup(this);
        haServer.init(this, '#node-input-server', (serverId) => {
            entitySelector.serverChanged(serverId);
        });
        exposeNode.init(this);
        saveEntityType(EntityType.Switch, 'exposeAsEntityConfig');

        const entitySelector = new EntitySelector({
            filterTypeSelector: '#node-input-entityIdType',
            entityId: this.entityId,
            serverId: haServer.getSelectedServerId(),
        });
        $('#dialog-form').data('entitySelector', entitySelector);

        ifState.init(
            '#node-input-ifState',
            '#node-input-ifStateType',
            '#node-input-ifStateOperator'
        );

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
        const outputs = $('#node-input-ifState').val() ? 2 : 1;
        $('#node-input-outputs').val(outputs);
        this.outputProperties = haOutputs.getOutputs();
        const entitySelector = $('#dialog-form').data(
            'entitySelector'
        ) as EntitySelector;
        this.entityId = entitySelector.entityId;
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
