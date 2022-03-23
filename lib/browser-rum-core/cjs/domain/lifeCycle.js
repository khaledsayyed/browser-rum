"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LifeCycle = exports.LifeCycleEventType = void 0;
var LifeCycleEventType;
(function (LifeCycleEventType) {
    LifeCycleEventType[LifeCycleEventType["PERFORMANCE_ENTRY_COLLECTED"] = 0] = "PERFORMANCE_ENTRY_COLLECTED";
    LifeCycleEventType[LifeCycleEventType["AUTO_ACTION_CREATED"] = 1] = "AUTO_ACTION_CREATED";
    LifeCycleEventType[LifeCycleEventType["AUTO_ACTION_COMPLETED"] = 2] = "AUTO_ACTION_COMPLETED";
    LifeCycleEventType[LifeCycleEventType["AUTO_ACTION_DISCARDED"] = 3] = "AUTO_ACTION_DISCARDED";
    LifeCycleEventType[LifeCycleEventType["VIEW_CREATED"] = 4] = "VIEW_CREATED";
    LifeCycleEventType[LifeCycleEventType["VIEW_UPDATED"] = 5] = "VIEW_UPDATED";
    LifeCycleEventType[LifeCycleEventType["VIEW_ENDED"] = 6] = "VIEW_ENDED";
    LifeCycleEventType[LifeCycleEventType["REQUEST_STARTED"] = 7] = "REQUEST_STARTED";
    LifeCycleEventType[LifeCycleEventType["REQUEST_COMPLETED"] = 8] = "REQUEST_COMPLETED";
    // The SESSION_EXPIRED lifecycle event has been introduced to represent when a session has expired
    // and trigger cleanup tasks related to this, prior to renewing the session. Its implementation is
    // slightly naive: it is not triggered as soon as the session is expired, but rather just before
    // notifying that the session is renewed. Thus, the session id is already set to the newly renewed
    // session.
    //
    // This implementation is "good enough" for our use-cases. Improving this is not trivial,
    // primarily because multiple instances of the SDK may be managing the same session cookie at
    // the same time, for example when using Logs and RUM on the same page, or opening multiple tabs
    // on the same domain.
    LifeCycleEventType[LifeCycleEventType["SESSION_EXPIRED"] = 9] = "SESSION_EXPIRED";
    LifeCycleEventType[LifeCycleEventType["SESSION_RENEWED"] = 10] = "SESSION_RENEWED";
    LifeCycleEventType[LifeCycleEventType["BEFORE_UNLOAD"] = 11] = "BEFORE_UNLOAD";
    LifeCycleEventType[LifeCycleEventType["RAW_RUM_EVENT_COLLECTED"] = 12] = "RAW_RUM_EVENT_COLLECTED";
    LifeCycleEventType[LifeCycleEventType["RUM_EVENT_COLLECTED"] = 13] = "RUM_EVENT_COLLECTED";
    LifeCycleEventType[LifeCycleEventType["RAW_ERROR_COLLECTED"] = 14] = "RAW_ERROR_COLLECTED";
})(LifeCycleEventType = exports.LifeCycleEventType || (exports.LifeCycleEventType = {}));
var LifeCycle = /** @class */ (function () {
    function LifeCycle() {
        this.callbacks = {};
    }
    LifeCycle.prototype.notify = function (eventType, data) {
        var eventCallbacks = this.callbacks[eventType];
        if (eventCallbacks) {
            eventCallbacks.forEach(function (callback) { return callback(data); });
        }
    };
    LifeCycle.prototype.subscribe = function (eventType, callback) {
        var _this = this;
        if (!this.callbacks[eventType]) {
            this.callbacks[eventType] = [];
        }
        this.callbacks[eventType].push(callback);
        return {
            unsubscribe: function () {
                _this.callbacks[eventType] = _this.callbacks[eventType].filter(function (other) { return callback !== other; });
            },
        };
    };
    return LifeCycle;
}());
exports.LifeCycle = LifeCycle;
//# sourceMappingURL=lifeCycle.js.map