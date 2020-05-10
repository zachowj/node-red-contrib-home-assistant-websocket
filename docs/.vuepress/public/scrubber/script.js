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

const scrub = document.getElementById('scrub');
const before = document.getElementById('before');
const after = document.getElementById('after');

scrub.onclick = () => {
    const json = JSON.parse(before.value);

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
    after.value = JSON.stringify(json);
    copy();
};

function copy() {
    var copyText = document.querySelector('#after');
    copyText.select();
    document.execCommand('copy');
}
