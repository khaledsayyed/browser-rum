"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpRequest = void 0;
var internalMonitoring_1 = require("../domain/internalMonitoring");
var hasReportedXhrError = false;
/**
 * Use POST request without content type to:
 * - avoid CORS preflight requests
 * - allow usage of sendBeacon
 *
 * multiple elements are sent separated by \n in order
 * to be parsed correctly without content type header
 */
var HttpRequest = /** @class */ (function () {
    function HttpRequest(endpointBuilder, bytesLimit, options) {
        this.endpointBuilder = endpointBuilder;
        this.bytesLimit = bytesLimit;
        this.options = options;
    }
    HttpRequest.prototype.send = function (data, size, flushReason) {
        var _a;
        var url = this.endpointBuilder.build();
        // Can't use `navigator.sendBeacon` if we need to send a custom header
        if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.proxyApiKey) {
            fetch(url, {
                method: 'POST',
                headers: {
                    'x-api-key': this.options.proxyApiKey
                },
                body: data,
                // Needed so the fetch is not ignored at the end of the session
                keepalive: true
            }).catch(function (e) { return internalMonitoring_1.addMonitoringError(e); });
            return;
        }
        var tryBeacon = !!navigator.sendBeacon && size < this.bytesLimit;
        if (tryBeacon) {
            try {
                var isQueued = navigator.sendBeacon(url, data);
                if (isQueued) {
                    return;
                }
            }
            catch (e) {
                reportBeaconError(e);
            }
        }
        var transportIntrospection = function (event) {
            var req = event === null || event === void 0 ? void 0 : event.currentTarget;
            if (req.status >= 200 && req.status < 300) {
                return;
            }
            if (!hasReportedXhrError) {
                hasReportedXhrError = true;
                internalMonitoring_1.addMonitoringMessage('XHR fallback failed', {
                    on_line: navigator.onLine,
                    size: size,
                    url: url,
                    try_beacon: tryBeacon,
                    flush_reason: flushReason,
                    event: {
                        is_trusted: event.isTrusted,
                        total: event.total,
                        loaded: event.loaded,
                    },
                    request: {
                        status: req.status,
                        ready_state: req.readyState,
                        response_text: req.responseText.slice(0, 512),
                    },
                });
            }
        };
        var request = new XMLHttpRequest();
        request.addEventListener('loadend', internalMonitoring_1.monitor(function (event) { return transportIntrospection(event); }));
        request.open('POST', url, true);
        request.send(data);
    };
    return HttpRequest;
}());
exports.HttpRequest = HttpRequest;
var hasReportedBeaconError = false;
function reportBeaconError(e) {
    if (!hasReportedBeaconError) {
        hasReportedBeaconError = true;
        internalMonitoring_1.addMonitoringError(e);
    }
}
//# sourceMappingURL=httpRequest.js.map