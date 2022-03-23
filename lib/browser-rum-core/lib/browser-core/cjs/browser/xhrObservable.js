"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initXhrObservable = void 0;
var tslib_1 = require("tslib");
var internalMonitoring_1 = require("../domain/internalMonitoring");
var instrumentMethod_1 = require("../tools/instrumentMethod");
var observable_1 = require("../tools/observable");
var timeUtils_1 = require("../tools/timeUtils");
var urlPolyfill_1 = require("../tools/urlPolyfill");
var xhrObservable;
function initXhrObservable() {
    if (!xhrObservable) {
        xhrObservable = createXhrObservable();
    }
    return xhrObservable;
}
exports.initXhrObservable = initXhrObservable;
function createXhrObservable() {
    var observable = new observable_1.Observable(function () {
        var stopInstrumentingStart = instrumentMethod_1.instrumentMethodAndCallOriginal(XMLHttpRequest.prototype, 'open', {
            before: openXhr,
        }).stop;
        var stopInstrumentingSend = instrumentMethod_1.instrumentMethodAndCallOriginal(XMLHttpRequest.prototype, 'send', {
            before: function () {
                sendXhr.call(this, observable);
            },
        }).stop;
        var stopInstrumentingAbort = instrumentMethod_1.instrumentMethodAndCallOriginal(XMLHttpRequest.prototype, 'abort', {
            before: abortXhr,
        }).stop;
        return function () {
            stopInstrumentingStart();
            stopInstrumentingSend();
            stopInstrumentingAbort();
        };
    });
    return observable;
}
function openXhr(method, url) {
    // WARN: since this data structure is tied to the instance, it is shared by both logs and rum
    // and can be used by different code versions depending on customer setup
    // so it should stay compatible with older versions
    this._datadog_xhr = {
        state: 'open',
        method: method,
        url: urlPolyfill_1.normalizeUrl(url),
    };
}
function sendXhr(observable) {
    var _this = this;
    if (!this._datadog_xhr) {
        return;
    }
    var startContext = this._datadog_xhr;
    startContext.state = 'start';
    startContext.startTime = timeUtils_1.relativeNow();
    startContext.startClocks = timeUtils_1.clocksNow();
    startContext.isAborted = false;
    startContext.xhr = this;
    var hasBeenReported = false;
    var stopInstrumentingOnReadyStateChange = instrumentMethod_1.instrumentMethodAndCallOriginal(this, 'onreadystatechange', {
        before: function () {
            if (this.readyState === XMLHttpRequest.DONE) {
                // Try to report the XHR as soon as possible, because the XHR may be mutated by the
                // application during a future event. For example, Angular is calling .abort() on
                // completed requests during a onreadystatechange event, so the status becomes '0'
                // before the request is collected.
                onEnd();
            }
        },
    }).stop;
    var onEnd = internalMonitoring_1.monitor(function () {
        _this.removeEventListener('loadend', onEnd);
        stopInstrumentingOnReadyStateChange();
        if (hasBeenReported) {
            return;
        }
        hasBeenReported = true;
        var completeContext = _this._datadog_xhr;
        completeContext.state = 'complete';
        completeContext.duration = timeUtils_1.elapsed(startContext.startClocks.timeStamp, timeUtils_1.timeStampNow());
        completeContext.responseText = _this.response;
        completeContext.status = _this.status;
        observable.notify(tslib_1.__assign({}, completeContext));
    });
    this.addEventListener('loadend', onEnd);
    observable.notify(startContext);
}
function abortXhr() {
    if (this._datadog_xhr) {
        this._datadog_xhr.isAborted = true;
    }
}
//# sourceMappingURL=xhrObservable.js.map