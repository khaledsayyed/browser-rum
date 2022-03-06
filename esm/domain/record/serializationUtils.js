import { buildUrl, isExperimentalFeatureEnabled } from '@datadog/browser-core';
import { CENSORED_STRING_MARK } from '../../constants';
import { shouldMaskNode } from './privacy';
var serializedNodeIds = new WeakMap();
export function hasSerializedNode(node) {
    return serializedNodeIds.has(node);
}
export function nodeAndAncestorsHaveSerializedNode(node) {
    var current = node;
    while (current) {
        if (!hasSerializedNode(current)) {
            return false;
        }
        current = current.parentNode;
    }
    return true;
}
export function getSerializedNodeId(node) {
    return serializedNodeIds.get(node);
}
export function setSerializedNodeId(node, serializeNodeId) {
    serializedNodeIds.set(node, serializeNodeId);
}
var URL_IN_CSS_REF = /url\((?:(')([^']*)'|(")([^"]*)"|([^)]*))\)/gm;
var ABSOLUTE_URL = /^[A-Za-z]+:|^\/\//;
var DATA_URI = /^data:.*,/i;
export function makeStylesheetUrlsAbsolute(cssText, baseUrl) {
    if (isExperimentalFeatureEnabled('base-tag')) {
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
var SRCSET_URLS = /(^\s*|,\s*)([^\s,]+)/g;
export function makeSrcsetUrlsAbsolute(attributeValue, baseUrl) {
    if (isExperimentalFeatureEnabled('base-tag')) {
        return attributeValue;
    }
    return attributeValue.replace(SRCSET_URLS, function (_, prefix, url) { return "" + prefix + makeUrlAbsolute(url, baseUrl); });
}
export function makeUrlAbsolute(url, baseUrl) {
    try {
        if (isExperimentalFeatureEnabled('base-tag')) {
            return url;
        }
        return buildUrl(url.trim(), baseUrl).href;
    }
    catch (_) {
        return url;
    }
}
/**
 * Get the element "value" to be serialized as an attribute or an input update record. It respects
 * the input privacy mode of the element.
 * PERFROMANCE OPTIMIZATION: Assumes that privacy level `HIDDEN` is never encountered because of earlier checks.
 */
export function getElementInputValue(element, nodePrivacyLevel) {
    /*
     BROWSER SPEC NOTE: <input>, <select>
     For some <input> elements, the `value` is an exceptional property/attribute that has the
     value synced between el.value and el.getAttribute()
     input[type=button,checkbox,hidden,image,radio,reset,submit]
     */
    var tagName = element.tagName;
    var value = element.value;
    if (shouldMaskNode(element, nodePrivacyLevel)) {
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
        return CENSORED_STRING_MARK;
    }
    if (tagName === 'OPTION' || tagName === 'SELECT') {
        return element.value;
    }
    if (tagName !== 'INPUT' && tagName !== 'TEXTAREA') {
        return;
    }
    return value;
}
//# sourceMappingURL=serializationUtils.js.map