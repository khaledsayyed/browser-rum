import { performDraw, startSessionManager } from '@datadog/browser-core';
import { LifeCycleEventType } from './lifeCycle';
export var RUM_SESSION_KEY = 'rum';
export var RumSessionPlan;
(function (RumSessionPlan) {
    RumSessionPlan[RumSessionPlan["LITE"] = 1] = "LITE";
    RumSessionPlan[RumSessionPlan["REPLAY"] = 2] = "REPLAY";
})(RumSessionPlan || (RumSessionPlan = {}));
export var RumTrackingType;
(function (RumTrackingType) {
    RumTrackingType["NOT_TRACKED"] = "0";
    // Note: the "tracking type" value (stored in the session cookie) does not match the "session
    // plan" value (sent in RUM events). This is expected, and was done to keep retrocompatibility
    // with active sessions when upgrading the SDK.
    RumTrackingType["TRACKED_REPLAY"] = "1";
    RumTrackingType["TRACKED_LITE"] = "2";
})(RumTrackingType || (RumTrackingType = {}));
export function startRumSessionManager(configuration, lifeCycle) {
    var sessionManager = startSessionManager(configuration.cookieOptions, RUM_SESSION_KEY, function (rawTrackingType) {
        return computeSessionState(configuration, rawTrackingType);
    });
    sessionManager.expireObservable.subscribe(function () {
        lifeCycle.notify(LifeCycleEventType.SESSION_EXPIRED);
    });
    sessionManager.renewObservable.subscribe(function () {
        lifeCycle.notify(LifeCycleEventType.SESSION_RENEWED);
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
/**
 * Start a tracked replay session stub
 * It needs to be a replay plan in order to get long tasks
 */
export function startRumSessionManagerStub() {
    var session = {
        id: '00000000-aaaa-0000-aaaa-000000000000',
        hasReplayPlan: true,
        hasLitePlan: false,
    };
    return {
        findTrackedSession: function () { return session; },
    };
}
function computeSessionState(configuration, rawTrackingType) {
    var trackingType;
    if (hasValidRumSession(rawTrackingType)) {
        trackingType = rawTrackingType;
    }
    else if (!performDraw(configuration.sampleRate)) {
        trackingType = RumTrackingType.NOT_TRACKED;
    }
    else if (!performDraw(configuration.replaySampleRate)) {
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