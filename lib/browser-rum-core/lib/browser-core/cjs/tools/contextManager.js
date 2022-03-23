"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContextManager = void 0;
function createContextManager() {
    var context = {};
    return {
        get: function () { return context; },
        add: function (key, value) {
            context[key] = value;
        },
        remove: function (key) {
            delete context[key];
        },
        set: function (newContext) {
            context = newContext;
        },
    };
}
exports.createContextManager = createContextManager;
//# sourceMappingURL=contextManager.js.map