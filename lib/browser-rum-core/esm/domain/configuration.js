import { __assign } from "tslib";
import { DefaultPrivacyLevel, display, isPercentage, objectHasValue, validateAndBuildConfiguration, } from '@datadog/browser-core';
import { buildEnv } from '../boot/buildEnv';
export function validateAndBuildRumConfiguration(initConfiguration) {
    var _a, _b;
    if (!initConfiguration.applicationId) {
        display.error('Application ID is not configured, no RUM data will be collected.');
        return;
    }
    if (initConfiguration.replaySampleRate !== undefined && !isPercentage(initConfiguration.replaySampleRate)) {
        display.error('Replay Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.allowedTracingOrigins !== undefined) {
        if (!Array.isArray(initConfiguration.allowedTracingOrigins)) {
            display.error('Allowed Tracing Origins should be an array');
            return;
        }
        if (initConfiguration.allowedTracingOrigins.length !== 0 && initConfiguration.service === undefined) {
            display.error('Service need to be configured when tracing is enabled');
            return;
        }
    }
    var baseConfiguration = validateAndBuildConfiguration(initConfiguration, buildEnv);
    if (!baseConfiguration) {
        return;
    }
    return __assign(__assign({}, baseConfiguration), { applicationId: initConfiguration.applicationId, actionNameAttribute: initConfiguration.actionNameAttribute, replaySampleRate: (_a = initConfiguration.replaySampleRate) !== null && _a !== void 0 ? _a : 100, allowedTracingOrigins: (_b = initConfiguration.allowedTracingOrigins) !== null && _b !== void 0 ? _b : [], trackInteractions: !!initConfiguration.trackInteractions, trackViewsManually: !!initConfiguration.trackViewsManually, defaultPrivacyLevel: objectHasValue(DefaultPrivacyLevel, initConfiguration.defaultPrivacyLevel)
            ? initConfiguration.defaultPrivacyLevel
            : DefaultPrivacyLevel.MASK_USER_INPUT, maxActionsPerMinute: 3000, proxyApiKey: initConfiguration.proxyApiKey });
}
//# sourceMappingURL=configuration.js.map