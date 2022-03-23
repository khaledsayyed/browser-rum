"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doStartErrorCollection = exports.startErrorCollection = void 0;
var tslib_1 = require("tslib");
var browser_core_1 = require("@datadog/browser-core");
var rawRumEvent_types_1 = require("../../../rawRumEvent.types");
var lifeCycle_1 = require("../../lifeCycle");
function startErrorCollection(lifeCycle, foregroundContexts) {
    var errorObservable = new browser_core_1.Observable();
    browser_core_1.trackConsoleError(errorObservable);
    browser_core_1.trackRuntimeError(errorObservable);
    errorObservable.subscribe(function (error) { return lifeCycle.notify(lifeCycle_1.LifeCycleEventType.RAW_ERROR_COLLECTED, { error: error }); });
    return doStartErrorCollection(lifeCycle, foregroundContexts);
}
exports.startErrorCollection = startErrorCollection;
function doStartErrorCollection(lifeCycle, foregroundContexts) {
    lifeCycle.subscribe(lifeCycle_1.LifeCycleEventType.RAW_ERROR_COLLECTED, function (_a) {
        var error = _a.error, customerContext = _a.customerContext, savedCommonContext = _a.savedCommonContext;
        lifeCycle.notify(lifeCycle_1.LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, tslib_1.__assign({ customerContext: customerContext,
            savedCommonContext: savedCommonContext }, processError(error, foregroundContexts)));
    });
    return {
        addError: function (_a, savedCommonContext) {
            var error = _a.error, handlingStack = _a.handlingStack, startClocks = _a.startClocks, customerContext = _a.context;
            var rawError = computeRawError(error, handlingStack, startClocks);
            lifeCycle.notify(lifeCycle_1.LifeCycleEventType.RAW_ERROR_COLLECTED, {
                customerContext: customerContext,
                savedCommonContext: savedCommonContext,
                error: rawError,
            });
        },
    };
}
exports.doStartErrorCollection = doStartErrorCollection;
function computeRawError(error, handlingStack, startClocks) {
    var stackTrace = error instanceof Error ? browser_core_1.computeStackTrace(error) : undefined;
    return tslib_1.__assign(tslib_1.__assign({ startClocks: startClocks, source: browser_core_1.ErrorSource.CUSTOM, originalError: error }, browser_core_1.formatUnknownError(stackTrace, error, 'Provided', handlingStack)), { handling: browser_core_1.ErrorHandling.HANDLED });
}
function processError(error, foregroundContexts) {
    var rawRumEvent = {
        date: error.startClocks.timeStamp,
        error: {
            id: browser_core_1.generateUUID(),
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
        type: rawRumEvent_types_1.RumEventType.ERROR,
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