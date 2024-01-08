import { StackInstanceEntry } from '@node-red/editor-client';
import { EditorRED } from 'node-red';

import { EntityType, NodeType } from '../../const';
import { i18n } from '../i18n';

declare const RED: EditorRED;
declare const Handlebars: typeof import('handlebars');

const listTemplate = Handlebars.compile($('#handlebars-sidebar-list').html());
const filterTemplate = Handlebars.compile(
    $('#handlebars-sidebar-filter').html(),
);

type ListData = {
    name: string;
    id: string;
    count: number;
    type?: EntityType;
};

function getListData(type: NodeType) {
    const list: ListData[] = [];
    const types = new Set<EntityType>();

    RED.nodes.eachConfig(function (cn: any) {
        if (cn.type === type) {
            if (cn.entityType) {
                types.add(cn.entityType);
            }
            list.push({
                name: cn.name || cn.id,
                id: cn.id,
                count: cn.users.length,
                type: cn.entityType,
            });
        }
        return true;
    });

    return {
        list: list.sort((a, b) => a.name.localeCompare(b.name)),
        types: [...types].sort(),
    };
}

let serverSection: StackInstanceEntry;
let entitySection: StackInstanceEntry;
let deviceSection: StackInstanceEntry;

export function refreshConfigs() {
    [
        { type: NodeType.Server, section: serverSection },
        { type: NodeType.EntityConfig, section: entitySection },
        { type: NodeType.DeviceConfig, section: deviceSection },
    ].forEach(({ type, section }) => {
        section.content.empty();
        const data = getListData(type);

        if (data.types.length > 1) {
            $(filterTemplate(data))
                .on('change', 'select', function () {
                    const type = $(this).val();
                    section.content.find('.ha-list-row').each(function () {
                        const row = $(this);
                        if (type === '__all__' || row.data('type') === type) {
                            row.show();
                        } else {
                            row.hide();
                        }
                    });
                })
                .appendTo(section.content);
        }

        $(listTemplate(data))
            .on('click', '.ha-list-row-name', function (e) {
                e.stopPropagation();
                RED.editor.editConfig(
                    '',
                    type,
                    $(this).parent().data('id'),
                    '',
                );
            })
            .on('click', '.ha-list-row-count', function (e) {
                e.stopPropagation();
                RED.search.show($(this).parent().data('id'));
            })
            .appendTo(section.content);
    });
}

export function initStacks(container: JQuery) {
    const stackContainer = $('<div>', {
        id: 'home-assistant-stack',
        class: 'home-assistant-sidebar-stack',
    }).appendTo(container);

    const sections = RED.stack.create({
        container: stackContainer,
    });

    // const infoSection = sections.add({
    //     title: i18n('home-assistant.sidebar.stacks.information'),
    //     collapsible: true,
    // });
    // infoSection.expand();

    serverSection = sections.add({
        title: i18n('home-assistant.sidebar.stacks.server'),
        collapsible: true,
    });

    entitySection = sections.add({
        title: i18n('home-assistant.sidebar.stacks.entity'),
        collapsible: true,
    });

    deviceSection = sections.add({
        title: i18n('home-assistant.sidebar.stacks.device'),
        collapsible: true,
    });

    refreshConfigs();
}
