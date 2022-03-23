import { __assign } from "tslib";
import { addEventListener, instrumentMethodAndCallOriginal, Observable } from '@datadog/browser-core';
export function createLocationChangeObservable(location) {
    var currentLocation = __assign({}, location);
    var observable = new Observable(function () {
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
        var newLocation = __assign({}, location);
        observable.notify({
            newLocation: newLocation,
            oldLocation: currentLocation,
        });
        currentLocation = newLocation;
    }
    return observable;
}
function trackHistory(onHistoryChange) {
    var stopInstrumentingPushState = instrumentMethodAndCallOriginal(history, 'pushState', {
        after: onHistoryChange,
    }).stop;
    var stopInstrumentingReplaceState = instrumentMethodAndCallOriginal(history, 'replaceState', {
        after: onHistoryChange,
    }).stop;
    var removeListener = addEventListener(window, "popstate" /* POP_STATE */, onHistoryChange).stop;
    return {
        stop: function () {
            stopInstrumentingPushState();
            stopInstrumentingReplaceState();
            removeListener();
        },
    };
}
function trackHash(onHashChange) {
    return addEventListener(window, "hashchange" /* HASH_CHANGE */, onHashChange);
}
//# sourceMappingURL=locationChangeObservable.js.map