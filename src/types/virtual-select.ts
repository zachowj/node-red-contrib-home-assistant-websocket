/**
 * @typedef {object} virtualSelectOption
 * @property {(string|number)} value Value of the option
 * @property {(string|number)} label Display text of the option
 * @property {(string|number)} [description] Text to show along with label
 * @property {(string|number)} [classNames] Additional class names to customize specific option
 * @property {(string|string[])} [alias] Alternative labels to use on search. Array of string or
 * comma separated string.
 * @property {any} [customData] Any custom data to store with the options and it would be available
 * with getSelectedOptions() result.
 * @property {virtualSelectOption[]} [options] List of options for option group
 */
export type VirtualSelectOption = {
    label?: string;
    value: string;
    description?: string;
    alias?: string | string[];
    classNames?: string[];
    customData?: Record<string, any>;
};

/**
 * @typedef {object} virtualSelectOptions
 * @property {(HTMLElement|string)} ele Parent element to render VirtualSelect
 * @property {string} [dropboxWrapper=self] Parent element to render dropbox. (self, body, or any css selector) Use this when container of dropdown has overflow scroll or hidden value.
 * @property {virtualSelectOption[]} options Array of object to show as options
 * @property {string} [valueKey=value] Object key to use to get value from options array
 * @property {string} [labelKey=label] Object key to use to get label from options array
 * @property {string} [descriptionKey=description] Object key to use to get description from options array
 * @property {string} [aliasKey=alias] Key name to get alias from options object
 * @property {boolean} [multiple=false] Enable multiselect
 * @property {boolean} [search=false] Enable search
 * @property {boolean} [searchByStartsWith=false] Search options by startsWith() method
 * @property {boolean} [searchGroup=false] Include group title for searching
 * @property {boolean} [disabled=false] Disable dropdown
 * @property {boolean} [required=false] Enable required validation
 * @property {boolean} [autofocus=false] Autofocus dropdown on load
 * @property {boolean} [hideClearButton=false] Hide clear button
 * @property {boolean} [autoSelectFirstOption=false] Select first option by default on load
 * @property {boolean} [hasOptionDescription=false] Has description to show along with label
 * @property {boolean} [disableSelectAll=false] Disable select all feature of multiple select
 * @property {string} [optionsCount=5|4] No.of options to show on viewport
 * @property {string} [optionHeight='40px|50px'] Height of each dropdown options
 * @property {string} [position='bottom left'] Position of dropbox (auto, top, bottom, top left, top right, bottom left, bottom right)
 * @property {string} [textDirection=ltr] Direction of text (ltr or rtl)
 * @property {(string[]|number[])} [disabledOptions] Options to disable (array of values)
 * @property {(string|string[]|number[])} [selectedValue] Single value or array of values to select on init
 * @property {boolean} [silentInitialValueSet=false] To avoid "change event" trigger on setting initial value
 * @property {string} [dropboxWidth] Custom width for dropbox
 * @property {number} [zIndex=1] CSS z-index value for dropbox
 * @property {number} [noOfDisplayValues=50] Maximum no.of values to show in the tooltip for multi-select
 * @property {boolean} [allowNewOption=false] Allow to add new option by searching
 * @property {boolean} [markSearchResults=false] Mark matched term in label
 * @property {string} [tooltipFontSize='14px'] Font size for tooltip
 * @property {string} [tooltipAlignment=center] CSS Text alignment for tooltip
 * @property {string} [tooltipMaxWidth='300px'] CSS max width for tooltip
 * @property {boolean} [showSelectedOptionsFirst=false] Show selected options at the top of the dropbox
 * @property {boolean} [focusSelectedOptionOnOpen=true] Scroll selected option to viewport on dropbox open
 * @property {string} [name] Name attribute for hidden input
 * @property {boolean} [keepAlwaysOpen] Keep dropbox always open with fixed height
 * @property {number} [maxValues=0] Maximum no.of options allowed to choose in multiple select
 * @property {number} [minValues] Minimum no.of options should be selected to succeed required validation
 * @property {string} [additionalClasses] Additional classes for wrapper element
 * @property {string} [additionalDropboxClasses] Additional classes for dropbox element
 * @property {string} [additionalDropboxContainerClasses] Additional classes for dropbox container element
 * @property {string} [additionalToggleButtonClasses] Additional classes for toggle button element
 * @property {boolean} [showDropboxAsPopup=true] Show dropbox as popup on small screen like mobile
 * @property {string} [popupDropboxBreakpoint='576px'] Maximum screen width that allowed to show dropbox as popup
 * @property {string} [popupPosition=center] Position of the popup (left, center, or right)
 * @property {function} [onServerSearch] Callback function to integrate server search
 * @property {number} [searchDelay=300] Delay time in milliseconds to trigger onServerSearch callback function
 * @property {function} [labelRenderer] Callback function to render label, which could be used to add image, icon, or custom content
 * @property {string} [ariaLabelledby] ID of the label element to use as a11y attribute aria-labelledby
 * @property {boolean} [hideValueTooltipOnSelectAll=true] Hide value tooltip if all options selected
 * @property {boolean} [showOptionsOnlyOnSearch=false] Show options to select only if search value is not empty
 * @property {boolean} [selectAllOnlyVisible=false] Select only visible options on clicking select all checkbox when options filtered by search
 * @property {boolean} [alwaysShowSelectedOptionsCount=false] By default, no.of options selected text would be shown when there is no enough space to show all selected values. Set true to show count even though there is enough space.
 * @property {boolean} [alwaysShowSelectedOptionsLabel=false] By default, no.of options selected text would be shown when there is no enough space to show all selected values. Set true to show labels even though there is no enough space.
 * @property {boolean} [disableAllOptionsSelectedText=false] By default, when all values selected "All (10)"value text would be shown. Set true to show value text as "10 options selected".
 * @property {boolean} [showValueAsTags=false] Show each selected values as tags with remove icon
 * @property {boolean} [disableOptionGroupCheckbox=false] Disable option group title checkbox
 * @property {boolean} [enableSecureText=false] Set true to replace HTML tags from option's text (value and label) to prevent XSS attack. This feature is not enabled by default to avoid performance issue.
 * @property {boolean} [setValueAsArray=false] Set value for hidden input in array format (e.g. '["1", "2"]')
 * @property {string} [emptyValue=''] Empty value to use for hidden input when no value is selected (e.g. 'null' or '[]' or 'none')
 * @property {boolean} [disableValidation=false] Disable required validation
 * @property {boolean} [useGroupValue=false] Group's value would be returned when all of its child options selected
 * @property {string} [maxWidth='250px'] Maximum width for the select element
 * @property {number} [updatePositionThrottle=100] Throttle time for updating dropbox position on scroll event (in milliseconds)
 * @property {string} [placeholder=Select] Text to show when no options selected
 * @property {string} [noOptionsText='No options found'] Text to show when no options to show
 * @property {string} [noSearchResultsText='No results found'] Text to show when no results on search
 * @property {string} [selectAllText='Select all'] Text to show near select all checkbox when search is disabled
 * @property {string} [searchPlaceholderText='Search...'] Text to show as placeholder for search input
 * @property {string} [optionsSelectedText='options selected'] Text to use when displaying no.of values selected text (i.e. 3 options selected)
 * @property {string} [optionSelectedText='option selected'] Text to use when displaying no.of values selected text and only one value is selected (i.e. 1 option selected)
 * @property {string} [allOptionsSelectedText=All] Text to use when displaying all values selected text (i.e. All (10))
 * @property {string} [clearButtonText=Clear] Tooltip text for clear button
 * @property {string} [moreText='more...'] Text to show when more than noOfDisplayValues options selected (i.e + 10 more...)
 */
export type VirtualSelectOptions = {
    ele: HTMLElement | string;
    dropboxWrapper?: string;
    options: VirtualSelectOption[];
    valueKey?: string;
    labelKey?: string;
    descriptionKey?: string;
    aliasKey?: string;
    multiple?: boolean;
    search?: boolean;
    searchByStartsWith?: boolean;
    searchGroup?: boolean;
    disabled?: boolean;
    required?: boolean;
    autofocus?: boolean;
    hideClearButton?: boolean;
    autoSelectFirstOption?: boolean;
    hasOptionDescription?: boolean;
    disableSelectAll?: boolean;
    optionsCount?: string;
    optionHeight?: string;
    position?: string;
    textDirection?: string;
    disabledOptions?: string[];
    selectedValue?: string | string[] | number[];
    silentInitialValueSet?: boolean;
    dropboxWidth?: string;
    zIndex?: number;
    noOfDisplayValues?: number;
    allowNewOption?: boolean;
    markSearchResults?: boolean;
    tooltipFontSize?: string;
    tooltipAlignment?: string;
    tooltipMaxWidth?: string;
    showSelectedOptionsFirst?: boolean;
    focusSelectedOptionOnOpen?: boolean;
    name?: string;
    keepAlwaysOpen?: boolean;
    maxValues?: number;
    minValues?: number;
    additionalClasses?: string;
    additionalDropboxClasses?: string;
    additionalDropboxContainerClasses?: string;
    additionalToggleButtonClasses?: string;
    showDropboxAsPopup?: boolean;
    popupDropboxBreakpoint?: string;
    popupPosition?: string;
    onServerSearch?: () => void;
    searchDelay?: number;
    labelRenderer?: () => void;
    ariaLabelledby?: string;
    hideValueTooltipOnSelectAll?: boolean;
    showOptionsOnlyOnSearch?: boolean;
    selectAllOnlyVisible?: boolean;
    alwaysShowSelectedOptionsCount?: boolean;
    alwaysShowSelectedOptionsLabel?: boolean;
    disableAllOptionsSelectedText?: boolean;
    showValueAsTags?: boolean;
    disableOptionGroupCheckbox?: boolean;
    enableSecureText?: boolean;
    setValueAsArray?: boolean;
    emptyValue?: string;
    disableValidation?: boolean;
    useGroupValue?: boolean;
    maxWidth?: string;
    updatePositionThrottle?: number;
    placeholder?: string;
    noOptionsText?: string;
    noSearchResultsText?: string;
    selectAllText?: string;
    searchPlaceholderText?: string;
    optionsSelectedText?: string;
    optionSelectedText?: string;
    allOptionsSelectedText?: string;
    clearButtonText?: string;
    moreText?: string;
};
