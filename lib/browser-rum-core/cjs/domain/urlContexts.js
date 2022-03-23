"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startUrlContexts = exports.URL_CONTEXT_TIME_OUT_DELAY = void 0;
var browser_core_1 = require("@datadog/browser-core");
var lifeCycle_1 = require("./lifeCycle");
/**
 * We want to attach to an event:
 * - the url corresponding to its start
 * - the referrer corresponding to the previous view url (or document referrer for initial view)
 */
exports.URL_CONTEXT_TIME_OUT_DELAY = browser_core_1.SESSION_TIME_OUT_DELAY;
function startUrlContexts(lifeCycle, locationChangeObservable, location) {
    var urlContextHistory = new browser_core_1.ContextHistory(exports.URL_CONTEXT_TIME_OUT_DELAY);
    var previousViewUrl;
    lifeCycle.subscribe(lifeCycle_1.LifeCycleEventType.VIEW_ENDED, function (_a) {
        var endClocks = _a.endClocks;
        urlContextHistory.closeCurrent(endClocks.relative);
    });
    lifeCycle.subscribe(lifeCycle_1.LifeCycleEventType.VIEW_CREATED, function (_a) {
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
            var changeTime = browser_core_1.relativeNow();
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
exports.startUrlContexts = startUrlContexts;
//# sourceMappingURL=urlContexts.js.map