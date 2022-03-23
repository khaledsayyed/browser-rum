"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRumSessionManagerStub = exports.startRumSessionManager = exports.RumTrackingType = exports.RumSessionPlan = exports.RUM_SESSION_KEY = void 0;
var browser_core_1 = require("@datadog/browser-core");
var lifeCycle_1 = require("./lifeCycle");
exports.RUM_SESSION_KEY = 'rum';
var RumSessionPlan;
(function (RumSessionPlan) {
    RumSessionPlan[RumSessionPlan["LITE"] = 1] = "LITE";
    RumSessionPlan[RumSessionPlan["REPLAY"] = 2] = "REPLAY";
})(RumSessionPlan = exports.RumSessionPlan || (exports.RumSessionPlan = {}));
var RumTrackingType;
(function (RumTrackingType) {
    RumTrackingType["NOT_TRACKED"] = "0";
    // Note: the "tracking type" value (stored in the session cookie) does not match the "session
    // plan" value (sent in RUM events). This is expected, and was done to keep retrocompatibility
    // with active sessions when upgrading the SDK.
    RumTrackingType["TRACKED_REPLAY"] = "1";
    RumTrackingType["TRACKED_LITE"] = "2";
})(RumTrackingType = exports.RumTrackingType || (exports.RumTrackingType = {}));
function startRumSessionManager(configuration, lifeCycle) {
    var sessionManager = browser_core_1.startSessionManager(configuration.cookieOptions, exports.RUM_SESSION_KEY, function (rawTrackingType) {
        return computeSessionState(configuration, rawTrackingType);
    });
    sessionManager.expireObservable.subscribe(function () {
        lifeCycle.notify(lifeCycle_1.LifeCycleEventType.SESSION_EXPIRED);
    });
    sessionManager.renewObservable.subscribe(function () {
        lifeCycle.notify(lifeCycle_1.LifeCycleEventType.SESSION_RENEWED);
    });
    return {
        findTrackedSession: function (startTime) {
            var session = sessionManager.findActiveSession(startTime);
            if (!session || !isTypeTracked(session.trackingType)) {
                return;
            }
            return {
                id: session.id,
                hasReplayPlan: session.trackingType === RumTrackingType.TRACKED_REPLAY,
                hasLitePlan: session.trackingType === RumTrackingType.TRACKED_LITE,
            };
        },
    };
}
exports.startRumSessionManager = startRumSessionManager;
/**
 * Start a tracked replay session stub
 * It needs to be a replay plan in order to get long tasks
 */
function startRumSessionManagerStub() {
    var session = {
        id: '00000000-aaaa-0000-aaaa-000000000000',
        hasReplayPlan: true,
        hasLitePlan: false,
    };
    return {
        findTrackedSession: function () { return session; },
    };
}
exports.startRumSessionManagerStub = startRumSessionManagerStub;
function computeSessionState(configuration, rawTrackingType) {
    var trackingType;
    if (hasValidRumSession(rawTrackingType)) {
        trackingType = rawTrackingType;
    }
    else if (!browser_core_1.performDraw(configuration.sampleRate)) {
        trackingType = RumTrackingType.NOT_TRACKED;
    }
    else if (!browser_core_1.performDraw(configuration.replaySampleRate)) {
        trackingType = RumTrackingType.TRACKED_LITE;
    }
    else {
        trackingType = RumTrackingType.TRACKED_REPLAY;
    }
    return {
        trackingType: trackingType,
        isTracked: isTypeTracked(trackingType),
    };
}
function hasValidRumSession(trackingType) {
    return (trackingType === RumTrackingType.NOT_TRACKED ||
        trackingType === RumTrackingType.TRACKED_REPLAY ||
        trackingType === RumTrackingType.TRACKED_LITE);
}
function isTypeTracked(rumSessionType) {
    return rumSessionType === RumTrackingType.TRACKED_LITE || rumSessionType === RumTrackingType.TRACKED_REPLAY;
}
//# sourceMappingURL=rumSessionManager.js.map