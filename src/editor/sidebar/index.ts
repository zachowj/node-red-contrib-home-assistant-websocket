import { EditorRED } from 'node-red';

import { setupDiagnosticButton } from './diagnostics-button';
import { initStacks, refreshConfigs } from './stacks';

declare const RED: EditorRED;

export function initSidebar() {
    RED.events.off('runtime-state', initSidebar);

    // The html content of the sidebar has been specified below as a data-template, from where it can be loaded:
    const content = $(
        // @ts-expect-error - DefinitelyTyped is wrong
        $('script[data-template-name="ha_sidebar"]').i18n().html(),
    );
    const toolbar = $(
        // @ts-expect-error - DefinitelyTyped is wrong
        $('script[data-template-name="ha_sidebar_toolbar"]').i18n().html(),
    );

    initStacks(content);

    RED.sidebar.addTab({
        id: 'ha_sidebar',
        label: 'Home Assistant',
        name: 'Home Assistant',
        content: content.get(0),
        closeable: true,
        disableOnEdit: true,
        iconClass: 'fa fa-home',
        // @ts-expect-error - DefinitelyTyped is wrong
        toolbar,
        onchange: () => refreshConfigs(),
    });

    setupDiagnosticButton();
}
