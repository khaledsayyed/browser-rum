"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getElementInputValue = exports.setSerializedNodeId = exports.getSerializedNodeId = exports.nodeAndAncestorsHaveSerializedNode = exports.hasSerializedNode = void 0;
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
    if ((0, privacy_1.shouldMaskNode)(element, nodePrivacyLevel)) {
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