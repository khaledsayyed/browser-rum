"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHandlingStack = exports.formatErrorMessage = exports.toStackTraceString = exports.formatUnknownError = exports.ErrorHandling = exports.ErrorSource = void 0;
var internalMonitoring_1 = require("../domain/internalMonitoring");
var tracekit_1 = require("../domain/tracekit");
var utils_1 = require("./utils");
exports.ErrorSource = {
    AGENT: 'agent',
    CONSOLE: 'console',
    CUSTOM: 'custom',
    LOGGER: 'logger',
    NETWORK: 'network',
    SOURCE: 'source',
};
var ErrorHandling;
(function (ErrorHandling) {
    ErrorHandling["HANDLED"] = "handled";
    ErrorHandling["UNHANDLED"] = "unhandled";
})(ErrorHandling = exports.ErrorHandling || (exports.ErrorHandling = {}));
function formatUnknownError(stackTrace, errorObject, nonErrorPrefix, handlingStack) {
    if (!stackTrace || (stackTrace.message === undefined && !(errorObject instanceof Error))) {
        return {
            message: nonErrorPrefix + " " + utils_1.jsonStringify(errorObject),
            stack: 'No stack, consider using an instance of Error',
            handlingStack: handlingStack,
            type: stackTrace && stackTrace.name,
        };
    }
    return {
        message: stackTrace.message || 'Empty message',
        stack: toStackTraceString(stackTrace),
        handlingStack: handlingStack,
        type: stackTrace.name,
    };
}
exports.formatUnknownError = formatUnknownError;
function toStackTraceString(stack) {
    var result = formatErrorMessage(stack);
    stack.stack.forEach(function (frame) {
        var func = frame.func === '?' ? '<anonymous>' : frame.func;
        var args = frame.args && frame.args.length > 0 ? "(" + frame.args.join(', ') + ")" : '';
        var line = frame.line ? ":" + frame.line : '';
        var column = frame.line && frame.column ? ":" + frame.column : '';
        result += "\n  at " + func + args + " @ " + frame.url + line + column;
    });
    return result;
}
exports.toStackTraceString = toStackTraceString;
function formatErrorMessage(stack) {
    return (stack.name || 'Error') + ": " + stack.message;
}
exports.formatErrorMessage = formatErrorMessage;
/**
 Creates a stacktrace without SDK internal frames.
 
 Constraints:
 - Has to be called at the utmost position of the call stack.
 - No internal monitoring should encapsulate the function, that is why we need to use callMonitored inside of it.
 */
function createHandlingStack() {
    /**
     * Skip the two internal frames:
     * - SDK API (console.error, ...)
     * - this function
     * in order to keep only the user calls
     */
    var internalFramesToSkip = 2;
    var error = new Error();
    var formattedStack;
    // IE needs to throw the error to fill in the stack trace
    if (!error.stack) {
        try {
            throw error;
        }
        catch (e) {
            utils_1.noop();
        }
    }
    internalMonitoring_1.callMonitored(function () {
        var stackTrace = tracekit_1.computeStackTrace(error);
        stackTrace.stack = stackTrace.stack.slice(internalFramesToSkip);
        formattedStack = toStackTraceString(stackTrace);
    });
    return formattedStack;
}
exports.createHandlingStack = createHandlingStack;
//# sourceMappingURL=error.js.map