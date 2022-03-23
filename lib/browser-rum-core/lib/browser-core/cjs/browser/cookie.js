"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentSite = exports.areCookiesAuthorized = exports.deleteCookie = exports.getCookie = exports.setCookie = exports.COOKIE_ACCESS_DELAY = void 0;
var display_1 = require("../tools/display");
var utils_1 = require("../tools/utils");
exports.COOKIE_ACCESS_DELAY = utils_1.ONE_SECOND;
function setCookie(name, value, expireDelay, options) {
    var date = new Date();
    date.setTime(date.getTime() + expireDelay);
    var expires = "expires=" + date.toUTCString();
    var sameSite = options && options.crossSite ? 'none' : 'strict';
    var domain = options && options.domain ? ";domain=" + options.domain : '';
    var secure = options && options.secure ? ";secure" : '';
    document.cookie = name + "=" + value + ";" + expires + ";path=/;samesite=" + sameSite + domain + secure;
}
exports.setCookie = setCookie;
function getCookie(name) {
    return utils_1.findCommaSeparatedValue(document.cookie, name);
}
exports.getCookie = getCookie;
function deleteCookie(name, options) {
    setCookie(name, '', 0, options);
}
exports.deleteCookie = deleteCookie;
function areCookiesAuthorized(options) {
    if (document.cookie === undefined || document.cookie === null) {
        return false;
    }
    try {
        // Use a unique cookie name to avoid issues when the SDK is initialized multiple times during
        // the test cookie lifetime
        var testCookieName = "dd_cookie_test_" + utils_1.generateUUID();
        var testCookieValue = 'test';
        setCookie(testCookieName, testCookieValue, utils_1.ONE_SECOND, options);
        var isCookieCorrectlySet = getCookie(testCookieName) === testCookieValue;
        deleteCookie(testCookieName, options);
        return isCookieCorrectlySet;
    }
    catch (error) {
        display_1.display.error(error);
        return false;
    }
}
exports.areCookiesAuthorized = areCookiesAuthorized;
/**
 * No API to retrieve it, number of levels for subdomain and suffix are unknown
 * strategy: find the minimal domain on which cookies are allowed to be set
 * https://web.dev/same-site-same-origin/#site
 */
var getCurrentSiteCache;
function getCurrentSite() {
    if (getCurrentSiteCache === undefined) {
        // Use a unique cookie name to avoid issues when the SDK is initialized multiple times during
        // the test cookie lifetime
        var testCookieName = "dd_site_test_" + utils_1.generateUUID();
        var testCookieValue = 'test';
        var domainLevels = window.location.hostname.split('.');
        var candidateDomain = domainLevels.pop();
        while (domainLevels.length && !getCookie(testCookieName)) {
            candidateDomain = domainLevels.pop() + "." + candidateDomain;
            setCookie(testCookieName, testCookieValue, utils_1.ONE_SECOND, { domain: candidateDomain });
        }
        deleteCookie(testCookieName, { domain: candidateDomain });
        getCurrentSiteCache = candidateDomain;
    }
    return getCurrentSiteCache;
}
exports.getCurrentSite = getCurrentSite;
//# sourceMappingURL=cookie.js.map