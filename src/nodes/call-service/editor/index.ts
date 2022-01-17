import { HassEntity, HassServices } from 'home-assistant-js-websocket';
import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import { SERVER_ADD } from '../../../const';
import { getServices as getHassServices } from '../../../editor/data';
import ha from '../../../editor/ha';
import * as haServer from '../../../editor/haserver';
import * as haOutputs from '../../../editor/output-properties';
import { OutputProperty } from '../../../editor/types';
import { loadExampleData, updateServiceSelection } from './service-table';
import { populateEntities } from './targets';
import { autocompleteSetup, getNormalizedDomainServices } from './utils';

declare const RED: EditorRED;

interface CallServiceEditorNodeProperties extends EditorNodeProperties {
    server: any;
    version: number;
    debugenabled: boolean;
    name: string;
    domain: string;
    service: string;
    entityId: string[];
    data: string;
    dataType: string;
    mergeContext: string;
    mustacheAltTags: boolean;
    queue: string;
    outputProperties: OutputProperty[];
    // deprecated
    output_location?: string;
    output_location_type?: string;
    service_domain?: string;
    mergecontext?: string;
}

type ServiceTarget = {
    entity?: {
        domain?: string;
    };
};

export type FilterEntities = (
    value: HassEntity,
    index: number,
    array: HassEntity[]
) => boolean;

const byServiceTarget = (
    services: HassServices
): FilterEntities | undefined => {
    const [domain, service] = getNormalizedDomainServices();
    const filterDomain = (
        services?.[domain]?.[service]?.target as ServiceTarget
    )?.entity?.domain;

    return filterDomain
        ? (value) => value.entity_id.startsWith(`${filterDomain}.`)
        : undefined;
};

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
        entityId: { value: [] },
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
        const populateDomainAndServices = (serverId: string) => {
            const services = getHassServices(serverId);
            const updateDomainServices = () => {
                const domainNormalized = (
                    $domainField.val() as string
                ).toLowerCase();
                // Use all services if domain is not found in the list
                const domainSerivces =
                    domainNormalized in services
                        ? Object.keys(services[domainNormalized] ?? [])
                        : Array.from(
                              new Set(
                                  Object.values(services)
                                      .map((service) => Object.keys(service))
                                      .flat()
                              )
                          );

                autocompleteSetup($serviceField, domainSerivces.sort(), () => {
                    updateServiceSelection();
                    populateEntities(serverId, {
                        filter: byServiceTarget(services),
                    });
                });
            };
            autocompleteSetup(
                $domainField,
                Object.keys(services).sort(),
                () => {
                    updateServiceSelection();
                    updateDomainServices();
                    // Clear service if it doesn't exist in the new domain
                    const source = $serviceField.autocomplete(
                        'option',
                        'source'
                    ) as string[];
                    if (!source.includes($serviceField.val() as string)) {
                        $serviceField.val('');
                    }
                    populateEntities(serverId, {
                        filter: byServiceTarget(services),
                    });
                }
            );
            updateDomainServices();
        };
        updateServiceSelection();

        $('#node-input-server').on('change', () => {
            const serverId = $('#node-input-server').val() as string;
            if (serverId === SERVER_ADD) return;
            populateDomainAndServices(serverId);
            populateEntities(serverId, {
                selectedIds: this.entityId,
                filter: byServiceTarget(getHassServices(serverId)),
            });
        });
        $loadExampleData.on('click', loadExampleData);

        $data.typedInput({
            default: 'jsonata',
            types: ['jsonata', 'json'],
            typeField: '#node-input-dataType',
        });
        $data.on('change', (event, type, value) => {
            // hack to hide error border when data field is empty
            if (value.length === 0) {
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
    },
};

export default CallServiceEditor;
