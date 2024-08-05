import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import { NodeType, TypedInputTypes } from '../../../const';
import IdSelector, {
    getSelectedIds,
} from '../../../editor/components/idSelector/IdSelector';
import { IdSelectorType } from '../../../editor/components/idSelector/types';
import * as haOutputs from '../../../editor/components/output-properties';
import ha, { NodeCategory, NodeColor } from '../../../editor/ha';
import * as haServer from '../../../editor/haserver';
import { i18n } from '../../../editor/i18n';
import { OutputProperty } from '../../../editor/types';
import { loadExampleData, updateServiceSelection } from './service-table';
import { getValidTargets, ValidTarget } from './targets';
import { buildDomainServices } from './utils';

declare const RED: EditorRED;

interface ActionEditorNodeProperties extends EditorNodeProperties {
    server: any;
    version: number;
    debugenabled: boolean;
    name: string;
    action: string;
    data: string;
    dataType: string;
    floorId?: string[];
    areaId?: string[];
    deviceId?: string[];
    entityId?: string[];
    labelId?: string[];
    mergeContext: string;
    mustacheAltTags: boolean;
    queue: string;
    outputProperties: OutputProperty[];

    // deprecated
    domain?: string;
    service?: string;
    target: undefined;
    output_location?: string;
    output_location_type?: string;
    service_domain?: string;
    mergecontext?: string;
}

const ActionEditor: EditorNodeDef<ActionEditorNodeProperties> = {
    category: NodeCategory.HomeAssistant,
    color: NodeColor.HaBlue,
    inputs: 1,
    outputs: 1,
    icon: 'ha-call-service.svg',
    align: 'right',
    paletteLabel: 'action',
    label: function () {
        return this.name || this.action || 'action';
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: NodeType.Server, required: true },
        version: { value: RED.settings.get('apiCallServiceVersion', 0) },
        debugenabled: { value: false },
        action: { value: '' },
        floorId: { value: [] },
        areaId: { value: [] },
        deviceId: { value: [] },
        entityId: { value: [] },
        labelId: { value: [] },
        data: {
            value: '',
            // @ts-expect-error - DefinitelyTyped is missing this property
            validate: RED.validators.typedInput({
                type: 'dateType',
                allowBlank: true,
            }),
        },
        dataType: { value: 'jsonata' },
        mergeContext: { value: '' },
        mustacheAltTags: { value: false },
        outputProperties: {
            value: [],
            validate: haOutputs.validate,
        },
        queue: { value: 'none' },

        // deprecated
        domain: { value: '' },
        service: { value: '' },
        target: { value: undefined },
        output_location: { value: undefined },
        output_location_type: { value: undefined },
        service_domain: { value: undefined },
        mergecontext: { value: undefined },
    },
    oneditprepare: function () {
        ha.setup(this);
        const $haAction = $('#ha-action');
        let lastServerId = '';
        haServer.init(this, '#node-input-server', function (serverId) {
            if (serverId === lastServerId) {
                return;
            }
            lastServerId = serverId;
            updateServiceSelection();
            idSelector.refreshOptions();
            const services = haServer.getServices();
            // @ts-expect-error - VirtualSelect is not recognized
            $haAction[0].setOptions(buildDomainServices(services));
        });

        // Action selector
        // @ts-expect-error - VirtualSelect is not recognized
        VirtualSelect.init({
            ele: '#ha-action',
            allowNewOption: true,
            search: true,
            maxWidth: '70%',
            placeholder: '',
            selectedValue: this.action,
            silentInitialValueSet: true,
            hasOptionDescription: true,
            options: buildDomainServices(haServer.getServices()),
            optionsCount: 8,
        });

        // Target selectors
        const idSelector = new IdSelector({
            element: '#target-list',
            types: [
                IdSelectorType.Entity,
                IdSelectorType.Device,
                IdSelectorType.Area,
                IdSelectorType.Floor,
                IdSelectorType.Label,
            ],
            headerText: i18n('api-call-service.label.targets'),
        });
        const ids = {
            [IdSelectorType.Floor]: this.floorId,
            [IdSelectorType.Area]: this.areaId,
            [IdSelectorType.Device]: this.deviceId,
            [IdSelectorType.Entity]: this.entityId,
            [IdSelectorType.Label]: this.labelId,
        };
        Object.entries(ids).forEach(([type, ids]) => {
            ids?.forEach((id) => {
                idSelector.addId(type as IdSelectorType, id);
            });
        });

        // Update lists when action changes
        $haAction
            .on('change', () => {
                updateServiceSelection();
                const action = $haAction.val() as string;
                const showTargets = getValidTargets(action) === ValidTarget.All;
                const $formRow = $('#target-list').parents('.form-row');
                $formRow.toggle(showTargets);
                if (!showTargets) {
                    idSelector.clear();
                }
            })
            .trigger('change');

        // Data field
        const $data = $('#node-input-data');
        const $dataType = $('#node-input-dataType');
        $data.typedInput({
            default: TypedInputTypes.JSONata,
            types: [TypedInputTypes.JSONata, TypedInputTypes.JSON],
            typeField: '#node-input-dataType',
        });
        $data.on('change', () => {
            $('#mustacheAltTags').toggle(
                $dataType.val() === TypedInputTypes.JSON,
            );
        });

        // Output properties
        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: ['sentData', 'results', 'msg'],
        });

        // Service data info
        $('#example-data').on('click', loadExampleData);
    },
    oneditsave: function () {
        this.action = $('#ha-action').val() as string;
        // TODO: Remove with version 1.0
        // Here so input overrides still work
        [this.domain, this.service] = this.action.split('.');

        const targets = getSelectedIds('#target-list');
        this.floorId = targets[IdSelectorType.Floor];
        this.areaId = targets[IdSelectorType.Area];
        this.deviceId = targets[IdSelectorType.Device];
        this.entityId = targets[IdSelectorType.Entity];
        this.labelId = targets[IdSelectorType.Label];

        this.outputProperties = haOutputs.getOutputs();
    },
};

export default ActionEditor;
