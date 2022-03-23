"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRumEventBridge = void 0;
var browser_core_1 = require("@datadog/browser-core");
var lifeCycle_1 = require("../domain/lifeCycle");
function startRumEventBridge(lifeCycle) {
    var bridge = browser_core_1.getEventBridge();
    lifeCycle.subscribe(lifeCycle_1.LifeCycleEventType.RUM_EVENT_COLLECTED, function (serverRumEvent) {
        bridge.send(serverRumEvent.type, serverRumEvent);
    });
}
exports.startRumEventBridge = startRumEventBridge;
//# sourceMappingURL=startRumEventBridge.js.map