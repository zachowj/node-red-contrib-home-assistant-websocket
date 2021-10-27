/* global RED: false, $: false, nodeVersion: false */
RED.nodes.registerType('server', {
    category: 'config',
    defaults: {
        name: { value: 'Home Assistant', required: false },
        version: { value: RED.settings.serverVersion },
        addon: { value: false },
        rejectUnauthorizedCerts: { value: true },
        ha_boolean: { value: 'y|yes|true|on|home|open' },
        connectionDelay: { value: true },
        cacheJson: { value: true },
        heartbeat: { value: false },
        heartbeatInterval: {
            value: '30',
            validate: function (v) {
                return (
                    !$('#node-config-input-heartbeat').is(':checked') ||
                    (RED.validators.number()(v) && v >= 10)
                );
            },
        },
    },
    credentials: {
        host: { value: '', required: true },
        access_token: { value: '', required: false },
    },
    icon: 'font-awesome/fa-home',
    label: function () {
        return this.name || this.url;
    },
    oneditprepare: function () {
        nodeVersion.check(this);
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
        if (addonBaseUrls.includes($host.val())) {
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
                    source: (request, response) => {
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
                    close: (event, ui) => {
                        $host.autocomplete('destroy');
                    },
                })
                .autocomplete('search', '');
        });

        $('#node-config-input-heartbeat').on('change', function () {
            $('#heartbeatIntervalRow').toggle(this.checked);
        });
    },
    oneditsave: function () {
        const addon = $('#node-config-input-addon').is(':checked');
        const $host = $('#node-config-input-host');
        const hostname = $host.val();

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
});
