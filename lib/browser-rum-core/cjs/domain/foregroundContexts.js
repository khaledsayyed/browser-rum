"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeForegroundPeriod = exports.addNewForegroundPeriod = exports.startForegroundContexts = exports.MAX_NUMBER_OF_STORED_FOREGROUND_PERIODS = exports.MAX_NUMBER_OF_SELECTABLE_FOREGROUND_PERIODS = void 0;
var browser_core_1 = require("@datadog/browser-core");
// Arbitrary value to cap number of element mostly for backend & to save bandwidth
exports.MAX_NUMBER_OF_SELECTABLE_FOREGROUND_PERIODS = 500;
// Arbitrary value to cap number of element mostly for memory consumption in the browser
exports.MAX_NUMBER_OF_STORED_FOREGROUND_PERIODS = 2500;
var foregroundPeriods = [];
function startForegroundContexts() {
    if (document.hasFocus()) {
        addNewForegroundPeriod();
    }
    var stopForegroundTracking = trackFocus(addNewForegroundPeriod).stop;
    var stopBlurTracking = trackBlur(closeForegroundPeriod).stop;
    return {
        isInForegroundAt: isInForegroundAt,
        selectInForegroundPeriodsFor: selectInForegroundPeriodsFor,
        stop: function () {
            foregroundPeriods = [];
            stopForegroundTracking();
            stopBlurTracking();
        },
    };
}
exports.startForegroundContexts = startForegroundContexts;
function addNewForegroundPeriod() {
    if (foregroundPeriods.length > exports.MAX_NUMBER_OF_STORED_FOREGROUND_PERIODS) {
        return;
    }
    var currentForegroundPeriod = foregroundPeriods[foregroundPeriods.length - 1];
    var now = browser_core_1.relativeNow();
    if (currentForegroundPeriod !== undefined && currentForegroundPeriod.end === undefined) {
        return;
    }
    foregroundPeriods.push({
        start: now,
    });
}
exports.addNewForegroundPeriod = addNewForegroundPeriod;
function closeForegroundPeriod() {
    if (foregroundPeriods.length === 0) {
        return;
    }
    var currentForegroundPeriod = foregroundPeriods[foregroundPeriods.length - 1];
    var now = browser_core_1.relativeNow();
    if (currentForegroundPeriod.end !== undefined) {
        return;
    }
    currentForegroundPeriod.end = now;
}
exports.closeForegroundPeriod = closeForegroundPeriod;
function trackFocus(onFocusChange) {
    return browser_core_1.addEventListener(window, "focus" /* FOCUS */, function (event) {
        if (!event.isTrusted) {
            return;
        }
        onFocusChange();
    });
}
function trackBlur(onBlurChange) {
    return browser_core_1.addEventListener(window, "blur" /* BLUR */, function (event) {
        if (!event.isTrusted) {
            return;
        }
        onBlurChange();
    });
}
function isInForegroundAt(startTime) {
    for (var i = foregroundPeriods.length - 1; i >= 0; i--) {
        var foregroundPeriod = foregroundPeriods[i];
        if (foregroundPeriod.end !== undefined && startTime > foregroundPeriod.end) {
            break;
        }
        if (startTime > foregroundPeriod.start &&
            (foregroundPeriod.end === undefined || startTime < foregroundPeriod.end)) {
            return true;
        }
    }
    return false;
}
function selectInForegroundPeriodsFor(eventStartTime, duration) {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    var eventEndTime = (eventStartTime + duration);
    var filteredForegroundPeriods = [];
    var earliestIndex = Math.max(0, foregroundPeriods.length - exports.MAX_NUMBER_OF_SELECTABLE_FOREGROUND_PERIODS);
    for (var i = foregroundPeriods.length - 1; i >= earliestIndex; i--) {
        var foregroundPeriod = foregroundPeriods[i];
        if (foregroundPeriod.end !== undefined && eventStartTime > foregroundPeriod.end) {
            // event starts after the end of the current focus period
            // since the array is sorted, we can stop looking for foreground periods
            break;
        }
        if (eventEndTime < foregroundPeriod.start) {
            // event ends before the start of the current focus period
            // continue to previous one
            continue;
        }
        var startTime = eventStartTime > foregroundPeriod.start ? eventStartTime : foregroundPeriod.start;
        var startDuration = browser_core_1.elapsed(eventStartTime, startTime);
        var endTime = foregroundPeriod.end === undefined || eventEndTime < foregroundPeriod.end ? eventEndTime : foregroundPeriod.end;
        var endDuration = browser_core_1.elapsed(startTime, endTime);
        filteredForegroundPeriods.unshift({
            start: browser_core_1.toServerDuration(startDuration),
            duration: browser_core_1.toServerDuration(endDuration),
        });
    }
    return filteredForegroundPeriods;
}
//# sourceMappingURL=foregroundContexts.js.map