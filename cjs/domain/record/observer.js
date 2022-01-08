"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.initInputObserver = exports.INPUT_TAGS = exports.initObservers = void 0;
var tslib_1 = require("tslib");
var browser_core_1 = require("@datadog/browser-core");
var constants_1 = require("../../constants");
var privacy_1 = require("./privacy");
var serializationUtils_1 = require("./serializationUtils");
var types_1 = require("./types");
var utils_1 = require("./utils");
var mutationObserver_1 = require("./mutationObserver");
var viewports_1 = require("./viewports");
var MOUSE_MOVE_OBSERVER_THRESHOLD = 50;
var SCROLL_OBSERVER_THRESHOLD = 100;
var VISUAL_VIEWPORT_OBSERVER_THRESHOLD = 200;
function initObservers(o) {
    var mutationHandler = initMutationObserver(o.mutationController, o.mutationCb, o.defaultPrivacyLevel);
    var mousemoveHandler = initMoveObserver(o.mousemoveCb);
    var mouseInteractionHandler = initMouseInteractionObserver(o.mouseInteractionCb, o.defaultPrivacyLevel);
    var scrollHandler = initScrollObserver(o.scrollCb, o.defaultPrivacyLevel);
    var viewportResizeHandler = initViewportResizeObserver(o.viewportResizeCb);
    var inputHandler = initInputObserver(o.inputCb, o.defaultPrivacyLevel);
    var mediaInteractionHandler = initMediaInteractionObserver(o.mediaInteractionCb, o.defaultPrivacyLevel);
    var styleSheetObserver = initStyleSheetObserver(o.styleSheetRuleCb);
    var focusHandler = initFocusObserver(o.focusCb);
    var visualViewportResizeHandler = (0, browser_core_1.isExperimentalFeatureEnabled)('visualviewport')
        ? initVisualViewportResizeObserver(o.visualViewportResizeCb)
        : browser_core_1.noop;
    return function () {
        mutationHandler();
        mousemoveHandler();
        mouseInteractionHandler();
        scrollHandler();
        viewportResizeHandler();
        inputHandler();
        mediaInteractionHandler();
        styleSheetObserver();
        focusHandler();
        visualViewportResizeHandler();
    };
}
exports.initObservers = initObservers;
function initMutationObserver(mutationController, cb, defaultPrivacyLevel) {
    return (0, mutationObserver_1.startMutationObserver)(mutationController, cb, defaultPrivacyLevel).stop;
}
function initMoveObserver(cb) {
    var updatePosition = (0, browser_core_1.throttle)((0, browser_core_1.monitor)(function (event) {
        var target = event.target;
        if ((0, serializationUtils_1.hasSerializedNode)(target)) {
            var _a = (0, utils_1.isTouchEvent)(event) ? event.changedTouches[0] : event, clientX = _a.clientX, clientY = _a.clientY;
            var position = {
                id: (0, serializationUtils_1.getSerializedNodeId)(target),
                timeOffset: 0,
                x: clientX,
                y: clientY,
            };
            if ((0, browser_core_1.isExperimentalFeatureEnabled)('visualviewport') && window.visualViewport) {
                var _b = (0, viewports_1.convertMouseEventToLayoutCoordinates)(clientX, clientY), visualViewportX = _b.visualViewportX, visualViewportY = _b.visualViewportY;
                position.x = visualViewportX;
                position.y = visualViewportY;
            }
            cb([position], (0, utils_1.isTouchEvent)(event) ? types_1.IncrementalSource.TouchMove : types_1.IncrementalSource.MouseMove);
        }
    }), MOUSE_MOVE_OBSERVER_THRESHOLD, {
        trailing: false,
    }).throttled;
    return (0, browser_core_1.addEventListeners)(document, ["mousemove" /* MOUSE_MOVE */, "touchmove" /* TOUCH_MOVE */], updatePosition, {
        capture: true,
        passive: true,
    }).stop;
}
var eventTypeToMouseInteraction = (_a = {},
    _a["mouseup" /* MOUSE_UP */] = types_1.MouseInteractions.MouseUp,
    _a["mousedown" /* MOUSE_DOWN */] = types_1.MouseInteractions.MouseDown,
    _a["click" /* CLICK */] = types_1.MouseInteractions.Click,
    _a["contextmenu" /* CONTEXT_MENU */] = types_1.MouseInteractions.ContextMenu,
    _a["dblclick" /* DBL_CLICK */] = types_1.MouseInteractions.DblClick,
    _a["focus" /* FOCUS */] = types_1.MouseInteractions.Focus,
    _a["blur" /* BLUR */] = types_1.MouseInteractions.Blur,
    _a["touchstart" /* TOUCH_START */] = types_1.MouseInteractions.TouchStart,
    _a["touchend" /* TOUCH_END */] = types_1.MouseInteractions.TouchEnd,
    _a);
function initMouseInteractionObserver(cb, defaultPrivacyLevel) {
    var handler = function (event) {
        var target = event.target;
        if ((0, privacy_1.getNodePrivacyLevel)(target, defaultPrivacyLevel) === constants_1.NodePrivacyLevel.HIDDEN || !(0, serializationUtils_1.hasSerializedNode)(target)) {
            return;
        }
        var _a = (0, utils_1.isTouchEvent)(event) ? event.changedTouches[0] : event, clientX = _a.clientX, clientY = _a.clientY;
        var position = {
            id: (0, serializationUtils_1.getSerializedNodeId)(target),
            type: eventTypeToMouseInteraction[event.type],
            x: clientX,
            y: clientY,
        };
        if ((0, browser_core_1.isExperimentalFeatureEnabled)('visualviewport') && window.visualViewport) {
            var _b = (0, viewports_1.convertMouseEventToLayoutCoordinates)(clientX, clientY), visualViewportX = _b.visualViewportX, visualViewportY = _b.visualViewportY;
            position.x = visualViewportX;
            position.y = visualViewportY;
        }
        cb(position);
    };
    return (0, browser_core_1.addEventListeners)(document, Object.keys(eventTypeToMouseInteraction), handler, {
        capture: true,
        passive: true,
    }).stop;
}
function initScrollObserver(cb, defaultPrivacyLevel) {
    var updatePosition = (0, browser_core_1.throttle)((0, browser_core_1.monitor)(function (event) {
        var target = event.target;
        if (!target ||
            (0, privacy_1.getNodePrivacyLevel)(target, defaultPrivacyLevel) === constants_1.NodePrivacyLevel.HIDDEN ||
            !(0, serializationUtils_1.hasSerializedNode)(target)) {
            return;
        }
        var id = (0, serializationUtils_1.getSerializedNodeId)(target);
        if (target === document) {
            if ((0, browser_core_1.isExperimentalFeatureEnabled)('visualviewport')) {
                cb({
                    id: id,
                    x: (0, viewports_1.getScrollX)(),
                    y: (0, viewports_1.getScrollY)(),
                });
            }
            else {
                var scrollEl = (document.scrollingElement || document.documentElement);
                cb({
                    id: id,
                    x: scrollEl.scrollLeft,
                    y: scrollEl.scrollTop,
                });
            }
        }
        else {
            cb({
                id: id,
                x: target.scrollLeft,
                y: target.scrollTop,
            });
        }
    }), SCROLL_OBSERVER_THRESHOLD).throttled;
    return (0, browser_core_1.addEventListener)(document, "scroll" /* SCROLL */, updatePosition, { capture: true, passive: true }).stop;
}
function initViewportResizeObserver(cb) {
    var updateDimension = (0, browser_core_1.throttle)((0, browser_core_1.monitor)(function () {
        var height = (0, viewports_1.getWindowHeight)();
        var width = (0, viewports_1.getWindowWidth)();
        cb({
            height: Number(height),
            width: Number(width),
        });
    }), 200).throttled;
    return (0, browser_core_1.addEventListener)(window, "resize" /* RESIZE */, updateDimension, { capture: true, passive: true }).stop;
}
exports.INPUT_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];
var lastInputStateMap = new WeakMap();
function initInputObserver(cb, defaultPrivacyLevel) {
    function eventHandler(event) {
        var target = event.target;
        var nodePrivacyLevel = (0, privacy_1.getNodePrivacyLevel)(target, defaultPrivacyLevel);
        if (!target ||
            !target.tagName ||
            !(0, browser_core_1.includes)(exports.INPUT_TAGS, target.tagName) ||
            nodePrivacyLevel === constants_1.NodePrivacyLevel.HIDDEN) {
            return;
        }
        var type = target.type;
        var inputState;
        if (type === 'radio' || type === 'checkbox') {
            if ((0, privacy_1.shouldMaskNode)(target, nodePrivacyLevel)) {
                return;
            }
            inputState = { isChecked: target.checked };
        }
        else {
            var value = (0, serializationUtils_1.getElementInputValue)(target, nodePrivacyLevel);
            if (value === undefined) {
                return;
            }
            inputState = { text: value };
        }
        // Can be multiple changes on the same node within the same batched mutation observation.
        cbWithDedup(target, inputState);
        // If a radio was checked, other radios with the same name attribute will be unchecked.
        var name = target.name;
        if (type === 'radio' && name && target.checked) {
            (0, utils_1.forEach)(document.querySelectorAll("input[type=\"radio\"][name=\"".concat(name, "\"]")), function (el) {
                if (el !== target) {
                    // TODO: Consider the privacy implications for various differing input privacy levels
                    cbWithDedup(el, { isChecked: false });
                }
            });
        }
    }
    /**
     * There can be multiple changes on the same node within the same batched mutation observation.
     */
    function cbWithDedup(target, inputState) {
        if (!(0, serializationUtils_1.hasSerializedNode)(target)) {
            return;
        }
        var lastInputState = lastInputStateMap.get(target);
        if (!lastInputState ||
            lastInputState.text !== inputState.text ||
            lastInputState.isChecked !== inputState.isChecked) {
            lastInputStateMap.set(target, inputState);
            cb((0, tslib_1.__assign)((0, tslib_1.__assign)({}, inputState), { id: (0, serializationUtils_1.getSerializedNodeId)(target) }));
        }
    }
    var stopEventListeners = (0, browser_core_1.addEventListeners)(document, ["input" /* INPUT */, "change" /* CHANGE */], eventHandler, {
        capture: true,
        passive: true,
    }).stop;
    var propertyDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    var hookProperties = [
        [HTMLInputElement.prototype, 'value'],
        [HTMLInputElement.prototype, 'checked'],
        [HTMLSelectElement.prototype, 'value'],
        [HTMLTextAreaElement.prototype, 'value'],
        // Some UI library use selectedIndex to set select value
        [HTMLSelectElement.prototype, 'selectedIndex'],
    ];
    var hookResetters = [];
    if (propertyDescriptor && propertyDescriptor.set) {
        hookResetters.push.apply(hookResetters, hookProperties.map(function (p) {
            return (0, utils_1.hookSetter)(p[0], p[1], {
                set: (0, browser_core_1.monitor)(function () {
                    // mock to a normal event
                    eventHandler({ target: this });
                }),
            });
        }));
    }
    return function () {
        hookResetters.forEach(function (h) { return h(); });
        stopEventListeners();
    };
}
exports.initInputObserver = initInputObserver;
function initStyleSheetObserver(cb) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    var insertRule = CSSStyleSheet.prototype.insertRule;
    CSSStyleSheet.prototype.insertRule = function (rule, index) {
        var _this = this;
        (0, browser_core_1.callMonitored)(function () {
            if ((0, serializationUtils_1.hasSerializedNode)(_this.ownerNode)) {
                cb({
                    id: (0, serializationUtils_1.getSerializedNodeId)(_this.ownerNode),
                    adds: [{ rule: rule, index: index }],
                });
            }
        });
        return insertRule.call(this, rule, index);
    };
    // eslint-disable-next-line @typescript-eslint/unbound-method
    var deleteRule = CSSStyleSheet.prototype.deleteRule;
    CSSStyleSheet.prototype.deleteRule = function (index) {
        var _this = this;
        (0, browser_core_1.callMonitored)(function () {
            if ((0, serializationUtils_1.hasSerializedNode)(_this.ownerNode)) {
                cb({
                    id: (0, serializationUtils_1.getSerializedNodeId)(_this.ownerNode),
                    removes: [{ index: index }],
                });
            }
        });
        return deleteRule.call(this, index);
    };
    return function () {
        CSSStyleSheet.prototype.insertRule = insertRule;
        CSSStyleSheet.prototype.deleteRule = deleteRule;
    };
}
function initMediaInteractionObserver(mediaInteractionCb, defaultPrivacyLevel) {
    var handler = function (event) {
        var target = event.target;
        if (!target ||
            (0, privacy_1.getNodePrivacyLevel)(target, defaultPrivacyLevel) === constants_1.NodePrivacyLevel.HIDDEN ||
            !(0, serializationUtils_1.hasSerializedNode)(target)) {
            return;
        }
        mediaInteractionCb({
            id: (0, serializationUtils_1.getSerializedNodeId)(target),
            type: event.type === "play" /* PLAY */ ? types_1.MediaInteractions.Play : types_1.MediaInteractions.Pause,
        });
    };
    return (0, browser_core_1.addEventListeners)(document, ["play" /* PLAY */, "pause" /* PAUSE */], handler, { capture: true, passive: true }).stop;
}
function initFocusObserver(focusCb) {
    return (0, browser_core_1.addEventListeners)(window, ["focus" /* FOCUS */, "blur" /* BLUR */], function () {
        focusCb({ has_focus: document.hasFocus() });
    }).stop;
}
function initVisualViewportResizeObserver(cb) {
    if (!window.visualViewport) {
        return browser_core_1.noop;
    }
    var _a = (0, browser_core_1.throttle)((0, browser_core_1.monitor)(function () {
        cb((0, viewports_1.getVisualViewport)());
    }), VISUAL_VIEWPORT_OBSERVER_THRESHOLD, {
        trailing: false,
    }), updateDimension = _a.throttled, cancelThrottle = _a.cancel;
    var removeListener = (0, browser_core_1.addEventListeners)(window.visualViewport, ["resize" /* RESIZE */, "scroll" /* SCROLL */], updateDimension, {
        capture: true,
        passive: true,
    }).stop;
    return function stop() {
        removeListener();
        cancelThrottle();
    };
}
//# sourceMappingURL=observer.js.map