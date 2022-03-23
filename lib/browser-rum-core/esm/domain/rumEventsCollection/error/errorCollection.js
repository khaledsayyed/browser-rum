import { __assign } from "tslib";
import { computeStackTrace, formatUnknownError, ErrorSource, generateUUID, ErrorHandling, Observable, trackConsoleError, trackRuntimeError, } from '@datadog/browser-core';
import { RumEventType } from '../../../rawRumEvent.types';
import { LifeCycleEventType } from '../../lifeCycle';
export function startErrorCollection(lifeCycle, foregroundContexts) {
    var errorObservable = new Observable();
    trackConsoleError(errorObservable);
    trackRuntimeError(errorObservable);
    errorObservable.subscribe(function (error) { return lifeCycle.notify(LifeCycleEventType.RAW_ERROR_COLLECTED, { error: error }); });
    return doStartErrorCollection(lifeCycle, foregroundContexts);
}
export function doStartErrorCollection(lifeCycle, foregroundContexts) {
    lifeCycle.subscribe(LifeCycleEventType.RAW_ERROR_COLLECTED, function (_a) {
        var error = _a.error, customerContext = _a.customerContext, savedCommonContext = _a.savedCommonContext;
        lifeCycle.notify(LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, __assign({ customerContext: customerContext,
            savedCommonContext: savedCommonContext }, processError(error, foregroundContexts)));
    });
    return {
        addError: function (_a, savedCommonContext) {
            var error = _a.error, handlingStack = _a.handlingStack, startClocks = _a.startClocks, customerContext = _a.context;
            var rawError = computeRawError(error, handlingStack, startClocks);
            lifeCycle.notify(LifeCycleEventType.RAW_ERROR_COLLECTED, {
                customerContext: customerContext,
                savedCommonContext: savedCommonContext,
                error: rawError,
            });
        },
    };
}
function computeRawError(error, handlingStack, startClocks) {
    var stackTrace = error instanceof Error ? computeStackTrace(error) : undefined;
    return __assign(__assign({ startClocks: startClocks, source: ErrorSource.CUSTOM, originalError: error }, formatUnknownError(stackTrace, error, 'Provided', handlingStack)), { handling: ErrorHandling.HANDLED });
}
function processError(error, foregroundContexts) {
    var rawRumEvent = {
        date: error.startClocks.timeStamp,
        error: {
            id: generateUUID(),
            message: error.message,
            resource: error.resource
                ? {
                    method: error.resource.method,
                    status_code: error.resource.statusCode,
                    url: error.resource.url,
                }
                : undefined,
            source: error.source,
            stack: error.stack,
            handling_stack: error.handlingStack,
            type: error.type,
            handling: error.handling,
        },
        type: RumEventType.ERROR,
    };
    var inForeground = foregroundContexts.isInForegroundAt(error.startClocks.relative);
    if (inForeground !== undefined) {
        rawRumEvent.view = { in_foreground: inForeground };
    }
    return {
        rawRumEvent: rawRumEvent,
        startTime: error.startClocks.relative,
        domainContext: {
            error: error.originalError,
        },
    };
}
//# sourceMappingURL=errorCollection.js.map