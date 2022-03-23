import { instrumentMethodAndCallOriginal } from '../../tools/instrumentMethod';
import { computeStackTrace } from './computeStackTrace';
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Error_types
// eslint-disable-next-line  max-len
var ERROR_TYPES_RE = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/;
/**
 * Cross-browser collection of unhandled errors
 *
 * Supports:
 * - Firefox: full stack trace with line numbers, plus column number
 * on top frame; column number is not guaranteed
 * - Opera: full stack trace with line and column numbers
 * - Chrome: full stack trace with line and column numbers
 * - Safari: line and column number for the top frame only; some frames
 * may be missing, and column number is not guaranteed
 * - IE: line and column number for the top frame only; some frames
 * may be missing, and column number is not guaranteed
 *
 * In theory, TraceKit should work on all of the following versions:
 * - IE5.5+ (only 8.0 tested)
 * - Firefox 0.9+ (only 3.5+ tested)
 * - Opera 7+ (only 10.50 tested; versions 9 and earlier may require
 * Exceptions Have Stacktrace to be enabled in opera:config)
 * - Safari 3+ (only 4+ tested)
 * - Chrome 1+ (only 5+ tested)
 * - Konqueror 3.5+ (untested)
 *
 * Tries to catch all unhandled errors and report them to the
 * callback.
 *
 * Callbacks receive a StackTrace object as described in the
 * computeStackTrace docs.
 *
 * @memberof TraceKit
 * @namespace
 */
export function startUnhandledErrorCollection(callback) {
    var stopInstrumentingOnError = instrumentOnError(callback).stop;
    var stopInstrumentingOnUnhandledRejection = instrumentUnhandledRejection(callback).stop;
    return {
        stop: function () {
            stopInstrumentingOnError();
            stopInstrumentingOnUnhandledRejection();
        },
    };
}
/**
 * Install a global onerror handler
 */
function instrumentOnError(callback) {
    return instrumentMethodAndCallOriginal(window, 'onerror', {
        before: function (message, url, lineNo, columnNo, errorObj) {
            var stack;
            if (errorObj) {
                stack = computeStackTrace(errorObj);
                callback(stack, errorObj);
            }
            else {
                var location_1 = {
                    url: url,
                    column: columnNo,
                    line: lineNo,
                };
                var name_1;
                var msg = message;
                if ({}.toString.call(message) === '[object String]') {
                    var groups = ERROR_TYPES_RE.exec(msg);
                    if (groups) {
                        name_1 = groups[1];
                        msg = groups[2];
                    }
                }
                stack = {
                    name: name_1,
                    message: typeof msg === 'string' ? msg : undefined,
                    stack: [location_1],
                };
                callback(stack, message);
            }
        },
    });
}
/**
 * Install a global onunhandledrejection handler
 */
function instrumentUnhandledRejection(callback) {
    return instrumentMethodAndCallOriginal(window, 'onunhandledrejection', {
        before: function (e) {
            var reason = e.reason || 'Empty reason';
            var stack = computeStackTrace(reason);
            callback(stack, reason);
        },
    });
}
//# sourceMappingURL=tracekit.js.map