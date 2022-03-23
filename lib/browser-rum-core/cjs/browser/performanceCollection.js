"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveInitialDocumentResourceTiming = exports.startPerformanceCollection = exports.supportPerformanceEntry = exports.supportPerformanceTimingEvent = void 0;
var tslib_1 = require("tslib");
var browser_core_1 = require("@datadog/browser-core");
var lifeCycle_1 = require("../domain/lifeCycle");
var resourceUtils_1 = require("../domain/rumEventsCollection/resource/resourceUtils");
var getDocumentTraceId_1 = require("../domain/tracing/getDocumentTraceId");
function supportPerformanceObject() {
    return window.performance !== undefined && 'getEntries' in performance;
}
function supportPerformanceTimingEvent(entryType) {
    return (window.PerformanceObserver &&
        PerformanceObserver.supportedEntryTypes !== undefined &&
        PerformanceObserver.supportedEntryTypes.includes(entryType));
}
exports.supportPerformanceTimingEvent = supportPerformanceTimingEvent;
function supportPerformanceEntry() {
    // Safari 10 doesn't support PerformanceEntry
    return typeof PerformanceEntry === 'function';
}
exports.supportPerformanceEntry = supportPerformanceEntry;
function startPerformanceCollection(lifeCycle, configuration) {
    retrieveInitialDocumentResourceTiming(function (timing) {
        handleRumPerformanceEntry(lifeCycle, configuration, timing);
    });
    if (supportPerformanceObject()) {
        handlePerformanceEntries(lifeCycle, configuration, performance.getEntries());
    }
    if (window.PerformanceObserver) {
        var handlePerformanceEntryList_1 = browser_core_1.monitor(function (entries) {
            return handlePerformanceEntries(lifeCycle, configuration, entries.getEntries());
        });
        var mainEntries = ['resource', 'navigation', 'longtask', 'paint'];
        var experimentalEntries = ['largest-contentful-paint', 'first-input', 'layout-shift'];
        try {
            // Experimental entries are not retrieved by performance.getEntries()
            // use a single PerformanceObserver with buffered flag by type
            // to get values that could happen before SDK init
            experimentalEntries.forEach(function (type) {
                var observer = new PerformanceObserver(handlePerformanceEntryList_1);
                observer.observe({ type: type, buffered: true });
            });
        }
        catch (e) {
            // Some old browser versions don't support PerformanceObserver without entryTypes option
            mainEntries.push.apply(mainEntries, experimentalEntries);
        }
        var mainObserver = new PerformanceObserver(handlePerformanceEntryList_1);
        mainObserver.observe({ entryTypes: mainEntries });
        if (supportPerformanceObject() && 'addEventListener' in performance) {
            // https://bugzilla.mozilla.org/show_bug.cgi?id=1559377
            performance.addEventListener('resourcetimingbufferfull', function () {
                performance.clearResourceTimings();
            });
        }
    }
    if (!supportPerformanceTimingEvent('navigation')) {
        retrieveNavigationTiming(function (timing) {
            handleRumPerformanceEntry(lifeCycle, configuration, timing);
        });
    }
    if (!supportPerformanceTimingEvent('first-input')) {
        retrieveFirstInputTiming(function (timing) {
            handleRumPerformanceEntry(lifeCycle, configuration, timing);
        });
    }
}
exports.startPerformanceCollection = startPerformanceCollection;
function retrieveInitialDocumentResourceTiming(callback) {
    browser_core_1.runOnReadyState('interactive', function () {
        var timing;
        var forcedAttributes = {
            entryType: 'resource',
            initiatorType: resourceUtils_1.FAKE_INITIAL_DOCUMENT,
            traceId: getDocumentTraceId_1.getDocumentTraceId(document),
        };
        if (supportPerformanceTimingEvent('navigation') && performance.getEntriesByType('navigation').length > 0) {
            var navigationEntry = performance.getEntriesByType('navigation')[0];
            timing = tslib_1.__assign(tslib_1.__assign({}, navigationEntry.toJSON()), forcedAttributes);
        }
        else {
            var relativePerformanceTiming = computeRelativePerformanceTiming();
            timing = tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, relativePerformanceTiming), { decodedBodySize: 0, duration: relativePerformanceTiming.responseEnd, name: window.location.href, startTime: 0 }), forcedAttributes);
        }
        callback(timing);
    });
}
exports.retrieveInitialDocumentResourceTiming = retrieveInitialDocumentResourceTiming;
function retrieveNavigationTiming(callback) {
    function sendFakeTiming() {
        callback(tslib_1.__assign(tslib_1.__assign({}, computeRelativePerformanceTiming()), { entryType: 'navigation' }));
    }
    browser_core_1.runOnReadyState('complete', function () {
        // Send it a bit after the actual load event, so the "loadEventEnd" timing is accurate
        setTimeout(browser_core_1.monitor(sendFakeTiming));
    });
}
/**
 * first-input timing entry polyfill based on
 * https://github.com/GoogleChrome/web-vitals/blob/master/src/lib/polyfills/firstInputPolyfill.ts
 */
function retrieveFirstInputTiming(callback) {
    var startTimeStamp = Date.now();
    var timingSent = false;
    var removeEventListeners = browser_core_1.addEventListeners(window, ["click" /* CLICK */, "mousedown" /* MOUSE_DOWN */, "keydown" /* KEY_DOWN */, "touchstart" /* TOUCH_START */, "pointerdown" /* POINTER_DOWN */], function (evt) {
        // Only count cancelable events, which should trigger behavior important to the user.
        if (!evt.cancelable) {
            return;
        }
        // This timing will be used to compute the "first Input delay", which is the delta between
        // when the system received the event (e.g. evt.timeStamp) and when it could run the callback
        // (e.g. performance.now()).
        var timing = {
            entryType: 'first-input',
            processingStart: browser_core_1.relativeNow(),
            startTime: evt.timeStamp,
        };
        if (evt.type === "pointerdown" /* POINTER_DOWN */) {
            sendTimingIfPointerIsNotCancelled(timing);
        }
        else {
            sendTiming(timing);
        }
    }, { passive: true, capture: true }).stop;
    /**
     * Pointer events are a special case, because they can trigger main or compositor thread behavior.
     * We differentiate these cases based on whether or not we see a pointercancel event, which are
     * fired when we scroll. If we're scrolling we don't need to report input delay since FID excludes
     * scrolling and pinch/zooming.
     */
    function sendTimingIfPointerIsNotCancelled(timing) {
        browser_core_1.addEventListeners(window, ["pointerup" /* POINTER_UP */, "pointercancel" /* POINTER_CANCEL */], function (event) {
            if (event.type === "pointerup" /* POINTER_UP */) {
                sendTiming(timing);
            }
        }, { once: true });
    }
    function sendTiming(timing) {
        if (!timingSent) {
            timingSent = true;
            removeEventListeners();
            // In some cases the recorded delay is clearly wrong, e.g. it's negative or it's larger than
            // the time between now and when the page was loaded.
            // - https://github.com/GoogleChromeLabs/first-input-delay/issues/4
            // - https://github.com/GoogleChromeLabs/first-input-delay/issues/6
            // - https://github.com/GoogleChromeLabs/first-input-delay/issues/7
            var delay = timing.processingStart - timing.startTime;
            if (delay >= 0 && delay < Date.now() - startTimeStamp) {
                callback(timing);
            }
        }
    }
}
function computeRelativePerformanceTiming() {
    var result = {};
    var timing = performance.timing;
    for (var key in timing) {
        if (browser_core_1.isNumber(timing[key])) {
            var numberKey = key;
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            var timingElement = timing[numberKey];
            result[numberKey] = timingElement === 0 ? 0 : browser_core_1.getRelativeTime(timingElement);
        }
    }
    return result;
}
function handlePerformanceEntries(lifeCycle, configuration, entries) {
    entries.forEach(function (entry) {
        if (entry.entryType === 'resource' ||
            entry.entryType === 'navigation' ||
            entry.entryType === 'paint' ||
            entry.entryType === 'longtask' ||
            entry.entryType === 'largest-contentful-paint' ||
            entry.entryType === 'first-input' ||
            entry.entryType === 'layout-shift') {
            handleRumPerformanceEntry(lifeCycle, configuration, entry);
        }
    });
}
function handleRumPerformanceEntry(lifeCycle, configuration, entry) {
    if (isIncompleteNavigation(entry) || isForbiddenResource(configuration, entry)) {
        return;
    }
    lifeCycle.notify(lifeCycle_1.LifeCycleEventType.PERFORMANCE_ENTRY_COLLECTED, entry);
}
function isIncompleteNavigation(entry) {
    return entry.entryType === 'navigation' && entry.loadEventEnd <= 0;
}
function isForbiddenResource(configuration, entry) {
    return entry.entryType === 'resource' && !resourceUtils_1.isAllowedRequestUrl(configuration, entry.name);
}
//# sourceMappingURL=performanceCollection.js.map