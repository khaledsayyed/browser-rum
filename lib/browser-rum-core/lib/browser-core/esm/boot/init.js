import { __assign } from "tslib";
import { setDebugMode } from '../domain/internalMonitoring';
import { catchUserErrors } from '../tools/catchUserErrors';
export function makePublicApi(stub) {
    var publicApi = __assign(__assign({}, stub), { 
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
            return setDebugMode;
        },
        enumerable: false,
    });
    return publicApi;
}
export function defineGlobal(global, name, api) {
    var existingGlobalVariable = global[name];
    global[name] = api;
    if (existingGlobalVariable && existingGlobalVariable.q) {
        existingGlobalVariable.q.forEach(function (fn) { return catchUserErrors(fn, 'onReady callback threw an error:')(); });
    }
}
export var BuildMode;
(function (BuildMode) {
    BuildMode["RELEASE"] = "release";
    BuildMode["STAGING"] = "staging";
    BuildMode["CANARY"] = "canary";
    BuildMode["E2E_TEST"] = "e2e-test";
})(BuildMode || (BuildMode = {}));
//# sourceMappingURL=init.js.map