"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getElementInputValue = exports.makeUrlAbsolute = exports.makeSrcsetUrlsAbsolute = exports.makeStylesheetUrlsAbsolute = exports.setSerializedNodeId = exports.getSerializedNodeId = exports.nodeAndAncestorsHaveSerializedNode = exports.hasSerializedNode = void 0;
var browser_core_1 = require("@datadog/browser-core");
var constants_1 = require("../../constants");
var privacy_1 = require("./privacy");
var serializedNodeIds = new WeakMap();
function hasSerializedNode(node) {
    return serializedNodeIds.has(node);
}
exports.hasSerializedNode = hasSerializedNode;
function nodeAndAncestorsHaveSerializedNode(node) {
    var current = node;
    while (current) {
        if (!hasSerializedNode(current)) {
            return false;
        }
        current = current.parentNode;
    }
    return true;
}
exports.nodeAndAncestorsHaveSerializedNode = nodeAndAncestorsHaveSerializedNode;
function getSerializedNodeId(node) {
    return serializedNodeIds.get(node);
}
exports.getSerializedNodeId = getSerializedNodeId;
function setSerializedNodeId(node, serializeNodeId) {
    serializedNodeIds.set(node, serializeNodeId);
}
exports.setSerializedNodeId = setSerializedNodeId;
var URL_IN_CSS_REF = /url\((?:(')([^']*)'|(")([^"]*)"|([^)]*))\)/gm;
var ABSOLUTE_URL = /^[A-Za-z]+:|^\/\//;
var DATA_URI = /^data:.*,/i;
function makeStylesheetUrlsAbsolute(cssText, baseUrl) {
    if (browser_core_1.isExperimentalFeatureEnabled('base-tag')) {
        return cssText;
    }
    return cssText.replace(URL_IN_CSS_REF, function (origin, quote1, path1, quote2, path2, path3) {
        var filePath = path1 || path2 || path3;
        if (!filePath || ABSOLUTE_URL.test(filePath) || DATA_URI.test(filePath)) {
            return origin;
        }
        var maybeQuote = quote1 || quote2 || '';
        return "url(" + maybeQuote + makeUrlAbsolute(filePath, baseUrl) + maybeQuote + ")";
    });
}
exports.makeStylesheetUrlsAbsolute = makeStylesheetUrlsAbsolute;
var SRCSET_URLS = /(^\s*|,\s*)([^\s,]+)/g;
function makeSrcsetUrlsAbsolute(attributeValue, baseUrl) {
    if (browser_core_1.isExperimentalFeatureEnabled('base-tag')) {
        return attributeValue;
    }
    return attributeValue.replace(SRCSET_URLS, function (_, prefix, url) { return "" + prefix + makeUrlAbsolute(url, baseUrl); });
}
exports.makeSrcsetUrlsAbsolute = makeSrcsetUrlsAbsolute;
function makeUrlAbsolute(url, baseUrl) {
    try {
        if (browser_core_1.isExperimentalFeatureEnabled('base-tag')) {
            return url;
        }
        return browser_core_1.buildUrl(url.trim(), baseUrl).href;
    }
    catch (_) {
        return url;
    }
}
exports.makeUrlAbsolute = makeUrlAbsolute;
/**
 * Get the element "value" to be serialized as an attribute or an input update record. It respects
 * the input privacy mode of the element.
 * PERFROMANCE OPTIMIZATION: Assumes that privacy level `HIDDEN` is never encountered because of earlier checks.
 */
function getElementInputValue(element, nodePrivacyLevel) {
    /*
     BROWSER SPEC NOTE: <input>, <select>
     For some <input> elements, the `value` is an exceptional property/attribute that has the
     value synced between el.value and el.getAttribute()
     input[type=button,checkbox,hidden,image,radio,reset,submit]
     */
    var tagName = element.tagName;
    var value = element.value;
    if (privacy_1.shouldMaskNode(element, nodePrivacyLevel)) {
        var type = element.type;
        if (tagName === 'INPUT' && (type === 'button' || type === 'submit' || type === 'reset')) {
            // Overrule `MASK` privacy level for button-like element values, as they are used during replay
            // to display their label. They can still be hidden via the "hidden" privacy attribute or class name.
            return value;
        }
        else if (!value || tagName === 'OPTION') {
            // <Option> value provides no benefit
            return;
        }
        return constants_1.CENSORED_STRING_MARK;
    }
    if (tagName === 'OPTION' || tagName === 'SELECT') {
        return element.value;
    }
    if (tagName !== 'INPUT' && tagName !== 'TEXTAREA') {
        return;
    }
    return value;
}
exports.getElementInputValue = getElementInputValue;
//# sourceMappingURL=serializationUtils.js.map