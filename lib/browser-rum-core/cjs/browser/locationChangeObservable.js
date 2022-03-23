"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLocationChangeObservable = void 0;
var tslib_1 = require("tslib");
var browser_core_1 = require("@datadog/browser-core");
function createLocationChangeObservable(location) {
    var currentLocation = tslib_1.__assign({}, location);
    var observable = new browser_core_1.Observable(function () {
        var stopHistoryTracking = trackHistory(onLocationChange).stop;
        var stopHashTracking = trackHash(onLocationChange).stop;
        return function () {
            stopHistoryTracking();
            stopHashTracking();
        };
    });
    function onLocationChange() {
        if (currentLocation.href === location.href) {
            return;
        }
        var newLocation = tslib_1.__assign({}, location);
        observable.notify({
            newLocation: newLocation,
            oldLocation: currentLocation,
        });
        currentLocation = newLocation;
    }
    return observable;
}
exports.createLocationChangeObservable = createLocationChangeObservable;
function trackHistory(onHistoryChange) {
    var stopInstrumentingPushState = browser_core_1.instrumentMethodAndCallOriginal(history, 'pushState', {
        after: onHistoryChange,
    }).stop;
    var stopInstrumentingReplaceState = browser_core_1.instrumentMethodAndCallOriginal(history, 'replaceState', {
        after: onHistoryChange,
    }).stop;
    var removeListener = browser_core_1.addEventListener(window, "popstate" /* POP_STATE */, onHistoryChange).stop;
    return {
        stop: function () {
            stopInstrumentingPushState();
            stopInstrumentingReplaceState();
            removeListener();
        },
    };
}
function trackHash(onHashChange) {
    return browser_core_1.addEventListener(window, "hashchange" /* HASH_CHANGE */, onHashChange);
}
//# sourceMappingURL=locationChangeObservable.js.map