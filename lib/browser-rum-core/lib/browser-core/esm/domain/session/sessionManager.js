import * as utils from '../../tools/utils';
import { monitor } from '../internalMonitoring';
import { ContextHistory } from '../../tools/contextHistory';
import { relativeNow, clocksOrigin } from '../../tools/timeUtils';
import { tryOldCookiesMigration } from './oldCookiesMigration';
import { startSessionStore, SESSION_TIME_OUT_DELAY } from './sessionStore';
export var VISIBILITY_CHECK_DELAY = utils.ONE_MINUTE;
var SESSION_CONTEXT_TIMEOUT_DELAY = SESSION_TIME_OUT_DELAY;
var stopCallbacks = [];
export function startSessionManager(options, productKey, computeSessionState) {
    tryOldCookiesMigration(options);
    var sessionStore = startSessionStore(options, productKey, computeSessionState);
    stopCallbacks.push(function () { return sessionStore.stop(); });
    var sessionContextHistory = new ContextHistory(SESSION_CONTEXT_TIMEOUT_DELAY);
    stopCallbacks.push(function () { return sessionContextHistory.stop(); });
    sessionStore.renewObservable.subscribe(function () {
        sessionContextHistory.setCurrent(buildSessionContext(), relativeNow());
    });
    sessionStore.expireObservable.subscribe(function () {
        sessionContextHistory.closeCurrent(relativeNow());
    });
    sessionStore.expandOrRenewSession();
    sessionContextHistory.setCurrent(buildSessionContext(), clocksOrigin().relative);
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
export function stopSessionManager() {
    stopCallbacks.forEach(function (e) { return e(); });
    stopCallbacks = [];
}
function trackActivity(expandOrRenewSession) {
    var stop = utils.addEventListeners(window, ["click" /* CLICK */, "touchstart" /* TOUCH_START */, "keydown" /* KEY_DOWN */, "scroll" /* SCROLL */], expandOrRenewSession, { capture: true, passive: true }).stop;
    stopCallbacks.push(stop);
}
function trackVisibility(expandSession) {
    var expandSessionWhenVisible = monitor(function () {
        if (document.visibilityState === 'visible') {
            expandSession();
        }
    });
    var stop = utils.addEventListener(document, "visibilitychange" /* VISIBILITY_CHANGE */, expandSessionWhenVisible).stop;
    stopCallbacks.push(stop);
    var visibilityCheckInterval = setInterval(expandSessionWhenVisible, VISIBILITY_CHECK_DELAY);
    stopCallbacks.push(function () {
        clearInterval(visibilityCheckInterval);
    });
}
//# sourceMappingURL=sessionManager.js.map