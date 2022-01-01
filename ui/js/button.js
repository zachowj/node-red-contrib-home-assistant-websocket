/* global RED: false, $: false, exposeNode: false, ha: false, nodeVersion: false, haOutputs: false */
RED.nodes.registerType('ha-button', {
    category: 'home_assistant_entities',
    color: ha.nodeColors.beta,
    inputs: 0,
    outputs: 1,
    icon: 'font-awesome/fa-hand-o-up',
    align: 'left',
    paletteLabel: 'button',
    label: function () {
        return this.name || 'button';
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        version: { value: RED.settings.haButtonVersion },
        debugenabled: { value: false },
        outputs: { value: 1 },
        entityConfig: {
            value: '',
            type: 'ha-entity-config',
            filter: (config) => config.entityType === 'button',
            required: true,
        },
        outputProperties: {
            value: [
                {
                    property: 'payload',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'entityState',
                },
                {
                    property: 'topic',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'triggerId',
                },
                {
                    property: 'data',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'entity',
                },
            ],
            validate: haOutputs.validate,
        },
    },
    oneditprepare: function () {
        nodeVersion.check(this);
        exposeNode.init(this);
        $('#dialog-form').prepend(ha.betaWarning(546));

        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: ['entity', 'entityState', 'entityId'],
        });
    },
    oneditsave: function () {
        this.outputProperties = haOutputs.getOutputs();
    },
});
