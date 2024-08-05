import { EditorRED } from 'node-red';

import { IdSelectorType } from '../../../common/const';
import { openEntityFilter } from '../../editors/entity-filter';
import { getEntities } from '../../haserver';
import { i18n } from '../../i18n';
import { createVirtualSelect } from './virtual-select';

declare const RED: EditorRED;

export function createCopyButton(
    $container: JQuery<HTMLElement>,
): JQuery<HTMLElement> {
    const $button = $('<a>', {
        href: '#',
        class: 'red-ui-button',
        style: 'margin-left: 10px;',
        title: i18n('home-assistant.component.id-selector.label.copy'),
    })
        .on('click', function copyClick(evt: any) {
            evt.preventDefault();
            const $vs = $container.find('.virtual-select');
            if ($vs.length === 0) {
                return;
            }

            // @ts-expect-error - getValue is not recognized
            const value = $vs[0].value;
            if (!value) {
                return;
            }

            // @ts-expect-error - clipboard is not recognized
            if (RED.clipboard.copyText(value)) {
                RED.notify(
                    i18n('home-assistant.ui.notifications.clipboard_copy'),
                    { type: 'success', timeout: 2000 },
                );
            }
        })
        .append($('<i>', { class: 'fa fa-copy' }));

    return $button;
}

export function createDeleteButton(
    $editableList: JQuery<HTMLElement>,
    $container: JQuery<HTMLElement>,
): JQuery<HTMLElement> {
    const $button = $('<a>', {
        href: '#',
        class: 'red-ui-button id-delete-button',
        style: 'margin-left: 10px;',
        title: i18n('home-assistant.component.id-selector.label.delete'),
    })
        .on('click', (evt: any) => {
            evt.preventDefault();
            const data = $container.data('data');
            const $li = $container.closest('li');
            $li.addClass('red-ui-editableList-item-deleting');
            $li.fadeOut(200, () => {
                $editableList.editableList('removeItem', data);
            });
            // Destroy virtual select if it exists
            const $vs = $container.find('.virtual-select');
            if ($vs.length) {
                // @ts-expect-error - virtualSelect is not recognized
                $vs[0].destroy();
            }
        })
        .append($('<i>', { class: 'fa fa-remove' }));

    return $button;
}

function createTextField(value: string): JQuery<HTMLElement> {
    return $('<input>', {
        type: 'text',
        class: 'id-selector-regex',
        css: {
            flex: 1,
        },
        value,
    });
}

function createPreviewButton(
    $container: JQuery<HTMLElement>,
    type: IdSelectorType,
): JQuery<HTMLElement> {
    const $button = $('<a>', {
        href: '#',
        class: 'red-ui-button',
        style: 'margin-left: 10px;',
        title: i18n('home-assistant.component.id-selector.label.preview'),
    })
        .on('click', function previewClick(evt: any) {
            evt.preventDefault();
            const $input = $container.find('input');
            const value = $input.val();

            if (
                typeof value !== 'string' ||
                (type !== IdSelectorType.Substring &&
                    type !== IdSelectorType.Regex)
            ) {
                return;
            }

            openEntityFilter({
                filter: value,
                filterType: type,
                entities: getEntities(),
                complete: (filter) => {
                    $input.val(filter);
                },
            });
        })
        .append($('<i>', { class: 'fa fa-eye' }));

    return $button;
}

export function createRow(
    $editableList,
    $container: JQuery<HTMLElement>,
    type: IdSelectorType,
    value: string,
): JQuery<HTMLElement>[] {
    const $row = $('<div>', {
        class: 'id-selector-row',
    }).html(type);

    const $wrapper = $('<div>', {
        class: 'id-selector-wrapper',
    });

    switch (type) {
        case IdSelectorType.Floor:
        case IdSelectorType.Area:
        case IdSelectorType.Device:
        case IdSelectorType.Entity:
        case IdSelectorType.Label:
            createVirtualSelect(type, value).appendTo($wrapper);
            createCopyButton($container).appendTo($wrapper);
            break;
        case IdSelectorType.Substring:
        case IdSelectorType.Regex:
            createTextField(value).appendTo($wrapper);
            createPreviewButton($container, type).appendTo($wrapper);
            break;
        default:
    }

    createDeleteButton($editableList, $container).appendTo($wrapper);

    return [$row, $wrapper];
}
