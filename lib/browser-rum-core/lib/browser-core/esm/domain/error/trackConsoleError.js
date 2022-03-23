import { __assign, __spreadArrays } from "tslib";
import { ErrorSource, toStackTraceString, ErrorHandling, createHandlingStack, formatErrorMessage, } from '../../tools/error';
import { Observable } from '../../tools/observable';
import { clocksNow } from '../../tools/timeUtils';
import { find, jsonStringify } from '../../tools/utils';
import { callMonitored } from '../internalMonitoring';
import { computeStackTrace } from '../tracekit';
/* eslint-disable no-console */
export function trackConsoleError(errorObservable) {
    startConsoleErrorProxy().subscribe(function (error) { return errorObservable.notify(error); });
}
var originalConsoleError;
var consoleErrorObservable;
function startConsoleErrorProxy() {
    if (!consoleErrorObservable) {
        consoleErrorObservable = new Observable();
        originalConsoleError = console.error;
        console.error = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            var handlingStack = createHandlingStack();
            callMonitored(function () {
                originalConsoleError.apply(console, params);
                var rawError = __assign(__assign({}, buildErrorFromParams(params, handlingStack)), { source: ErrorSource.CONSOLE, startClocks: clocksNow(), handling: ErrorHandling.HANDLED });
                consoleErrorObservable.notify(rawError);
            });
        };
    }
    return consoleErrorObservable;
}
export function resetConsoleErrorProxy() {
    if (consoleErrorObservable) {
        consoleErrorObservable = undefined;
        console.error = originalConsoleError;
    }
}
function buildErrorFromParams(params, handlingStack) {
    var firstErrorParam = find(params, function (param) { return param instanceof Error; });
    return {
        message: __spreadArrays(['console error:'], params).map(function (param) { return formatConsoleParameters(param); }).join(' '),
        stack: firstErrorParam ? toStackTraceString(computeStackTrace(firstErrorParam)) : undefined,
        handlingStack: handlingStack,
    };
}
function formatConsoleParameters(param) {
    if (typeof param === 'string') {
        return param;
    }
    if (param instanceof Error) {
        return formatErrorMessage(computeStackTrace(param));
    }
    return jsonStringify(param, undefined, 2);
}
//# sourceMappingURL=trackConsoleError.js.map