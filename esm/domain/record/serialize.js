import { __assign } from "tslib";
import { NodePrivacyLevel, PRIVACY_ATTR_NAME, PRIVACY_ATTR_VALUE_HIDDEN, CENSORED_STRING_MARK, CENSORED_IMG_MARK, } from '../../constants';
import { getTextContent, shouldMaskNode, reducePrivacyLevel, getNodeSelfPrivacyLevel, MAX_ATTRIBUTE_VALUE_CHAR_LENGTH, } from './privacy';
import { NodeType, } from './types';
import { makeStylesheetUrlsAbsolute, getSerializedNodeId, setSerializedNodeId, getElementInputValue, makeSrcsetUrlsAbsolute, makeUrlAbsolute, } from './serializationUtils';
import { forEach } from './utils';
export function serializeDocument(document, defaultPrivacyLevel) {
    // We are sure that Documents are never ignored, so this function never returns null
    return serializeNodeWithId(document, {
        document: document,
        parentNodePrivacyLevel: defaultPrivacyLevel,
    });
}
export function serializeNodeWithId(node, options) {
    var serializedNode = serializeNode(node, options);
    if (!serializedNode) {
        return null;
    }
    // Try to reuse the previous id
    var id = getSerializedNodeId(node) || generateNextId();
    var serializedNodeWithId = serializedNode;
    serializedNodeWithId.id = id;
    setSerializedNodeId(node, id);
    if (options.serializedNodeIds) {
        options.serializedNodeIds.add(id);
    }
    return serializedNodeWithId;
}
function serializeNode(node, options) {
    switch (node.nodeType) {
        case node.DOCUMENT_NODE:
            return serializeDocumentNode(node, options);
        case node.DOCUMENT_TYPE_NODE:
            return serializeDocumentTypeNode(node);
        case node.ELEMENT_NODE:
            return serializeElementNode(node, options);
        case node.TEXT_NODE:
            return serializeTextNode(node, options);
        case node.CDATA_SECTION_NODE:
            return serializeCDataNode();
    }
}
export function serializeDocumentNode(document, options) {
    return {
        type: NodeType.Document,
        childNodes: serializeChildNodes(document, options),
    };
}
function serializeDocumentTypeNode(documentType) {
    return {
        type: NodeType.DocumentType,
        name: documentType.name,
        publicId: documentType.publicId,
        systemId: documentType.systemId,
    };
}
/**
 * Serialzing Element nodes involves capturing:
 * 1. HTML ATTRIBUTES:
 * 2. JS STATE:
 * - scroll offsets
 * - Form fields (input value, checkbox checked, otpion selection, range)
 * - Canvas state,
 * - Media (video/audio) play mode + currentTime
 * - iframe contents
 * - webcomponents
 * 3. CUSTOM PROPERTIES:
 * - height+width for when `hidden` to cover the element
 * 4. EXCLUDED INTERACTION STATE:
 * - focus (possible, but not worth perf impact)
 * - hover (tracked only via mouse activity)
 * - fullscreen mode
 */
export function serializeElementNode(element, options) {
    var _a;
    var tagName = getValidTagName(element.tagName);
    var isSVG = isSVGElement(element) || undefined;
    // For performance reason, we don't use getNodePrivacyLevel directly: we leverage the
    // parentNodePrivacyLevel option to avoid iterating over all parents
    var nodePrivacyLevel = reducePrivacyLevel(getNodeSelfPrivacyLevel(element), options.parentNodePrivacyLevel);
    if (nodePrivacyLevel === NodePrivacyLevel.HIDDEN) {
        var _b = element.getBoundingClientRect(), width = _b.width, height = _b.height;
        return {
            type: NodeType.Element,
            tagName: tagName,
            attributes: (_a = {
                    rr_width: width + "px",
                    rr_height: height + "px"
                },
                _a[PRIVACY_ATTR_NAME] = PRIVACY_ATTR_VALUE_HIDDEN,
                _a),
            childNodes: [],
            isSVG: isSVG,
        };
    }
    // Ignore Elements like Script and some Link, Metas
    if (nodePrivacyLevel === NodePrivacyLevel.IGNORE) {
        return;
    }
    var attributes = getAttributesForPrivacyLevel(element, nodePrivacyLevel);
    var childNodes = [];
    if (element.childNodes.length) {
        // OBJECT POOLING OPTIMIZATION:
        // We should not create a new object systematically as it could impact performances. Try to reuse
        // the same object as much as possible, and clone it only if we need to.
        var childNodesSerializationOptions = void 0;
        if (options.parentNodePrivacyLevel === nodePrivacyLevel && options.ignoreWhiteSpace === (tagName === 'head')) {
            childNodesSerializationOptions = options;
        }
        else {
            childNodesSerializationOptions = __assign(__assign({}, options), { parentNodePrivacyLevel: nodePrivacyLevel, ignoreWhiteSpace: tagName === 'head' });
        }
        childNodes = serializeChildNodes(element, childNodesSerializationOptions);
    }
    return {
        type: NodeType.Element,
        tagName: tagName,
        attributes: attributes,
        childNodes: childNodes,
        isSVG: isSVG,
    };
}
/**
 * TODO: Preserve CSS element order, and record the presence of the tag, just don't render
 * We don't need this logic on the recorder side.
 * For security related meta's, customer can mask themmanually given they
 * are easy to identify in the HEAD tag.
 */
export function shouldIgnoreElement(element) {
    if (element.nodeName === 'SCRIPT') {
        return true;
    }
    if (element.nodeName === 'LINK') {
        var relAttribute = getLowerCaseAttribute('rel');
        return (
        // Scripts
        (relAttribute === 'preload' && getLowerCaseAttribute('as') === 'script') ||
            // Favicons
            relAttribute === 'shortcut icon' ||
            relAttribute === 'icon');
    }
    if (element.nodeName === 'META') {
        var nameAttribute = getLowerCaseAttribute('name');
        var relAttribute = getLowerCaseAttribute('rel');
        var propertyAttribute = getLowerCaseAttribute('property');
        return (
        // Favicons
        /^msapplication-tile(image|color)$/.test(nameAttribute) ||
            nameAttribute === 'application-name' ||
            relAttribute === 'icon' ||
            relAttribute === 'apple-touch-icon' ||
            relAttribute === 'shortcut icon' ||
            // Description
            nameAttribute === 'keywords' ||
            nameAttribute === 'description' ||
            // Social
            /^(og|twitter|fb):/.test(propertyAttribute) ||
            /^(og|twitter):/.test(nameAttribute) ||
            nameAttribute === 'pinterest' ||
            // Robots
            nameAttribute === 'robots' ||
            nameAttribute === 'googlebot' ||
            nameAttribute === 'bingbot' ||
            // Http headers. Ex: X-UA-Compatible, Content-Type, Content-Language, cache-control,
            // X-Translated-By
            element.hasAttribute('http-equiv') ||
            // Authorship
            nameAttribute === 'author' ||
            nameAttribute === 'generator' ||
            nameAttribute === 'framework' ||
            nameAttribute === 'publisher' ||
            nameAttribute === 'progid' ||
            /^article:/.test(propertyAttribute) ||
            /^product:/.test(propertyAttribute) ||
            // Verification
            nameAttribute === 'google-site-verification' ||
            nameAttribute === 'yandex-verification' ||
            nameAttribute === 'csrf-token' ||
            nameAttribute === 'p:domain_verify' ||
            nameAttribute === 'verify-v1' ||
            nameAttribute === 'verification' ||
            nameAttribute === 'shopify-checkout-api-token');
    }
    function getLowerCaseAttribute(name) {
        return (element.getAttribute(name) || '').toLowerCase();
    }
    return false;
}
/**
 * Text Nodes are dependant on Element nodes
 * Privacy levels are set on elements so we check the parentElement of a text node
 * for privacy level.
 */
function serializeTextNode(textNode, options) {
    var _a;
    // The parent node may not be a html element which has a tagName attribute.
    // So just let it be undefined which is ok in this use case.
    var parentTagName = (_a = textNode.parentElement) === null || _a === void 0 ? void 0 : _a.tagName;
    var textContent = getTextContent(textNode, options.ignoreWhiteSpace || false, options.parentNodePrivacyLevel);
    if (!textContent) {
        return;
    }
    return {
        type: NodeType.Text,
        textContent: textContent,
        isStyle: parentTagName === 'STYLE' ? true : undefined,
    };
}
function serializeCDataNode() {
    return {
        type: NodeType.CDATA,
        textContent: '',
    };
}
export function serializeChildNodes(node, options) {
    var result = [];
    forEach(node.childNodes, function (childNode) {
        var serializedChildNode = serializeNodeWithId(childNode, options);
        if (serializedChildNode) {
            result.push(serializedChildNode);
        }
    });
    return result;
}
export function serializeAttribute(element, nodePrivacyLevel, attributeName) {
    var _a, _b, _c;
    if (nodePrivacyLevel === NodePrivacyLevel.HIDDEN) {
        // dup condition for direct access case
        return null;
    }
    var attributeValue = element.getAttribute(attributeName);
    if (nodePrivacyLevel === NodePrivacyLevel.MASK) {
        var tagName = element.tagName;
        switch (attributeName) {
            // Mask Attribute text content
            case 'title':
            case 'alt':
                return CENSORED_STRING_MARK;
        }
        // mask image URLs
        if (tagName === 'IMG' || tagName === 'SOURCE') {
            if (attributeName === 'src' || attributeName === 'srcset') {
                return CENSORED_IMG_MARK;
            }
        }
        // mask <a> URLs
        if (tagName === 'A' && attributeName === 'href') {
            return CENSORED_STRING_MARK;
        }
        // mask data-* attributes
        if (attributeValue && attributeName.indexOf('data-') === 0 && attributeName !== PRIVACY_ATTR_NAME) {
            // Exception: it's safe to reveal the `${PRIVACY_ATTR_NAME}` attr
            return CENSORED_STRING_MARK;
        }
    }
    if (!attributeValue || typeof attributeValue !== 'string') {
        return attributeValue;
    }
    // Minimum Fix for customer.
    if (attributeValue.length > MAX_ATTRIBUTE_VALUE_CHAR_LENGTH && attributeValue.slice(0, 5) === 'data:') {
        return 'data:truncated';
    }
    // Rebuild absolute URLs from relative (without using <base> tag)
    var doc = element.ownerDocument;
    switch (attributeName) {
        case 'src':
        case 'href':
            return makeUrlAbsolute(attributeValue, (_a = doc.location) === null || _a === void 0 ? void 0 : _a.href);
        case 'srcset':
            return makeSrcsetUrlsAbsolute(attributeValue, (_b = doc.location) === null || _b === void 0 ? void 0 : _b.href);
        case 'style':
            return makeStylesheetUrlsAbsolute(attributeValue, (_c = doc.location) === null || _c === void 0 ? void 0 : _c.href);
        default:
            return attributeValue;
    }
}
var _nextId = 1;
function generateNextId() {
    return _nextId++;
}
var TAG_NAME_REGEX = /[^a-z1-6-_]/;
function getValidTagName(tagName) {
    var processedTagName = tagName.toLowerCase().trim();
    if (TAG_NAME_REGEX.test(processedTagName)) {
        // if the tag name is odd and we cannot extract
        // anything from the string, then we return a
        // generic div
        return 'div';
    }
    return processedTagName;
}
function getCssRulesString(s) {
    try {
        var rules = s.rules || s.cssRules;
        return rules ? Array.from(rules).map(getCssRuleString).join('') : null;
    }
    catch (error) {
        return null;
    }
}
function getCssRuleString(rule) {
    return isCSSImportRule(rule) ? getCssRulesString(rule.styleSheet) || '' : rule.cssText;
}
function isCSSImportRule(rule) {
    return 'styleSheet' in rule;
}
function isSVGElement(el) {
    return el.tagName === 'svg' || el instanceof SVGElement;
}
function getAttributesForPrivacyLevel(element, nodePrivacyLevel) {
    if (nodePrivacyLevel === NodePrivacyLevel.HIDDEN) {
        return {};
    }
    var safeAttrs = {};
    var tagName = getValidTagName(element.tagName);
    var doc = element.ownerDocument;
    for (var i = 0; i < element.attributes.length; i += 1) {
        var attribute = element.attributes.item(i);
        var attributeName = attribute.name;
        var attributeValue = serializeAttribute(element, nodePrivacyLevel, attributeName);
        if (attributeValue !== null) {
            safeAttrs[attributeName] = attributeValue;
        }
    }
    if (element.value &&
        (tagName === 'textarea' || tagName === 'select' || tagName === 'option' || tagName === 'input')) {
        var formValue = getElementInputValue(element, nodePrivacyLevel);
        if (formValue !== undefined) {
            safeAttrs.value = formValue;
        }
    }
    /**
     * <Option> can be selected, which occurs if its `value` matches ancestor `<Select>.value`
     */
    if (tagName === 'option' && nodePrivacyLevel === NodePrivacyLevel.ALLOW) {
        // For privacy=`MASK`, all the values would be the same, so skip.
        var optionElement = element;
        if (optionElement.selected) {
            safeAttrs.selected = optionElement.selected;
        }
    }
    // remote css
    if (tagName === 'link') {
        var stylesheet = Array.from(doc.styleSheets).find(function (s) { return s.href === element.href; });
        var cssText = getCssRulesString(stylesheet);
        if (cssText && stylesheet) {
            delete safeAttrs.rel;
            delete safeAttrs.href;
            safeAttrs._cssText = makeStylesheetUrlsAbsolute(cssText, stylesheet.href);
        }
    }
    // dynamic stylesheet
    if (tagName === 'style' &&
        element.sheet &&
        // TODO: Currently we only try to get dynamic stylesheet when it is an empty style element
        !(element.innerText || element.textContent || '').trim().length) {
        var cssText = getCssRulesString(element.sheet);
        if (cssText) {
            safeAttrs._cssText = makeStylesheetUrlsAbsolute(cssText, location.href);
        }
    }
    /**
     * Forms: input[type=checkbox,radio]
     * The `checked` property for <input> is a little bit special:
     * 1. el.checked is a setter that returns if truthy.
     * 2. getAttribute returns the string value
     * getAttribute('checked') does not sync with `Element.checked`, so use JS property
     * NOTE: `checked` property exists on `HTMLInputElement`. For serializer assumptions, we check for type=radio|check.
     */
    var inputElement = element;
    if (tagName === 'input' && (inputElement.type === 'radio' || inputElement.type === 'checkbox')) {
        if (nodePrivacyLevel === NodePrivacyLevel.ALLOW) {
            safeAttrs.checked = !!inputElement.checked;
        }
        else if (shouldMaskNode(inputElement, nodePrivacyLevel)) {
            safeAttrs.checked = CENSORED_STRING_MARK;
        }
    }
    /**
     * Serialize the media playback state
     */
    if (tagName === 'audio' || tagName === 'video') {
        var mediaElement = element;
        safeAttrs.rr_mediaState = mediaElement.paused ? 'paused' : 'played';
    }
    /**
     * Serialize the scroll state for each element
     */
    if (element.scrollLeft) {
        safeAttrs.rr_scrollLeft = Math.round(element.scrollLeft);
    }
    if (element.scrollTop) {
        safeAttrs.rr_scrollTop = Math.round(element.scrollTop);
    }
    return safeAttrs;
}
//# sourceMappingURL=serialize.js.map