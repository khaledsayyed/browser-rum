"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUrl = exports.getHash = exports.getSearch = exports.getPathName = exports.getOrigin = exports.haveSameOrigin = exports.isValidUrl = exports.normalizeUrl = void 0;
var utils_1 = require("./utils");
function normalizeUrl(url) {
    return buildUrl(url, utils_1.getLocationOrigin()).href;
}
exports.normalizeUrl = normalizeUrl;
function isValidUrl(url) {
    try {
        return !!buildUrl(url);
    }
    catch (_a) {
        return false;
    }
}
exports.isValidUrl = isValidUrl;
function haveSameOrigin(url1, url2) {
    return getOrigin(url1) === getOrigin(url2);
}
exports.haveSameOrigin = haveSameOrigin;
function getOrigin(url) {
    return utils_1.getLinkElementOrigin(buildUrl(url));
}
exports.getOrigin = getOrigin;
function getPathName(url) {
    var pathname = buildUrl(url).pathname;
    return pathname[0] === '/' ? pathname : "/" + pathname;
}
exports.getPathName = getPathName;
function getSearch(url) {
    return buildUrl(url).search;
}
exports.getSearch = getSearch;
function getHash(url) {
    return buildUrl(url).hash;
}
exports.getHash = getHash;
function buildUrl(url, base) {
    if (checkURLSupported()) {
        return base !== undefined ? new URL(url, base) : new URL(url);
    }
    if (base === undefined && !/:/.test(url)) {
        throw new Error("Invalid URL: '" + url + "'");
    }
    var doc = document;
    var anchorElement = doc.createElement('a');
    if (base !== undefined) {
        doc = document.implementation.createHTMLDocument('');
        var baseElement = doc.createElement('base');
        baseElement.href = base;
        doc.head.appendChild(baseElement);
        doc.body.appendChild(anchorElement);
    }
    anchorElement.href = url;
    return anchorElement;
}
exports.buildUrl = buildUrl;
var isURLSupported;
function checkURLSupported() {
    if (isURLSupported !== undefined) {
        return isURLSupported;
    }
    try {
        var url = new URL('http://test/path');
        isURLSupported = url.href === 'http://test/path';
        return isURLSupported;
    }
    catch (_a) {
        isURLSupported = false;
    }
    return isURLSupported;
}
//# sourceMappingURL=urlPolyfill.js.map