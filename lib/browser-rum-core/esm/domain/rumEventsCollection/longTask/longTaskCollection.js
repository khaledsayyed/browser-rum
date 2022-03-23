import { toServerDuration, relativeToClocks, generateUUID } from '@datadog/browser-core';
import { RumEventType } from '../../../rawRumEvent.types';
import { LifeCycleEventType } from '../../lifeCycle';
export function startLongTaskCollection(lifeCycle, sessionManager) {
    lifeCycle.subscribe(LifeCycleEventType.PERFORMANCE_ENTRY_COLLECTED, function (entry) {
        if (entry.entryType !== 'longtask') {
            return;
        }
        var session = sessionManager.findTrackedSession(entry.startTime);
        if (!session || session.hasLitePlan) {
            return;
        }
        var startClocks = relativeToClocks(entry.startTime);
        var rawRumEvent = {
            date: startClocks.timeStamp,
            long_task: {
                id: generateUUID(),
                duration: toServerDuration(entry.duration),
            },
            type: RumEventType.LONG_TASK,
        };
        lifeCycle.notify(LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, {
            rawRumEvent: rawRumEvent,
            startTime: startClocks.relative,
            domainContext: { performanceEntry: entry.toJSON() },
        });
    });
}
//# sourceMappingURL=longTaskCollection.js.map