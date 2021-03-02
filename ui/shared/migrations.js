/* global RED: false, jQuery: false, nodeVersion: false, ha: false */
(function ($) {
    let $upgradeHaNode;

    $(() => {
        createElements();
        $upgradeHaNode = $('#upgrade-ha-node');
        $upgradeHaNode.on('click', nodeVersion.migrateAllNodesConfirm).hide();
    });

    RED.events.on('nodes:add', (node) => {
        if (
            nodeVersion.isHomeAssistantNode(node) &&
            !nodeVersion.isCurrentVersion(node)
        ) {
            $upgradeHaNode.show();
        }
    });

    RED.events.on('nodes:remove', (node) => {
        if (
            $upgradeHaNode.is(':visible') &&
            nodeVersion.isHomeAssistantNode(node) &&
            nodeVersion.getOldNodeCount() === 0
        ) {
            $upgradeHaNode.hide();
        }
    });

    function createElements() {
        const namespace = 'home-assistant.ui.migrations';
        const title = ha.i18n(`${namespace}.title`);
        const warning = ha.i18n(`${namespace}.warning`);
        const message = ha.i18n(`${namespace}.message`);
        const buttonLabel = ha.i18n(`${namespace}.button_label`);
        const attention = ha.i18n('home-assistant.ui.notifications.attention');

        const $dialogHtml = $.parseHTML(
            `<div id="ha-dialog-confirm" title="${title}">
                ${message}
                <div class="ui-state-error ha-alert-box"><strong>${attention}:</strong> ${warning}</div>
            </div>`
        );
        const $buttonHtml = $.parseHTML(
            `<li>
                <button id="upgrade-ha-node"><i class="fa fa-refresh"></i> ${buttonLabel}</button>
            </li>`
        );
        $('body').append($dialogHtml);
        $('#red-ui-header .red-ui-header-toolbar').prepend($buttonHtml);
    }
})(jQuery);
