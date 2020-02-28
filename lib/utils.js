'use strict';
const utils = (module.exports = {});

utils.shouldInclude = (targetString, includeRegex, excludeRegex) => {
    if (!targetString || (!includeRegex && !excludeRegex)) {
        return true;
    }

    // If include regex isn't passed then include everything since test will be skipped
    // otherwise default to false and set in regex test
    let shouldIncludeTest = !includeRegex;
    let shouldExcludeTest = false;

    if (includeRegex && includeRegex.test(targetString)) {
        shouldIncludeTest = true;
    }
    if (excludeRegex && excludeRegex.test(targetString)) {
        shouldExcludeTest = true;
    }

    return shouldIncludeTest && !shouldExcludeTest;
};

utils.shouldIncludeEvent = (eventId, filter, filterType) => {
    if (!filter) return true;

    if (filterType === 'substring') {
        const found = filter
            .split(',')
            .map(f => f.trim())
            .filter(filterStr => eventId.indexOf(filterStr) >= 0);
        return found.length > 0;
    }

    if (filterType === 'regex') {
        return new RegExp(filter).test(eventId);
    }

    return filter === eventId;
};
