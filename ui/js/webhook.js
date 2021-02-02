/* global RED: false, $: false, exposeNode: false, ha: false, haServer: false, nodeVersion: false */
function generateId(length) {
    const possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    return Array.from(
        { length: length },
        () => possible[Math.floor(Math.random() * possible.length)]
    ).join('');
}

RED.nodes.registerType('ha-webhook', {
    category: 'home_assistant',
    color: ha.nodeColors.haBlue,
    outputs: 1,
    outputLabels: '',
    icon: 'ha-webhook.svg',
    paletteLabel: 'webhook',
    label: function () {
        return this.name || `webhook`;
    },
    labelStyle: nodeVersion.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        outputs: { value: 1 },
        webhookId: { value: generateId(32), required: true },
        payloadLocation: { value: 'payload' },
        payloadLocationType: { value: 'msg' },
        headersLocation: { value: 'headers' },
        headersLocationType: { value: 'none' },
    },
    oneditprepare: function () {
        const node = this;
        haServer.init(node, '#node-input-server');
        const $webhookId = $('#node-input-webhookId');

        exposeNode.init(node);

        $('#copyId').on('click', function () {
            const ele = $webhookId[0];
            const id = ele.value;
            ele.value = `https://<ip>:<port>/api/webhook/${id}`;

            ele.select();
            ele.setSelectionRange(0, 99999);

            document.execCommand('copy');
            ele.value = id;
        });

        $('#refresh').on('click', function () {
            $webhookId.val(generateId(32));
        });

        const NoneType = { value: 'none', label: 'None', hasValue: false };
        $('#node-input-payloadLocation').typedInput({
            types: ['msg', 'flow', 'global', NoneType],
            typeField: '#node-input-payloadLocationType',
        });
        $('#node-input-headersLocation').typedInput({
            types: ['msg', 'flow', 'global', NoneType],
            typeField: '#node-input-headersLocationType',
        });
    },
});
