"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.willSyntheticsInjectRum = exports.getSyntheticsContext = exports.SYNTHETICS_INJECTS_RUM_COOKIE_NAME = exports.SYNTHETICS_RESULT_ID_COOKIE_NAME = exports.SYNTHETICS_TEST_ID_COOKIE_NAME = void 0;
var browser_core_1 = require("@datadog/browser-core");
exports.SYNTHETICS_TEST_ID_COOKIE_NAME = 'datadog-synthetics-public-id';
exports.SYNTHETICS_RESULT_ID_COOKIE_NAME = 'datadog-synthetics-result-id';
exports.SYNTHETICS_INJECTS_RUM_COOKIE_NAME = 'datadog-synthetics-injects-rum';
function getSyntheticsContext() {
    var testId = window._DATADOG_SYNTHETICS_PUBLIC_ID || browser_core_1.getCookie(exports.SYNTHETICS_TEST_ID_COOKIE_NAME);
    var resultId = window._DATADOG_SYNTHETICS_RESULT_ID || browser_core_1.getCookie(exports.SYNTHETICS_RESULT_ID_COOKIE_NAME);
    if (typeof testId === 'string' && typeof resultId === 'string') {
        return {
            test_id: testId,
            result_id: resultId,
            injected: willSyntheticsInjectRum(),
        };
    }
}
exports.getSyntheticsContext = getSyntheticsContext;
function willSyntheticsInjectRum() {
    return Boolean(window._DATADOG_SYNTHETICS_INJECTS_RUM || browser_core_1.getCookie(exports.SYNTHETICS_INJECTS_RUM_COOKIE_NAME));
}
exports.willSyntheticsInjectRum = willSyntheticsInjectRum;
//# sourceMappingURL=syntheticsContext.js.map