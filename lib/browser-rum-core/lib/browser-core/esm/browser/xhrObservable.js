import { __assign } from "tslib";
import { monitor } from '../domain/internalMonitoring';
import { instrumentMethodAndCallOriginal } from '../tools/instrumentMethod';
import { Observable } from '../tools/observable';
import { elapsed, relativeNow, clocksNow, timeStampNow } from '../tools/timeUtils';
import { normalizeUrl } from '../tools/urlPolyfill';
var xhrObservable;
export function initXhrObservable() {
    if (!xhrObservable) {
        xhrObservable = createXhrObservable();
    }
    return xhrObservable;
}
function createXhrObservable() {
    var observable = new Observable(function () {
        var stopInstrumentingStart = instrumentMethodAndCallOriginal(XMLHttpRequest.prototype, 'open', {
            before: openXhr,
        }).stop;
        var stopInstrumentingSend = instrumentMethodAndCallOriginal(XMLHttpRequest.prototype, 'send', {
            before: function () {
                sendXhr.call(this, observable);
            },
        }).stop;
        var stopInstrumentingAbort = instrumentMethodAndCallOriginal(XMLHttpRequest.prototype, 'abort', {
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
        url: normalizeUrl(url),
    };
}
function sendXhr(observable) {
    var _this = this;
    if (!this._datadog_xhr) {
        return;
    }
    var startContext = this._datadog_xhr;
    startContext.state = 'start';
    startContext.startTime = relativeNow();
    startContext.startClocks = clocksNow();
    startContext.isAborted = false;
    startContext.xhr = this;
    var hasBeenReported = false;
    var stopInstrumentingOnReadyStateChange = instrumentMethodAndCallOriginal(this, 'onreadystatechange', {
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
    var onEnd = monitor(function () {
        _this.removeEventListener('loadend', onEnd);
        stopInstrumentingOnReadyStateChange();
        if (hasBeenReported) {
            return;
        }
        hasBeenReported = true;
        var completeContext = _this._datadog_xhr;
        completeContext.state = 'complete';
        completeContext.duration = elapsed(startContext.startClocks.timeStamp, timeStampNow());
        completeContext.responseText = _this.response;
        completeContext.status = _this.status;
        observable.notify(__assign({}, completeContext));
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