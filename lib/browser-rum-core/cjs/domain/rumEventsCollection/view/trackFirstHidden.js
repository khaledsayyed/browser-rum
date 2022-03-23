"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetFirstHidden = exports.trackFirstHidden = void 0;
var browser_core_1 = require("@datadog/browser-core");
var trackFirstHiddenSingleton;
var stopListeners;
function trackFirstHidden(emitter) {
    if (emitter === void 0) { emitter = window; }
    if (!trackFirstHiddenSingleton) {
        if (document.visibilityState === 'hidden') {
            trackFirstHiddenSingleton = { timeStamp: 0 };
        }
        else {
            trackFirstHiddenSingleton = {
                timeStamp: Infinity,
            };
            (stopListeners = browser_core_1.addEventListener(emitter, "pagehide" /* PAGE_HIDE */, function (_a) {
                var timeStamp = _a.timeStamp;
                trackFirstHiddenSingleton.timeStamp = timeStamp;
            }, { capture: true, once: true }).stop);
        }
    }
    return trackFirstHiddenSingleton;
}
exports.trackFirstHidden = trackFirstHidden;
function resetFirstHidden() {
    if (stopListeners) {
        stopListeners();
    }
    trackFirstHiddenSingleton = undefined;
}
exports.resetFirstHidden = resetFirstHidden;
//# sourceMappingURL=trackFirstHidden.js.map