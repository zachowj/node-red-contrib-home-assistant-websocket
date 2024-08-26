import { EditorRED } from 'node-red';

import { HomeAssistantEditorEvent } from './const';
import { i18n } from './i18n';

declare const RED: EditorRED;
declare const Handlebars: typeof import('handlebars');

export interface Issue {
    color: string;
    icon: string;
    nodeId: string;
    messages: string[];
    hide: boolean;
}

const notificationBar = Handlebars.compile(
    $('#handlebars-notification-bar').html(),
);
let issues: Issue[] = [];
let notificationBarInitialized = false;

export function getIssues(): readonly Issue[] {
    return issues;
}

let $notificationBar: JQuery<HTMLLIElement>;
function initNotificationBar() {
    $notificationBar = $(notificationBar({ issuesCount: issues.length }));
    const $issues = $notificationBar
        .find('#notification-issues')
        .on('click', () => {
            RED.events.emit(HomeAssistantEditorEvent.OpenIssues);
        });
    RED.popover.tooltip(
        $issues,
        i18n('home-assistant.service.issue.tooltip_description'),
    );

    $notificationBar.prependTo('.red-ui-header-toolbar');
}

export function updateIssues(_, newIssues: Issue[]) {
    issues = newIssues;
    RED.events.emit(HomeAssistantEditorEvent.IssuesUpdated);

    if (!notificationBarInitialized) {
        notificationBarInitialized = true;
        initNotificationBar();
    }

    const issueCount = issues.filter((issue) => !issue.hide).length;

    $notificationBar.toggle(issueCount > 0);
    $notificationBar.find('.ha-issue-count').text(issueCount);
}
