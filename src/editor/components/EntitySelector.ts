import { HassEntity } from 'home-assistant-js-websocket';

import { byPropertiesOf } from '../../helpers/sort';
import { getEntities } from '../haserver';
import { i18n } from '../i18n';
import { disableSelect2OpenOnRemove } from '../utils';
import {
    createCustomIdListByProperty,
    createSelect2Options,
    isSelect2Initialized,
    Select2Data,
} from './select2';

export default class EntitySelector {
    #$select: JQuery<HTMLElement>;
    #$filter: JQuery<HTMLElement>;
    #$filterType: JQuery<HTMLElement>;
    #$filterButton: JQuery<HTMLElement>;
    #$filterBar: JQuery<HTMLElement>;
    #$filterBarLabel: JQuery<HTMLElement>;
    #$filterDialog: JQuery<HTMLElement>;
    #$filterResults: JQuery<HTMLElement>;
    #entityId: string | string[];
    #select2Data: Select2Data[];

    constructor({
        filterTypeSelector,
        entityId,
    }: {
        filterTypeSelector: string;
        entityId: string | string[];
    }) {
        this.#$filterType = $(filterTypeSelector);
        this.#entityId = entityId;

        this.buildElements();
        this.init();
    }

    get entityId() {
        let id: string | string[] = [];
        switch (this.#$filterType.val()) {
            case 'exact':
                id = isSelect2Initialized(this.#$select)
                    ? this.#$select.select2('data')?.[0]?.id
                    : '';
                break;
            case 'list':
                id = isSelect2Initialized(this.#$select)
                    ? this.#$select.select2('data')?.map((e) => e.id) ?? []
                    : '';
                break;
            case 'substring':
            case 'regex':
                id = this.#$filter.val() as string;
                break;
        }
        return id;
    }

    private buildElements() {
        const $formRow = this.#$filterType.parent();
        const $div = $('<div />', {
            class: 'ha-entity-selector',
        });
        this.#$select = $(`<select />`, {
            id: 'ha-entity-selector',
        });
        this.#$filter = $('<input />', {
            type: 'text',
        });
        this.#$filterButton = $(`
            <a class="editor-button">
                <i class="fa fa-search"></i>
            </a>`);

        $formRow.append(
            $div.append([this.#$select, this.#$filter, this.#$filterButton])
        );
        this.#$filterType.appendTo($div);

        // Filter dialog
        this.#$filterDialog = $('<div />');
        const $filterBar = $('<div />', {
            class: 'ha-entity-filter-bar',
        });
        this.#$filterBarLabel = $(
            `<label>${i18n(
                'home-assistant.label.filter_results_label'
            )}</label>`
        );
        this.#$filterBar = $('<input />', {
            type: 'text',
        });
        this.#$filterResults = $('<ul />');
        this.#$filterDialog
            .append([
                $filterBar.append([this.#$filterBarLabel, this.#$filterBar]),
                this.#$filterResults,
            ])
            .appendTo('#dialog-form');
    }

    init() {
        this.#$filterType.on('change', this.showHide.bind(this));

        this.#$filterDialog.dialog({
            autoOpen: false,
            dialogClass: 'ha-entity-search-dialog',
            height: 600,
            modal: true,
            resizable: false,
            title: i18n('home-assistant.label.filter_results_title'),
            width: 700,
            buttons: [
                {
                    text: i18n('home-assistant.label.cancel'),
                    click: () => {
                        this.#$filterDialog.dialog('close');
                    },
                },
                {
                    text: i18n('home-assistant.label.done'),
                    class: 'primary',
                    click: () => {
                        this.#$filter.val(this.#$filterBar.val());
                        this.#$filterDialog.dialog('close');
                    },
                },
            ],
            open: () => {
                this.#$filterBar.val(this.#$filter.val());
            },
        });

        this.#$filterBar.on('input', () => this.filterIds());
        this.#$filterButton.on('click', () => {
            this.#$filterDialog.dialog('open');
            this.filterIds();
        });

        this.generateEntityList();
        this.initSelect2(Array.isArray(this.#entityId));
        this.#$filter.val(this.#entityId);
    }

    private showHide() {
        const filter = this.#$filterType.val() as string;
        switch (filter) {
            case 'exact':
            case 'list':
                this.initSelect2(filter === 'list');
                this.#$filterButton.hide();
                this.#$filter.hide();
                break;
            case 'substring':
            case 'regex':
                this.#$select.next().hide();
                this.#$filterButton.show();
                this.#$filter.val(this.#entityId).show();
                break;
        }
    }

    private filterIds() {
        if (!this.#$filterDialog.dialog('isOpen')) return;
        const filterType = this.#$filterType.val();
        const str = this.#$filterDialog.find('input').val() as string;

        let results: HassEntity[];
        if (filterType === 'regex') {
            try {
                const regex = new RegExp(str);
                results = getEntities().filter((e) => regex.test(e.entity_id));
            } catch (e) {
                results = [];
            }
        } else if (filterType === 'substring') {
            results = getEntities().filter((e) => e.entity_id.includes(str));
        }
        const text = results
            .sort(byPropertiesOf(['entity_id']))
            .map((e) => `<li>${e.entity_id}</li>`)
            .join('');
        this.#$filterResults
            .empty()
            .append(
                text.length
                    ? text
                    : `<li>${i18n('home-assistant.label.no_matches')}</li>`
            );
    }

    private generateEntityList() {
        const entities = Object.values(getEntities());
        const entityIds = !this.#select2Data
            ? Array.isArray(this.#entityId)
                ? this.#entityId
                : [this.#entityId]
            : this.#$select.select2('data').map((e) => e.id);

        const data = entities
            .map((e): Select2Data => {
                return {
                    id: e.entity_id,
                    text: e.attributes.friendly_name ?? e.entity_id,
                    title: e.entity_id,
                    selected: entityIds.includes(e.entity_id),
                };
            })
            .sort(byPropertiesOf<Select2Data>(['text']))
            .concat(
                createCustomIdListByProperty<HassEntity>(entityIds, entities, {
                    property: 'entity_id',
                    includeUnknownIds: true,
                })
            );
        this.#select2Data = data;
    }

    private initSelect2(multiple = false) {
        this.#$select
            .select2(
                createSelect2Options({
                    data: this.#select2Data.filter((e) => e.id?.length > 0),
                    tags: true,
                    multiple: multiple,
                })
            )
            .maximizeSelect2Height();
        if (multiple) {
            disableSelect2OpenOnRemove(this.#$select);
        }
    }

    destroy() {
        this.#$filterDialog.dialog('destroy');
        if (isSelect2Initialized(this.#$select)) {
            this.#$select.select2('destroy');
        }
    }

    serverChanged() {
        this.#$select.empty();
        this.generateEntityList();
        this.showHide();
    }
}
