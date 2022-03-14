"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toFormEntries = exports.send = exports.SEND_BEACON_BYTE_LENGTH_LIMIT = void 0;
var browser_core_1 = require("@datadog/browser-core");
exports.SEND_BEACON_BYTE_LENGTH_LIMIT = 60000;
function send(endpointBuilder, data, meta, rawSegmentSize, flushReason, httpRequestOptions) {
    if (httpRequestOptions === void 0) { httpRequestOptions = {}; }
    var formData = new FormData();
    formData.append('segment', new Blob([data], {
        type: 'application/octet-stream',
    }), meta.session.id + "-" + meta.start);
    toFormEntries(meta, function (key, value) { return formData.append(key, value); });
    formData.append('raw_segment_size', rawSegmentSize.toString());
    var request = new browser_core_1.HttpRequest(endpointBuilder, exports.SEND_BEACON_BYTE_LENGTH_LIMIT, httpRequestOptions);
    request.send(formData, data.byteLength, flushReason);
}
exports.send = send;
function toFormEntries(input, onEntry, prefix) {
    if (prefix === void 0) { prefix = ''; }
    browser_core_1.objectEntries(input).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        if (typeof value === 'object' && value !== null) {
            toFormEntries(value, onEntry, "" + prefix + key + ".");
        }
        else {
            onEntry("" + prefix + key, String(value));
        }
    });
}
exports.toFormEntries = toFormEntries;
//# sourceMappingURL=send.js.map