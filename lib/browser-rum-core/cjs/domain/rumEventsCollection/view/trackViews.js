"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackViews = exports.SESSION_KEEP_ALIVE_INTERVAL = exports.THROTTLE_VIEW_UPDATE_PERIOD = void 0;
var tslib_1 = require("tslib");
var browser_core_1 = require("@datadog/browser-core");
var rawRumEvent_types_1 = require("../../../rawRumEvent.types");
var lifeCycle_1 = require("../../lifeCycle");
var trackInitialViewTimings_1 = require("./trackInitialViewTimings");
var trackViewMetrics_1 = require("./trackViewMetrics");
exports.THROTTLE_VIEW_UPDATE_PERIOD = 3000;
exports.SESSION_KEEP_ALIVE_INTERVAL = 5 * browser_core_1.ONE_MINUTE;
function trackViews(location, lifeCycle, domMutationObservable, locationChangeObservable, areViewsTrackedAutomatically, initialViewName) {
    var _a = trackInitialView(initialViewName), stopInitialViewTracking = _a.stop, initialView = _a.initialView;
    var currentView = initialView;
    var stopViewLifeCycle = startViewLifeCycle().stop;
    var locationChangeSubscription;
    if (areViewsTrackedAutomatically) {
        locationChangeSubscription = renewViewOnLocationChange(locationChangeObservable);
    }
    function trackInitialView(name) {
        var initialView = newView(lifeCycle, domMutationObservable, location, rawRumEvent_types_1.ViewLoadingType.INITIAL_LOAD, browser_core_1.clocksOrigin(), name);
        var stop = trackInitialViewTimings_1.trackInitialViewTimings(lifeCycle, function (timings) {
            initialView.updateTimings(timings);
            initialView.scheduleUpdate();
        }).stop;
        return { initialView: initialView, stop: stop };
    }
    function trackViewChange(startClocks, name) {
        return newView(lifeCycle, domMutationObservable, location, rawRumEvent_types_1.ViewLoadingType.ROUTE_CHANGE, startClocks, name);
    }
    function startViewLifeCycle() {
        lifeCycle.subscribe(lifeCycle_1.LifeCycleEventType.SESSION_RENEWED, function () {
            // do not trigger view update to avoid wrong data
            currentView.end();
            // Renew view on session renewal
            currentView = trackViewChange(undefined, currentView.name);
        });
        // End the current view on page unload
        lifeCycle.subscribe(lifeCycle_1.LifeCycleEventType.BEFORE_UNLOAD, function () {
            currentView.end();
            currentView.triggerUpdate();
        });
        // Session keep alive
        var keepAliveInterval = window.setInterval(browser_core_1.monitor(function () {
            currentView.triggerUpdate();
        }), exports.SESSION_KEEP_ALIVE_INTERVAL);
        return {
            stop: function () {
                clearInterval(keepAliveInterval);
            },
        };
    }
    function renewViewOnLocationChange(locationChangeObservable) {
        return locationChangeObservable.subscribe(function (_a) {
            var oldLocation = _a.oldLocation, newLocation = _a.newLocation;
            if (areDifferentLocation(oldLocation, newLocation)) {
                currentView.end();
                currentView.triggerUpdate();
                currentView = trackViewChange();
                return;
            }
        });
    }
    return {
        addTiming: function (name, time) {
            if (time === void 0) { time = browser_core_1.timeStampNow(); }
            currentView.addTiming(name, time);
            currentView.triggerUpdate();
        },
        startView: function (name, startClocks) {
            currentView.end(startClocks);
            currentView.triggerUpdate();
            currentView = trackViewChange(startClocks, name);
        },
        stop: function () {
            locationChangeSubscription === null || locationChangeSubscription === void 0 ? void 0 : locationChangeSubscription.unsubscribe();
            stopInitialViewTracking();
            stopViewLifeCycle();
            currentView.end();
        },
        stopView: function () {
            currentView.end();
            currentView.triggerUpdate();
        }
    };
}
exports.trackViews = trackViews;
function newView(lifeCycle, domMutationObservable, initialLocation, loadingType, startClocks, name) {
    if (startClocks === void 0) { startClocks = browser_core_1.clocksNow(); }
    // Setup initial values
    var id = browser_core_1.generateUUID();
    var timings = {};
    var customTimings = {};
    var documentVersion = 0;
    var endClocks;
    var location = tslib_1.__assign({}, initialLocation);
    lifeCycle.notify(lifeCycle_1.LifeCycleEventType.VIEW_CREATED, { id: id, name: name, startClocks: startClocks });
    // Update the view every time the measures are changing
    var _a = browser_core_1.throttle(browser_core_1.monitor(triggerViewUpdate), exports.THROTTLE_VIEW_UPDATE_PERIOD, {
        leading: false,
    }), scheduleViewUpdate = _a.throttled, cancelScheduleViewUpdate = _a.cancel;
    var _b = trackViewMetrics_1.trackViewMetrics(lifeCycle, domMutationObservable, scheduleViewUpdate, loadingType), setLoadEvent = _b.setLoadEvent, stopViewMetricsTracking = _b.stop, viewMetrics = _b.viewMetrics;
    // Initial view update
    triggerViewUpdate();
    function triggerViewUpdate() {
        documentVersion += 1;
        var currentEnd = endClocks === undefined ? browser_core_1.timeStampNow() : endClocks.timeStamp;
        lifeCycle.notify(lifeCycle_1.LifeCycleEventType.VIEW_UPDATED, tslib_1.__assign(tslib_1.__assign({}, viewMetrics), { customTimings: customTimings,
            documentVersion: documentVersion,
            id: id,
            name: name,
            loadingType: loadingType,
            location: location,
            startClocks: startClocks,
            timings: timings, duration: browser_core_1.elapsed(startClocks.timeStamp, currentEnd), isActive: endClocks === undefined }));
    }
    return {
        name: name,
        scheduleUpdate: scheduleViewUpdate,
        end: function (clocks) {
            if (clocks === void 0) { clocks = browser_core_1.clocksNow(); }
            endClocks = clocks;
            stopViewMetricsTracking();
            lifeCycle.notify(lifeCycle_1.LifeCycleEventType.VIEW_ENDED, { endClocks: endClocks });
        },
        triggerUpdate: function () {
            // cancel any pending view updates execution
            cancelScheduleViewUpdate();
            triggerViewUpdate();
        },
        updateTimings: function (newTimings) {
            timings = newTimings;
            if (newTimings.loadEvent !== undefined) {
                setLoadEvent(newTimings.loadEvent);
            }
        },
        addTiming: function (name, time) {
            var relativeTime = browser_core_1.looksLikeRelativeTime(time) ? time : browser_core_1.elapsed(startClocks.timeStamp, time);
            customTimings[sanitizeTiming(name)] = relativeTime;
        },
    };
}
/**
 * Timing name is used as facet path that must contain only letters, digits, or the characters - _ . @ $
 */
function sanitizeTiming(name) {
    var sanitized = name.replace(/[^a-zA-Z0-9-_.@$]/g, '_');
    if (sanitized !== name) {
        browser_core_1.display.warn("Invalid timing name: " + name + ", sanitized to: " + sanitized);
    }
    return sanitized;
}
function areDifferentLocation(currentLocation, otherLocation) {
    return (currentLocation.pathname !== otherLocation.pathname ||
        (!isHashAnAnchor(otherLocation.hash) &&
            getPathFromHash(otherLocation.hash) !== getPathFromHash(currentLocation.hash)));
}
function isHashAnAnchor(hash) {
    var correspondingId = hash.substr(1);
    return !!document.getElementById(correspondingId);
}
function getPathFromHash(hash) {
    var index = hash.indexOf('?');
    return index < 0 ? hash : hash.slice(0, index);
}
//# sourceMappingURL=trackViews.js.map