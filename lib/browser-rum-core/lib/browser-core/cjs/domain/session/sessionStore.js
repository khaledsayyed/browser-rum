"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistSession = exports.startSessionStore = exports.SESSION_TIME_OUT_DELAY = exports.SESSION_EXPIRATION_DELAY = exports.SESSION_COOKIE_NAME = void 0;
var tslib_1 = require("tslib");
var cookie_1 = require("../../browser/cookie");
var observable_1 = require("../../tools/observable");
var utils = tslib_1.__importStar(require("../../tools/utils"));
var internalMonitoring_1 = require("../internalMonitoring");
exports.SESSION_COOKIE_NAME = '_dd_s';
exports.SESSION_EXPIRATION_DELAY = 15 * utils.ONE_MINUTE;
exports.SESSION_TIME_OUT_DELAY = 4 * utils.ONE_HOUR;
var SESSION_ENTRY_REGEXP = /^([a-z]+)=([a-z0-9-]+)$/;
var SESSION_ENTRY_SEPARATOR = '&';
/**
 * Different session concepts:
 * - tracked, the session has an id and is updated along the user navigation
 * - not tracked, the session does not have an id but it is updated along the user navigation
 * - inactive, no session in store or session expired, waiting for a renew session
 */
function startSessionStore(options, productKey, computeSessionState) {
    var renewObservable = new observable_1.Observable();
    var expireObservable = new observable_1.Observable();
    var cookieWatch = setInterval(internalMonitoring_1.monitor(retrieveAndSynchronizeSession), cookie_1.COOKIE_ACCESS_DELAY);
    var sessionCache = retrieveActiveSession(options);
    function expandOrRenewSession() {
        var cookieSession = retrieveAndSynchronizeSession();
        var isTracked = expandOrRenewCookie(cookieSession);
        if (isTracked && !hasSessionInCache()) {
            renewSession(cookieSession);
        }
        sessionCache = cookieSession;
    }
    function expandSession() {
        var cookieSession = retrieveAndSynchronizeSession();
        if (hasSessionInCache()) {
            persistSession(cookieSession, options);
        }
    }
    function retrieveAndSynchronizeSession() {
        var cookieSession = retrieveActiveSession(options);
        if (hasSessionInCache()) {
            if (isSessionInCacheOutdated(cookieSession)) {
                expireSession();
            }
            else {
                sessionCache = cookieSession;
            }
        }
        return cookieSession;
    }
    function expandOrRenewCookie(cookieSession) {
        var _a = computeSessionState(cookieSession[productKey]), trackingType = _a.trackingType, isTracked = _a.isTracked;
        cookieSession[productKey] = trackingType;
        if (isTracked && !cookieSession.id) {
            cookieSession.id = utils.generateUUID();
            cookieSession.created = String(Date.now());
        }
        // save changes and expand session duration
        persistSession(cookieSession, options);
        return isTracked;
    }
    function hasSessionInCache() {
        return sessionCache[productKey] !== undefined;
    }
    function isSessionInCacheOutdated(cookieSession) {
        if (sessionCache.id !== cookieSession.id) {
            if (cookieSession.id && isActiveSession(sessionCache)) {
                // cookie id undefined could be due to cookie expiration
                // inactive session in cache could happen if renew session in another tab and cache not yet cleared
                addSessionInconsistenciesMessage(cookieSession, 'different id');
            }
            return true;
        }
        if (sessionCache[productKey] !== cookieSession[productKey]) {
            addSessionInconsistenciesMessage(cookieSession, 'different tracking type');
            return true;
        }
        return false;
    }
    function addSessionInconsistenciesMessage(cookieSession, cause) {
        internalMonitoring_1.addMonitoringMessage('Session inconsistencies detected', {
            debug: {
                productKey: productKey,
                sessionCache: sessionCache,
                cookieSession: cookieSession,
                cause: cause,
            },
        });
    }
    function expireSession() {
        sessionCache = {};
        expireObservable.notify();
    }
    function renewSession(cookieSession) {
        sessionCache = cookieSession;
        renewObservable.notify();
    }
    return {
        expandOrRenewSession: utils.throttle(internalMonitoring_1.monitor(expandOrRenewSession), cookie_1.COOKIE_ACCESS_DELAY).throttled,
        expandSession: expandSession,
        getSession: function () { return sessionCache; },
        renewObservable: renewObservable,
        expireObservable: expireObservable,
        stop: function () {
            clearInterval(cookieWatch);
        },
    };
}
exports.startSessionStore = startSessionStore;
function isValidSessionString(sessionString) {
    return (sessionString !== undefined &&
        (sessionString.indexOf(SESSION_ENTRY_SEPARATOR) !== -1 || SESSION_ENTRY_REGEXP.test(sessionString)));
}
function retrieveActiveSession(options) {
    var session = retrieveSession();
    if (isActiveSession(session)) {
        return session;
    }
    clearSession(options);
    return {};
}
function isActiveSession(session) {
    // created and expire can be undefined for versions which was not storing them
    // these checks could be removed when older versions will not be available/live anymore
    return ((session.created === undefined || Date.now() - Number(session.created) < exports.SESSION_TIME_OUT_DELAY) &&
        (session.expire === undefined || Date.now() < Number(session.expire)));
}
function retrieveSession() {
    var sessionString = cookie_1.getCookie(exports.SESSION_COOKIE_NAME);
    var session = {};
    if (isValidSessionString(sessionString)) {
        sessionString.split(SESSION_ENTRY_SEPARATOR).forEach(function (entry) {
            var matches = SESSION_ENTRY_REGEXP.exec(entry);
            if (matches !== null) {
                var key = matches[1], value = matches[2];
                session[key] = value;
            }
        });
    }
    return session;
}
function persistSession(session, options) {
    if (utils.isEmptyObject(session)) {
        clearSession(options);
        return;
    }
    session.expire = String(Date.now() + exports.SESSION_EXPIRATION_DELAY);
    var cookieString = utils
        .objectEntries(session)
        .map(function (_a) {
        var key = _a[0], value = _a[1];
        return key + "=" + value;
    })
        .join(SESSION_ENTRY_SEPARATOR);
    cookie_1.setCookie(exports.SESSION_COOKIE_NAME, cookieString, exports.SESSION_EXPIRATION_DELAY, options);
}
exports.persistSession = persistSession;
function clearSession(options) {
    cookie_1.setCookie(exports.SESSION_COOKIE_NAME, '', 0, options);
}
//# sourceMappingURL=sessionStore.js.map