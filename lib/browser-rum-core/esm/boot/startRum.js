import { combine, canUseEventBridge } from '@datadog/browser-core';
import { createDOMMutationObservable } from '../browser/domMutationObservable';
import { startPerformanceCollection } from '../browser/performanceCollection';
import { startRumAssembly } from '../domain/assembly';
import { startForegroundContexts } from '../domain/foregroundContexts';
import { startInternalContext } from '../domain/internalContext';
import { LifeCycle } from '../domain/lifeCycle';
import { startParentContexts } from '../domain/parentContexts';
import { startRequestCollection } from '../domain/requestCollection';
import { startActionCollection } from '../domain/rumEventsCollection/action/actionCollection';
import { startErrorCollection } from '../domain/rumEventsCollection/error/errorCollection';
import { startLongTaskCollection } from '../domain/rumEventsCollection/longTask/longTaskCollection';
import { startResourceCollection } from '../domain/rumEventsCollection/resource/resourceCollection';
import { startViewCollection } from '../domain/rumEventsCollection/view/viewCollection';
import { startRumSessionManager, startRumSessionManagerStub } from '../domain/rumSessionManager';
import { startRumBatch } from '../transport/startRumBatch';
import { startRumEventBridge } from '../transport/startRumEventBridge';
import { startUrlContexts } from '../domain/urlContexts';
import { createLocationChangeObservable } from '../browser/locationChangeObservable';
export function startRum(configuration, internalMonitoring, getCommonContext, recorderApi, initialViewName) {
    var lifeCycle = new LifeCycle();
    var session = !canUseEventBridge() ? startRumSessionManager(configuration, lifeCycle) : startRumSessionManagerStub();
    var domMutationObservable = createDOMMutationObservable();
    var locationChangeObservable = createLocationChangeObservable(location);
    internalMonitoring.setExternalContextProvider(function () {
        var _a;
        return combine({
            application_id: configuration.applicationId,
            session: {
                id: (_a = session.findTrackedSession()) === null || _a === void 0 ? void 0 : _a.id,
            },
        }, parentContexts.findView(), { view: { name: null } });
    });
    var _a = startRumEventCollection(lifeCycle, configuration, location, session, locationChangeObservable, getCommonContext), parentContexts = _a.parentContexts, foregroundContexts = _a.foregroundContexts, urlContexts = _a.urlContexts;
    startLongTaskCollection(lifeCycle, session);
    startResourceCollection(lifeCycle);
    var _b = startViewCollection(lifeCycle, configuration, location, domMutationObservable, locationChangeObservable, foregroundContexts, recorderApi, initialViewName), addTiming = _b.addTiming, startView = _b.startView, stopView = _b.stopView;
    var addError = startErrorCollection(lifeCycle, foregroundContexts).addError;
    var addAction = startActionCollection(lifeCycle, domMutationObservable, configuration, foregroundContexts).addAction;
    startRequestCollection(lifeCycle, configuration, session);
    startPerformanceCollection(lifeCycle, configuration);
    var internalContext = startInternalContext(configuration.applicationId, session, parentContexts, urlContexts);
    return {
        addAction: addAction,
        addError: addError,
        addTiming: addTiming,
        startView: startView,
        lifeCycle: lifeCycle,
        parentContexts: parentContexts,
        session: session,
        getInternalContext: internalContext.get,
        stopView: stopView
    };
}
export function startRumEventCollection(lifeCycle, configuration, location, sessionManager, locationChangeObservable, getCommonContext) {
    var parentContexts = startParentContexts(lifeCycle);
    var urlContexts = startUrlContexts(lifeCycle, locationChangeObservable, location);
    var foregroundContexts = startForegroundContexts();
    var stopBatch;
    if (canUseEventBridge()) {
        startRumEventBridge(lifeCycle);
    }
    else {
        ;
        (stopBatch = startRumBatch(configuration, lifeCycle).stop);
    }
    startRumAssembly(configuration, lifeCycle, sessionManager, parentContexts, urlContexts, getCommonContext);
    return {
        parentContexts: parentContexts,
        foregroundContexts: foregroundContexts,
        urlContexts: urlContexts,
        stop: function () {
            // prevent batch from previous tests to keep running and send unwanted requests
            // could be replaced by stopping all the component when they will all have a stop method
            stopBatch === null || stopBatch === void 0 ? void 0 : stopBatch();
            parentContexts.stop();
            foregroundContexts.stop();
        },
    };
}
//# sourceMappingURL=startRum.js.map