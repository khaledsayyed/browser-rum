"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canUseEventBridge = exports.getEventBridge = void 0;
var __1 = require("..");
function getEventBridge() {
    var eventBridgeGlobal = getEventBridgeGlobal();
    if (!eventBridgeGlobal) {
        return;
    }
    return {
        getAllowedWebViewHosts: function () {
            return JSON.parse(eventBridgeGlobal.getAllowedWebViewHosts());
        },
        send: function (eventType, event) {
            eventBridgeGlobal.send(JSON.stringify({ eventType: eventType, event: event }));
        },
    };
}
exports.getEventBridge = getEventBridge;
function canUseEventBridge() {
    var bridge = getEventBridge();
    return !!bridge && __1.includes(bridge.getAllowedWebViewHosts(), window.location.hostname);
}
exports.canUseEventBridge = canUseEventBridge;
function getEventBridgeGlobal() {
    return __1.isExperimentalFeatureEnabled('event-bridge') ? window.DatadogEventBridge : null;
}
//# sourceMappingURL=eventBridge.js.map