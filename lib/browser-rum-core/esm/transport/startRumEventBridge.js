import { getEventBridge } from '@datadog/browser-core';
import { LifeCycleEventType } from '../domain/lifeCycle';
export function startRumEventBridge(lifeCycle) {
    var bridge = getEventBridge();
    lifeCycle.subscribe(LifeCycleEventType.RUM_EVENT_COLLECTED, function (serverRumEvent) {
        bridge.send(serverRumEvent.type, serverRumEvent);
    });
}
//# sourceMappingURL=startRumEventBridge.js.map