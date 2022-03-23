import { display } from '../tools/display';
import { findCommaSeparatedValue, generateUUID, ONE_SECOND } from '../tools/utils';
export var COOKIE_ACCESS_DELAY = ONE_SECOND;
export function setCookie(name, value, expireDelay, options) {
    var date = new Date();
    date.setTime(date.getTime() + expireDelay);
    var expires = "expires=" + date.toUTCString();
    var sameSite = options && options.crossSite ? 'none' : 'strict';
    var domain = options && options.domain ? ";domain=" + options.domain : '';
    var secure = options && options.secure ? ";secure" : '';
    document.cookie = name + "=" + value + ";" + expires + ";path=/;samesite=" + sameSite + domain + secure;
}
export function getCookie(name) {
    return findCommaSeparatedValue(document.cookie, name);
}
export function deleteCookie(name, options) {
    setCookie(name, '', 0, options);
}
export function areCookiesAuthorized(options) {
    if (document.cookie === undefined || document.cookie === null) {
        return false;
    }
    try {
        // Use a unique cookie name to avoid issues when the SDK is initialized multiple times during
        // the test cookie lifetime
        var testCookieName = "dd_cookie_test_" + generateUUID();
        var testCookieValue = 'test';
        setCookie(testCookieName, testCookieValue, ONE_SECOND, options);
        var isCookieCorrectlySet = getCookie(testCookieName) === testCookieValue;
        deleteCookie(testCookieName, options);
        return isCookieCorrectlySet;
    }
    catch (error) {
        display.error(error);
        return false;
    }
}
/**
 * No API to retrieve it, number of levels for subdomain and suffix are unknown
 * strategy: find the minimal domain on which cookies are allowed to be set
 * https://web.dev/same-site-same-origin/#site
 */
var getCurrentSiteCache;
export function getCurrentSite() {
    if (getCurrentSiteCache === undefined) {
        // Use a unique cookie name to avoid issues when the SDK is initialized multiple times during
        // the test cookie lifetime
        var testCookieName = "dd_site_test_" + generateUUID();
        var testCookieValue = 'test';
        var domainLevels = window.location.hostname.split('.');
        var candidateDomain = domainLevels.pop();
        while (domainLevels.length && !getCookie(testCookieName)) {
            candidateDomain = domainLevels.pop() + "." + candidateDomain;
            setCookie(testCookieName, testCookieValue, ONE_SECOND, { domain: candidateDomain });
        }
        deleteCookie(testCookieName, { domain: candidateDomain });
        getCurrentSiteCache = candidateDomain;
    }
    return getCurrentSiteCache;
}
//# sourceMappingURL=cookie.js.map