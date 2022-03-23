import { ErrorSource, ErrorHandling, formatUnknownError } from '../../tools/error';
import { clocksNow } from '../../tools/timeUtils';
import { startUnhandledErrorCollection } from '../tracekit';
export function trackRuntimeError(errorObservable) {
    return startUnhandledErrorCollection(function (stackTrace, errorObject) {
        var _a = formatUnknownError(stackTrace, errorObject, 'Uncaught'), stack = _a.stack, message = _a.message, type = _a.type;
        errorObservable.notify({
            message: message,
            stack: stack,
            type: type,
            source: ErrorSource.SOURCE,
            startClocks: clocksNow(),
            originalError: errorObject,
            handling: ErrorHandling.UNHANDLED,
        });
    });
}
//# sourceMappingURL=trackRuntimeError.js.map