"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildMode = exports.defineGlobal = exports.makePublicApi = void 0;
var tslib_1 = require("tslib");
var internalMonitoring_1 = require("../domain/internalMonitoring");
var catchUserErrors_1 = require("../tools/catchUserErrors");
function makePublicApi(stub) {
    var publicApi = tslib_1.__assign(tslib_1.__assign({}, stub), { 
        // This API method is intentionally not monitored, since the only thing executed is the
        // user-provided 'callback'.  All SDK usages executed in the callback should be monitored, and
        // we don't want to interfere with the user uncaught exceptions.
        onReady: function (callback) {
            callback();
        } });
    // Add an "hidden" property to set debug mode. We define it that way to hide it
    // as much as possible but of course it's not a real protection.
    Object.defineProperty(publicApi, '_setDebug', {
        get: function () {
            return internalMonitoring_1.setDebugMode;
        },
        enumerable: false,
    });
    return publicApi;
}
exports.makePublicApi = makePublicApi;
function defineGlobal(global, name, api) {
    var existingGlobalVariable = global[name];
    global[name] = api;
    if (existingGlobalVariable && existingGlobalVariable.q) {
        existingGlobalVariable.q.forEach(function (fn) { return catchUserErrors_1.catchUserErrors(fn, 'onReady callback threw an error:')(); });
    }
}
exports.defineGlobal = defineGlobal;
var BuildMode;
(function (BuildMode) {
    BuildMode["RELEASE"] = "release";
    BuildMode["STAGING"] = "staging";
    BuildMode["CANARY"] = "canary";
    BuildMode["E2E_TEST"] = "e2e-test";
})(BuildMode = exports.BuildMode || (exports.BuildMode = {}));
//# sourceMappingURL=init.js.map