<template>
    <div>
        <textarea
            v-model="before"
            placeholder="paste Node-RED flow export here"
        ></textarea>

        <button v-on:click="scrub">Scrub</button>
        <transition name="fade">
            <span v-if="showError" class="error">Invalid JSON</span>
        </transition>

        <textarea v-model="after" ref="copyme"></textarea>

        <button v-on:click="copy">Copy to Clipboard</button>
        <transition name="fade">
            <span v-if="showCopied" class="copied">Copied</span>
        </transition>
    </div>
</template>

<script>
const haNodes = [
    'server',
    'server-events',
    'server-state-changed',
    'trigger-state',
    'poll-state',
    'api-call-service',
    'ha-fire-event',
    'api-current-state',
    'ha-get-entities',
    'api-get-history',
    'api-render-template',
    'ha-wait-until',
    'ha-api',
];

export default {
    data: function () {
        return {
            after: '',
            before: '',
            showCopied: false,
            showError: false,
        };
    },
    methods: {
        scrub: function (event) {
            let json;
            try {
                json = JSON.parse(this.before);
            } catch (e) {
                this.showError = true;
                setTimeout(() => {
                    this.showError = false;
                }, 1500);
                return;
            }
            this.showError = false;
            let i = json.length;
            while (i--) {
                const type = json[i].type;
                if (type === 'server') {
                    json.splice(i, 1);
                    continue;
                }
                if (haNodes.includes(type)) {
                    delete json[i].server;
                }

                ['lat', 'lon', 'latitude', 'longitude'].forEach(
                    (ele) => delete json[i][ele]
                );
            }
            this.after = JSON.stringify(json);
        },
        copy: function () {
            const copyText = this.$refs.copyme;

            copyText.select();
            document.execCommand('copy');
            this.showCopied = true;
            setTimeout(() => {
                this.showCopied = false;
            }, 1500);
        },
    },
};
</script>

<style scoped lang="stylus">
textarea {
    width: 100%;
    height: 10em;
    border-color: $accentColor;
}

button {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
        Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
    font-size: 16px !important;
    border-radius: 4px;
    vertical-align: middle;
    line-height: 20px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    text-align: center;
    cursor: pointer;
    padding: 6px 14px;
    border-color: $accentColor;
    color: #fff;
    background: $accentColor;
    margin: 12px 0;
}

button:hover {
    background-color: lighten($accentColor, 10%);
}

.fade-leave-active {
    transition: opacity 0.7s;
}

.fade-leave-to {
    opacity: 0;
}

span {
    font-weight: 600;
    display: inline-block;
    font-size: 14px;
    height: 18px;
    line-height: 18px;
    border-radius: 3px;
    padding: 6px;
    color: #fff;
}
.error {
    background-color: $badgeErrorColor;
}

.copied {
    background-color: $badgeWarningColor;
}
</style>
