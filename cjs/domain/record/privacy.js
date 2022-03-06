"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTextContent = exports.censorText = exports.shouldMaskNode = exports.getNodeSelfPrivacyLevel = exports.reducePrivacyLevel = exports.getNodePrivacyLevel = exports.MAX_ATTRIBUTE_VALUE_CHAR_LENGTH = void 0;
var constants_1 = require("../../constants");
exports.MAX_ATTRIBUTE_VALUE_CHAR_LENGTH = 100000;
var serializationUtils_1 = require("./serializationUtils");
var serialize_1 = require("./serialize");
var TEXT_MASKING_CHAR = 'x';
/**
 * Get node privacy level by iterating over its ancestors. When the direct parent privacy level is
 * know, it is best to use something like:
 *
 * derivePrivacyLevelGivenParent(getNodeSelfPrivacyLevel(node), parentNodePrivacyLevel)
 */
function getNodePrivacyLevel(node, defaultPrivacyLevel) {
    var parentNodePrivacyLevel = node.parentNode
        ? getNodePrivacyLevel(node.parentNode, defaultPrivacyLevel)
        : defaultPrivacyLevel;
    var selfNodePrivacyLevel = getNodeSelfPrivacyLevel(node);
    return reducePrivacyLevel(selfNodePrivacyLevel, parentNodePrivacyLevel);
}
exports.getNodePrivacyLevel = getNodePrivacyLevel;
/**
 * Reduces the next privacy level based on self + parent privacy levels
 */
function reducePrivacyLevel(childPrivacyLevel, parentNodePrivacyLevel) {
    switch (parentNodePrivacyLevel) {
        // These values cannot be overridden
        case constants_1.NodePrivacyLevel.HIDDEN:
        case constants_1.NodePrivacyLevel.IGNORE:
            return parentNodePrivacyLevel;
    }
    switch (childPrivacyLevel) {
        case constants_1.NodePrivacyLevel.ALLOW:
        case constants_1.NodePrivacyLevel.MASK:
        case constants_1.NodePrivacyLevel.MASK_USER_INPUT:
        case constants_1.NodePrivacyLevel.HIDDEN:
        case constants_1.NodePrivacyLevel.IGNORE:
            return childPrivacyLevel;
        default:
            return parentNodePrivacyLevel;
    }
}
exports.reducePrivacyLevel = reducePrivacyLevel;
/**
 * Determines the node's own privacy level without checking for ancestors.
 */
function getNodeSelfPrivacyLevel(node) {
    // Only Element types can be have a privacy level set
    if (!isElement(node)) {
        return;
    }
    var privAttr = node.getAttribute(constants_1.PRIVACY_ATTR_NAME);
    // Overrules to enforce end-user protection
    if (node.tagName === 'BASE') {
        return constants_1.NodePrivacyLevel.ALLOW;
    }
    if (node.tagName === 'INPUT') {
        var inputElement = node;
        if (inputElement.type === 'password' || inputElement.type === 'email' || inputElement.type === 'tel') {
            return constants_1.NodePrivacyLevel.MASK;
        }
        if (inputElement.type === 'hidden') {
            return constants_1.NodePrivacyLevel.MASK;
        }
        var autocomplete = inputElement.getAttribute('autocomplete');
        // Handle input[autocomplete=cc-number/cc-csc/cc-exp/cc-exp-month/cc-exp-year]
        if (autocomplete && autocomplete.indexOf('cc-') === 0) {
            return constants_1.NodePrivacyLevel.MASK;
        }
    }
    // Check HTML privacy attributes
    switch (privAttr) {
        case constants_1.PRIVACY_ATTR_VALUE_ALLOW:
            return constants_1.NodePrivacyLevel.ALLOW;
        case constants_1.PRIVACY_ATTR_VALUE_MASK:
            return constants_1.NodePrivacyLevel.MASK;
        case constants_1.PRIVACY_ATTR_VALUE_MASK_USER_INPUT:
        case constants_1.PRIVACY_ATTR_VALUE_INPUT_IGNORED: // Deprecated, now aliased
        case constants_1.PRIVACY_ATTR_VALUE_INPUT_MASKED: // Deprecated, now aliased
            return constants_1.NodePrivacyLevel.MASK_USER_INPUT;
        case constants_1.PRIVACY_ATTR_VALUE_HIDDEN:
            return constants_1.NodePrivacyLevel.HIDDEN;
    }
    // Check HTML privacy classes
    if (node.classList.contains(constants_1.PRIVACY_CLASS_ALLOW)) {
        return constants_1.NodePrivacyLevel.ALLOW;
    }
    else if (node.classList.contains(constants_1.PRIVACY_CLASS_MASK)) {
        return constants_1.NodePrivacyLevel.MASK;
    }
    else if (node.classList.contains(constants_1.PRIVACY_CLASS_HIDDEN)) {
        return constants_1.NodePrivacyLevel.HIDDEN;
    }
    else if (node.classList.contains(constants_1.PRIVACY_CLASS_MASK_USER_INPUT) ||
        node.classList.contains(constants_1.PRIVACY_CLASS_INPUT_MASKED) || // Deprecated, now aliased
        node.classList.contains(constants_1.PRIVACY_CLASS_INPUT_IGNORED) // Deprecated, now aliased
    ) {
        return constants_1.NodePrivacyLevel.MASK_USER_INPUT;
    }
    else if (serialize_1.shouldIgnoreElement(node)) {
        // such as for scripts
        return constants_1.NodePrivacyLevel.IGNORE;
    }
}
exports.getNodeSelfPrivacyLevel = getNodeSelfPrivacyLevel;
/**
 * Helper aiming to unify `mask` and `mask-user-input` privacy levels:
 *
 * In the `mask` case, it is trivial: we should mask the element.
 *
 * In the `mask-user-input` case, we should mask the element only if it is a "form" element or the
 * direct parent is a form element for text nodes).
 *
 * Other `shouldMaskNode` cases are edge cases that should not matter too much (ex: should we mask a
 * node if it is ignored or hidden? it doesn't matter since it won't be serialized).
 */
function shouldMaskNode(node, privacyLevel) {
    switch (privacyLevel) {
        case constants_1.NodePrivacyLevel.MASK:
        case constants_1.NodePrivacyLevel.HIDDEN:
        case constants_1.NodePrivacyLevel.IGNORE:
            return true;
        case constants_1.NodePrivacyLevel.MASK_USER_INPUT:
            return isTextNode(node) ? isFormElement(node.parentNode) : isFormElement(node);
        default:
            return false;
    }
}
exports.shouldMaskNode = shouldMaskNode;
function isElement(node) {
    return node.nodeType === node.ELEMENT_NODE;
}
function isTextNode(node) {
    return node.nodeType === node.TEXT_NODE;
}
function isFormElement(node) {
    if (!node || node.nodeType !== node.ELEMENT_NODE) {
        return false;
    }
    var element = node;
    if (element.tagName === 'INPUT') {
        switch (element.type) {
            case 'button':
            case 'color':
            case 'reset':
            case 'submit':
                return false;
        }
    }
    return !!constants_1.FORM_PRIVATE_TAG_NAMES[element.tagName];
}
/**
 * Text censoring non-destructively maintains whitespace characters in order to preserve text shape
 * during replay.
 */
var censorText = function (text) { return text.replace(/\S/g, TEXT_MASKING_CHAR); };
exports.censorText = censorText;
function getTextContent(textNode, ignoreWhiteSpace, parentNodePrivacyLevel) {
    var _a;
    // The parent node may not be a html element which has a tagName attribute.
    // So just let it be undefined which is ok in this use case.
    var parentTagName = (_a = textNode.parentElement) === null || _a === void 0 ? void 0 : _a.tagName;
    var textContent = textNode.textContent || '';
    if (ignoreWhiteSpace && !textContent.trim()) {
        return;
    }
    var nodePrivacyLevel = parentNodePrivacyLevel;
    var isStyle = parentTagName === 'STYLE' ? true : undefined;
    var isScript = parentTagName === 'SCRIPT';
    if (isScript) {
        // For perf reasons, we don't record script (heuristic)
        textContent = constants_1.CENSORED_STRING_MARK;
    }
    else if (nodePrivacyLevel === constants_1.NodePrivacyLevel.HIDDEN) {
        // Should never occur, but just in case, we set to CENSORED_MARK.
        textContent = constants_1.CENSORED_STRING_MARK;
    }
    else if (shouldMaskNode(textNode, nodePrivacyLevel)) {
        if (isStyle) {
            // Style tags are `overruled` (Use `hide` to enforce privacy)
            textContent = serializationUtils_1.makeStylesheetUrlsAbsolute(textContent, location.href);
        }
        else if (
        // Scrambling the child list breaks text nodes for DATALIST/SELECT/OPTGROUP
        parentTagName === 'DATALIST' ||
            parentTagName === 'SELECT' ||
            parentTagName === 'OPTGROUP') {
            if (!textContent.trim()) {
                return;
            }
        }
        else if (parentTagName === 'OPTION') {
            // <Option> has low entropy in charset + text length, so use `CENSORED_STRING_MARK` when masked
            textContent = constants_1.CENSORED_STRING_MARK;
        }
        else {
            textContent = exports.censorText(textContent);
        }
    }
    return textContent;
}
exports.getTextContent = getTextContent;
//# sourceMappingURL=privacy.js.map