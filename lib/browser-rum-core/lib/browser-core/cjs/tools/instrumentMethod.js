"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instrumentMethodAndCallOriginal = exports.instrumentMethod = void 0;
var internalMonitoring_1 = require("../domain/internalMonitoring");
function instrumentMethod(object, method, instrumentationFactory) {
    var original = object[method];
    var instrumentation = instrumentationFactory(original);
    var instrumentationWrapper = function () {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return instrumentation.apply(this, arguments);
    };
    object[method] = instrumentationWrapper;
    return {
        stop: function () {
            if (object[method] === instrumentationWrapper) {
                object[method] = original;
            }
            else {
                instrumentation = original;
            }
        },
    };
}
exports.instrumentMethod = instrumentMethod;
function instrumentMethodAndCallOriginal(object, method, _a) {
    var before = _a.before, after = _a.after;
    return instrumentMethod(object, method, function (original) {
        return function () {
            var args = arguments;
            var result;
            if (before) {
                internalMonitoring_1.callMonitored(before, this, args);
            }
            if (typeof original === 'function') {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                result = original.apply(this, args);
            }
            if (after) {
                internalMonitoring_1.callMonitored(after, this, args);
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return result;
        };
    });
}
exports.instrumentMethodAndCallOriginal = instrumentMethodAndCallOriginal;
//# sourceMappingURL=instrumentMethod.js.map