import { HassEntity } from 'home-assistant-js-websocket';
import { EditorRED } from 'node-red';

import { byPropertiesOf } from '../../helpers/sort';
import { i18n } from '../i18n';

declare const RED: EditorRED;
declare global {
    interface JQuery {
        i18n: () => void;
    }
}

const filterIds = (
    entities: HassEntity[],
    filter: string,
    filterType: 'regex' | 'substring',
) => {
    let results: HassEntity[];
    if (filterType === 'regex') {
        try {
            const regex = new RegExp(filter);
            results = entities.filter((e) => regex.test(e.entity_id));
        } catch (e) {
            results = [];
        }
    } else if (filterType === 'substring') {
        results = entities.filter((e) => e.entity_id.includes(filter));
    }

    return results.sort(byPropertiesOf(['entity_id']));
};

const buildResults = (results: HassEntity[]): string => {
    return results.length
        ? results.map((e) => `<li>${e.entity_id}</li>`).join('')
        : `<li>${i18n('home-assistant.label.no_matches_found')}</li>`;
};

interface EntityFilterShowOptions {
    filter: string;
    filterType: 'substring' | 'regex';
    entities: HassEntity[];
    complete: (filterString: string) => void;
}

let filterString: string;

export const entityFilter = {
    show: (options: EntityFilterShowOptions) => {
        RED.view.state(RED.state.EDITING);

        const trayOptions = {
            title: i18n('home-assistant.label.filter_results_title'),
            width: 'inherit',
            buttons: [
                {
                    id: 'node-dialog-cancel',
                    text: i18n('home-assistant.label.cancel'),
                    click: () => {
                        RED.tray.close();
                    },
                },
                {
                    id: 'node-dialog-ok',
                    text: i18n('home-assistant.label.done'),
                    class: 'primary',
                    click: () => {
                        options.complete(filterString);
                        RED.tray.close();
                    },
                },
            ],
            open: (tray: JQuery) => {
                const $body = tray.find('.red-ui-tray-body');
                // @ts-expect-error - 5th argument is unused, DefinitelyTyped is wrong
                RED.editor.buildEditForm(
                    $body,
                    'dialog-form',
                    'ha_entity_filter',
                    'node-red-contrib-home-assistant-websocket/all',
                );
                tray.i18n();
                $('#dialog-form').addClass('home-assistant');
                $body.find('select').val(options.filterType);
                $body
                    .find('input')
                    .val(options.filter)
                    .on('input', (e) => {
                        const results = filterIds(
                            options.entities,
                            e.target.value,
                            options.filterType,
                        );
                        filterString = e.target.value;
                        $body.find('ul').html(buildResults(results));
                    })
                    .trigger('input');
            },
        };
        RED.tray.show(trayOptions);
    },
};

export const openEntityFilter = ({
    filter,
    filterType,
    entities,
    complete,
}: {
    filter: string;
    filterType: 'substring' | 'regex';
    entities: HassEntity[];
    complete: (filter: string) => void;
}) => {
    RED.editor.showTypeEditor('ha_entity_filter', {
        filter,
        filterType,
        entities,
        complete,
    });
};
