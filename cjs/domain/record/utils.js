"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forEach = exports.isTouchEvent = exports.hookSetter = void 0;
function hookSetter(target, key, d) {
    var original = Object.getOwnPropertyDescriptor(target, key);
    Object.defineProperty(target, key, {
        set: function (value) {
            var _this = this;
            // put hooked setter into event loop to avoid of set latency
            setTimeout(function () {
                d.set.call(_this, value);
            }, 0);
            if (original && original.set) {
                original.set.call(this, value);
            }
        },
    });
    return function () {
        Object.defineProperty(target, key, original || {});
    };
}
exports.hookSetter = hookSetter;
function isTouchEvent(event) {
    return Boolean(event.changedTouches);
}
exports.isTouchEvent = isTouchEvent;
function forEach(list, callback) {
    Array.prototype.forEach.call(list, callback);
}
exports.forEach = forEach;
//# sourceMappingURL=utils.js.map