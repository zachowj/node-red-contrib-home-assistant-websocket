import { EditorNodeDef, EditorRED } from 'node-red';

import { NodeType } from '../../const';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import { HassNodeProperties } from '../../editor/types';

declare const RED: EditorRED;

interface RenderTemplateEditorNodeProperties extends HassNodeProperties {
    server: string;
    version: number;
    template: string;
    resultsLocation: string;
    resultsLocationType: string;
    templateLocation: string;
    templateLocationType: string;
}

let templateEditor: AceAjax.Editor | undefined;

const RenderTemplateEditor: EditorNodeDef<RenderTemplateEditorNodeProperties> =
    {
        category: NodeCategory.HomeAssistant,
        color: NodeColor.HaBlue,
        inputs: 1,
        outputs: 1,
        icon: 'ha-render-template.svg',
        paletteLabel: 'render template',
        label: function () {
            return this.name || 'template';
        },
        labelStyle: ha.labelStyle,
        defaults: {
            name: { value: '' },
            server: { value: '', type: NodeType.Server, required: true },
            version: { value: RED.settings.get('apiRenderTemplateVersion', 0) },
            template: { value: '' },
            resultsLocation: { value: 'payload' },
            resultsLocationType: { value: 'msg' },
            templateLocation: { value: 'template' },
            templateLocationType: { value: 'msg' },
        },
        oneditprepare: function () {
            ha.setup(this);
            haServer.init(this, '#node-input-server');

            const $inputTemplate = $('#node-input-template');

            $('#node-input-templateLocation').typedInput({
                types: [
                    'msg',
                    'flow',
                    'global',
                    { value: 'none', label: 'none', hasValue: false },
                ],
                typeField: '#node-input-templateLocationType',
            });

            $('#node-input-resultsLocation').typedInput({
                types: [
                    'msg',
                    'flow',
                    'global',
                    { value: 'none', label: 'none', hasValue: false },
                ],
                typeField: '#node-input-resultsLocationType',
            });

            // NOTE: Copypasta from node-red/nodes/core/template node
            // TODO: How to get jinja syntax highlighting with ace editor?
            // TODO: Add a preview render button for testing (or call render on debounced keyup)
            templateEditor = RED.editor.createEditor({
                id: 'node-input-template-editor',
                mode: 'ace/mode/text',
                value: $inputTemplate.val() as string,
            });
        },
        oneditresize: function () {
            const $rows = $('#dialog-form>div:not(.node-text-editor-row)');
            const $editorRow = $('#dialog-form>div.node-text-editor-row');
            const $textEditor = $('.node-text-editor');
            const $dialogForm = $('#dialog-form');

            let height = $dialogForm.height() ?? 0;
            for (let i = 0; i < $rows.length; i++) {
                const outerHeight = $($rows[i]).outerHeight(true);
                if (typeof outerHeight === 'number') {
                    height -= outerHeight;
                }
            }
            height -=
                parseInt($editorRow.css('marginTop')) +
                parseInt($editorRow.css('marginBottom'));

            $textEditor.css('height', `${height}px`);
            templateEditor?.resize();
        },
        oneditcancel: function () {
            templateEditor?.destroy();
            templateEditor = undefined;
        },
        oneditsave: function () {
            const newValue = templateEditor?.getValue() ?? '';
            $('#node-input-template').val(newValue);
            templateEditor?.destroy();
            templateEditor = undefined;
        },
    };

export default RenderTemplateEditor;
