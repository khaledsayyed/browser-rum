import { getCookie } from '@datadog/browser-core';
export var SYNTHETICS_TEST_ID_COOKIE_NAME = 'datadog-synthetics-public-id';
export var SYNTHETICS_RESULT_ID_COOKIE_NAME = 'datadog-synthetics-result-id';
export var SYNTHETICS_INJECTS_RUM_COOKIE_NAME = 'datadog-synthetics-injects-rum';
export function getSyntheticsContext() {
    var testId = window._DATADOG_SYNTHETICS_PUBLIC_ID || getCookie(SYNTHETICS_TEST_ID_COOKIE_NAME);
    var resultId = window._DATADOG_SYNTHETICS_RESULT_ID || getCookie(SYNTHETICS_RESULT_ID_COOKIE_NAME);
    if (typeof testId === 'string' && typeof resultId === 'string') {
        return {
            test_id: testId,
            result_id: resultId,
            injected: willSyntheticsInjectRum(),
        };
    }
}
export function willSyntheticsInjectRum() {
    return Boolean(window._DATADOG_SYNTHETICS_INJECTS_RUM || getCookie(SYNTHETICS_INJECTS_RUM_COOKIE_NAME));
}
//# sourceMappingURL=syntheticsContext.js.map