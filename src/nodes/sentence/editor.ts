import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import { EntityType, NodeType, TypedInputTypes } from '../../const';
import * as haOutputs from '../../editor/components/output-properties';
import * as exposeNode from '../../editor/exposenode';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { i18n } from '../../editor/i18n';
import { insertSocialBar } from '../../editor/socialbar';
import { OutputProperty } from '../../editor/types';
import { saveEntityType } from '../entity-config/editor/helpers';
import { SentenceMode, SentenceResponseType } from './const';

declare const RED: EditorRED;

interface SentenceEditorNodeProperties extends EditorNodeProperties {
    server: string;
    version: number;
    mode: SentenceMode;
    sentences: string[];
    response: string;
    responseTimeout: number;
    responseType: TypedInputTypes;
    triggerResponse: string;
    triggerResponseType: SentenceResponseType;
    outputProperties: OutputProperty[];
    exposeAsEntityConfig: string;
}

const SentenceEditor: EditorNodeDef<SentenceEditorNodeProperties> = {
    category: NodeCategory.HomeAssistant,
    color: NodeColor.HaBlue,
    outputs: 1,
    outputLabels: '',
    icon: 'font-awesome/fa-comment-o',
    paletteLabel: 'sentence',
    label: function () {
        return this.name || `sentence`;
    },
    labelStyle: ha.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: NodeType.Server, required: true },
        version: { value: RED.settings.get('haSentenceVersion', 0) },
        inputs: { value: 0 },
        outputs: { value: 1 },
        exposeAsEntityConfig: {
            value: '',
            type: NodeType.EntityConfig,
            // @ts-ignore - DefinitelyTyped is missing this property
            filter: (config) => config.entityType === EntityType.Switch,
            required: false,
        },
        mode: { value: SentenceMode.Trigger },
        sentences: {
            value: [],
            validate: function (s) {
                return s.length > 0 || this.mode !== SentenceMode.Trigger;
            },
        },
        response: { value: '' },
        responseType: { value: TypedInputTypes.String },
        triggerResponse: { value: '' },
        triggerResponseType: { value: SentenceResponseType.Fixed },
        responseTimeout: { value: 1000 },
        outputProperties: {
            value: [
                {
                    property: 'topic',
                    propertyType: TypedInputTypes.Message,
                    value: '',
                    valueType: TypedInputTypes.TriggerId,
                },
                {
                    property: 'payload',
                    propertyType: TypedInputTypes.Message,
                    value: '',
                    valueType: TypedInputTypes.TriggerId,
                },
            ],
            validate: haOutputs.validate,
        },
    },
    oneditprepare: function () {
        ha.setup(this);
        haServer.init(this, '#node-input-server');
        exposeNode.init(this);
        saveEntityType(EntityType.Switch, 'exposeAsEntityConfig');

        // Handle mode change
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const _self = this;
        $('#node-input-mode').on('change', function (this: HTMLSelectElement) {
            $('#node-input-inputs').val(
                this.value === SentenceMode.Trigger ? 0 : 1,
            );
            const mode = $('#node-input-mode').val() as SentenceMode;
            $('.sentence-trigger').toggle(mode === SentenceMode.Trigger);
            $('.sentence-response').toggle(mode === SentenceMode.Response);
            $('#node-input-response').typedInput({
                types: [
                    TypedInputTypes.String,
                    TypedInputTypes.JSONata,
                    TypedInputTypes.Message,
                    TypedInputTypes.Flow,
                    TypedInputTypes.Global,
                ],
                typeField: '#node-input-responseType',
                // @ts-expect-error - DefinitelyTyped is wrong typedInput can take a object as a parameter
                type: _self.responseType,
            });
        });

        $('#node-input-triggerResponseType')
            .on('change', function (this: HTMLSelectElement) {
                const type = this.value as SentenceResponseType;
                $('#node-input-responseTimeout')
                    .parent()
                    .toggle(type === SentenceResponseType.Dynamic);
                $('#node-input-triggerResponse')
                    .siblings('label')
                    .text(
                        i18n(
                            type === SentenceResponseType.Fixed
                                ? 'ha-sentence.label.response'
                                : 'ha-sentence.label.fallback_response',
                        ),
                    );
            })
            .trigger('change');

        $('#node-input-sentences-container')
            .editableList({
                addButton: true,
                removable: true,
                height: 'auto',
                header: $('<div>').append(
                    this._('ha-sentence.label.sentences'),
                ),
                addItem: function (container, _, data: string) {
                    $('<input />', {
                        type: 'text',
                        value: typeof data === 'string' ? data : '',
                        style: 'width: 100%',
                    }).appendTo(container);
                },
            })
            .editableList(
                'addItems',
                (this.sentences.length ? this.sentences : ['']) as any,
            );

        haOutputs.createOutputs(this.outputProperties, {
            extraTypes: [
                TypedInputTypes.TriggerId,
                TypedInputTypes.Results,
                TypedInputTypes.DeviceId,
            ],
        });

        insertSocialBar('sentence');
    },
    oneditsave: function () {
        const _sentences: string[] = [];
        $('#node-input-sentences-container')
            .editableList('items')
            .each(function () {
                const $text = $(this).find('input');
                const value = $text.val() as string;
                // only add if not empty
                if (value) _sentences.push(value);
            });
        this.sentences = _sentences;
        this.outputProperties = haOutputs.getOutputs();
    },
};

export default SentenceEditor;
