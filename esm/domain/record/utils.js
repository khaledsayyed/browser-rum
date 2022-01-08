export function hookSetter(target, key, d) {
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
export function isTouchEvent(event) {
    return Boolean(event.changedTouches);
}
export function forEach(list, callback) {
    Array.prototype.forEach.call(list, callback);
}
//# sourceMappingURL=utils.js.map