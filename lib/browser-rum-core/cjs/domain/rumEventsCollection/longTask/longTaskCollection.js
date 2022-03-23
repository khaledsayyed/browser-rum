"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startLongTaskCollection = void 0;
var browser_core_1 = require("@datadog/browser-core");
var rawRumEvent_types_1 = require("../../../rawRumEvent.types");
var lifeCycle_1 = require("../../lifeCycle");
function startLongTaskCollection(lifeCycle, sessionManager) {
    lifeCycle.subscribe(lifeCycle_1.LifeCycleEventType.PERFORMANCE_ENTRY_COLLECTED, function (entry) {
        if (entry.entryType !== 'longtask') {
            return;
        }
        var session = sessionManager.findTrackedSession(entry.startTime);
        if (!session || session.hasLitePlan) {
            return;
        }
        var startClocks = browser_core_1.relativeToClocks(entry.startTime);
        var rawRumEvent = {
            date: startClocks.timeStamp,
            long_task: {
                id: browser_core_1.generateUUID(),
                duration: browser_core_1.toServerDuration(entry.duration),
            },
            type: rawRumEvent_types_1.RumEventType.LONG_TASK,
        };
        lifeCycle.notify(lifeCycle_1.LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, {
            rawRumEvent: rawRumEvent,
            startTime: startClocks.relative,
            domainContext: { performanceEntry: entry.toJSON() },
        });
    });
}
exports.startLongTaskCollection = startLongTaskCollection;
//# sourceMappingURL=longTaskCollection.js.map