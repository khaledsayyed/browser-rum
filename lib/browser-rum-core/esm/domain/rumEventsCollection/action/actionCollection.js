import { __assign } from "tslib";
import { combine, toServerDuration, generateUUID } from '@datadog/browser-core';
import { ActionType, RumEventType } from '../../../rawRumEvent.types';
import { LifeCycleEventType } from '../../lifeCycle';
import { trackActions } from './trackActions';
export function startActionCollection(lifeCycle, domMutationObservable, configuration, foregroundContexts) {
    lifeCycle.subscribe(LifeCycleEventType.AUTO_ACTION_COMPLETED, function (action) {
        return lifeCycle.notify(LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, processAction(action, foregroundContexts));
    });
    if (configuration.trackInteractions) {
        trackActions(lifeCycle, domMutationObservable, configuration);
    }
    return {
        addAction: function (action, savedCommonContext) {
            lifeCycle.notify(LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, __assign({ savedCommonContext: savedCommonContext }, processAction(action, foregroundContexts)));
        },
    };
}
function processAction(action, foregroundContexts) {
    var autoActionProperties = isAutoAction(action)
        ? {
            action: {
                error: {
                    count: action.counts.errorCount,
                },
                id: action.id,
                loading_time: toServerDuration(action.duration),
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
    var actionEvent = combine({
        action: {
            id: generateUUID(),
            target: {
                name: action.name,
            },
            type: action.type,
        },
        date: action.startClocks.timeStamp,
        type: RumEventType.ACTION,
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
    return action.type !== ActionType.CUSTOM;
}
//# sourceMappingURL=actionCollection.js.map