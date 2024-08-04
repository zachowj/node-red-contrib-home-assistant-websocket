import * as haServer from '../../../editor/haserver';
import { getNormalizedDomainServices } from './utils';

// Populate service table
export const updateServiceSelection = () => {
    const $serviceDataDiv = $('#service-data-desc');
    const $serviceDescDiv = $('.service-description', $serviceDataDiv);
    const $serviceDataTableBody = $('tbody', $serviceDataDiv);
    const $unknownServiceDiv = $('.unknown-service', $serviceDataDiv);
    const $knownServiceDiv = $('.known-service', $serviceDataDiv);
    const $loadExampleData = $('#example-data');

    const [domain, service] = getNormalizedDomainServices();
    const services = haServer.getServices();
    const serviceData = services?.[domain]?.[service];
    // If a known  domain and service
    if (serviceData) {
        const serviceDesc = serviceData.description
            ? serviceData.description
            : 'No description provided by home assistant';
        const fields = serviceData.fields;

        const tableRows = Object.keys(fields).reduce((tRows, k) => {
            const fieldData = fields[k];
            if (!fieldData.description && !fieldData.example) {
                return tRows;
            }
            tRows.push(
                `<tr><td><code>${k}</code></td><td>${
                    fields[k].description ?? ''
                }</td><td>${fields[k].example ?? ''}</td></tr>`,
            );
            return tRows;
        }, [] as string[]);

        // Add table and description for service and service fields
        $serviceDescDiv.html(serviceDesc);
        $('#service-data-desc .title').html(`${domain}.${service}`);
        if (tableRows.length) {
            $('#service-data-table').show();
            $loadExampleData.show();
            $serviceDataTableBody.html(
                tableRows.length > 0 ? tableRows.join('') : '',
            );
        } else {
            $('#service-data-table').hide();
            $loadExampleData.hide();
            $serviceDescDiv.append(
                '<p>No fields documented by Home Assistant<p>',
            );
        }
        $unknownServiceDiv.hide();
        $knownServiceDiv.show();
    } else {
        // Hide service data fields and desc
        $unknownServiceDiv.show();
        $knownServiceDiv.hide();
        $loadExampleData.hide();
        $('#service-data-desc .title').html('');
    }
};

// Load example data into data field
export const loadExampleData = () => {
    const $data = $('#node-input-data');

    const [domain, service] = getNormalizedDomainServices();
    const server = $('#node-input-server').val() as string;
    if (domain && service && server) {
        const services = haServer.getServices();
        const serviceData = services?.[domain]?.[service];
        if (serviceData) {
            const fields = serviceData.fields;
            // TODO: rework to use fields data and not have to guess at parsing the example data
            const exampleData = Object.keys(fields).reduce(
                (acc, key) => {
                    const val = fields[key].example;
                    if (key === 'entity_id') {
                        acc[key] = val ?? '';
                        return acc;
                    }
                    if (val === undefined) {
                        return acc;
                    }
                    if (typeof val === 'string') {
                        if (val[0] === '[' && val[val.length - 1] === ']') {
                            try {
                                acc[key] = JSON.parse(val);
                            } catch (e) {}
                        } else {
                            if (val[0] === '"' && val[val.length - 1] === '"') {
                                acc[key] = val.substring(1, val.length - 1);
                            } else {
                                acc[key] = val;
                            }
                        }
                    } else if (typeof val === 'number' && !isNaN(val)) {
                        acc[key] = Number(val);
                    } else if (val) {
                        acc[key] = val;
                    }

                    return acc;
                },
                {} as Record<string, any>,
            );
            if (Object.keys(exampleData).length) {
                $data.typedInput('value', JSON.stringify(exampleData));
            }
        }
    }
};
