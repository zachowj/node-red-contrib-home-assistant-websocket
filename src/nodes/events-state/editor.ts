import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import { IdSelectorType } from '../../common/const';
import { TransformType } from '../../common/TransformState';
import {
    ComparatorType,
    EntityType,
    NodeType,
    TypedInputTypes,
} from '../../const';
import IdSelector, {
    getSelectedIds,
} from '../../editor/components/idSelector/IdSelector';
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
import { EntitySelectorList } from './index';

declare const RED: EditorRED;

interface EventsStateEditorNodeProperties extends EditorNodeProperties {
    server: string;
    version: number;
    exposeAsEntityConfig: string;
    entities: EntitySelectorList;
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
    entityId: undefined;
    entityIdType: undefined;
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
        let label: string[] = [];
        if (this.entities) {
            Object.entries(this.entities).forEach(([, ids]) => {
                if (Array.isArray(ids) && ids?.length) {
                    label = [...label, ...ids];
                }
            });
        }

        return this.name || `state_changed: ${label}`;
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
        entities: {
            value: {
                [IdSelectorType.Entity]: [''],
                [IdSelectorType.Substring]: [],
                [IdSelectorType.Regex]: [],
            },
            // TODO: After v1.0 uncomment validation because now it will throw errors for nodes that have a version prior to 6
            // validate: (value) => {
            //     if (!value) {
            //         return false;
            //     }

            //     Object.entries(value).forEach(([_, ids]) => {
            //         if (Array.isArray(ids)) {
            //             if (ids.some((id) => id.length)) {
            //                 return true;
            //             }
            //         }
            //     });

            //     return false;
            // },
        },
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
        entityId: { value: undefined },
        entityIdType: { value: undefined },
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
        haServer.init(this, '#node-input-server', () => {
            idSelector.refreshOptions();
        });
        exposeNode.init(this);
        saveEntityType(EntityType.Switch, 'exposeAsEntityConfig');

        const idSelector = new IdSelector({
            element: '#entity-list',
            types: [
                IdSelectorType.Entity,
                IdSelectorType.Substring,
                IdSelectorType.Regex,
            ],
            headerText: i18n('server-state-changed.label.entities'),
        });
        Object.entries(this.entities).forEach(([type, ids]) => {
            ids?.forEach((id) => {
                idSelector.addId(type as IdSelectorType, id);
            });
        });

        ifState.init(
            '#node-input-ifState',
            '#node-input-ifStateType',
            '#node-input-ifStateOperator',
        );

        $('#node-input-for').typedInput({
            default: TypedInputTypes.Number,
            types: [
                TypedInputTypes.Number,
                TypedInputTypes.JSONata,
                TypedInputTypes.Flow,
                TypedInputTypes.Global,
            ],
            typeField: '#node-input-forType',
        });

        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: ['eventData', 'entityId', 'entityState'],
        });

        insertSocialBar('events-state');
        renderDeprecatedSettings(this, [DeprecatedSettingType.StateType]);
    },
    oneditsave: function () {
        const outputs = $('#node-input-ifState').val() ? 2 : 1;
        $('#node-input-outputs').val(outputs);
        const entities = getSelectedIds('#entity-list');
        this.entities = {
            [IdSelectorType.Entity]: entities[IdSelectorType.Entity],
            [IdSelectorType.Substring]: entities[IdSelectorType.Substring],
            [IdSelectorType.Regex]: entities[IdSelectorType.Regex],
        };

        this.outputProperties = haOutputs.getOutputs();
    },
};

export default EventsStateEditor;
