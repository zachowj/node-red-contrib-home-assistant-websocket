import { EditorRED } from 'node-red';

import clipboard from '../clipboard';
import { i18n } from '../i18n';

declare const RED: EditorRED;

export function setupDiagnosticButton() {
    $('#home-assistant-diagnostics-button').on('click', function (e) {
        e.preventDefault();
        const fetchingData = i18n(
            'home-assistant.sidebar.diagnostics.fetching_data'
        );
        const dialog = $(`
            <div id="home-assistant-diagnostics-dialog">
                <textarea id="home-assistant-diagnostics-textarea" style="width: 100%;resize: none;" rows="12" >${fetchingData}</textarea>
            </div>
        `);

        // @ts-expect-error - DefinitelyTyped is wrong
        RED.keyboard.disable();
        dialog.dialog({
            classes: {
                'ui-dialog': 'red-ui-editor-dialog',
                'ui-dialog-titlebar-close': 'hide',
                'ui-widget-overlay': 'red-ui-editor-dialog',
            },
            modal: true,
            closeOnEscape: true,
            width: 450,
            resizable: false,
            draggable: false,
            title: i18n('home-assistant.sidebar.diagnostics.environment_data'),
            close: function () {
                $('#home-assistant-diagnostics-dialog')
                    .dialog('destroy')
                    .remove();
                // @ts-expect-error - DefinitelyTyped is wrong
                RED.keyboard.enable();
            },
            buttons: [
                {
                    text: i18n('home-assistant.sidebar.diagnostics.copy'),
                    click: function () {
                        // copy the text to the clipboard
                        const ele = document.getElementById(
                            'home-assistant-diagnostics-textarea'
                        ) as HTMLInputElement;
                        clipboard(ele.value);

                        RED.notify(
                            i18n('home-assistant.sidebar.diagnostics.copied')
                        );
                        $(this).dialog('close');
                    },
                },
                {
                    text: i18n('home-assistant.sidebar.diagnostics.close'),
                    click: function () {
                        $(this).dialog('close');
                    },
                },
            ],
        });

        $.get('/homeassistant/diagnostics', function (data) {
            $('#home-assistant-diagnostics-textarea').val(data);
        });
    });
}
