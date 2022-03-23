import { __assign } from "tslib";
import { display } from '../../tools/display';
import { toStackTraceString } from '../../tools/error';
import { assign, combine, jsonStringify } from '../../tools/utils';
import { canUseEventBridge, getEventBridge } from '../../transport';
import { computeStackTrace } from '../tracekit';
import { startMonitoringBatch } from './startMonitoringBatch';
var StatusType;
(function (StatusType) {
    StatusType["info"] = "info";
    StatusType["error"] = "error";
})(StatusType || (StatusType = {}));
var monitoringConfiguration = { maxMessagesPerPage: 0, sentMessageCount: 0 };
var onInternalMonitoringMessageCollected;
export function startInternalMonitoring(configuration) {
    var externalContextProvider;
    if (canUseEventBridge()) {
        var bridge_1 = getEventBridge();
        onInternalMonitoringMessageCollected = function (message) {
            return bridge_1.send('internal_log', withContext(message));
        };
    }
    else if (configuration.internalMonitoringEndpointBuilder) {
        var batch_1 = startMonitoringBatch(configuration);
        onInternalMonitoringMessageCollected = function (message) { return batch_1.add(withContext(message)); };
    }
    assign(monitoringConfiguration, {
        maxMessagesPerPage: configuration.maxInternalMonitoringMessagesPerPage,
        sentMessageCount: 0,
    });
    function withContext(message) {
        return combine({ date: new Date().getTime() }, externalContextProvider !== undefined ? externalContextProvider() : {}, message);
    }
    return {
        setExternalContextProvider: function (provider) {
            externalContextProvider = provider;
        },
    };
}
export function startFakeInternalMonitoring() {
    var messages = [];
    assign(monitoringConfiguration, {
        maxMessagesPerPage: Infinity,
        sentMessageCount: 0,
    });
    onInternalMonitoringMessageCollected = function (message) {
        messages.push(message);
    };
    return messages;
}
export function resetInternalMonitoring() {
    onInternalMonitoringMessageCollected = undefined;
}
export function monitored(_, __, descriptor) {
    var originalMethod = descriptor.value;
    descriptor.value = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var decorated = onInternalMonitoringMessageCollected ? monitor(originalMethod) : originalMethod;
        return decorated.apply(this, args);
    };
}
export function monitor(fn) {
    return function () {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return callMonitored(fn, this, arguments);
    }; // consider output type has input type
}
export function callMonitored(fn, context, args) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return fn.apply(context, args);
    }
    catch (e) {
        logErrorIfDebug(e);
        try {
            addMonitoringError(e);
        }
        catch (e) {
            logErrorIfDebug(e);
        }
    }
}
export function addMonitoringMessage(message, context) {
    logMessageIfDebug(message, context);
    addToMonitoring(__assign(__assign({ message: message }, context), { status: StatusType.info }));
}
export function addMonitoringError(e) {
    addToMonitoring(__assign(__assign({}, formatError(e)), { status: StatusType.error }));
}
function addToMonitoring(message) {
    if (onInternalMonitoringMessageCollected &&
        monitoringConfiguration.sentMessageCount < monitoringConfiguration.maxMessagesPerPage) {
        monitoringConfiguration.sentMessageCount += 1;
        onInternalMonitoringMessageCollected(message);
    }
}
function formatError(e) {
    if (e instanceof Error) {
        var stackTrace = computeStackTrace(e);
        return {
            error: {
                kind: stackTrace.name,
                stack: toStackTraceString(stackTrace),
            },
            message: stackTrace.message,
        };
    }
    return {
        error: {
            stack: 'Not an instance of error',
        },
        message: "Uncaught " + jsonStringify(e),
    };
}
export function setDebugMode(debugMode) {
    monitoringConfiguration.debugMode = debugMode;
}
function logErrorIfDebug(e) {
    if (monitoringConfiguration.debugMode) {
        display.error('[INTERNAL ERROR]', e);
    }
}
function logMessageIfDebug(message, context) {
    if (monitoringConfiguration.debugMode) {
        display.log('[MONITORING MESSAGE]', message, context);
    }
}
//# sourceMappingURL=internalMonitoring.js.map