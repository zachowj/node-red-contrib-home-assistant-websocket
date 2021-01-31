RED.nodes.registerType('api-call-service', {
    category: 'home_assistant',
    color: '#46B1EF',
    inputs: 1,
    outputs: 1,
    icon: 'ha-call-service.svg',
    align: 'right',
    paletteLabel: 'call service',
    label: function () {
        return this.name || `svc: ${this.service_domain}:${this.service}`;
    },
    labelStyle: nodeVersion.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        version: { value: 1 },
        debugenabled: { value: false },
        service_domain: { value: '' },
        service: { value: '' },
        entityId: { value: '' },
        data: { value: '' },
        dataType: { value: 'jsonata' },
        mergecontext: { value: null },
        output_location: { value: 'payload' },
        output_location_type: { value: 'none' },
        mustacheAltTags: { value: false },
    },
    oneditprepare: function () {
        nodeVersion.check(this);
        const node = this;

        const $domainField = $('#service_domain');
        const $serviceField = $('#service');
        const $entityIdField = $('#node-input-entityId');
        const $data = $('#node-input-data');
        const $dataType = $('#node-input-dataType');

        const $serviceDataDiv = $('#service-data-desc');
        const $serviceDescDiv = $('.service-description', $serviceDataDiv);
        const $serviceDataTableBody = $('tbody', $serviceDataDiv);
        const $unknownServiceDiv = $('.unknown-service', $serviceDataDiv);
        const $knownServiceDiv = $('.known-service', $serviceDataDiv);
        const $loadExampleData = $('#example-data');

        $domainField.val(node.service_domain);
        $serviceField.val(node.service);

        if (!node.version) {
            // Extract entity_id from data and fill in the entity_id input
            try {
                const data = JSON.parse(node.data);
                if (data.entity_id) {
                    $entityIdField.val(data.entity_id);
                    delete data.entity_id;
                    $data.val(
                        !Object.keys(data).length ? '' : JSON.stringify(data)
                    );
                }
            } catch (e) {}
        }

        $data.typedInput({
            types: ['json', 'jsonata'],
            typeField: '#node-input-dataType',
        });

        $data.on('change', function () {
            $('#mustacheAltTags').toggle($dataType.val() === 'json');
        });

        haServer.init(node, '#node-input-server');
        haServer.autocomplete('entities', (entities) => {
            node.availableEntities = entities;

            function split(val) {
                return val.split(/,\s*/);
            }

            function extractLast(term) {
                return split(term).pop();
            }

            $entityIdField
                .on('keydown', function (event) {
                    if (
                        event.keyCode === $.ui.keyCode.TAB &&
                        $(this).autocomplete().data('uiAutocomplete').menu
                            .active
                    ) {
                        event.preventDefault();
                    }
                })
                .autocomplete({
                    // source: node.availableEntities,
                    minLength: 0,
                    source: function (request, response) {
                        // delegate back to autocomplete, but extract the last term
                        response(
                            $.ui.autocomplete.filter(
                                node.availableEntities,
                                extractLast(request.term)
                            )
                        );
                    },
                    focus: function () {
                        // prevent value inserted on focus
                        return false;
                    },
                    select: function (event, ui) {
                        const terms = split(this.value);
                        // remove the current input
                        terms.pop();
                        // add the selected item
                        terms.push(ui.item.value);
                        // add placeholder to get the comma-and-space at the end
                        terms.push('');
                        this.value = terms.join(', ');
                        return false;
                    },
                });
        });

        haServer.autocomplete('services', (services) => {
            node.allServices = services;
            node.allDomains = Object.keys(node.allServices).sort();

            $domainField
                .autocomplete({
                    source: node.allDomains,
                    create: (evt, ui) =>
                        updateDomainSelection({
                            event: evt,
                        }),
                    change: (evt, ui) =>
                        updateDomainSelection({
                            event: evt,
                        }),
                    select: (evt, ui) =>
                        updateDomainSelection({
                            event: evt,
                        }),
                    minLength: 0,
                })
                .focus(function () {
                    $domainField.autocomplete('search');
                });

            updateDomainSelection({
                domainText: node.service_domain || '',
            });
            updateServiceSelection({
                serviceText: node.service || '',
            });

            return node;
        });

        function updateServiceSelection({ event, serviceText }) {
            let selectedServiceText = serviceText;
            if (!selectedServiceText && event) {
                selectedServiceText = $(event.target).val();
            }

            // If a value selected
            if (selectedServiceText) {
                node.selectedService =
                    node.selectedDomain.services[selectedServiceText];
                // If a known service
                if (node.selectedService) {
                    const serviceDesc = node.selectedService.description
                        ? node.selectedService.description
                        : 'No description provided by home assistant';
                    const fields = node.selectedService.fields;

                    let tableRows = Object.keys(fields).reduce((tRows, k) => {
                        const fieldData = fields[k];
                        if (!fieldData.description && !fieldData.example) {
                            return tRows;
                        }
                        tRows.push(
                            `<tr><td><code>${k}</code></td><td>${
                                fields[k].description || ''
                            }</td><td>${fields[k].example || ''}</td></tr>`
                        );
                        return tRows;
                    }, []);

                    tableRows = tableRows.length > 0 ? tableRows.join('') : '';

                    // Add table and description for service and service fields
                    $serviceDescDiv.html(serviceDesc);
                    $('#service-data-desc .title').html(
                        node.selectedDomain.name + '.' + selectedServiceText
                    );
                    if (tableRows) {
                        $('#service-data-table').show();
                        $loadExampleData.show();
                        $serviceDataTableBody.html(tableRows);
                    } else {
                        $('#service-data-table').hide();
                        $loadExampleData.hide();
                        $serviceDescDiv.append(
                            '<p>No fields documented by home-assistant<p>'
                        );
                    }
                    $unknownServiceDiv.hide();
                    $knownServiceDiv.show();
                } else {
                    // Hide service data fields and desc
                    $unknownServiceDiv.show();
                    $knownServiceDiv.hide();
                    $loadExampleData.hide();
                    $('#service-data-desc .title').val('');
                }
            } else {
                // Hide service data fields and desc
                $unknownServiceDiv.show();
                $knownServiceDiv.hide();
                $loadExampleData.hide();
                $('#service-data-desc .title').val('');
            }
        }

        function updateDomainSelection({ event, domainText }) {
            let selectedDomainText = domainText;
            if (!selectedDomainText && event) {
                selectedDomainText = $(event.target).val();
            }

            const knownDomain =
                node.allDomains.indexOf(selectedDomainText) > -1;
            node.selectedDomain = knownDomain
                ? {
                      services: node.allServices[selectedDomainText],
                      name: selectedDomainText,
                  }
                : (node.selectedDomain = {
                      services: {},
                  });

            $serviceField
                .autocomplete({
                    source: Object.keys(node.selectedDomain.services).sort(),
                    create: (evt, ui) =>
                        updateServiceSelection({
                            event: evt,
                        }),
                    change: (evt, ui) =>
                        updateServiceSelection({
                            event: evt,
                        }),
                    select: (evt, ui) =>
                        updateServiceSelection({
                            event: evt,
                        }),
                    focus: (evt, ui) =>
                        updateServiceSelection({
                            event: evt,
                        }),
                    minLength: 0,
                })
                .focus(function () {
                    $serviceField.autocomplete('search');
                });
        }

        if (!this.output_location) {
            $('#node-input-output_location').val('payload');
        }
        $('#node-input-output_location').typedInput({
            types: [
                'msg',
                'flow',
                'global',
                {
                    value: 'none',
                    label: 'None',
                    hasValue: false,
                },
            ],
            typeField: '#node-input-output_location_type',
        });

        $loadExampleData.on('click', () => {
            const fields = node.selectedService.fields;
            const exampleData = Object.keys(fields).reduce((acc, key) => {
                const val = fields[key].example;
                if (key === 'entity_id') {
                    $entityIdField.val(val);
                    return acc;
                }

                if (val[0] === '[' && val[val.length - 1] === ']') {
                    try {
                        acc[key] = JSON.parse(val);
                    } catch (e) {}
                } else if (!isNaN(val)) {
                    acc[key] = Number(val);
                } else {
                    if (val[0] === '"' && val[val.length - 1] === '"') {
                        acc[key] = val.substring(1, val.length - 1);
                    } else {
                        acc[key] = val;
                    }
                }
                return acc;
            }, {});
            if (Object.keys(exampleData).length) {
                $data.typedInput('value', JSON.stringify(exampleData));
            }
        });
    },
    oneditsave: function () {
        const entityId = $('#node-input-entityId').val();
        this.service_domain = $('#service_domain').val();
        this.service = $('#service').val();

        if (entityId.length) {
            // remove trailing comma
            $('#node-input-entityId').val(entityId.replace(/\s*,\s*$/, ''));
        }

        nodeVersion.update(this);
    },
});
