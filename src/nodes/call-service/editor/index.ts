import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import { NodeType } from '../../../const';
import * as haOutputs from '../../../editor/components/output-properties';
import {
    createCustomIdListByProperty,
    createSelect2Options,
    Select2Data,
    Tags,
} from '../../../editor/components/select2';
import ha, { NodeCategory, NodeColor } from '../../../editor/ha';
import * as haServer from '../../../editor/haserver';
import { OutputProperty } from '../../../editor/types';
import { byPropertiesOf } from '../../../helpers/sort';
import { containsMustache } from '../../../helpers/utils';
import { loadExampleData, updateServiceSelection } from './service-table';
import { displayValidTargets, populateTargets } from './targets';

declare const RED: EditorRED;

interface CallServiceEditorNodeProperties extends EditorNodeProperties {
    server: any;
    version: number;
    debugenabled: boolean;
    name: string;
    domain: string;
    service: string;
    data: string;
    dataType: string;
    areaId?: string[];
    deviceId?: string[];
    entityId?: string[];
    mergeContext: string;
    mustacheAltTags: boolean;
    queue: string;
    outputProperties: OutputProperty[];

    // deprecated
    target: undefined;
    output_location?: string;
    output_location_type?: string;
    service_domain?: string;
    mergecontext?: string;
}

const CallServiceEditor: EditorNodeDef<CallServiceEditorNodeProperties> = {
    category: NodeCategory.HomeAssistant,
    color: NodeColor.HaBlue,
    inputs: 1,
    outputs: 1,
    icon: 'ha-call-service.svg',
    align: 'right',
    paletteLabel: 'call service',
    label: function () {
        return (
            this.name ||
            (this.domain || this.service
                ? `${this.domain || '<domain>'}.${this.service || '<service>'}`
                : 'call service')
        );
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: NodeType.Server, required: true },
        version: { value: RED.settings.get('apiCallServiceVersion', 0) },
        debugenabled: { value: false },
        domain: { value: '' },
        service: { value: '' },
        areaId: { value: [] },
        deviceId: { value: [] },
        entityId: { value: [] },
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
        target: { value: undefined },
        output_location: { value: undefined },
        output_location_type: { value: undefined },
        service_domain: { value: undefined },
        mergecontext: { value: undefined },
    },
    oneditprepare: function () {
        ha.setup(this);
        haServer.init(this, '#node-input-server');
        const $domainField = $('#node-input-domain');
        const $serviceField = $('#node-input-service');
        const $data = $('#node-input-data');
        const $dataType = $('#node-input-dataType');
        const $loadExampleData = $('#example-data');

        // Load domaina and service list into autocomplete
        const populateDomains = (domain?: string) => {
            const services = haServer.getServices();
            const selectedId = domain ?? ($domainField.val() as string);
            const domains = Object.keys(services)
                .map((d) => ({
                    id: d,
                    text: d,
                    selected: d === selectedId,
                }))
                .sort(byPropertiesOf<Select2Data>(['text']))
                .concat(
                    createCustomIdListByProperty<string>(
                        selectedId,
                        Object.keys(services),
                        {
                            includeUnknownIds: true,
                        }
                    )
                );
            $domainField
                .empty()
                .select2(
                    createSelect2Options({
                        tags: Tags.Custom,
                        data: domains,
                    })
                )
                .maximizeSelect2Height();
            if (!selectedId) {
                $domainField.val(-1).trigger('change');
            }
        };
        const populateServices = (service?: string) => {
            const services = haServer.getServices();
            const domainNormalized = (
                $domainField.val() as string
            )?.toLowerCase();
            const showAll =
                !services?.[domainNormalized] ||
                containsMustache(domainNormalized);
            // If domain is a mustache template, show all services otherwise show only services for the domain
            const filteredServices = showAll
                ? Array.from(
                      new Set(
                          Object.values(services)
                              .map((service) => Object.keys(service))
                              .flat()
                      )
                  )
                : Object.keys(services[domainNormalized]);
            const domainServices = filteredServices
                .map((d) => ({
                    id: d,
                    text: d,
                    selected: d === service,
                }))
                .sort(byPropertiesOf<Select2Data>(['text']))
                .concat(
                    createCustomIdListByProperty<string>(
                        service,
                        filteredServices,
                        {
                            includeUnknownIds: true,
                        }
                    )
                );

            $serviceField
                .empty()
                .select2(
                    createSelect2Options({
                        data: domainServices,
                        tags: Tags.Custom,
                    })
                )
                .maximizeSelect2Height();
            if (!service) {
                $serviceField.val(-1).trigger('change');
            }
        };

        $domainField.on('select2:select', () => {
            populateServices();
            populateTargets();
            displayValidTargets();
            updateServiceSelection();
        });
        $serviceField.on('select2:select', () => {
            populateTargets();
            displayValidTargets();
            updateServiceSelection();
        });
        $('#node-input-server').on('change', () => {
            populateDomains(this.domain);
            populateServices(this.service);
            populateTargets({
                entityId: this.entityId,
                areaId: this.areaId,
                deviceId: this.deviceId,
            });
            displayValidTargets();
            updateServiceSelection();
        });
        $loadExampleData.on('click', loadExampleData);

        $data.typedInput({
            default: 'jsonata',
            types: ['jsonata', 'json'],
            typeField: '#node-input-dataType',
        });
        $data.on('change', () => {
            $('#mustacheAltTags').toggle($dataType.val() === 'json');
        });

        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: ['sentData', 'results', 'msg'],
        });
    },
    oneditsave: function () {
        this.outputProperties = haOutputs.getOutputs();
    },
};

export default CallServiceEditor;
