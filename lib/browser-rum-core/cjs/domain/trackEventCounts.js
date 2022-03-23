"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackEventCounts = void 0;
var browser_core_1 = require("@datadog/browser-core");
var rawRumEvent_types_1 = require("../rawRumEvent.types");
var lifeCycle_1 = require("./lifeCycle");
function trackEventCounts(lifeCycle, callback) {
    if (callback === void 0) { callback = browser_core_1.noop; }
    var eventCounts = {
        errorCount: 0,
        longTaskCount: 0,
        resourceCount: 0,
        userActionCount: 0,
    };
    var subscription = lifeCycle.subscribe(lifeCycle_1.LifeCycleEventType.RUM_EVENT_COLLECTED, function (_a) {
        var type = _a.type;
        switch (type) {
            case rawRumEvent_types_1.RumEventType.ERROR:
                eventCounts.errorCount += 1;
                callback(eventCounts);
                break;
            case rawRumEvent_types_1.RumEventType.ACTION:
                eventCounts.userActionCount += 1;
                callback(eventCounts);
                break;
            case rawRumEvent_types_1.RumEventType.LONG_TASK:
                eventCounts.longTaskCount += 1;
                callback(eventCounts);
                break;
            case rawRumEvent_types_1.RumEventType.RESOURCE:
                eventCounts.resourceCount += 1;
                callback(eventCounts);
                break;
        }
    });
    return {
        stop: function () {
            subscription.unsubscribe();
        },
        eventCounts: eventCounts,
    };
}
exports.trackEventCounts = trackEventCounts;
//# sourceMappingURL=trackEventCounts.js.map