import { addEventListener, generateUUID, clocksNow, ONE_SECOND, } from '@datadog/browser-core';
import { ActionType } from '../../../rawRumEvent.types';
import { LifeCycleEventType } from '../../lifeCycle';
import { trackEventCounts } from '../../trackEventCounts';
import { waitIdlePage } from '../../waitIdlePage';
import { getActionNameFromElement } from './getActionNameFromElement';
// Maximum duration for automatic actions
export var AUTO_ACTION_MAX_DURATION = 10 * ONE_SECOND;
export function trackActions(lifeCycle, domMutationObservable, _a) {
    var actionNameAttribute = _a.actionNameAttribute;
    var action = startActionManagement(lifeCycle, domMutationObservable);
    // New views trigger the discard of the current pending Action
    lifeCycle.subscribe(LifeCycleEventType.VIEW_CREATED, function () {
        action.discardCurrent();
    });
    var stopListener = addEventListener(window, "click" /* CLICK */, function (event) {
        if (!(event.target instanceof Element)) {
            return;
        }
        var name = getActionNameFromElement(event.target, actionNameAttribute);
        if (!name) {
            return;
        }
        action.create(ActionType.CLICK, name, event);
    }, { capture: true }).stop;
    return {
        stop: function () {
            action.discardCurrent();
            stopListener();
        },
    };
}
function startActionManagement(lifeCycle, domMutationObservable) {
    var currentAction;
    var stopWaitingIdlePage;
    return {
        create: function (type, name, event) {
            if (currentAction) {
                // Ignore any new action if another one is already occurring.
                return;
            }
            var pendingAutoAction = new PendingAutoAction(lifeCycle, type, name, event);
            currentAction = pendingAutoAction;
            (stopWaitingIdlePage = waitIdlePage(lifeCycle, domMutationObservable, function (event) {
                if (event.hadActivity && event.duration >= 0) {
                    pendingAutoAction.complete(event.duration);
                }
                else {
                    pendingAutoAction.discard();
                }
                currentAction = undefined;
            }, AUTO_ACTION_MAX_DURATION).stop);
        },
        discardCurrent: function () {
            if (currentAction) {
                stopWaitingIdlePage();
                currentAction.discard();
                currentAction = undefined;
            }
        },
    };
}
var PendingAutoAction = /** @class */ (function () {
    function PendingAutoAction(lifeCycle, type, name, event) {
        this.lifeCycle = lifeCycle;
        this.type = type;
        this.name = name;
        this.event = event;
        this.id = generateUUID();
        this.startClocks = clocksNow();
        this.eventCountsSubscription = trackEventCounts(lifeCycle);
        this.lifeCycle.notify(LifeCycleEventType.AUTO_ACTION_CREATED, { id: this.id, startClocks: this.startClocks });
    }
    PendingAutoAction.prototype.complete = function (duration) {
        var eventCounts = this.eventCountsSubscription.eventCounts;
        this.lifeCycle.notify(LifeCycleEventType.AUTO_ACTION_COMPLETED, {
            counts: {
                errorCount: eventCounts.errorCount,
                longTaskCount: eventCounts.longTaskCount,
                resourceCount: eventCounts.resourceCount,
            },
            duration: duration,
            id: this.id,
            name: this.name,
            startClocks: this.startClocks,
            type: this.type,
            event: this.event,
        });
        this.eventCountsSubscription.stop();
    };
    PendingAutoAction.prototype.discard = function () {
        this.lifeCycle.notify(LifeCycleEventType.AUTO_ACTION_DISCARDED);
        this.eventCountsSubscription.stop();
    };
    return PendingAutoAction;
}());
//# sourceMappingURL=trackActions.js.map