import { EditorRED } from 'node-red';

import { i18n } from '../i18n';

declare const RED: EditorRED;

interface StoreInfo {
    stores: string[];
    selectedStore: string;
    defaultStore: string;
    ready: boolean;
    failed: boolean;
    legacyImported: boolean;
    migrationPending: boolean;
    persistenceConfirmed: boolean;
    persistentStores: string[];
    acknowledgedStores: string[];
    confirmableStores: string[];
}

let startupNotificationShown = false;
const persistenceWarningKey =
    'node-red-contrib-home-assistant-websocket.persistence-warning-dismissed';

function showPersistenceWarning(store: string, key: string) {
    const dismissalKey = `${persistenceWarningKey}.${key}.${store}`;
    const rememberDismissal = () => {
        try {
            localStorage.setItem(dismissalKey, 'true');
        } catch {
            // The warning remains dismissible if storage is unavailable.
        }
    };
    let dismissed = false;
    try {
        dismissed = localStorage.getItem(dismissalKey) === 'true';
    } catch {
        // Storage may be disabled by the browser.
    }
    if (dismissed) return;

    const notification = RED.notify(textForStorage(key), {
        type: 'warning',
        timeout: 15000,
        buttons: [
            {
                text: textForStorage('choose_store'),
                click: () => {
                    rememberDismissal();
                    RED.sidebar.show('ha_sidebar');
                    $('#home-assistant-storage-button').trigger('click');
                },
            },
            {
                text: textForStorage('ignore'),
                click: rememberDismissal,
            },
        ],
    });
    notification.addEventListener('click', rememberDismissal, {
        capture: true,
        once: true,
    });
}

function textForStorage(key: string) {
    return i18n(`home-assistant.sidebar.storage.${key}`);
}

export function setupStorageButton() {
    const text = textForStorage;
    $.get('homeassistant/storage').done((data: StoreInfo) => {
        if (!startupNotificationShown) {
            if (data.legacyImported) {
                startupNotificationShown = true;
                if (data.migrationPending) {
                    showPersistenceWarning(
                        data.selectedStore,
                        'migration_pending',
                    );
                } else {
                    RED.notify(text('migration_completed'), 'success');
                }
            } else if (!data.persistenceConfirmed) {
                startupNotificationShown = true;
                showPersistenceWarning(
                    data.selectedStore,
                    'persistence_warning',
                );
            }
        }
    });

    $('#home-assistant-storage-button')
        .attr('title', text('title'))
        .attr('aria-label', text('title'))
        .on('click', (event) => {
            event.preventDefault();
            const dialog = $('<div>');
            const select = $('<select>')
                .attr('id', 'home-assistant-context-store')
                .css('width', '100%')
                .prop('disabled', true);
            const label = $('<label>')
                .attr('for', 'home-assistant-context-store')
                .text(text('label'));
            const warning = $('<p>').text(text('warning'));
            const persistenceCheckbox = $('<input>')
                .attr('type', 'checkbox')
                .attr('id', 'home-assistant-persistence-confirmation');
            const persistenceLabel = $('<label>')
                .attr('for', 'home-assistant-persistence-confirmation')
                .append(persistenceCheckbox, ` ${text('confirm_persistence')}`);
            const persistenceHelp = $('<p>').text(
                text('confirm_persistence_help'),
            );
            const persistenceConfirmation = $('<div>').append(
                persistenceLabel,
                persistenceHelp,
            );
            const docsLink = $('<a>')
                .attr(
                    'href',
                    'https://zachowj.github.io/node-red-contrib-home-assistant-websocket/guide/#context-storage',
                )
                .attr('target', '_blank')
                .attr('rel', 'noopener noreferrer')
                .text(text('context_docs'));
            const docs = $('<p>').append(docsLink);
            const status = $('<p>').attr('role', 'status');
            dialog.append(
                label,
                select,
                warning,
                persistenceConfirmation,
                docs,
                status,
            );
            let selectedStore: string | undefined;
            let persistentStores: string[] = [];
            let acknowledgedStores: string[] = [];
            let confirmableStores: string[] = [];
            let open = true;
            let saving = false;

            const updatePersistenceWarning = () => {
                const store = select.val();
                if (typeof store !== 'string') return;
                const persistenceConfirmed =
                    persistentStores.includes(store) ||
                    (confirmableStores.includes(store)
                        ? persistenceCheckbox.is(':checked')
                        : acknowledgedStores.includes(store));
                warning.text(
                    persistenceConfirmed
                        ? text('persistent_warning')
                        : text('persistence_warning'),
                );
            };

            const updatePersistenceControl = () => {
                const store = select.val();
                if (typeof store !== 'string') return;
                const canConfirm = confirmableStores.includes(store);
                persistenceConfirmation.toggle(canConfirm);
                persistenceCheckbox
                    .prop('checked', acknowledgedStores.includes(store))
                    .prop('disabled', !canConfirm);
                updatePersistenceWarning();
            };

            select.on('change', updatePersistenceControl);
            persistenceCheckbox.on('change', updatePersistenceWarning);

            // @ts-expect-error - DefinitelyTyped is wrong
            RED.keyboard.disable();
            dialog.dialog({
                classes: {
                    'ui-dialog': 'red-ui-editor-dialog',
                    'ui-widget-overlay': 'red-ui-editor-dialog',
                },
                modal: true,
                width: Math.min(460, window.innerWidth - 32),
                resizable: false,
                title: text('title'),
                close: function () {
                    open = false;
                    dialog.dialog('destroy').remove();
                    // @ts-expect-error - DefinitelyTyped is wrong
                    RED.keyboard.enable();
                },
                buttons: [
                    {
                        text: text('save'),
                        click: function () {
                            if (saving) return;
                            const store = select.val();
                            if (
                                typeof store !== 'string' ||
                                selectedStore === undefined
                            ) {
                                return;
                            }
                            const persistentAcknowledged =
                                persistenceCheckbox.is(':checked');
                            if (
                                store === selectedStore &&
                                (!confirmableStores.includes(store) ||
                                    persistentAcknowledged ===
                                        acknowledgedStores.includes(store))
                            ) {
                                dialog.dialog('close');
                                return;
                            }
                            if (
                                store !== selectedStore &&
                                !window.confirm(text('confirm'))
                            )
                                return;
                            saving = true;
                            select.prop('disabled', true);
                            $.ajax({
                                url: 'homeassistant/storage',
                                method: 'POST',
                                contentType: 'application/json',
                                data: JSON.stringify({
                                    store,
                                    persistentAcknowledged,
                                }),
                            })
                                .done((data: StoreInfo) => {
                                    selectedStore = data.selectedStore;
                                    persistentStores = data.persistentStores;
                                    acknowledgedStores =
                                        data.acknowledgedStores;
                                    confirmableStores = data.confirmableStores;
                                    RED.notify(
                                        data.failed
                                            ? text('failed')
                                            : data.ready
                                              ? text('saved')
                                              : text('waiting'),
                                    );
                                    if (open) dialog.dialog('close');
                                })
                                .fail(() => {
                                    saving = false;
                                    if (open) {
                                        status.text(text('failed_save'));
                                        select.prop('disabled', false);
                                    } else {
                                        RED.notify(
                                            text('failed_save'),
                                            'error',
                                        );
                                    }
                                });
                        },
                    },
                    {
                        text: text('cancel'),
                        click: function () {
                            dialog.dialog('close');
                        },
                    },
                ],
            });
            $.get('homeassistant/storage')
                .done((data: StoreInfo) => {
                    selectedStore = data.selectedStore;
                    persistentStores = data.persistentStores;
                    acknowledgedStores = data.acknowledgedStores;
                    confirmableStores = data.confirmableStores;
                    data.stores.forEach((store) =>
                        $('<option>')
                            .val(store)
                            .text(
                                store === data.defaultStore
                                    ? `${store} (${text('default')})`
                                    : store,
                            )
                            .appendTo(select),
                    );
                    if (!data.stores.includes(data.selectedStore)) {
                        $('<option>')
                            .val(data.selectedStore)
                            .text(
                                `${data.selectedStore} (${text('unavailable')})`,
                            )
                            .prop('disabled', true)
                            .prependTo(select);
                    }
                    select.val(data.selectedStore).prop('disabled', false);
                    updatePersistenceControl();
                    if (data.failed) status.text(text('failed'));
                    else if (!data.ready) status.text(text('waiting'));
                })
                .fail(() => status.text(text('failed_fetch')));
        });
}
