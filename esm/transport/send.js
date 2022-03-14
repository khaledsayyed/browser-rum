import { HttpRequest, objectEntries } from '@datadog/browser-core';
export var SEND_BEACON_BYTE_LENGTH_LIMIT = 60000;
export function send(endpointBuilder, data, meta, rawSegmentSize, flushReason, httpRequestOptions) {
    if (httpRequestOptions === void 0) { httpRequestOptions = {}; }
    var formData = new FormData();
    formData.append('segment', new Blob([data], {
        type: 'application/octet-stream',
    }), meta.session.id + "-" + meta.start);
    toFormEntries(meta, function (key, value) { return formData.append(key, value); });
    formData.append('raw_segment_size', rawSegmentSize.toString());
    var request = new HttpRequest(endpointBuilder, SEND_BEACON_BYTE_LENGTH_LIMIT, httpRequestOptions);
    request.send(formData, data.byteLength, flushReason);
}
export function toFormEntries(input, onEntry, prefix) {
    if (prefix === void 0) { prefix = ''; }
    objectEntries(input).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        if (typeof value === 'object' && value !== null) {
            toFormEntries(value, onEntry, "" + prefix + key + ".");
        }
        else {
            onEntry("" + prefix + key, String(value));
        }
    });
}
//# sourceMappingURL=send.js.map