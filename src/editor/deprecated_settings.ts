import { EditorNodeInstance } from 'node-red';

import { TransformType } from '../common/TransformState';
import { i18n } from './i18n';
import { HassNodeProperties } from './types';

export enum DeprecatedSettingType {
    StateType = 'state_type',
}

/**
 * Determines whether there are any visible deprecated rows in the dialog form.
 *
 * Searches for elements with the class `.form-row.ha-deprecated` that are currently visible,
 * excluding those with the `.ha-deprecated--description` class, within the `#dialog-form` element.
 *
 * @returns {boolean} `true` if at least one visible deprecated row exists (excluding descriptions), otherwise `false`.
 */
function hasVisibleDeprecatedRows(): boolean {
    return (
        $('#dialog-form')
            .find('.form-row.ha-deprecated:visible')
            .not('.ha-deprecated--description').length > 0
    );
}

/**
 * Renders a section in the editor for deprecated settings associated with a node.
 * If there are no deprecated settings, the function exits early.
 *
 * @param node - The editor node instance containing the properties for the Home Assistant node.
 * @param deprecatedSettings - An array of deprecated settings to be rendered in the editor.
 *
 * This function dynamically creates and appends a collapsible section to the editor's dialog form.
 * The section includes a header labeled "Deprecated Settings" and toggles the visibility of the
 * deprecated settings when clicked. For each deprecated setting, the function handles its
 * rendering logic, such as creating and appending specific UI elements.
 */
export function renderDeprecatedSettings(
    node: EditorNodeInstance<HassNodeProperties>,
    deprecatedSettings: DeprecatedSettingType[],
) {
    if (!deprecatedSettings.length) {
        return;
    }

    const $container = $('<div></div>'); // Temporary container for elements
    const $deprecatedHeader = $(`
        <div class="form-row ui-widget" id="ha-deprecated-settings" style="cursor: pointer; margin-bottom: 1em; font-weight: bold;">
            ${i18n('home-assistant.ui.deprecated_settings.title')}
        </div>
    `).on('click', () => {
        const anyVisible = hasVisibleDeprecatedRows();
        $('.form-row.ha-deprecated').toggle(!anyVisible);
    });
    const $description = $(`
        <div class="form-row ha-deprecated ha-deprecated--description" style="margin-bottom: 1em; font-style: italic;">
            ${i18n('home-assistant.ui.deprecated_settings.description')}
        </div>
    `);

    $container.append($deprecatedHeader, $description);

    for (const setting of deprecatedSettings) {
        switch (setting) {
            case DeprecatedSettingType.StateType:
                $container.append(
                    applyValues(createStateTypeSelector(node), node),
                );
                break;
        }
    }
    $('#dialog-form').append($container.children());

    // Hide description only if there are no visible deprecated rows in the DOM
    if (!hasVisibleDeprecatedRows()) {
        $description.hide();
    }
}

/**
 * Applies values from the node config to the specified jQuery element by matching
 * input fields with IDs prefixed by "node-input-" to the corresponding properties
 * in the node config.
 *
 * @param $element - A jQuery element containing input fields to populate.
 * @param values - The node config object containing key-value pairs where the keys
 * correspond to the IDs (without the "node-input-" prefix) of the input fields
 * and the values are the values to set.
 *
 * The function iterates over all input fields within the `$element` that have
 * an ID starting with "node-input-". For each field, it extracts the ID suffix,
 * looks up the corresponding value in the `values` object, and sets the field's
 * value if a matching property exists.
 *
 * If the value is a string or number, it is directly applied. For other types,
 * the value is converted to a string before being applied.
 *
 * @returns The modified jQuery element (`$element`) after applying the values.
 */
function applyValues(
    $element: JQuery<HTMLElement>,
    values: EditorNodeInstance<HassNodeProperties>,
): JQuery<HTMLElement> {
    // Clone the element to avoid modifying the original
    const $clonedElement = $element.clone();

    $clonedElement.find('[id^="node-input-"]').each(function () {
        const id = $(this).attr('id')?.replace('node-input-', '');
        if (!id) return;

        const value = (values as Record<string, unknown>)[id];
        if (value !== undefined) {
            $(this).val(
                typeof value === 'string' || typeof value === 'number'
                    ? value
                    : String(value),
            );
        }
    });

    return $clonedElement;
}

// TODO: rmeove before 1.0 release
function createStateTypeSelector(
    node: Record<string, unknown>,
): JQuery<HTMLElement> {
    const htmlBlock = `
        <div class="form-row ha-deprecated">
            <label for="node-input-state_type">${i18n('api-current-state.label.state_type')}</label>
            <select type="text" id="node-input-state_type">
                <option value="str">${i18n('api-current-state.label.state_type_option.string')}</option>
                <option value="num">${i18n('api-current-state.label.state_type_option.number')}</option>
                <option value="habool">${i18n('api-current-state.label.state_type_option.boolean')}</option>
            </select>
        </div>
        <div class="form-row ha-deprecated" style="color: var(--red-ui-text-color-warning);font-weight: bold;">
            ${i18n('home-assistant.ui.deprecated_settings.state_type_warning')}
        </div>
    `;

    const $html = $(htmlBlock);
    // Hide the state_type selector if the node is configured to use 'str' (string) type
    const stateType = node.state_type ?? node.stateType ?? undefined;
    if (stateType && stateType === TransformType.String) {
        $html.filter('.form-row.ha-deprecated').hide();
    }
    return $html;
}
