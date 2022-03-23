import { __assign } from "tslib";
import { addMonitoringMessage, elapsed, getPathName, includes, isValidUrl, ResourceType, toServerDuration, } from '@datadog/browser-core';
export var FAKE_INITIAL_DOCUMENT = 'initial_document';
var RESOURCE_TYPES = [
    [ResourceType.DOCUMENT, function (initiatorType) { return FAKE_INITIAL_DOCUMENT === initiatorType; }],
    [ResourceType.XHR, function (initiatorType) { return 'xmlhttprequest' === initiatorType; }],
    [ResourceType.FETCH, function (initiatorType) { return 'fetch' === initiatorType; }],
    [ResourceType.BEACON, function (initiatorType) { return 'beacon' === initiatorType; }],
    [ResourceType.CSS, function (_, path) { return /\.css$/i.test(path); }],
    [ResourceType.JS, function (_, path) { return /\.js$/i.test(path); }],
    [
        ResourceType.IMAGE,
        function (initiatorType, path) {
            return includes(['image', 'img', 'icon'], initiatorType) || /\.(gif|jpg|jpeg|tiff|png|svg|ico)$/i.exec(path) !== null;
        },
    ],
    [ResourceType.FONT, function (_, path) { return /\.(woff|eot|woff2|ttf)$/i.exec(path) !== null; }],
    [
        ResourceType.MEDIA,
        function (initiatorType, path) {
            return includes(['audio', 'video'], initiatorType) || /\.(mp3|mp4)$/i.exec(path) !== null;
        },
    ],
];
export function computeResourceKind(timing) {
    var url = timing.name;
    if (!isValidUrl(url)) {
        addMonitoringMessage("Failed to construct URL for \"" + timing.name + "\"");
        return ResourceType.OTHER;
    }
    var path = getPathName(url);
    for (var _i = 0, RESOURCE_TYPES_1 = RESOURCE_TYPES; _i < RESOURCE_TYPES_1.length; _i++) {
        var _a = RESOURCE_TYPES_1[_i], type = _a[0], isType = _a[1];
        if (isType(timing.initiatorType, path)) {
            return type;
        }
    }
    return ResourceType.OTHER;
}
function areInOrder() {
    var numbers = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        numbers[_i] = arguments[_i];
    }
    for (var i = 1; i < numbers.length; i += 1) {
        if (numbers[i - 1] > numbers[i]) {
            return false;
        }
    }
    return true;
}
export function isRequestKind(timing) {
    return timing.initiatorType === 'xmlhttprequest' || timing.initiatorType === 'fetch';
}
export function computePerformanceResourceDuration(entry) {
    var duration = entry.duration, startTime = entry.startTime, responseEnd = entry.responseEnd;
    // Safari duration is always 0 on timings blocked by cross origin policies.
    if (duration === 0 && startTime < responseEnd) {
        return toServerDuration(elapsed(startTime, responseEnd));
    }
    return toServerDuration(duration);
}
export function computePerformanceResourceDetails(entry) {
    var validEntry = toValidEntry(entry);
    if (!validEntry) {
        return undefined;
    }
    var startTime = validEntry.startTime, fetchStart = validEntry.fetchStart, redirectStart = validEntry.redirectStart, redirectEnd = validEntry.redirectEnd, domainLookupStart = validEntry.domainLookupStart, domainLookupEnd = validEntry.domainLookupEnd, connectStart = validEntry.connectStart, secureConnectionStart = validEntry.secureConnectionStart, connectEnd = validEntry.connectEnd, requestStart = validEntry.requestStart, responseStart = validEntry.responseStart, responseEnd = validEntry.responseEnd;
    var details = {
        download: formatTiming(startTime, responseStart, responseEnd),
        first_byte: formatTiming(startTime, requestStart, responseStart),
    };
    // Make sure a connection occurred
    if (connectEnd !== fetchStart) {
        details.connect = formatTiming(startTime, connectStart, connectEnd);
        // Make sure a secure connection occurred
        if (areInOrder(connectStart, secureConnectionStart, connectEnd)) {
            details.ssl = formatTiming(startTime, secureConnectionStart, connectEnd);
        }
    }
    // Make sure a domain lookup occurred
    if (domainLookupEnd !== fetchStart) {
        details.dns = formatTiming(startTime, domainLookupStart, domainLookupEnd);
    }
    if (hasRedirection(entry)) {
        details.redirect = formatTiming(startTime, redirectStart, redirectEnd);
    }
    return details;
}
export function toValidEntry(entry) {
    // Ensure timings are in the right order. On top of filtering out potential invalid
    // RumPerformanceResourceTiming, it will ignore entries from requests where timings cannot be
    // collected, for example cross origin requests without a "Timing-Allow-Origin" header allowing
    // it.
    if (!areInOrder(entry.startTime, entry.fetchStart, entry.domainLookupStart, entry.domainLookupEnd, entry.connectStart, entry.connectEnd, entry.requestStart, entry.responseStart, entry.responseEnd)) {
        return undefined;
    }
    if (!hasRedirection(entry)) {
        return entry;
    }
    var redirectStart = entry.redirectStart, redirectEnd = entry.redirectEnd;
    // Firefox doesn't provide redirect timings on cross origin requests.
    // Provide a default for those.
    if (redirectStart < entry.startTime) {
        redirectStart = entry.startTime;
    }
    if (redirectEnd < entry.startTime) {
        redirectEnd = entry.fetchStart;
    }
    // Make sure redirect timings are in order
    if (!areInOrder(entry.startTime, redirectStart, redirectEnd, entry.fetchStart)) {
        return undefined;
    }
    return __assign(__assign({}, entry), { redirectEnd: redirectEnd,
        redirectStart: redirectStart });
}
function hasRedirection(entry) {
    // The only time fetchStart is different than startTime is if a redirection occurred.
    return entry.fetchStart !== entry.startTime;
}
function formatTiming(origin, start, end) {
    return {
        duration: toServerDuration(elapsed(start, end)),
        start: toServerDuration(elapsed(origin, start)),
    };
}
export function computeSize(entry) {
    // Make sure a request actually occurred
    if (entry.startTime < entry.responseStart) {
        return entry.decodedBodySize;
    }
    return undefined;
}
export function isAllowedRequestUrl(configuration, url) {
    return url && !configuration.isIntakeUrl(url);
}
//# sourceMappingURL=resourceUtils.js.map