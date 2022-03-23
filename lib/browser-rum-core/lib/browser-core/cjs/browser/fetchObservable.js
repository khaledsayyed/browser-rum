"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initFetchObservable = void 0;
var tslib_1 = require("tslib");
var internalMonitoring_1 = require("../domain/internalMonitoring");
var tracekit_1 = require("../domain/tracekit");
var error_1 = require("../tools/error");
var instrumentMethod_1 = require("../tools/instrumentMethod");
var observable_1 = require("../tools/observable");
var timeUtils_1 = require("../tools/timeUtils");
var urlPolyfill_1 = require("../tools/urlPolyfill");
var fetchObservable;
function initFetchObservable() {
    if (!fetchObservable) {
        fetchObservable = createFetchObservable();
    }
    return fetchObservable;
}
exports.initFetchObservable = initFetchObservable;
function createFetchObservable() {
    var observable = new observable_1.Observable(function () {
        if (!window.fetch) {
            return;
        }
        var stop = instrumentMethod_1.instrumentMethod(window, 'fetch', function (originalFetch) {
            return function (input, init) {
                var responsePromise;
                var context = internalMonitoring_1.callMonitored(beforeSend, null, [observable, input, init]);
                if (context) {
                    responsePromise = originalFetch.call(this, context.input, context.init);
                    internalMonitoring_1.callMonitored(afterSend, null, [observable, responsePromise, context]);
                }
                else {
                    responsePromise = originalFetch.call(this, input, init);
                }
                return responsePromise;
            };
        }).stop;
        return stop;
    });
    return observable;
}
function beforeSend(observable, input, init) {
    var method = (init && init.method) || (typeof input === 'object' && input.method) || 'GET';
    var url = urlPolyfill_1.normalizeUrl((typeof input === 'object' && input.url) || input);
    var startClocks = timeUtils_1.clocksNow();
    var context = {
        state: 'start',
        init: init,
        input: input,
        method: method,
        startClocks: startClocks,
        url: url,
    };
    observable.notify(context);
    return context;
}
function afterSend(observable, responsePromise, startContext) {
    var _this = this;
    var reportFetch = function (response) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var context, text, e_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    context = startContext;
                    context.state = 'complete';
                    context.duration = timeUtils_1.elapsed(context.startClocks.timeStamp, timeUtils_1.timeStampNow());
                    if (!('stack' in response || response instanceof Error)) return [3 /*break*/, 1];
                    context.status = 0;
                    context.responseText = error_1.toStackTraceString(tracekit_1.computeStackTrace(response));
                    context.isAborted = response instanceof DOMException && response.code === DOMException.ABORT_ERR;
                    context.error = response;
                    observable.notify(context);
                    return [3 /*break*/, 6];
                case 1:
                    if (!('status' in response)) return [3 /*break*/, 6];
                    text = void 0;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, response.clone().text()];
                case 3:
                    text = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    text = "Unable to retrieve response: " + e_1;
                    return [3 /*break*/, 5];
                case 5:
                    context.response = response;
                    context.responseText = text;
                    context.responseType = response.type;
                    context.status = response.status;
                    context.isAborted = false;
                    observable.notify(context);
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    }); };
    responsePromise.then(internalMonitoring_1.monitor(reportFetch), internalMonitoring_1.monitor(reportFetch));
}
//# sourceMappingURL=fetchObservable.js.map