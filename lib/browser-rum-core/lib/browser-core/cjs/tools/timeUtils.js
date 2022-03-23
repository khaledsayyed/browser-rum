"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetNavigationStart = exports.looksLikeRelativeTime = exports.getTimeStamp = exports.getRelativeTime = exports.elapsed = exports.clocksOrigin = exports.clocksNow = exports.relativeNow = exports.timeStampNow = exports.toServerDuration = exports.currentDrift = exports.relativeToClocks = void 0;
var utils_1 = require("./utils");
function relativeToClocks(relative) {
    return { relative: relative, timeStamp: getCorrectedTimeStamp(relative) };
}
exports.relativeToClocks = relativeToClocks;
function getCorrectedTimeStamp(relativeTime) {
    var correctedOrigin = Date.now() - performance.now();
    // apply correction only for positive drift
    if (correctedOrigin > getNavigationStart()) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        return Math.round(correctedOrigin + relativeTime);
    }
    return getTimeStamp(relativeTime);
}
function currentDrift() {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    return Math.round(Date.now() - (getNavigationStart() + performance.now()));
}
exports.currentDrift = currentDrift;
function toServerDuration(duration) {
    if (!utils_1.isNumber(duration)) {
        return duration;
    }
    return utils_1.round(duration * 1e6, 0);
}
exports.toServerDuration = toServerDuration;
function timeStampNow() {
    return Date.now();
}
exports.timeStampNow = timeStampNow;
function relativeNow() {
    return performance.now();
}
exports.relativeNow = relativeNow;
function clocksNow() {
    return { relative: relativeNow(), timeStamp: timeStampNow() };
}
exports.clocksNow = clocksNow;
function clocksOrigin() {
    return { relative: 0, timeStamp: getNavigationStart() };
}
exports.clocksOrigin = clocksOrigin;
function elapsed(start, end) {
    return (end - start);
}
exports.elapsed = elapsed;
/**
 * Get the time since the navigation was started.
 *
 * Note: this does not use `performance.timeOrigin` because it doesn't seem to reflect the actual
 * time on which the navigation has started: it may be much farther in the past, at least in Firefox 71.
 * Related issue in Firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=1429926
 */
function getRelativeTime(timestamp) {
    return (timestamp - getNavigationStart());
}
exports.getRelativeTime = getRelativeTime;
function getTimeStamp(relativeTime) {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    return Math.round(getNavigationStart() + relativeTime);
}
exports.getTimeStamp = getTimeStamp;
function looksLikeRelativeTime(time) {
    return time < utils_1.ONE_YEAR;
}
exports.looksLikeRelativeTime = looksLikeRelativeTime;
/**
 * Navigation start slightly change on some rare cases
 */
var navigationStart;
function getNavigationStart() {
    if (navigationStart === undefined) {
        navigationStart = performance.timing.navigationStart;
    }
    return navigationStart;
}
function resetNavigationStart() {
    navigationStart = undefined;
}
exports.resetNavigationStart = resetNavigationStart;
//# sourceMappingURL=timeUtils.js.map