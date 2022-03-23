"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRumEventCollection = exports.startRum = void 0;
var browser_core_1 = require("@datadog/browser-core");
var domMutationObservable_1 = require("../browser/domMutationObservable");
var performanceCollection_1 = require("../browser/performanceCollection");
var assembly_1 = require("../domain/assembly");
var foregroundContexts_1 = require("../domain/foregroundContexts");
var internalContext_1 = require("../domain/internalContext");
var lifeCycle_1 = require("../domain/lifeCycle");
var parentContexts_1 = require("../domain/parentContexts");
var requestCollection_1 = require("../domain/requestCollection");
var actionCollection_1 = require("../domain/rumEventsCollection/action/actionCollection");
var errorCollection_1 = require("../domain/rumEventsCollection/error/errorCollection");
var longTaskCollection_1 = require("../domain/rumEventsCollection/longTask/longTaskCollection");
var resourceCollection_1 = require("../domain/rumEventsCollection/resource/resourceCollection");
var viewCollection_1 = require("../domain/rumEventsCollection/view/viewCollection");
var rumSessionManager_1 = require("../domain/rumSessionManager");
var startRumBatch_1 = require("../transport/startRumBatch");
var startRumEventBridge_1 = require("../transport/startRumEventBridge");
var urlContexts_1 = require("../domain/urlContexts");
var locationChangeObservable_1 = require("../browser/locationChangeObservable");
function startRum(configuration, internalMonitoring, getCommonContext, recorderApi, initialViewName) {
    var lifeCycle = new lifeCycle_1.LifeCycle();
    var session = !browser_core_1.canUseEventBridge() ? rumSessionManager_1.startRumSessionManager(configuration, lifeCycle) : rumSessionManager_1.startRumSessionManagerStub();
    var domMutationObservable = domMutationObservable_1.createDOMMutationObservable();
    var locationChangeObservable = locationChangeObservable_1.createLocationChangeObservable(location);
    internalMonitoring.setExternalContextProvider(function () {
        var _a;
        return browser_core_1.combine({
            application_id: configuration.applicationId,
            session: {
                id: (_a = session.findTrackedSession()) === null || _a === void 0 ? void 0 : _a.id,
            },
        }, parentContexts.findView(), { view: { name: null } });
    });
    var _a = startRumEventCollection(lifeCycle, configuration, location, session, locationChangeObservable, getCommonContext), parentContexts = _a.parentContexts, foregroundContexts = _a.foregroundContexts, urlContexts = _a.urlContexts;
    longTaskCollection_1.startLongTaskCollection(lifeCycle, session);
    resourceCollection_1.startResourceCollection(lifeCycle);
    var _b = viewCollection_1.startViewCollection(lifeCycle, configuration, location, domMutationObservable, locationChangeObservable, foregroundContexts, recorderApi, initialViewName), addTiming = _b.addTiming, startView = _b.startView, stopView = _b.stopView;
    var addError = errorCollection_1.startErrorCollection(lifeCycle, foregroundContexts).addError;
    var addAction = actionCollection_1.startActionCollection(lifeCycle, domMutationObservable, configuration, foregroundContexts).addAction;
    requestCollection_1.startRequestCollection(lifeCycle, configuration, session);
    performanceCollection_1.startPerformanceCollection(lifeCycle, configuration);
    var internalContext = internalContext_1.startInternalContext(configuration.applicationId, session, parentContexts, urlContexts);
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
exports.startRum = startRum;
function startRumEventCollection(lifeCycle, configuration, location, sessionManager, locationChangeObservable, getCommonContext) {
    var parentContexts = parentContexts_1.startParentContexts(lifeCycle);
    var urlContexts = urlContexts_1.startUrlContexts(lifeCycle, locationChangeObservable, location);
    var foregroundContexts = foregroundContexts_1.startForegroundContexts();
    var stopBatch;
    if (browser_core_1.canUseEventBridge()) {
        startRumEventBridge_1.startRumEventBridge(lifeCycle);
    }
    else {
        ;
        (stopBatch = startRumBatch_1.startRumBatch(configuration, lifeCycle).stop);
    }
    assembly_1.startRumAssembly(configuration, lifeCycle, sessionManager, parentContexts, urlContexts, getCommonContext);
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
exports.startRumEventCollection = startRumEventCollection;
//# sourceMappingURL=startRum.js.map