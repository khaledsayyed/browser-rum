"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRecorderApi = void 0;
var browser_core_1 = require("@datadog/browser-core");
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var replayStats_1 = require("../domain/replayStats");
var startDeflateWorker_1 = require("../domain/segmentCollection/startDeflateWorker");
function makeRecorderApi(startRecordingImpl, startDeflateWorkerImpl) {
    if (startDeflateWorkerImpl === void 0) { startDeflateWorkerImpl = startDeflateWorker_1.startDeflateWorker; }
    if (browser_core_1.canUseEventBridge()) {
        return {
            start: browser_core_1.noop,
            stop: browser_core_1.noop,
            getReplayStats: function () { return undefined; },
            onRumStart: browser_core_1.noop,
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
        getReplayStats: replayStats_1.getReplayStats,
        onRumStart: function (lifeCycle, configuration, sessionManager, parentContexts) {
            lifeCycle.subscribe(browser_rum_core_1.LifeCycleEventType.SESSION_EXPIRED, function () {
                if (state.status === 2 /* Starting */ || state.status === 3 /* Started */) {
                    stopStrategy();
                    state = { status: 1 /* IntentToStart */ };
                }
            });
            lifeCycle.subscribe(browser_rum_core_1.LifeCycleEventType.SESSION_RENEWED, function () {
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
                browser_core_1.runOnReadyState('interactive', function () {
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
exports.makeRecorderApi = makeRecorderApi;
//# sourceMappingURL=recorderApi.js.map