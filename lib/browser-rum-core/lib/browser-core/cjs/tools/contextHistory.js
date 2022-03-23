"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextHistory = exports.CLEAR_OLD_CONTEXTS_INTERVAL = void 0;
var timeUtils_1 = require("./timeUtils");
var utils_1 = require("./utils");
exports.CLEAR_OLD_CONTEXTS_INTERVAL = utils_1.ONE_MINUTE;
var ContextHistory = /** @class */ (function () {
    function ContextHistory(expireDelay) {
        var _this = this;
        this.expireDelay = expireDelay;
        this.previousContexts = [];
        this.clearOldContextsInterval = setInterval(function () { return _this.clearOldContexts(); }, exports.CLEAR_OLD_CONTEXTS_INTERVAL);
    }
    ContextHistory.prototype.find = function (startTime) {
        if (startTime === undefined ||
            (this.current !== undefined && this.currentStart !== undefined && startTime >= this.currentStart)) {
            return this.current;
        }
        for (var _i = 0, _a = this.previousContexts; _i < _a.length; _i++) {
            var previousContext = _a[_i];
            if (startTime > previousContext.endTime) {
                break;
            }
            if (startTime >= previousContext.startTime) {
                return previousContext.context;
            }
        }
        return undefined;
    };
    ContextHistory.prototype.setCurrent = function (current, startTime) {
        this.current = current;
        this.currentStart = startTime;
    };
    ContextHistory.prototype.getCurrent = function () {
        return this.current;
    };
    ContextHistory.prototype.clearCurrent = function () {
        this.current = undefined;
        this.currentStart = undefined;
    };
    ContextHistory.prototype.closeCurrent = function (endTime) {
        if (this.current !== undefined && this.currentStart !== undefined) {
            this.previousContexts.unshift({
                endTime: endTime,
                context: this.current,
                startTime: this.currentStart,
            });
            this.clearCurrent();
        }
    };
    ContextHistory.prototype.clearOldContexts = function () {
        var oldTimeThreshold = timeUtils_1.relativeNow() - this.expireDelay;
        while (this.previousContexts.length > 0 &&
            this.previousContexts[this.previousContexts.length - 1].startTime < oldTimeThreshold) {
            this.previousContexts.pop();
        }
    };
    ContextHistory.prototype.reset = function () {
        this.clearCurrent();
        this.previousContexts = [];
    };
    ContextHistory.prototype.stop = function () {
        clearInterval(this.clearOldContextsInterval);
    };
    return ContextHistory;
}());
exports.ContextHistory = ContextHistory;
//# sourceMappingURL=contextHistory.js.map