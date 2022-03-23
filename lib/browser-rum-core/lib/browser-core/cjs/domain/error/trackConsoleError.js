"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetConsoleErrorProxy = exports.trackConsoleError = void 0;
var tslib_1 = require("tslib");
var error_1 = require("../../tools/error");
var observable_1 = require("../../tools/observable");
var timeUtils_1 = require("../../tools/timeUtils");
var utils_1 = require("../../tools/utils");
var internalMonitoring_1 = require("../internalMonitoring");
var tracekit_1 = require("../tracekit");
/* eslint-disable no-console */
function trackConsoleError(errorObservable) {
    startConsoleErrorProxy().subscribe(function (error) { return errorObservable.notify(error); });
}
exports.trackConsoleError = trackConsoleError;
var originalConsoleError;
var consoleErrorObservable;
function startConsoleErrorProxy() {
    if (!consoleErrorObservable) {
        consoleErrorObservable = new observable_1.Observable();
        originalConsoleError = console.error;
        console.error = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            var handlingStack = error_1.createHandlingStack();
            internalMonitoring_1.callMonitored(function () {
                originalConsoleError.apply(console, params);
                var rawError = tslib_1.__assign(tslib_1.__assign({}, buildErrorFromParams(params, handlingStack)), { source: error_1.ErrorSource.CONSOLE, startClocks: timeUtils_1.clocksNow(), handling: error_1.ErrorHandling.HANDLED });
                consoleErrorObservable.notify(rawError);
            });
        };
    }
    return consoleErrorObservable;
}
function resetConsoleErrorProxy() {
    if (consoleErrorObservable) {
        consoleErrorObservable = undefined;
        console.error = originalConsoleError;
    }
}
exports.resetConsoleErrorProxy = resetConsoleErrorProxy;
function buildErrorFromParams(params, handlingStack) {
    var firstErrorParam = utils_1.find(params, function (param) { return param instanceof Error; });
    return {
        message: tslib_1.__spreadArrays(['console error:'], params).map(function (param) { return formatConsoleParameters(param); }).join(' '),
        stack: firstErrorParam ? error_1.toStackTraceString(tracekit_1.computeStackTrace(firstErrorParam)) : undefined,
        handlingStack: handlingStack,
    };
}
function formatConsoleParameters(param) {
    if (typeof param === 'string') {
        return param;
    }
    if (param instanceof Error) {
        return error_1.formatErrorMessage(tracekit_1.computeStackTrace(param));
    }
    return utils_1.jsonStringify(param, undefined, 2);
}
//# sourceMappingURL=trackConsoleError.js.map