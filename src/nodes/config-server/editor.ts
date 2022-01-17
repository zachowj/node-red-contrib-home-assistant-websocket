import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import ha from '../../editor/ha';
import { Credentials } from '../../homeAssistant/index';

declare const RED: EditorRED;

interface ConfigServerEditorNodeProperties extends EditorNodeProperties {
    version: number;
    addon: boolean;
    rejectUnauthorizedCerts: boolean;
    ha_boolean: string;
    connectionDelay: boolean;
    cacheJson: boolean;
    heartbeat: boolean;
    heartbeatInterval: number;
}

const ConfigServerEditor: EditorNodeDef<
    ConfigServerEditorNodeProperties,
    Credentials
> = {
    category: 'config',
    defaults: {
        name: { value: 'Home Assistant', required: false },
        version: { value: RED.settings.get('serverVersion', 0) },
        addon: { value: false },
        rejectUnauthorizedCerts: { value: true },
        ha_boolean: { value: 'y|yes|true|on|home|open' },
        connectionDelay: { value: true },
        cacheJson: { value: true },
        heartbeat: { value: false },
        heartbeatInterval: {
            value: 30,
            validate: function (v: string) {
                return (
                    !$('#node-config-input-heartbeat').is(':checked') ||
                    (RED.validators.number()(v) && Number(v) >= 10)
                );
            },
        },
    },
    credentials: {
        host: { type: 'text' },
        access_token: { type: 'text' },
    },
    icon: 'font-awesome/fa-home',
    label: function (): string {
        return this.name || 'Home Assistant';
    },
    oneditprepare: function () {
        ha.setup(this);
        const $addon = $('#node-config-input-addon');
        const $host = $('#node-config-input-host');

        if (this.rejectUnauthorizedCerts === false) {
            $('#accept_unauthorized_certs').prop('checked', true);
        }

        // Still need to check if host is hassio url for backward compatibility
        const addonBaseUrls = [
            'http://hassio/homeassistant',
            'http://supervisor/core',
        ];
        if (addonBaseUrls.includes($host.val() as string)) {
            $addon.prop('checked', true);
        }

        function updateAddon() {
            $('#server-info').toggle(!$addon.prop('checked'));
            $('.addon').toggle($addon.prop('checked'));
        }
        updateAddon();
        $addon.on('click', function () {
            updateAddon();
        });

        try {
            $host.autocomplete('destroy');
        } catch (err) {}

        const $discovery = $('#discoverInstances');
        $discovery.on('click', function () {
            if ($(this).hasClass('disabled')) return;
            const $icon = $('i', this)
                .removeClass('fa-search')
                .addClass('spinner');
            $discovery.addClass('disabled');
            $host
                .autocomplete({
                    source: (request: any, response: (data: any) => void) => {
                        $.ajax({
                            dataType: 'json',
                            url: '/homeassistant/discover',
                            cache: false,
                        }).done((data) => {
                            response(data);
                        });
                    },
                    minLength: 0,
                    response: () => {
                        $icon.addClass('fa-search').removeClass('spinner');
                        $discovery.removeClass('disabled');
                    },
                    close: () => $host.autocomplete('destroy'),
                })
                .autocomplete('search', '');
        });

        $('#node-config-input-heartbeat').on(
            'change',
            function (this: HTMLInputElement) {
                $('#heartbeatIntervalRow').toggle(this.checked);
            }
        );
    },
    oneditsave: function () {
        const addon = $('#node-config-input-addon').is(':checked');
        const $host = $('#node-config-input-host');
        const hostname = $host.val() as string;

        if (addon) {
            this.addon = true;
            this.rejectUnauthorizedCerts = true;
        } else {
            const parser = document.createElement('a');
            parser.href = hostname;

            if (hostname !== parser.origin) {
                RED.notify('Invalid format of Base URL: ' + hostname);
            }

            // Save the inverse of the checkbox
            this.rejectUnauthorizedCerts = !$(
                '#accept_unauthorized_certs'
            ).prop('checked');
            this.connectionDelay = false;
        }
    },
};

export default ConfigServerEditor;
