import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import * as haOutputs from '../../../editor/components/output-properties';
import {
    createCustomIdListByProperty,
    createSelect2Options,
    Select2Data,
} from '../../../editor/components/select2';
import ha from '../../../editor/ha';
import * as haServer from '../../../editor/haserver';
import { OutputProperty } from '../../../editor/types';
import { containsMustache } from '../../../helpers/mustache';
import { byPropertiesOf } from '../../../helpers/sort';
import { loadExampleData, updateServiceSelection } from './service-table';
import { displayValidTargets, getTarget, populateTargets } from './targets';

declare const RED: EditorRED;

interface Target {
    areaId?: string[];
    deviceId?: string[];
    entityId?: string[];
}

interface CallServiceEditorNodeProperties extends EditorNodeProperties {
    server: any;
    version: number;
    debugenabled: boolean;
    name: string;
    domain: string;
    service: string;
    data: string;
    dataType: string;
    target: Target;
    mergeContext: string;
    mustacheAltTags: boolean;
    queue: string;
    outputProperties: OutputProperty[];
    // deprecated
    entityId?: string;
    output_location?: string;
    output_location_type?: string;
    service_domain?: string;
    mergecontext?: string;
}

const CallServiceEditor: EditorNodeDef<CallServiceEditorNodeProperties> = {
    category: 'home_assistant',
    color: ha.nodeColors.haBlue,
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
        server: { value: '', type: 'server', required: true },
        version: { value: RED.settings.get('apiCallServiceVersion', 0) },
        debugenabled: { value: false },
        domain: { value: '' },
        service: { value: '' },
        target: {
            value: {
                areaId: [],
                deviceId: [],
                entityId: [],
            },
        },
        data: { value: '' },
        dataType: { value: 'jsonata' },
        mergeContext: { value: '' },
        mustacheAltTags: { value: false },
        outputProperties: {
            value: [],
            validate: haOutputs.validate,
        },
        queue: { value: 'none' },
        // deprecated
        entityId: { value: undefined },
        output_location: { value: undefined },
        output_location_type: { value: undefined },
        service_domain: { value: undefined },
        mergecontext: { value: undefined },
    },
    oneditprepare: function () {
        ha.setup();
        haServer.init(this, '#node-input-server');
        const $domainField = $('#domain');
        const $serviceField = $('#service');
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
                        Object.keys(services)
                    )
                );
            $domainField
                .empty()
                .select2(
                    createSelect2Options({
                        tags: true,
                        data: domains,
                    })
                )
                .maximizeSelect2Height();
            if (!selectedId) {
                $domainField.val(null).trigger('change');
            }
        };
        const populateServices = (service?: string) => {
            const services = haServer.getServices();
            const domainNormalized = (
                $domainField.val() as string
            )?.toLowerCase();
            const selectedId = service ?? ($serviceField.val() as string);
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
                    selected: d === selectedId,
                }))
                .sort(byPropertiesOf<Select2Data>(['text']))
                .concat(
                    createCustomIdListByProperty<string>(
                        selectedId,
                        filteredServices
                    )
                );

            $serviceField
                .empty()
                .select2(
                    createSelect2Options({ data: domainServices, tags: true })
                )
                .maximizeSelect2Height();
            if (!selectedId) {
                $serviceField.val(null).trigger('change');
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
                entityId: this.target.entityId,
                areaId: this.target.areaId,
                deviceId: this.target.deviceId,
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
            // hack to hide error border when data field is empty
            const val = $data.val() as string;
            if (val.length === 0) {
                $data.next().removeClass('input-error');
            }
            $('#mustacheAltTags').toggle($dataType.val() === 'json');
        });

        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: ['sentData', 'msg'],
        });
    },
    oneditsave: function () {
        this.outputProperties = haOutputs.getOutputs();
        this.domain = $('#domain').select2('data')?.[0]?.id;
        this.service = $('#service').select2('data')?.[0]?.id;
        this.target = getTarget();
    },
};

export default CallServiceEditor;
