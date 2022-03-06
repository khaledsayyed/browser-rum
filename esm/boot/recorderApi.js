import { canUseEventBridge, noop, runOnReadyState } from '@datadog/browser-core';
import { LifeCycleEventType, } from '@datadog/browser-rum-core';
import { getReplayStats } from '../domain/replayStats';
import { startDeflateWorker } from '../domain/segmentCollection/startDeflateWorker';
export function makeRecorderApi(startRecordingImpl, startDeflateWorkerImpl) {
    if (startDeflateWorkerImpl === void 0) { startDeflateWorkerImpl = startDeflateWorker; }
    if (canUseEventBridge()) {
        return {
            start: noop,
            stop: noop,
            getReplayStats: function () { return undefined; },
            onRumStart: noop,
            isRecording: function () { return false; },
        };
    }
    var state = {
        status: 0 /* Stopped */,
    };
    var startStrategy = function () {
        state = { status: 1 /* IntentToStart */ };
    };
    var stopStrategy = function () {
        state = { status: 0 /* Stopped */ };
    };
    return {
        start: function () { return startStrategy(); },
        stop: function () { return stopStrategy(); },
        getReplayStats: getReplayStats,
        onRumStart: function (lifeCycle, configuration, sessionManager, parentContexts) {
            lifeCycle.subscribe(LifeCycleEventType.SESSION_EXPIRED, function () {
                if (state.status === 2 /* Starting */ || state.status === 3 /* Started */) {
                    stopStrategy();
                    state = { status: 1 /* IntentToStart */ };
                }
            });
            lifeCycle.subscribe(LifeCycleEventType.SESSION_RENEWED, function () {
                if (state.status === 1 /* IntentToStart */) {
                    startStrategy();
                }
            });
            startStrategy = function () {
                var session = sessionManager.findTrackedSession();
                if (!session || !session.hasReplayPlan) {
                    state = { status: 1 /* IntentToStart */ };
                    return;
                }
                if (state.status === 2 /* Starting */ || state.status === 3 /* Started */) {
                    return;
                }
                state = { status: 2 /* Starting */ };
                runOnReadyState('interactive', function () {
                    if (state.status !== 2 /* Starting */) {
                        return;
                    }
                    startDeflateWorkerImpl(function (worker) {
                        if (state.status !== 2 /* Starting */) {
                            return;
                        }
                        if (!worker) {
                            state = {
                                status: 0 /* Stopped */,
                            };
                            return;
                        }
                        var stopRecording = startRecordingImpl(lifeCycle, configuration, sessionManager, parentContexts, worker).stop;
                        state = {
                            status: 3 /* Started */,
                            stopRecording: stopRecording,
                        };
                    });
                });
            };
            stopStrategy = function () {
                if (state.status === 0 /* Stopped */) {
                    return;
                }
                if (state.status === 3 /* Started */) {
                    state.stopRecording();
                }
                state = {
                    status: 0 /* Stopped */,
                };
            };
            if (state.status === 1 /* IntentToStart */) {
                startStrategy();
            }
        },
        isRecording: function () { return state.status === 3 /* Started */; },
    };
}
//# sourceMappingURL=recorderApi.js.map