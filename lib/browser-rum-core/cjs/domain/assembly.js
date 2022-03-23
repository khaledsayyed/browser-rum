"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRumAssembly = void 0;
var tslib_1 = require("tslib");
var browser_core_1 = require("@datadog/browser-core");
var rawRumEvent_types_1 = require("../rawRumEvent.types");
var buildEnv_1 = require("../boot/buildEnv");
var syntheticsContext_1 = require("./syntheticsContext");
var lifeCycle_1 = require("./lifeCycle");
var rumSessionManager_1 = require("./rumSessionManager");
var SessionType;
(function (SessionType) {
    SessionType["SYNTHETICS"] = "synthetics";
    SessionType["USER"] = "user";
})(SessionType || (SessionType = {}));
var VIEW_EVENTS_MODIFIABLE_FIELD_PATHS = [
    // Fields with sensitive data
    'view.url',
    'view.referrer',
    'action.target.name',
    'error.message',
    'error.stack',
    'error.resource.url',
    'resource.url',
];
var OTHER_EVENTS_MODIFIABLE_FIELD_PATHS = tslib_1.__spreadArrays(VIEW_EVENTS_MODIFIABLE_FIELD_PATHS, [
    // User-customizable field
    'context',
]);
function startRumAssembly(configuration, lifeCycle, sessionManager, parentContexts, urlContexts, getCommonContext) {
    var _a;
    var reportError = function (error) {
        lifeCycle.notify(lifeCycle_1.LifeCycleEventType.RAW_ERROR_COLLECTED, { error: error });
    };
    var eventRateLimiters = (_a = {},
        _a[rawRumEvent_types_1.RumEventType.ERROR] = browser_core_1.createEventRateLimiter(rawRumEvent_types_1.RumEventType.ERROR, configuration.maxErrorsPerMinute, reportError),
        _a[rawRumEvent_types_1.RumEventType.ACTION] = browser_core_1.createEventRateLimiter(rawRumEvent_types_1.RumEventType.ACTION, configuration.maxActionsPerMinute, reportError),
        _a);
    var syntheticsContext = syntheticsContext_1.getSyntheticsContext();
    lifeCycle.subscribe(lifeCycle_1.LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, function (_a) {
        var startTime = _a.startTime, rawRumEvent = _a.rawRumEvent, domainContext = _a.domainContext, savedCommonContext = _a.savedCommonContext, customerContext = _a.customerContext;
        var viewContext = parentContexts.findView(startTime);
        var urlContext = urlContexts.findUrl(startTime);
        // allow to send events if the session was tracked when they start
        // except for views which are continuously updated
        // TODO: stop sending view updates when session is expired
        var session = sessionManager.findTrackedSession(rawRumEvent.type !== rawRumEvent_types_1.RumEventType.VIEW ? startTime : undefined);
        if (session && viewContext && urlContext) {
            var actionContext = parentContexts.findAction(startTime);
            var commonContext = savedCommonContext || getCommonContext();
            var rumContext = {
                _dd: {
                    format_version: 2,
                    drift: browser_core_1.currentDrift(),
                    session: {
                        plan: session.hasReplayPlan ? rumSessionManager_1.RumSessionPlan.REPLAY : rumSessionManager_1.RumSessionPlan.LITE,
                    },
                    browser_sdk_version: browser_core_1.canUseEventBridge() ? buildEnv_1.buildEnv.sdkVersion : undefined,
                },
                application: {
                    id: configuration.applicationId,
                },
                date: browser_core_1.timeStampNow(),
                service: configuration.service,
                session: {
                    id: session.id,
                    type: syntheticsContext ? SessionType.SYNTHETICS : SessionType.USER,
                },
                synthetics: syntheticsContext,
            };
            var serverRumEvent = (needToAssembleWithAction(rawRumEvent)
                ? browser_core_1.combine(rumContext, urlContext, viewContext, actionContext, rawRumEvent)
                : browser_core_1.combine(rumContext, urlContext, viewContext, rawRumEvent));
            serverRumEvent.context = browser_core_1.combine(commonContext.context, customerContext);
            if (!('has_replay' in serverRumEvent.session)) {
                ;
                serverRumEvent.session.has_replay = commonContext.hasReplay;
            }
            if (!browser_core_1.isEmptyObject(commonContext.user)) {
                ;
                serverRumEvent.usr = commonContext.user;
            }
            if (shouldSend(serverRumEvent, configuration.beforeSend, domainContext, eventRateLimiters)) {
                if (browser_core_1.isEmptyObject(serverRumEvent.context)) {
                    delete serverRumEvent.context;
                }
                lifeCycle.notify(lifeCycle_1.LifeCycleEventType.RUM_EVENT_COLLECTED, serverRumEvent);
            }
        }
    });
}
exports.startRumAssembly = startRumAssembly;
function shouldSend(event, beforeSend, domainContext, eventRateLimiters) {
    var _a;
    if (beforeSend) {
        var result = browser_core_1.limitModification(event, event.type === rawRumEvent_types_1.RumEventType.VIEW ? VIEW_EVENTS_MODIFIABLE_FIELD_PATHS : OTHER_EVENTS_MODIFIABLE_FIELD_PATHS, function (event) { return beforeSend(event, domainContext); });
        if (result === false && event.type !== rawRumEvent_types_1.RumEventType.VIEW) {
            return false;
        }
        if (result === false) {
            browser_core_1.display.warn("Can't dismiss view events using beforeSend!");
        }
    }
    var rateLimitReached = (_a = eventRateLimiters[event.type]) === null || _a === void 0 ? void 0 : _a.isLimitReached();
    return !rateLimitReached;
}
function needToAssembleWithAction(event) {
    return [rawRumEvent_types_1.RumEventType.ERROR, rawRumEvent_types_1.RumEventType.RESOURCE, rawRumEvent_types_1.RumEventType.LONG_TASK].indexOf(event.type) !== -1;
}
//# sourceMappingURL=assembly.js.map