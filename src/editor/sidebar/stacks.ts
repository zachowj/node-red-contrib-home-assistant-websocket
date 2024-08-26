import { EditorRED, NodeDef } from 'node-red';

import { EntityType, NodeType } from '../../const';
import { HomeAssistantEditorEvent } from '../const';
import { i18n } from '../i18n';
import { getIssues, Issue } from '../issues';

interface StackInstanceEntry {
    collapsible?: boolean | undefined;
    container: JQuery<HTMLDivElement>;
    header: JQuery<HTMLDivElement>;
    contentWrap: JQuery<HTMLDivElement>;
    content: JQuery<HTMLDivElement>;
    title: JQuery<HTMLDivElement>;
    toggle(): boolean;
    expand(): boolean | undefined;
    collapse(): boolean | undefined;
    isExpanded(): boolean;
}

declare const RED: EditorRED;
declare const Handlebars: typeof import('handlebars');

Handlebars.registerHelper('backgroundcolor', function (color: string) {
    return `style="background-color: ${color};"`;
});

Handlebars.registerHelper('ishidden', function (value: boolean) {
    return value ? 'class="ha-hidden"' : '';
});

Handlebars.registerHelper('i18n', function (key: string) {
    return i18n(key);
});

const listTemplate = Handlebars.compile($('#handlebars-sidebar-list').html());
const filterTemplate = Handlebars.compile(
    $('#handlebars-sidebar-filter').html(),
);
const issueTemplate = Handlebars.compile(
    $('#handlebars-sidebar-issues').html(),
);
const issueTemplateList = Handlebars.compile(
    $('#handlebars-sidebar-issues-list').html(),
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
let issueSection: StackInstanceEntry;

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

function buildIssueData(issues: readonly Issue[]) {
    return issues.map((issue) => {
        const node = RED.nodes.node(issue.nodeId) as NodeDef | undefined;
        // @ts-expect-error - _def does exist on node
        const nodeIcon = node?._def.icon;
        const isFontAwesomeIcon = !!nodeIcon?.startsWith('font-awesome/');
        const icon = isFontAwesomeIcon ? nodeIcon.slice(13) : nodeIcon;

        return {
            // @ts-expect-error - _def does exist on node
            color: node._def.color,
            icon,
            isFontAwesomeIcon,
            // @ts-expect-error - _def does exist on node
            name: node ? node._def.label.call(node) : issue.nodeId,
            id: issue.nodeId,
            issues: issue.messages,
            hide: issue.hide,
        };
    });
}

function buildIssues(issues: readonly Issue[]) {
    // sidebar not initialized yet
    if (!issueSection) {
        return;
    }

    $(
        issueTemplate({
            issues,
        }),
    )
        .on('click', '#ha-issues-toggle-hidden', function () {
            if (this.checked) {
                $('.ha-issues-list').addClass('ha-show-hidden');
            } else {
                $('.ha-issues-list').removeClass('ha-show-hidden');
            }
        })
        .appendTo(issueSection.content);

    addIssueListEvents(
        issueSection.content
            .find('.ha-issues-list')
            .append(buildIssuesList(issues)),
    );
}

function addIssueListEvents($list: JQuery) {
    $list
        .on('click', '.ha-find-node', function (e) {
            e.stopPropagation();
            RED.view.reveal($(this).parents('li').data('id'));
        })
        .on('click', '.ha-edit-node', function (e) {
            e.stopPropagation();
            const nodeId = $(this).parents('li').data('id');
            const node = RED.nodes.node(nodeId);
            if (node) {
                RED.editor.edit(node);
            }
        })
        .on('click', '.ha-hidden-issue', function (e) {
            e.stopPropagation();
            const $li = $(this).parents('li[data-id]');
            const issue = $li.data('id');
            const popover = $(this).data('popover');
            if (popover) {
                popover.close();
                popover.setContent(
                    $li.hasClass('ha-hidden')
                        ? i18n('home-assistant.sidebar.issues.show_issue')
                        : i18n('home-assistant.sidebar.issues.hide_issue'),
                );
            }
            $.ajax({
                url: `homeassistant/issues/hidden`,
                type: 'POST',
                data: JSON.stringify({ issue } ?? {}),
                contentType: 'application/json',
                success: () => {
                    RED.notify(
                        i18n('home-assistant.service.issue.issue_hidden', {
                            issue_id: issue,
                        }),
                        {
                            type: 'success',
                            id: `issue${issue}`,
                            timeout: 2000,
                        },
                    );
                    $li.addClass('ha-hidden');
                },
                error: function (jqXHR, textStatus) {
                    let message = '';
                    if (jqXHR.status === 500) {
                        message = i18n(
                            'home-assistant.service.issue.failed_to_hide',
                            { issue_id: issue },
                        );
                    } else if (jqXHR.status === 0) {
                        message = i18n(
                            'home-assistant.service.issue.no-response',
                        );
                    } else {
                        message = i18n(
                            'home-assistant.service.issue.unexpected',
                            {
                                status: jqXHR.status,
                                message: textStatus,
                            },
                        );
                    }
                    RED.notify(message, 'error');
                },
            });
        });
}

function buildIssuesList(issues: readonly Issue[]) {
    const $list = $(issueTemplateList({ issues: buildIssueData(issues) }));
    $('.ha-edit-node', $list).each(function () {
        RED.popover.tooltip(
            $(this),
            i18n('home-assistant.sidebar.issues.open_editor'),
        );
    });
    $('.ha-find-node', $list).each(function () {
        RED.popover.tooltip(
            $(this),
            i18n('home-assistant.sidebar.issues.find_node'),
        );
    });
    $('.ha-hidden-issue', $list).each(function () {
        const $this = $(this);
        const isHidden = $this.parents('li').hasClass('ha-hidden');
        const popover = RED.popover.tooltip(
            $this,
            i18n(
                isHidden
                    ? 'home-assistant.sidebar.issues.show_issue'
                    : 'home-assistant.sidebar.issues.hide_issue',
            ),
        );
        $(this).data('popover', popover);
    });

    return $list;
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

    issueSection = sections.add({
        title: i18n('home-assistant.sidebar.stacks.issues'),
        collapsible: true,
    });

    refreshConfigs();
    buildIssues(getIssues());

    RED.events.on(HomeAssistantEditorEvent.OpenIssues, () => {
        RED.sidebar.show('ha_sidebar');
        if (!issueSection.isExpanded()) {
            issueSection.expand();
        }
    });
    RED.events.on(HomeAssistantEditorEvent.IssuesUpdated, () => {
        issueSection.content
            .find('.ha-issues-list')
            .empty()
            .append(buildIssuesList(getIssues()));
    });
}
