import { __assign } from "tslib";
import { getCurrentSite } from '../../browser/cookie';
import { catchUserErrors } from '../../tools/catchUserErrors';
import { display } from '../../tools/display';
import { isPercentage, ONE_KILO_BYTE, ONE_SECOND } from '../../tools/utils';
import { updateExperimentalFeatures } from './experimentalFeatures';
import { computeTransportConfiguration } from './transportConfiguration';
export var DefaultPrivacyLevel = {
    ALLOW: 'allow',
    MASK: 'mask',
    MASK_USER_INPUT: 'mask-user-input',
};
export function validateAndBuildConfiguration(initConfiguration, buildEnv) {
    var _a;
    if (!initConfiguration || !initConfiguration.clientToken) {
        display.error('Client Token is not configured, we will not send any data.');
        return;
    }
    if (initConfiguration.sampleRate !== undefined && !isPercentage(initConfiguration.sampleRate)) {
        display.error('Sample Rate should be a number between 0 and 100');
        return;
    }
    // Set the experimental feature flags as early as possible so we can use them in most places
    updateExperimentalFeatures(initConfiguration.enableExperimentalFeatures);
    return __assign(__assign({}, computeTransportConfiguration(initConfiguration, buildEnv)), { beforeSend: initConfiguration.beforeSend && catchUserErrors(initConfiguration.beforeSend, 'beforeSend threw an error:'), cookieOptions: buildCookieOptions(initConfiguration), sampleRate: (_a = initConfiguration.sampleRate) !== null && _a !== void 0 ? _a : 100, service: initConfiguration.service, silentMultipleInit: !!initConfiguration.silentMultipleInit, proxyApiKey: initConfiguration.proxyApiKey, 
        /**
         * beacon payload max queue size implementation is 64kb
         * ensure that we leave room for logs, rum and potential other users
         */
        batchBytesLimit: 16 * ONE_KILO_BYTE, maxErrorsPerMinute: 3000, maxInternalMonitoringMessagesPerPage: 15, 
        /**
         * arbitrary value, byte precision not needed
         */
        requestErrorResponseLengthLimit: 32 * ONE_KILO_BYTE, 
        /**
         * flush automatically, aim to be lower than ALB connection timeout
         * to maximize connection reuse.
         */
        flushTimeout: 30 * ONE_SECOND, 
        /**
         * Logs intake limit
         */
        maxBatchSize: 50, maxMessageSize: 256 * ONE_KILO_BYTE });
}
export function buildCookieOptions(initConfiguration) {
    var cookieOptions = {};
    cookieOptions.secure = mustUseSecureCookie(initConfiguration);
    cookieOptions.crossSite = !!initConfiguration.useCrossSiteSessionCookie;
    if (initConfiguration.trackSessionAcrossSubdomains) {
        cookieOptions.domain = getCurrentSite();
    }
    return cookieOptions;
}
function mustUseSecureCookie(initConfiguration) {
    return !!initConfiguration.useSecureSessionCookie || !!initConfiguration.useCrossSiteSessionCookie;
}
//# sourceMappingURL=configuration.js.map