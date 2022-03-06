var _a;
import { __assign } from "tslib";
import { monitor, callMonitored, throttle, addEventListeners, addEventListener, includes, isExperimentalFeatureEnabled, noop, } from '@datadog/browser-core';
import { NodePrivacyLevel } from '../../constants';
import { getNodePrivacyLevel, shouldMaskNode } from './privacy';
import { getElementInputValue, getSerializedNodeId, hasSerializedNode } from './serializationUtils';
import { IncrementalSource, MediaInteractions, MouseInteractions, } from './types';
import { forEach, hookSetter, isTouchEvent } from './utils';
import { startMutationObserver } from './mutationObserver';
import { getVisualViewport, getWindowHeight, getWindowWidth, getScrollX, getScrollY, convertMouseEventToLayoutCoordinates, } from './viewports';
var MOUSE_MOVE_OBSERVER_THRESHOLD = 50;
var SCROLL_OBSERVER_THRESHOLD = 100;
var VISUAL_VIEWPORT_OBSERVER_THRESHOLD = 200;
export function initObservers(o) {
    var mutationHandler = initMutationObserver(o.mutationController, o.mutationCb, o.defaultPrivacyLevel);
    var mousemoveHandler = initMoveObserver(o.mousemoveCb);
    var mouseInteractionHandler = initMouseInteractionObserver(o.mouseInteractionCb, o.defaultPrivacyLevel);
    var scrollHandler = initScrollObserver(o.scrollCb, o.defaultPrivacyLevel);
    var viewportResizeHandler = initViewportResizeObserver(o.viewportResizeCb);
    var inputHandler = initInputObserver(o.inputCb, o.defaultPrivacyLevel);
    var mediaInteractionHandler = initMediaInteractionObserver(o.mediaInteractionCb, o.defaultPrivacyLevel);
    var styleSheetObserver = initStyleSheetObserver(o.styleSheetRuleCb);
    var focusHandler = initFocusObserver(o.focusCb);
    var visualViewportResizeHandler = isExperimentalFeatureEnabled('visualviewport')
        ? initVisualViewportResizeObserver(o.visualViewportResizeCb)
        : noop;
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
function initMutationObserver(mutationController, cb, defaultPrivacyLevel) {
    return startMutationObserver(mutationController, cb, defaultPrivacyLevel).stop;
}
function initMoveObserver(cb) {
    var updatePosition = throttle(monitor(function (event) {
        var target = event.target;
        if (hasSerializedNode(target)) {
            var _a = isTouchEvent(event) ? event.changedTouches[0] : event, clientX = _a.clientX, clientY = _a.clientY;
            var position = {
                id: getSerializedNodeId(target),
                timeOffset: 0,
                x: clientX,
                y: clientY,
            };
            if (isExperimentalFeatureEnabled('visualviewport') && window.visualViewport) {
                var _b = convertMouseEventToLayoutCoordinates(clientX, clientY), visualViewportX = _b.visualViewportX, visualViewportY = _b.visualViewportY;
                position.x = visualViewportX;
                position.y = visualViewportY;
            }
            cb([position], isTouchEvent(event) ? IncrementalSource.TouchMove : IncrementalSource.MouseMove);
        }
    }), MOUSE_MOVE_OBSERVER_THRESHOLD, {
        trailing: false,
    }).throttled;
    return addEventListeners(document, ["mousemove" /* MOUSE_MOVE */, "touchmove" /* TOUCH_MOVE */], updatePosition, {
        capture: true,
        passive: true,
    }).stop;
}
var eventTypeToMouseInteraction = (_a = {},
    _a["mouseup" /* MOUSE_UP */] = MouseInteractions.MouseUp,
    _a["mousedown" /* MOUSE_DOWN */] = MouseInteractions.MouseDown,
    _a["click" /* CLICK */] = MouseInteractions.Click,
    _a["contextmenu" /* CONTEXT_MENU */] = MouseInteractions.ContextMenu,
    _a["dblclick" /* DBL_CLICK */] = MouseInteractions.DblClick,
    _a["focus" /* FOCUS */] = MouseInteractions.Focus,
    _a["blur" /* BLUR */] = MouseInteractions.Blur,
    _a["touchstart" /* TOUCH_START */] = MouseInteractions.TouchStart,
    _a["touchend" /* TOUCH_END */] = MouseInteractions.TouchEnd,
    _a);
function initMouseInteractionObserver(cb, defaultPrivacyLevel) {
    var handler = function (event) {
        var target = event.target;
        if (getNodePrivacyLevel(target, defaultPrivacyLevel) === NodePrivacyLevel.HIDDEN || !hasSerializedNode(target)) {
            return;
        }
        var _a = isTouchEvent(event) ? event.changedTouches[0] : event, clientX = _a.clientX, clientY = _a.clientY;
        var position = {
            id: getSerializedNodeId(target),
            type: eventTypeToMouseInteraction[event.type],
            x: clientX,
            y: clientY,
        };
        if (isExperimentalFeatureEnabled('visualviewport') && window.visualViewport) {
            var _b = convertMouseEventToLayoutCoordinates(clientX, clientY), visualViewportX = _b.visualViewportX, visualViewportY = _b.visualViewportY;
            position.x = visualViewportX;
            position.y = visualViewportY;
        }
        cb(position);
    };
    return addEventListeners(document, Object.keys(eventTypeToMouseInteraction), handler, {
        capture: true,
        passive: true,
    }).stop;
}
function initScrollObserver(cb, defaultPrivacyLevel) {
    var updatePosition = throttle(monitor(function (event) {
        var target = event.target;
        if (!target ||
            getNodePrivacyLevel(target, defaultPrivacyLevel) === NodePrivacyLevel.HIDDEN ||
            !hasSerializedNode(target)) {
            return;
        }
        var id = getSerializedNodeId(target);
        if (target === document) {
            if (isExperimentalFeatureEnabled('visualviewport')) {
                cb({
                    id: id,
                    x: getScrollX(),
                    y: getScrollY(),
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
    return addEventListener(document, "scroll" /* SCROLL */, updatePosition, { capture: true, passive: true }).stop;
}
function initViewportResizeObserver(cb) {
    var updateDimension = throttle(monitor(function () {
        var height = getWindowHeight();
        var width = getWindowWidth();
        cb({
            height: Number(height),
            width: Number(width),
        });
    }), 200).throttled;
    return addEventListener(window, "resize" /* RESIZE */, updateDimension, { capture: true, passive: true }).stop;
}
export var INPUT_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];
var lastInputStateMap = new WeakMap();
export function initInputObserver(cb, defaultPrivacyLevel) {
    function eventHandler(event) {
        var target = event.target;
        var nodePrivacyLevel = getNodePrivacyLevel(target, defaultPrivacyLevel);
        if (!target ||
            !target.tagName ||
            !includes(INPUT_TAGS, target.tagName) ||
            nodePrivacyLevel === NodePrivacyLevel.HIDDEN) {
            return;
        }
        var type = target.type;
        var inputState;
        if (type === 'radio' || type === 'checkbox') {
            if (shouldMaskNode(target, nodePrivacyLevel)) {
                return;
            }
            inputState = { isChecked: target.checked };
        }
        else {
            var value = getElementInputValue(target, nodePrivacyLevel);
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
            forEach(document.querySelectorAll("input[type=\"radio\"][name=\"" + name + "\"]"), function (el) {
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
        if (!hasSerializedNode(target)) {
            return;
        }
        var lastInputState = lastInputStateMap.get(target);
        if (!lastInputState ||
            lastInputState.text !== inputState.text ||
            lastInputState.isChecked !== inputState.isChecked) {
            lastInputStateMap.set(target, inputState);
            cb(__assign(__assign({}, inputState), { id: getSerializedNodeId(target) }));
        }
    }
    var stopEventListeners = addEventListeners(document, ["input" /* INPUT */, "change" /* CHANGE */], eventHandler, {
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
            return hookSetter(p[0], p[1], {
                set: monitor(function () {
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
function initStyleSheetObserver(cb) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    var insertRule = CSSStyleSheet.prototype.insertRule;
    CSSStyleSheet.prototype.insertRule = function (rule, index) {
        var _this = this;
        callMonitored(function () {
            if (hasSerializedNode(_this.ownerNode)) {
                cb({
                    id: getSerializedNodeId(_this.ownerNode),
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
        callMonitored(function () {
            if (hasSerializedNode(_this.ownerNode)) {
                cb({
                    id: getSerializedNodeId(_this.ownerNode),
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
            getNodePrivacyLevel(target, defaultPrivacyLevel) === NodePrivacyLevel.HIDDEN ||
            !hasSerializedNode(target)) {
            return;
        }
        mediaInteractionCb({
            id: getSerializedNodeId(target),
            type: event.type === "play" /* PLAY */ ? MediaInteractions.Play : MediaInteractions.Pause,
        });
    };
    return addEventListeners(document, ["play" /* PLAY */, "pause" /* PAUSE */], handler, { capture: true, passive: true }).stop;
}
function initFocusObserver(focusCb) {
    return addEventListeners(window, ["focus" /* FOCUS */, "blur" /* BLUR */], function () {
        focusCb({ has_focus: document.hasFocus() });
    }).stop;
}
function initVisualViewportResizeObserver(cb) {
    if (!window.visualViewport) {
        return noop;
    }
    var _a = throttle(monitor(function () {
        cb(getVisualViewport());
    }), VISUAL_VIEWPORT_OBSERVER_THRESHOLD, {
        trailing: false,
    }), updateDimension = _a.throttled, cancelThrottle = _a.cancel;
    var removeListener = addEventListeners(window.visualViewport, ["resize" /* RESIZE */, "scroll" /* SCROLL */], updateDimension, {
        capture: true,
        passive: true,
    }).stop;
    return function stop() {
        removeListener();
        cancelThrottle();
    };
}
//# sourceMappingURL=observer.js.map