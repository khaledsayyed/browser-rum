"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionType = exports.ViewLoadingType = exports.RumEventType = void 0;
var RumEventType;
(function (RumEventType) {
    RumEventType["ACTION"] = "action";
    RumEventType["ERROR"] = "error";
    RumEventType["LONG_TASK"] = "long_task";
    RumEventType["VIEW"] = "view";
    RumEventType["RESOURCE"] = "resource";
})(RumEventType = exports.RumEventType || (exports.RumEventType = {}));
var ViewLoadingType;
(function (ViewLoadingType) {
    ViewLoadingType["INITIAL_LOAD"] = "initial_load";
    ViewLoadingType["ROUTE_CHANGE"] = "route_change";
})(ViewLoadingType = exports.ViewLoadingType || (exports.ViewLoadingType = {}));
var ActionType;
(function (ActionType) {
    ActionType["CLICK"] = "click";
    ActionType["CUSTOM"] = "custom";
})(ActionType = exports.ActionType || (exports.ActionType = {}));
//# sourceMappingURL=rawRumEvent.types.js.map