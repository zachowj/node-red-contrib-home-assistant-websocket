RED.nodes.registerType('server', {
    category: 'config',
    defaults: {
        name: { value: 'Home Assistant', required: false },
        legacy: { value: false },
        hassio: { value: false },
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
        const $hassio = $('#node-config-input-hassio');
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

        if (
            !$hassio.prop('checked') &&
            $host.val() === 'http://hassio/homeassistant'
        ) {
            $hassio.prop('checked', true);
        }

        function updateHassio() {
            $('#server-info').toggle(!$hassio.prop('checked'));
            $('.hassio').toggle($hassio.prop('checked'));
        }
        updateHassio();
        $hassio.on('click', function() {
            updateHassio();
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
    },
    oneditsave: function() {
        const hassio = $('#node-config-input-hassio').is(':checked');
        const $host = $('#node-config-input-host');
        const hostname = $host.val();

        if (hassio) {
            $host.val('http://hassio/homeassistant');
            this.legacy = false;
            this.rejectUnauthorizedCerts = true;
            // this.connectionDelay = $("#node-config-input-connectionDelay").is(
            //   ":checked"
            // );
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
