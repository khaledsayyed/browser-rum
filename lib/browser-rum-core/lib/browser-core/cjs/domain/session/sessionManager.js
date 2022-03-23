"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopSessionManager = exports.startSessionManager = exports.VISIBILITY_CHECK_DELAY = void 0;
var tslib_1 = require("tslib");
var utils = tslib_1.__importStar(require("../../tools/utils"));
var internalMonitoring_1 = require("../internalMonitoring");
var contextHistory_1 = require("../../tools/contextHistory");
var timeUtils_1 = require("../../tools/timeUtils");
var oldCookiesMigration_1 = require("./oldCookiesMigration");
var sessionStore_1 = require("./sessionStore");
exports.VISIBILITY_CHECK_DELAY = utils.ONE_MINUTE;
var SESSION_CONTEXT_TIMEOUT_DELAY = sessionStore_1.SESSION_TIME_OUT_DELAY;
var stopCallbacks = [];
function startSessionManager(options, productKey, computeSessionState) {
    oldCookiesMigration_1.tryOldCookiesMigration(options);
    var sessionStore = sessionStore_1.startSessionStore(options, productKey, computeSessionState);
    stopCallbacks.push(function () { return sessionStore.stop(); });
    var sessionContextHistory = new contextHistory_1.ContextHistory(SESSION_CONTEXT_TIMEOUT_DELAY);
    stopCallbacks.push(function () { return sessionContextHistory.stop(); });
    sessionStore.renewObservable.subscribe(function () {
        sessionContextHistory.setCurrent(buildSessionContext(), timeUtils_1.relativeNow());
    });
    sessionStore.expireObservable.subscribe(function () {
        sessionContextHistory.closeCurrent(timeUtils_1.relativeNow());
    });
    sessionStore.expandOrRenewSession();
    sessionContextHistory.setCurrent(buildSessionContext(), timeUtils_1.clocksOrigin().relative);
    trackActivity(function () { return sessionStore.expandOrRenewSession(); });
    trackVisibility(function () { return sessionStore.expandSession(); });
    function buildSessionContext() {
        return {
            id: sessionStore.getSession().id,
            trackingType: sessionStore.getSession()[productKey],
        };
    }
    return {
        findActiveSession: function (startTime) { return sessionContextHistory.find(startTime); },
        renewObservable: sessionStore.renewObservable,
        expireObservable: sessionStore.expireObservable,
    };
}
exports.startSessionManager = startSessionManager;
function stopSessionManager() {
    stopCallbacks.forEach(function (e) { return e(); });
    stopCallbacks = [];
}
exports.stopSessionManager = stopSessionManager;
function trackActivity(expandOrRenewSession) {
    var stop = utils.addEventListeners(window, ["click" /* CLICK */, "touchstart" /* TOUCH_START */, "keydown" /* KEY_DOWN */, "scroll" /* SCROLL */], expandOrRenewSession, { capture: true, passive: true }).stop;
    stopCallbacks.push(stop);
}
function trackVisibility(expandSession) {
    var expandSessionWhenVisible = internalMonitoring_1.monitor(function () {
        if (document.visibilityState === 'visible') {
            expandSession();
        }
    });
    var stop = utils.addEventListener(document, "visibilitychange" /* VISIBILITY_CHANGE */, expandSessionWhenVisible).stop;
    stopCallbacks.push(stop);
    var visibilityCheckInterval = setInterval(expandSessionWhenVisible, exports.VISIBILITY_CHECK_DELAY);
    stopCallbacks.push(function () {
        clearInterval(visibilityCheckInterval);
    });
}
//# sourceMappingURL=sessionManager.js.map