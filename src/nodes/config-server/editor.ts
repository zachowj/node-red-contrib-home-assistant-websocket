import { EditorNodeDef, EditorNodeProperties, EditorRED } from 'node-red';

import ha from '../../editor/ha';
import { formatDate } from '../../helpers/date';
import { isNodeRedEnvVar } from '../../helpers/utils';
import { Credentials } from '../../homeAssistant/index';
import { DateTimeFormatOptions } from '../../types/DateTimeFormatOptions';

declare const RED: EditorRED;

export type SelectorType = 'id' | 'friendlyName';

export interface ConfigServerEditorNodeProperties extends EditorNodeProperties {
    version: number;
    addon: boolean;
    rejectUnauthorizedCerts: boolean;
    ha_boolean: string;
    connectionDelay: boolean;
    cacheJson: boolean;
    heartbeat: boolean;
    heartbeatInterval: number;
    areaSelector: SelectorType;
    deviceSelector: SelectorType;
    entitySelector: SelectorType;
    statusSeparator: string;
    statusYear: DateTimeFormatOptions['year'] | 'hidden';
    statusMonth: DateTimeFormatOptions['month'] | 'hidden';
    statusDay: DateTimeFormatOptions['day'] | 'hidden';
    statusHourCycle: DateTimeFormatOptions['hourCycle'] | 'default';
    statusTimeFormat: 'h:m' | 'h:m:s' | 'h:m:s.ms';
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
        areaSelector: { value: 'friendlyName' },
        deviceSelector: { value: 'friendlyName' },
        entitySelector: { value: 'friendlyName' },
        statusSeparator: { value: ': ' },
        statusYear: { value: 'hidden' },
        statusMonth: { value: 'short' },
        statusDay: { value: 'numeric' },
        statusHourCycle: { value: 'default' },
        statusTimeFormat: { value: 'h:m' },
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

        $('#node-config-input-statusHourCycle')
            .on('change', function () {
                const options: DateTimeFormatOptions = {
                    hour: 'numeric',
                    minute: 'numeric',
                };
                const value = $(this).val();
                if (value && value !== 'default') {
                    options.hourCycle =
                        value as DateTimeFormatOptions['hourCycle'];
                }
                $('#node-config-input-statusTimeFormat')
                    .children()
                    .each(function () {
                        const $this = $(this);
                        switch ($this.val()) {
                            case 'h:m:s':
                                options.second = 'numeric';
                                break;
                            case 'h:m:s.ms':
                                options.second = 'numeric';
                                options.fractionalSecondDigits = 3;
                                break;
                            default:
                                break;
                        }
                        const datetime = formatDate({
                            date: new Date(2022, 1, 1, 3, 4, 5, 6),
                            options,
                        });
                        $this.text(datetime);
                    });
            })
            .trigger('change');
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

            if (hostname !== parser.origin && !isNodeRedEnvVar(hostname)) {
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
