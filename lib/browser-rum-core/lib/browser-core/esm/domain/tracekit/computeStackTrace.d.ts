import { StackTrace } from './types';
/**
 * computeStackTrace: cross-browser stack traces in JavaScript
 *
 * Syntax:
 * ```js
 * s = computeStackTraceOfCaller([depth])
 * s = computeStackTrace(exception)
 * ```
 *
 * Supports:
 *   - Firefox:  full stack trace with line numbers and unreliable column
 *               number on top frame
 *   - Opera 10: full stack trace with line and column numbers
 *   - Opera 9-: full stack trace with line numbers
 *   - Chrome:   full stack trace with line and column numbers
 *   - Safari:   line and column number for the topmost stacktrace element
 *               only
 *   - IE:       no line numbers whatsoever
 *
 * Tries to guess names of anonymous functions by looking for assignments
 * in the source code. In IE and Safari, we have to guess source file names
 * by searching for function bodies inside all page scripts. This will not
 * work for scripts that are loaded cross-domain.
 * Here be dragons: some function names may be guessed incorrectly, and
 * duplicate functions may be mismatched.
 *
 * computeStackTrace should only be used for tracing purposes.
 *
 * Note: In IE and Safari, no stack trace is recorded on the Error object,
 * so computeStackTrace instead walks its *own* chain of callers.
 * This means that:
 *  * in Safari, some methods may be missing from the stack trace;
 *  * in IE, the topmost function in the stack trace will always be the
 *    caller of computeStackTrace.
 *
 * This is okay for tracing (because you are likely to be calling
 * computeStackTrace from the function you want to be the topmost element
 * of the stack trace anyway), but not okay for logging unhandled
 * exceptions (because your catch block will likely be far away from the
 * inner function that actually caused the exception).
 *
 * Tracing example:
 * ```js
 *     function trace(message) {
 *         let stackInfo = computeStackTrace.ofCaller();
 *         let data = message + "\n";
 *         for(let i in stackInfo.stack) {
 *             let item = stackInfo.stack[i];
 *             data += (item.func || '[anonymous]') + "() in " + item.url + ":" + (item.line || '0') + "\n";
 *         }
 *         if (window.console)
 *             console.info(data);
 *         else
 *             alert(data);
 *     }
 * ```
 * @memberof TraceKit
 * @namespace
 */
/**
 * Computes a stack trace for an exception.
 * @param {Error} ex
 * @param {(string|number)=} depth
 * @memberof computeStackTrace
 */
export declare function computeStackTrace(ex: unknown, depth?: string | number): StackTrace;
/**
 * Computes stack trace information from the stack property.
 * Chrome and Gecko use this property.
 * @param {Error} ex
 * @return {?StackTrace} Stack trace information.
 * @memberof computeStackTrace
 */
export declare function computeStackTraceFromStackProp(ex: unknown): {
    stack: {
        args: string[];
        column: number | undefined;
        func: string;
        line: number | undefined;
        url: string | undefined;
    }[];
    message: string | undefined;
    name: string | undefined;
} | undefined;
/**
 * Logs a stacktrace starting from the previous call and working down.
 * @param {(number|string)=} depth How many frames deep to trace.
 * @return {StackTrace} Stack trace information.
 * @memberof computeStackTrace
 */
export declare function computeStackTraceOfCaller(depth?: number): StackTrace;
