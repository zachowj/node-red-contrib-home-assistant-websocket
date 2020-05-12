<template>
    <div>
        <textarea v-model="before" placeholder="paste Node-RED flow export here"></textarea>

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
    data: function() {
        return {
            after: "",
            before: "",
            showCopied: false,
            showError: false
        }
    },
    methods: {
        scrub: function(event) {
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
            ga('send', 'event', 'Scrubber', 'click', "scrub");
        },
        copy: function() {                        
            const copyText = this.$refs.copyme;
            
            copyText.select();
            document.execCommand('copy');
            this.showCopied = true;
            setTimeout(() => {
                this.showCopied = false;
            }, 1500);
            ga('send', 'event', 'Scrubber', 'click', "copy");
        }
    }
}
</script>

<style scoped>
textarea {
    width: 100%;
    height: 10em;
}

button {
    font-size: 14px !important;
    border-radius: 4px;
    vertical-align: middle;
    line-height: 20px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    text-align: center;
    cursor: pointer;
    padding: 6px 14px;
    border-color: #3eaf7c;
    color: #eee !important;
    background: #3eaf7c;
    margin: 12px 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}
.fade-enter,
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
    background-color: #da5961;
}

.copied {
    background-color: #e7c000;
}
</style>
