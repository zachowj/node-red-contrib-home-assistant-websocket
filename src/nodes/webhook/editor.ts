import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import { NodeType } from '../../const';
import * as haOutputs from '../../editor/components/output-properties';
import * as exposeNode from '../../editor/exposenode';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { OutputProperty } from '../../editor/types';

declare const RED: EditorRED;

interface WebhookEditorNodeProperties extends EditorNodeProperties {
    server: string;
    version: number;
    webhookId: string;
    outputProperties: OutputProperty[];

    // deprecated but needed for imports
    payloadLocation: any;
    payloadLocationType: any;
    headersLocation: any;
    headersLocationType: any;
}

function generateId(length: number) {
    const possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    return Array.from(
        { length },
        () => possible[Math.floor(Math.random() * possible.length)]
    ).join('');
}

const WebhookEditor: EditorNodeDef<WebhookEditorNodeProperties> = {
    category: NodeCategory.HomeAssistant,
    color: NodeColor.HaBlue,
    outputs: 1,
    outputLabels: '',
    icon: 'ha-webhook.svg',
    paletteLabel: 'webhook',
    label: function () {
        return this.name || `webhook`;
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: NodeType.Server, required: true },
        version: { value: RED.settings.get('haWebhookVersion', 0) },
        outputs: { value: 1 },
        webhookId: { value: generateId(32), required: true },
        outputProperties: {
            value: [
                {
                    property: 'topic',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'triggerId',
                },
                {
                    property: 'payload',
                    propertyType: 'msg',
                    value: '',
                    valueType: 'data',
                },
            ],
            validate: haOutputs.validate,
        },

        // deprecated but needed for imports
        payloadLocation: { value: false },
        payloadLocationType: { value: false },
        headersLocation: { value: false },
        headersLocationType: { value: false },
    },
    oneditprepare: function () {
        ha.setup(this);
        haServer.init(this, '#node-input-server');
        exposeNode.init(this);
        const $webhookId = $('#node-input-webhookId');

        $('#copyId').on('click', function () {
            const ele = $webhookId.get(0) as HTMLInputElement;
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

        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: ['receivedData', 'headers', 'params', 'triggerId'],
        });
    },
    oneditsave: function () {
        this.outputProperties = haOutputs.getOutputs();
    },
};

export default WebhookEditor;
