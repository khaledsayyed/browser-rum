import { isNumber, ONE_YEAR, round } from './utils';
export function relativeToClocks(relative) {
    return { relative: relative, timeStamp: getCorrectedTimeStamp(relative) };
}
function getCorrectedTimeStamp(relativeTime) {
    var correctedOrigin = Date.now() - performance.now();
    // apply correction only for positive drift
    if (correctedOrigin > getNavigationStart()) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        return Math.round(correctedOrigin + relativeTime);
    }
    return getTimeStamp(relativeTime);
}
export function currentDrift() {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    return Math.round(Date.now() - (getNavigationStart() + performance.now()));
}
export function toServerDuration(duration) {
    if (!isNumber(duration)) {
        return duration;
    }
    return round(duration * 1e6, 0);
}
export function timeStampNow() {
    return Date.now();
}
export function relativeNow() {
    return performance.now();
}
export function clocksNow() {
    return { relative: relativeNow(), timeStamp: timeStampNow() };
}
export function clocksOrigin() {
    return { relative: 0, timeStamp: getNavigationStart() };
}
export function elapsed(start, end) {
    return (end - start);
}
/**
 * Get the time since the navigation was started.
 *
 * Note: this does not use `performance.timeOrigin` because it doesn't seem to reflect the actual
 * time on which the navigation has started: it may be much farther in the past, at least in Firefox 71.
 * Related issue in Firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=1429926
 */
export function getRelativeTime(timestamp) {
    return (timestamp - getNavigationStart());
}
export function getTimeStamp(relativeTime) {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    return Math.round(getNavigationStart() + relativeTime);
}
export function looksLikeRelativeTime(time) {
    return time < ONE_YEAR;
}
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
export function resetNavigationStart() {
    navigationStart = undefined;
}
//# sourceMappingURL=timeUtils.js.map