import { openEntityFilter } from '../editors/entity-filter';
import { getEntities, getUiSettings } from '../haserver';
import { disableSelect2OpenOnRemove } from '../utils';
import {
    createSelect2Options,
    isSelect2Initialized,
    Select2AjaxEndpoints,
    Tags,
} from './select2';

export default class EntitySelector {
    #$select: JQuery<HTMLElement>;
    #$filter: JQuery<HTMLElement>;
    #$filterType: JQuery<HTMLElement>;
    #$filterButton: JQuery<HTMLElement>;
    #entityId: string | string[];
    #serverId?: string;

    constructor({
        filterTypeSelector,
        entityId,
        serverId,
    }: {
        filterTypeSelector: string;
        entityId: string | string[];
        serverId?: string;
    }) {
        this.#$filterType = $(filterTypeSelector);
        this.#entityId = entityId;
        this.#serverId = serverId;

        this.#buildElements();
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

    #generateEntityList() {
        const entities = getEntities();
        const ids = !Array.isArray(this.#entityId)
            ? [this.#entityId]
            : this.#entityId;

        const options = ids.reduce((acc: JQuery<HTMLElement>[], id: string) => {
            const text =
                getUiSettings().entitySelector === 'id'
                    ? id
                    : entities.find((e) => e.entity_id === id)?.attributes
                          .friendly_name ?? id;
            acc.push(
                $('<option />', {
                    value: id,
                    text,
                    selected: true,
                })
            );
            return acc;
        }, []);

        return options;
    }

    #buildElements() {
        const $formRow = this.#$filterType.parent();
        const $div = $('<div />', {
            class: 'ha-entity-selector',
        });
        const filterType = this.#$filterType.val() as string;
        this.#$select = $(`<select />`, {
            id: 'ha-entity-selector',
            multiple: filterType === 'list',
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

        // Populate select with selected ids
        if (this.#entityId !== '') {
            this.#$select.append(this.#generateEntityList());
        }
    }

    init() {
        this.#$filterType.on('change', this.#showHideFilterOptions.bind(this));

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

        this.#initSelect2(Array.isArray(this.#entityId));
        this.#$filter.val(this.#entityId);
    }

    #showHideFilterOptions() {
        const filter = this.#$filterType.val() as string;
        switch (filter) {
            case 'exact':
            case 'list':
                this.#initSelect2(filter === 'list');
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

    #initSelect2(multiple = false) {
        this.#$select
            .select2(
                createSelect2Options({
                    tags: Tags.Custom,
                    multiple,
                    displayIds: getUiSettings().entitySelector === 'id',
                    ajax: {
                        endpoint: Select2AjaxEndpoints.Entities,
                        serverId: this.#serverId,
                    },
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

    serverChanged(serverId: string) {
        this.#serverId = serverId;
        this.#$select.empty();
        this.#showHideFilterOptions();
    }
}
