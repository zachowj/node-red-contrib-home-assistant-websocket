RED.nodes.registerType('server', {
    category: 'config',
    defaults: {
        name: { value: 'Home Assistant', required: false },
        legacy: { value: false },
        addon: { value: false },
        rejectUnauthorizedCerts: { value: true },
        ha_boolean: { value: 'y|yes|true|on|home|open' },
        connectionDelay: { value: true },
        cacheJson: { value: true }
    },
    credentials: {
        host: { value: '', required: true },
        access_token: { value: '', required: false }
    },
    icon: 'home.png',
    label: function() {
        return this.name || this.url;
    },
    oneditprepare: function() {
        const $addon = $('#node-config-input-addon');
        const $host = $('#node-config-input-host');
        const $legacy = $('#node-config-input-legacy');

        if (this.ha_boolean === undefined) {
            $('#node-config-input-ha_boolean').val('y|yes|true|on|home|open');
        }

        // Backwards compatibility
        if (this.rejectUnauthorizedCerts === false) {
            $('#accept_unauthorized_certs').prop('checked', true);
        }
        if (this.connectionDelay === undefined) {
            $('#node-config-input-connectionDelay').prop('checked', true);
        }
        if (this.cacheJson === undefined) {
            $('#node-config-input-cacheJson').prop('checked', true);
        }

        // Still need to check if host is hassio url for backward compatibility
        if ($host.val() === 'http://hassio/homeassistant') {
            $addon.prop('checked', true);
        }

        function updateAddon() {
            $('#server-info').toggle(!$addon.prop('checked'));
            $('.addon').toggle($addon.prop('checked'));
        }
        updateAddon();
        $addon.on('click', function() {
            updateAddon();
        });

        function updateLegacy() {
            const tokenName = $legacy.prop('checked')
                ? 'Password'
                : 'Access Token';

            $('#access-token-label').html(
                '<i class="fa fa-user-secret"></i> ' + tokenName
            );
            $('#node-config-input-access_token').attr(
                'placeholder',
                tokenName.toLowerCase()
            );
        }
        updateLegacy();
        $legacy.on('click', function() {
            updateLegacy();
        });

        try {
            $host.autocomplete('destroy');
        } catch (err) {}
        const $discovery = $('#discoverInstances');
        $discovery.on('click', function() {
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
                            cache: false
                        }).done(data => {
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
                    }
                })
                .autocomplete('search', '');
        });
    },
    oneditsave: function() {
        const addon = $('#node-config-input-addon').is(':checked');
        const $host = $('#node-config-input-host');
        const hostname = $host.val();

        if (addon) {
            this.addon = true;
            this.legacy = false;
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
    }
});
