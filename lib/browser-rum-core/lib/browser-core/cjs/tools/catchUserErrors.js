"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchUserErrors = void 0;
var display_1 = require("./display");
function catchUserErrors(fn, errorMsg) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        try {
            return fn.apply(void 0, args);
        }
        catch (err) {
            display_1.display.error(errorMsg, err);
        }
    };
}
exports.catchUserErrors = catchUserErrors;
//# sourceMappingURL=catchUserErrors.js.map