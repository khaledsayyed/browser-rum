"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.combine = exports.deepClone = exports.mergeInto = exports.getType = exports.runOnReadyState = exports.addEventListeners = exports.addEventListener = exports.safeTruncate = exports.findCommaSeparatedValue = exports.getLinkElementOrigin = exports.getLocationOrigin = exports.getGlobalObject = exports.mapValues = exports.isEmptyObject = exports.objectEntries = exports.objectHasValue = exports.objectValues = exports.isNumber = exports.isPercentage = exports.find = exports.includes = exports.jsonStringify = exports.noop = exports.round = exports.performDraw = exports.generateUUID = exports.assign = exports.throttle = exports.RequestType = exports.ResourceType = exports.ONE_KILO_BYTE = exports.ONE_YEAR = exports.ONE_DAY = exports.ONE_HOUR = exports.ONE_MINUTE = exports.ONE_SECOND = void 0;
var internalMonitoring_1 = require("../domain/internalMonitoring");
exports.ONE_SECOND = 1000;
exports.ONE_MINUTE = 60 * exports.ONE_SECOND;
exports.ONE_HOUR = 60 * exports.ONE_MINUTE;
exports.ONE_DAY = 24 * exports.ONE_HOUR;
exports.ONE_YEAR = 365 * exports.ONE_DAY;
exports.ONE_KILO_BYTE = 1024;
var ResourceType;
(function (ResourceType) {
    ResourceType["DOCUMENT"] = "document";
    ResourceType["XHR"] = "xhr";
    ResourceType["BEACON"] = "beacon";
    ResourceType["FETCH"] = "fetch";
    ResourceType["CSS"] = "css";
    ResourceType["JS"] = "js";
    ResourceType["IMAGE"] = "image";
    ResourceType["FONT"] = "font";
    ResourceType["MEDIA"] = "media";
    ResourceType["OTHER"] = "other";
})(ResourceType = exports.ResourceType || (exports.ResourceType = {}));
var RequestType;
(function (RequestType) {
    RequestType["FETCH"] = "fetch";
    RequestType["XHR"] = "xhr";
})(RequestType = exports.RequestType || (exports.RequestType = {}));
// use lodash API
function throttle(fn, wait, options) {
    var needLeadingExecution = options && options.leading !== undefined ? options.leading : true;
    var needTrailingExecution = options && options.trailing !== undefined ? options.trailing : true;
    var inWaitPeriod = false;
    var pendingExecutionWithParameters;
    var pendingTimeoutId;
    return {
        throttled: function () {
            var parameters = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                parameters[_i] = arguments[_i];
            }
            if (inWaitPeriod) {
                pendingExecutionWithParameters = parameters;
                return;
            }
            if (needLeadingExecution) {
                fn.apply(void 0, parameters);
            }
            else {
                pendingExecutionWithParameters = parameters;
            }
            inWaitPeriod = true;
            pendingTimeoutId = setTimeout(function () {
                if (needTrailingExecution && pendingExecutionWithParameters) {
                    fn.apply(void 0, pendingExecutionWithParameters);
                }
                inWaitPeriod = false;
                pendingExecutionWithParameters = undefined;
            }, wait);
        },
        cancel: function () {
            clearTimeout(pendingTimeoutId);
            inWaitPeriod = false;
            pendingExecutionWithParameters = undefined;
        },
    };
}
exports.throttle = throttle;
function assign(target) {
    var toAssign = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        toAssign[_i - 1] = arguments[_i];
    }
    toAssign.forEach(function (source) {
        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    });
}
exports.assign = assign;
/**
 * UUID v4
 * from https://gist.github.com/jed/982883
 */
function generateUUID(placeholder) {
    return placeholder
        ? // eslint-disable-next-line  no-bitwise
            (parseInt(placeholder, 10) ^ ((Math.random() * 16) >> (parseInt(placeholder, 10) / 4))).toString(16)
        : (1e7 + "-" + 1e3 + "-" + 4e3 + "-" + 8e3 + "-" + 1e11).replace(/[018]/g, generateUUID);
}
exports.generateUUID = generateUUID;
/**
 * Return true if the draw is successful
 * @param threshold between 0 and 100
 */
function performDraw(threshold) {
    return threshold !== 0 && Math.random() * 100 <= threshold;
}
exports.performDraw = performDraw;
function round(num, decimals) {
    return +num.toFixed(decimals);
}
exports.round = round;
// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() { }
exports.noop = noop;
/**
 * Custom implementation of JSON.stringify that ignores value.toJSON.
 * We need to do that because some sites badly override toJSON on certain objects.
 * Note this still supposes that JSON.stringify is correct...
 */
function jsonStringify(value, replacer, space) {
    if (value === null || value === undefined) {
        return JSON.stringify(value);
    }
    var originalToJSON = [false, undefined];
    if (hasToJSON(value)) {
        // We need to add a flag and not rely on the truthiness of value.toJSON
        // because it can be set but undefined and that's actually significant.
        originalToJSON = [true, value.toJSON];
        delete value.toJSON;
    }
    var originalProtoToJSON = [false, undefined];
    var prototype;
    if (typeof value === 'object') {
        prototype = Object.getPrototypeOf(value);
        if (hasToJSON(prototype)) {
            originalProtoToJSON = [true, prototype.toJSON];
            delete prototype.toJSON;
        }
    }
    var result;
    try {
        result = JSON.stringify(value, replacer, space);
    }
    catch (_a) {
        result = '<error: unable to serialize object>';
    }
    finally {
        if (originalToJSON[0]) {
            ;
            value.toJSON = originalToJSON[1];
        }
        if (originalProtoToJSON[0]) {
            ;
            prototype.toJSON = originalProtoToJSON[1];
        }
    }
    return result;
}
exports.jsonStringify = jsonStringify;
function hasToJSON(value) {
    return typeof value === 'object' && value !== null && Object.prototype.hasOwnProperty.call(value, 'toJSON');
}
function includes(candidate, search) {
    return candidate.indexOf(search) !== -1;
}
exports.includes = includes;
function find(array, predicate) {
    for (var i = 0; i < array.length; i += 1) {
        var item = array[i];
        if (predicate(item, i, array)) {
            return item;
        }
    }
    return undefined;
}
exports.find = find;
function isPercentage(value) {
    return isNumber(value) && value >= 0 && value <= 100;
}
exports.isPercentage = isPercentage;
function isNumber(value) {
    return typeof value === 'number';
}
exports.isNumber = isNumber;
function objectValues(object) {
    return Object.keys(object).map(function (key) { return object[key]; });
}
exports.objectValues = objectValues;
function objectHasValue(object, value) {
    return Object.keys(object).some(function (key) { return object[key] === value; });
}
exports.objectHasValue = objectHasValue;
function objectEntries(object) {
    return Object.keys(object).map(function (key) { return [key, object[key]]; });
}
exports.objectEntries = objectEntries;
function isEmptyObject(object) {
    return Object.keys(object).length === 0;
}
exports.isEmptyObject = isEmptyObject;
function mapValues(object, fn) {
    var newObject = {};
    for (var _i = 0, _a = Object.keys(object); _i < _a.length; _i++) {
        var key = _a[_i];
        newObject[key] = fn(object[key]);
    }
    return newObject;
}
exports.mapValues = mapValues;
/**
 * inspired by https://mathiasbynens.be/notes/globalthis
 */
function getGlobalObject() {
    if (typeof globalThis === 'object') {
        return globalThis;
    }
    Object.defineProperty(Object.prototype, '_dd_temp_', {
        get: function () {
            return this;
        },
        configurable: true,
    });
    // @ts-ignore _dd_temp is defined using defineProperty
    var globalObject = _dd_temp_;
    // @ts-ignore _dd_temp is defined using defineProperty
    delete Object.prototype._dd_temp_;
    if (typeof globalObject !== 'object') {
        // on safari _dd_temp_ is available on window but not globally
        // fallback on other browser globals check
        if (typeof self === 'object') {
            globalObject = self;
        }
        else if (typeof window === 'object') {
            globalObject = window;
        }
        else {
            globalObject = {};
        }
    }
    return globalObject;
}
exports.getGlobalObject = getGlobalObject;
function getLocationOrigin() {
    return getLinkElementOrigin(window.location);
}
exports.getLocationOrigin = getLocationOrigin;
/**
 * IE fallback
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/origin
 */
function getLinkElementOrigin(element) {
    if (element.origin) {
        return element.origin;
    }
    var sanitizedHost = element.host.replace(/(:80|:443)$/, '');
    return element.protocol + "//" + sanitizedHost;
}
exports.getLinkElementOrigin = getLinkElementOrigin;
function findCommaSeparatedValue(rawString, name) {
    var regex = new RegExp("(?:^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
    var matches = regex.exec(rawString);
    return matches ? matches[1] : undefined;
}
exports.findCommaSeparatedValue = findCommaSeparatedValue;
function safeTruncate(candidate, length) {
    var lastChar = candidate.charCodeAt(length - 1);
    // check if it is the high part of a surrogate pair
    if (lastChar >= 0xd800 && lastChar <= 0xdbff) {
        return candidate.slice(0, length + 1);
    }
    return candidate.slice(0, length);
}
exports.safeTruncate = safeTruncate;
/**
 * Add an event listener to an event emitter object (Window, Element, mock object...).  This provides
 * a few conveniences compared to using `element.addEventListener` directly:
 *
 * * supports IE11 by: using an option object only if needed and emulating the `once` option
 *
 * * wraps the listener with a `monitor` function
 *
 * * returns a `stop` function to remove the listener
 */
function addEventListener(emitter, event, listener, options) {
    return addEventListeners(emitter, [event], listener, options);
}
exports.addEventListener = addEventListener;
/**
 * Add event listeners to an event emitter object (Window, Element, mock object...).  This provides
 * a few conveniences compared to using `element.addEventListener` directly:
 *
 * * supports IE11 by: using an option object only if needed and emulating the `once` option
 *
 * * wraps the listener with a `monitor` function
 *
 * * returns a `stop` function to remove the listener
 *
 * * with `once: true`, the listener will be called at most once, even if different events are listened
 */
function addEventListeners(emitter, events, listener, _a) {
    var _b = _a === void 0 ? {} : _a, once = _b.once, capture = _b.capture, passive = _b.passive;
    var wrappedListener = internalMonitoring_1.monitor(once
        ? function (event) {
            stop();
            listener(event);
        }
        : listener);
    var options = passive ? { capture: capture, passive: passive } : capture;
    events.forEach(function (event) { return emitter.addEventListener(event, wrappedListener, options); });
    var stop = function () { return events.forEach(function (event) { return emitter.removeEventListener(event, wrappedListener, options); }); };
    return {
        stop: stop,
    };
}
exports.addEventListeners = addEventListeners;
function runOnReadyState(expectedReadyState, callback) {
    if (document.readyState === expectedReadyState || document.readyState === 'complete') {
        callback();
    }
    else {
        var eventName = expectedReadyState === 'complete' ? "load" /* LOAD */ : "DOMContentLoaded" /* DOM_CONTENT_LOADED */;
        addEventListener(window, eventName, callback, { once: true });
    }
}
exports.runOnReadyState = runOnReadyState;
/**
 * Similar to `typeof`, but distinguish plain objects from `null` and arrays
 */
function getType(value) {
    if (value === null) {
        return 'null';
    }
    if (Array.isArray(value)) {
        return 'array';
    }
    return typeof value;
}
exports.getType = getType;
function createCircularReferenceChecker() {
    if (typeof WeakSet !== 'undefined') {
        var set_1 = new WeakSet();
        return {
            hasAlreadyBeenSeen: function (value) {
                var has = set_1.has(value);
                if (!has) {
                    set_1.add(value);
                }
                return has;
            },
        };
    }
    var array = [];
    return {
        hasAlreadyBeenSeen: function (value) {
            var has = array.indexOf(value) >= 0;
            if (!has) {
                array.push(value);
            }
            return has;
        },
    };
}
/**
 * Iterate over source and affect its sub values into destination, recursively.
 * If the source and destination can't be merged, return source.
 */
function mergeInto(destination, source, circularReferenceChecker) {
    if (circularReferenceChecker === void 0) { circularReferenceChecker = createCircularReferenceChecker(); }
    // ignore the source if it is undefined
    if (source === undefined) {
        return destination;
    }
    if (typeof source !== 'object' || source === null) {
        // primitive values - just return source
        return source;
    }
    else if (source instanceof Date) {
        return new Date(source.getTime());
    }
    else if (source instanceof RegExp) {
        var flags = source.flags ||
            // old browsers compatibility
            [
                source.global ? 'g' : '',
                source.ignoreCase ? 'i' : '',
                source.multiline ? 'm' : '',
                source.sticky ? 'y' : '',
                source.unicode ? 'u' : '',
            ].join('');
        return new RegExp(source.source, flags);
    }
    if (circularReferenceChecker.hasAlreadyBeenSeen(source)) {
        // remove circular references
        return undefined;
    }
    else if (Array.isArray(source)) {
        var merged_1 = Array.isArray(destination) ? destination : [];
        for (var i = 0; i < source.length; ++i) {
            merged_1[i] = mergeInto(merged_1[i], source[i], circularReferenceChecker);
        }
        return merged_1;
    }
    var merged = getType(destination) === 'object' ? destination : {};
    for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            merged[key] = mergeInto(merged[key], source[key], circularReferenceChecker);
        }
    }
    return merged;
}
exports.mergeInto = mergeInto;
/**
 * A simplistic implementation of a deep clone algorithm.
 * Caveats:
 * - It doesn't maintain prototype chains - don't use with instances of custom classes.
 * - It doesn't handle Map and Set
 */
function deepClone(value) {
    return mergeInto(undefined, value);
}
exports.deepClone = deepClone;
function combine() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    var destination;
    for (var _a = 0, sources_1 = sources; _a < sources_1.length; _a++) {
        var source = sources_1[_a];
        // Ignore any undefined or null sources.
        if (source === undefined || source === null) {
            continue;
        }
        destination = mergeInto(destination, source);
    }
    return destination;
}
exports.combine = combine;
//# sourceMappingURL=utils.js.map