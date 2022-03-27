import { HassEntity } from 'home-assistant-js-websocket';

import { byPropertiesOf } from '../../helpers/sort';
import { openEntityFilter } from '../editors/entity-filter';
import { getEntities } from '../haserver';
import { disableSelect2OpenOnRemove } from '../utils';
import {
    createCustomIdListByProperty,
    createSelect2Options,
    isSelect2Initialized,
    Select2Data,
    Tags,
} from './select2';

export default class EntitySelector {
    #$select: JQuery<HTMLElement>;
    #$filter: JQuery<HTMLElement>;
    #$filterType: JQuery<HTMLElement>;
    #$filterButton: JQuery<HTMLElement>;
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
    }

    init() {
        this.#$filterType.on('change', this.showHide.bind(this));

        this.#$filterButton.on('click', () => {
            openEntityFilter({
                filter: this.#$filter.val() as string,
                filterType: this.#$filterType.val() as 'substring' | 'regex',
                entities: getEntities(),
                complete: (filter) => {
                    this.#$filter.val(filter);
                },
            });
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
                    tags: Tags.custom,
                    multiple: multiple,
                })
            )
            .maximizeSelect2Height();
        if (multiple) {
            disableSelect2OpenOnRemove(this.#$select);
        }
    }

    destroy() {
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
