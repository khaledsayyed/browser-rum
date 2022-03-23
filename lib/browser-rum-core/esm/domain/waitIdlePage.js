import { elapsed, monitor, Observable, timeStampNow } from '@datadog/browser-core';
import { LifeCycleEventType } from './lifeCycle';
// Delay to wait for a page activity to validate the tracking process
export var PAGE_ACTIVITY_VALIDATION_DELAY = 100;
// Delay to wait after a page activity to end the tracking process
export var PAGE_ACTIVITY_END_DELAY = 100;
/**
 * Wait for the next idle page time
 *
 * Detection lifecycle:
 * ```
 *                           Wait idle page
 *              .-------------------'--------------------.
 *              v                                        v
 *     [Wait for a page activity ]          [Wait for a maximum duration]
 *     [timeout: VALIDATION_DELAY]          [  timeout: maxDuration     ]
 *          /                  \                           |
 *         v                    v                          |
 *  [No page activity]   [Page activity]                   |
 *         |                   |,----------------------.   |
 *         v                   v                       |   |
 *     (Discard)     [Wait for a page activity]        |   |
 *                   [   timeout: END_DELAY   ]        |   |
 *                       /                \            |   |
 *                      v                  v           |   |
 *             [No page activity]    [Page activity]   |   |
 *                      |                 |            |   |
 *                      |                 '------------'   |
 *                      '-----------. ,--------------------'
 *                                   v
 *                                 (End)
 * ```
 *
 * Note: by assuming that maxDuration is greater than VALIDATION_DELAY, we are sure that if the
 * process is still alive after maxDuration, it has been validated.
 */
export function waitIdlePage(lifeCycle, domMutationObservable, idlePageCallback, maxDuration) {
    var pageActivityObservable = createPageActivityObservable(lifeCycle, domMutationObservable);
    return doWaitIdlePage(pageActivityObservable, idlePageCallback, maxDuration);
}
export function doWaitIdlePage(pageActivityObservable, idlePageCallback, maxDuration) {
    var idleTimeoutId;
    var hasCompleted = false;
    var startTime = timeStampNow();
    var validationTimeoutId = setTimeout(monitor(function () { return complete({ hadActivity: false }); }), PAGE_ACTIVITY_VALIDATION_DELAY);
    var maxDurationTimeoutId = maxDuration &&
        setTimeout(monitor(function () { return complete({ hadActivity: true, duration: elapsed(startTime, timeStampNow()) }); }), maxDuration);
    var pageActivitySubscription = pageActivityObservable.subscribe(function (_a) {
        var isBusy = _a.isBusy;
        clearTimeout(validationTimeoutId);
        clearTimeout(idleTimeoutId);
        var lastChangeTime = timeStampNow();
        if (!isBusy) {
            idleTimeoutId = setTimeout(monitor(function () { return complete({ hadActivity: true, duration: elapsed(startTime, lastChangeTime) }); }), PAGE_ACTIVITY_END_DELAY);
        }
    });
    var stop = function () {
        hasCompleted = true;
        clearTimeout(validationTimeoutId);
        clearTimeout(idleTimeoutId);
        clearTimeout(maxDurationTimeoutId);
        pageActivitySubscription.unsubscribe();
    };
    function complete(event) {
        if (hasCompleted) {
            return;
        }
        stop();
        idlePageCallback(event);
    }
    return { stop: stop };
}
export function createPageActivityObservable(lifeCycle, domMutationObservable) {
    var observable = new Observable(function () {
        var subscriptions = [];
        var firstRequestIndex;
        var pendingRequestsCount = 0;
        subscriptions.push(domMutationObservable.subscribe(function () { return notifyPageActivity(pendingRequestsCount); }), lifeCycle.subscribe(LifeCycleEventType.PERFORMANCE_ENTRY_COLLECTED, function (entry) {
            if (entry.entryType !== 'resource') {
                return;
            }
            notifyPageActivity(pendingRequestsCount);
        }), lifeCycle.subscribe(LifeCycleEventType.REQUEST_STARTED, function (startEvent) {
            if (firstRequestIndex === undefined) {
                firstRequestIndex = startEvent.requestIndex;
            }
            notifyPageActivity(++pendingRequestsCount);
        }), lifeCycle.subscribe(LifeCycleEventType.REQUEST_COMPLETED, function (request) {
            // If the request started before the tracking start, ignore it
            if (firstRequestIndex === undefined || request.requestIndex < firstRequestIndex) {
                return;
            }
            notifyPageActivity(--pendingRequestsCount);
        }));
        return function () { return subscriptions.forEach(function (s) { return s.unsubscribe(); }); };
    });
    function notifyPageActivity(pendingRequestsCount) {
        observable.notify({ isBusy: pendingRequestsCount > 0 });
    }
    return observable;
}
//# sourceMappingURL=waitIdlePage.js.map