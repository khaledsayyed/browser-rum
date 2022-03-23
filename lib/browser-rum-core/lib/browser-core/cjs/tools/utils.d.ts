export declare const ONE_SECOND = 1000;
export declare const ONE_MINUTE: number;
export declare const ONE_HOUR: number;
export declare const ONE_DAY: number;
export declare const ONE_YEAR: number;
export declare const ONE_KILO_BYTE = 1024;
export declare const enum DOM_EVENT {
    BEFORE_UNLOAD = "beforeunload",
    CLICK = "click",
    DBL_CLICK = "dblclick",
    KEY_DOWN = "keydown",
    LOAD = "load",
    POP_STATE = "popstate",
    SCROLL = "scroll",
    TOUCH_START = "touchstart",
    TOUCH_END = "touchend",
    TOUCH_MOVE = "touchmove",
    VISIBILITY_CHANGE = "visibilitychange",
    DOM_CONTENT_LOADED = "DOMContentLoaded",
    POINTER_DOWN = "pointerdown",
    POINTER_UP = "pointerup",
    POINTER_CANCEL = "pointercancel",
    HASH_CHANGE = "hashchange",
    PAGE_HIDE = "pagehide",
    MOUSE_DOWN = "mousedown",
    MOUSE_UP = "mouseup",
    MOUSE_MOVE = "mousemove",
    FOCUS = "focus",
    BLUR = "blur",
    CONTEXT_MENU = "contextmenu",
    RESIZE = "resize",
    CHANGE = "change",
    INPUT = "input",
    PLAY = "play",
    PAUSE = "pause"
}
export declare enum ResourceType {
    DOCUMENT = "document",
    XHR = "xhr",
    BEACON = "beacon",
    FETCH = "fetch",
    CSS = "css",
    JS = "js",
    IMAGE = "image",
    FONT = "font",
    MEDIA = "media",
    OTHER = "other"
}
export declare enum RequestType {
    FETCH = "fetch",
    XHR = "xhr"
}
export declare function throttle<T extends (...args: any[]) => void>(fn: T, wait: number, options?: {
    leading?: boolean;
    trailing?: boolean;
}): {
    throttled: (...parameters: Parameters<T>) => void;
    cancel: () => void;
};
interface Assignable {
    [key: string]: any;
}
export declare function assign(target: Assignable, ...toAssign: Assignable[]): void;
/**
 * UUID v4
 * from https://gist.github.com/jed/982883
 */
export declare function generateUUID(placeholder?: string): string;
/**
 * Return true if the draw is successful
 * @param threshold between 0 and 100
 */
export declare function performDraw(threshold: number): boolean;
export declare function round(num: number, decimals: 0 | 1 | 2 | 3 | 4): number;
export declare function noop(): void;
/**
 * Custom implementation of JSON.stringify that ignores value.toJSON.
 * We need to do that because some sites badly override toJSON on certain objects.
 * Note this still supposes that JSON.stringify is correct...
 */
export declare function jsonStringify(value: unknown, replacer?: Array<string | number>, space?: string | number): string | undefined;
export declare function includes(candidate: string, search: string): boolean;
export declare function includes<T>(candidate: T[], search: T): boolean;
export declare function find<T, S extends T>(array: T[], predicate: (item: T, index: number, array: T[]) => item is S): S | undefined;
export declare function isPercentage(value: unknown): boolean;
export declare function isNumber(value: unknown): value is number;
export declare function objectValues<T = unknown>(object: {
    [key: string]: T;
}): T[];
export declare function objectHasValue<T extends {
    [key: string]: unknown;
}>(object: T, value: unknown): value is T[keyof T];
export declare function objectEntries(object: {
    [key: string]: unknown;
}): Array<[string, unknown]>;
export declare function isEmptyObject(object: object): boolean;
export declare function mapValues<A, B>(object: {
    [key: string]: A;
}, fn: (arg: A) => B): {
    [key: string]: B;
};
/**
 * inspired by https://mathiasbynens.be/notes/globalthis
 */
export declare function getGlobalObject<T>(): T;
export declare function getLocationOrigin(): string;
/**
 * IE fallback
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/origin
 */
export declare function getLinkElementOrigin(element: Location | HTMLAnchorElement | URL): string;
export declare function findCommaSeparatedValue(rawString: string, name: string): string | undefined;
export declare function safeTruncate(candidate: string, length: number): string;
export interface EventEmitter {
    addEventListener(event: DOM_EVENT, listener: (event: Event) => void, options?: boolean | {
        capture?: boolean;
        passive?: boolean;
    }): void;
    removeEventListener(event: DOM_EVENT, listener: (event: Event) => void, options?: boolean | {
        capture?: boolean;
        passive?: boolean;
    }): void;
}
interface AddEventListenerOptions {
    once?: boolean;
    capture?: boolean;
    passive?: boolean;
}
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
export declare function addEventListener<E extends Event>(emitter: EventEmitter, event: DOM_EVENT, listener: (event: E) => void, options?: AddEventListenerOptions): {
    stop: () => void;
};
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
export declare function addEventListeners<E extends Event>(emitter: EventEmitter, events: DOM_EVENT[], listener: (event: E) => void, { once, capture, passive }?: {
    once?: boolean;
    capture?: boolean;
    passive?: boolean;
}): {
    stop: () => void;
};
export declare function runOnReadyState(expectedReadyState: 'complete' | 'interactive', callback: () => void): void;
/**
 * Similar to `typeof`, but distinguish plain objects from `null` and arrays
 */
export declare function getType(value: unknown): "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "null" | "array";
declare type Merged<TDestination, TSource> = TSource extends undefined ? TDestination : TDestination extends undefined ? TSource : TSource extends any[] ? TDestination extends any[] ? TDestination & TSource : TSource : TSource extends object ? TDestination extends object ? TDestination extends any[] ? TSource : TDestination & TSource : TSource : TSource;
interface CircularReferenceChecker {
    hasAlreadyBeenSeen(value: any): boolean;
}
/**
 * Iterate over source and affect its sub values into destination, recursively.
 * If the source and destination can't be merged, return source.
 */
export declare function mergeInto<D, S>(destination: D, source: S, circularReferenceChecker?: CircularReferenceChecker): Merged<D, S>;
/**
 * A simplistic implementation of a deep clone algorithm.
 * Caveats:
 * - It doesn't maintain prototype chains - don't use with instances of custom classes.
 * - It doesn't handle Map and Set
 */
export declare function deepClone<T>(value: T): T;
declare type Combined<A, B> = A extends null ? B : B extends null ? A : Merged<A, B>;
export declare function combine<A, B>(a: A, b: B): Combined<A, B>;
export declare function combine<A, B, C>(a: A, b: B, c: C): Combined<Combined<A, B>, C>;
export declare function combine<A, B, C, D>(a: A, b: B, c: C, d: D): Combined<Combined<Combined<A, B>, C>, D>;
export declare function combine<A, B, C, D, E>(a: A, b: B, c: C, d: D, e: E): Combined<Combined<Combined<Combined<A, B>, C>, D>, E>;
export declare type ThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any ? U : unknown;
export declare type Parameters<T extends (...args: any[]) => any> = T extends (...args: infer P) => any ? P : never;
export declare type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
export {};
