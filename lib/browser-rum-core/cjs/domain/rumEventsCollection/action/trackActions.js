"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackActions = exports.AUTO_ACTION_MAX_DURATION = void 0;
var browser_core_1 = require("@datadog/browser-core");
var rawRumEvent_types_1 = require("../../../rawRumEvent.types");
var lifeCycle_1 = require("../../lifeCycle");
var trackEventCounts_1 = require("../../trackEventCounts");
var waitIdlePage_1 = require("../../waitIdlePage");
var getActionNameFromElement_1 = require("./getActionNameFromElement");
// Maximum duration for automatic actions
exports.AUTO_ACTION_MAX_DURATION = 10 * browser_core_1.ONE_SECOND;
function trackActions(lifeCycle, domMutationObservable, _a) {
    var actionNameAttribute = _a.actionNameAttribute;
    var action = startActionManagement(lifeCycle, domMutationObservable);
    // New views trigger the discard of the current pending Action
    lifeCycle.subscribe(lifeCycle_1.LifeCycleEventType.VIEW_CREATED, function () {
        action.discardCurrent();
    });
    var stopListener = browser_core_1.addEventListener(window, "click" /* CLICK */, function (event) {
        if (!(event.target instanceof Element)) {
            return;
        }
        var name = getActionNameFromElement_1.getActionNameFromElement(event.target, actionNameAttribute);
        if (!name) {
            return;
        }
        action.create(rawRumEvent_types_1.ActionType.CLICK, name, event);
    }, { capture: true }).stop;
    return {
        stop: function () {
            action.discardCurrent();
            stopListener();
        },
    };
}
exports.trackActions = trackActions;
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
            (stopWaitingIdlePage = waitIdlePage_1.waitIdlePage(lifeCycle, domMutationObservable, function (event) {
                if (event.hadActivity && event.duration >= 0) {
                    pendingAutoAction.complete(event.duration);
                }
                else {
                    pendingAutoAction.discard();
                }
                currentAction = undefined;
            }, exports.AUTO_ACTION_MAX_DURATION).stop);
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
        this.id = browser_core_1.generateUUID();
        this.startClocks = browser_core_1.clocksNow();
        this.eventCountsSubscription = trackEventCounts_1.trackEventCounts(lifeCycle);
        this.lifeCycle.notify(lifeCycle_1.LifeCycleEventType.AUTO_ACTION_CREATED, { id: this.id, startClocks: this.startClocks });
    }
    PendingAutoAction.prototype.complete = function (duration) {
        var eventCounts = this.eventCountsSubscription.eventCounts;
        this.lifeCycle.notify(lifeCycle_1.LifeCycleEventType.AUTO_ACTION_COMPLETED, {
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
        this.lifeCycle.notify(lifeCycle_1.LifeCycleEventType.AUTO_ACTION_DISCARDED);
        this.eventCountsSubscription.stop();
    };
    return PendingAutoAction;
}());
//# sourceMappingURL=trackActions.js.map