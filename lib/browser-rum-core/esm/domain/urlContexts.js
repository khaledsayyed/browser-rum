import { SESSION_TIME_OUT_DELAY, relativeNow, ContextHistory } from '@datadog/browser-core';
import { LifeCycleEventType } from './lifeCycle';
/**
 * We want to attach to an event:
 * - the url corresponding to its start
 * - the referrer corresponding to the previous view url (or document referrer for initial view)
 */
export var URL_CONTEXT_TIME_OUT_DELAY = SESSION_TIME_OUT_DELAY;
export function startUrlContexts(lifeCycle, locationChangeObservable, location) {
    var urlContextHistory = new ContextHistory(URL_CONTEXT_TIME_OUT_DELAY);
    var previousViewUrl;
    lifeCycle.subscribe(LifeCycleEventType.VIEW_ENDED, function (_a) {
        var endClocks = _a.endClocks;
        urlContextHistory.closeCurrent(endClocks.relative);
    });
    lifeCycle.subscribe(LifeCycleEventType.VIEW_CREATED, function (_a) {
        var startClocks = _a.startClocks;
        var viewUrl = location.href;
        urlContextHistory.setCurrent(buildUrlContext({
            url: viewUrl,
            referrer: !previousViewUrl ? document.referrer : previousViewUrl,
        }), startClocks.relative);
        previousViewUrl = viewUrl;
    });
    var locationChangeSubscription = locationChangeObservable.subscribe(function (_a) {
        var newLocation = _a.newLocation;
        var current = urlContextHistory.getCurrent();
        if (current) {
            var changeTime = relativeNow();
            urlContextHistory.closeCurrent(changeTime);
            urlContextHistory.setCurrent(buildUrlContext({
                url: newLocation.href,
                referrer: current.view.referrer,
            }), changeTime);
        }
    });
    function buildUrlContext(_a) {
        var url = _a.url, referrer = _a.referrer;
        return {
            view: {
                url: url,
                referrer: referrer,
            },
        };
    }
    return {
        findUrl: function (startTime) { return urlContextHistory.find(startTime); },
        stop: function () {
            locationChangeSubscription.unsubscribe();
            urlContextHistory.stop();
        },
    };
}
//# sourceMappingURL=urlContexts.js.map