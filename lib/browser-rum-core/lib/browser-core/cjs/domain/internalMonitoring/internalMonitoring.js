"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDebugMode = exports.addMonitoringError = exports.addMonitoringMessage = exports.callMonitored = exports.monitor = exports.monitored = exports.resetInternalMonitoring = exports.startFakeInternalMonitoring = exports.startInternalMonitoring = void 0;
var tslib_1 = require("tslib");
var display_1 = require("../../tools/display");
var error_1 = require("../../tools/error");
var utils_1 = require("../../tools/utils");
var transport_1 = require("../../transport");
var tracekit_1 = require("../tracekit");
var startMonitoringBatch_1 = require("./startMonitoringBatch");
var StatusType;
(function (StatusType) {
    StatusType["info"] = "info";
    StatusType["error"] = "error";
})(StatusType || (StatusType = {}));
var monitoringConfiguration = { maxMessagesPerPage: 0, sentMessageCount: 0 };
var onInternalMonitoringMessageCollected;
function startInternalMonitoring(configuration) {
    var externalContextProvider;
    if (transport_1.canUseEventBridge()) {
        var bridge_1 = transport_1.getEventBridge();
        onInternalMonitoringMessageCollected = function (message) {
            return bridge_1.send('internal_log', withContext(message));
        };
    }
    else if (configuration.internalMonitoringEndpointBuilder) {
        var batch_1 = startMonitoringBatch_1.startMonitoringBatch(configuration);
        onInternalMonitoringMessageCollected = function (message) { return batch_1.add(withContext(message)); };
    }
    utils_1.assign(monitoringConfiguration, {
        maxMessagesPerPage: configuration.maxInternalMonitoringMessagesPerPage,
        sentMessageCount: 0,
    });
    function withContext(message) {
        return utils_1.combine({ date: new Date().getTime() }, externalContextProvider !== undefined ? externalContextProvider() : {}, message);
    }
    return {
        setExternalContextProvider: function (provider) {
            externalContextProvider = provider;
        },
    };
}
exports.startInternalMonitoring = startInternalMonitoring;
function startFakeInternalMonitoring() {
    var messages = [];
    utils_1.assign(monitoringConfiguration, {
        maxMessagesPerPage: Infinity,
        sentMessageCount: 0,
    });
    onInternalMonitoringMessageCollected = function (message) {
        messages.push(message);
    };
    return messages;
}
exports.startFakeInternalMonitoring = startFakeInternalMonitoring;
function resetInternalMonitoring() {
    onInternalMonitoringMessageCollected = undefined;
}
exports.resetInternalMonitoring = resetInternalMonitoring;
function monitored(_, __, descriptor) {
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
exports.monitored = monitored;
function monitor(fn) {
    return function () {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return callMonitored(fn, this, arguments);
    }; // consider output type has input type
}
exports.monitor = monitor;
function callMonitored(fn, context, args) {
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
exports.callMonitored = callMonitored;
function addMonitoringMessage(message, context) {
    logMessageIfDebug(message, context);
    addToMonitoring(tslib_1.__assign(tslib_1.__assign({ message: message }, context), { status: StatusType.info }));
}
exports.addMonitoringMessage = addMonitoringMessage;
function addMonitoringError(e) {
    addToMonitoring(tslib_1.__assign(tslib_1.__assign({}, formatError(e)), { status: StatusType.error }));
}
exports.addMonitoringError = addMonitoringError;
function addToMonitoring(message) {
    if (onInternalMonitoringMessageCollected &&
        monitoringConfiguration.sentMessageCount < monitoringConfiguration.maxMessagesPerPage) {
        monitoringConfiguration.sentMessageCount += 1;
        onInternalMonitoringMessageCollected(message);
    }
}
function formatError(e) {
    if (e instanceof Error) {
        var stackTrace = tracekit_1.computeStackTrace(e);
        return {
            error: {
                kind: stackTrace.name,
                stack: error_1.toStackTraceString(stackTrace),
            },
            message: stackTrace.message,
        };
    }
    return {
        error: {
            stack: 'Not an instance of error',
        },
        message: "Uncaught " + utils_1.jsonStringify(e),
    };
}
function setDebugMode(debugMode) {
    monitoringConfiguration.debugMode = debugMode;
}
exports.setDebugMode = setDebugMode;
function logErrorIfDebug(e) {
    if (monitoringConfiguration.debugMode) {
        display_1.display.error('[INTERNAL ERROR]', e);
    }
}
function logMessageIfDebug(message, context) {
    if (monitoringConfiguration.debugMode) {
        display_1.display.log('[MONITORING MESSAGE]', message, context);
    }
}
//# sourceMappingURL=internalMonitoring.js.map