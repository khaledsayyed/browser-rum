"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startActionCollection = void 0;
var tslib_1 = require("tslib");
var browser_core_1 = require("@datadog/browser-core");
var rawRumEvent_types_1 = require("../../../rawRumEvent.types");
var lifeCycle_1 = require("../../lifeCycle");
var trackActions_1 = require("./trackActions");
function startActionCollection(lifeCycle, domMutationObservable, configuration, foregroundContexts) {
    lifeCycle.subscribe(lifeCycle_1.LifeCycleEventType.AUTO_ACTION_COMPLETED, function (action) {
        return lifeCycle.notify(lifeCycle_1.LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, processAction(action, foregroundContexts));
    });
    if (configuration.trackInteractions) {
        trackActions_1.trackActions(lifeCycle, domMutationObservable, configuration);
    }
    return {
        addAction: function (action, savedCommonContext) {
            lifeCycle.notify(lifeCycle_1.LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, tslib_1.__assign({ savedCommonContext: savedCommonContext }, processAction(action, foregroundContexts)));
        },
    };
}
exports.startActionCollection = startActionCollection;
function processAction(action, foregroundContexts) {
    var autoActionProperties = isAutoAction(action)
        ? {
            action: {
                error: {
                    count: action.counts.errorCount,
                },
                id: action.id,
                loading_time: browser_core_1.toServerDuration(action.duration),
                long_task: {
                    count: action.counts.longTaskCount,
                },
                resource: {
                    count: action.counts.resourceCount,
                },
            },
        }
        : undefined;
    var customerContext = !isAutoAction(action) ? action.context : undefined;
    var actionEvent = browser_core_1.combine({
        action: {
            id: browser_core_1.generateUUID(),
            target: {
                name: action.name,
            },
            type: action.type,
        },
        date: action.startClocks.timeStamp,
        type: rawRumEvent_types_1.RumEventType.ACTION,
    }, autoActionProperties);
    var inForeground = foregroundContexts.isInForegroundAt(action.startClocks.relative);
    if (inForeground !== undefined) {
        actionEvent.view = { in_foreground: inForeground };
    }
    return {
        customerContext: customerContext,
        rawRumEvent: actionEvent,
        startTime: action.startClocks.relative,
        domainContext: isAutoAction(action) ? { event: action.event } : {},
    };
}
function isAutoAction(action) {
    return action.type !== rawRumEvent_types_1.ActionType.CUSTOM;
}
//# sourceMappingURL=actionCollection.js.map