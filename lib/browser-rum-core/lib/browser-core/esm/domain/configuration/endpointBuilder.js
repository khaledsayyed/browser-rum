import { timeStampNow } from '../../tools/timeUtils';
import { normalizeUrl } from '../../tools/urlPolyfill';
import { generateUUID, includes } from '../../tools/utils';
export var ENDPOINTS = {
    alternate: {
        logs: 'logs',
        rum: 'rum',
        sessionReplay: 'session-replay',
    },
    classic: {
        logs: 'browser',
        rum: 'rum',
        // session-replay has no classic endpoint
        sessionReplay: undefined,
    },
};
var INTAKE_TRACKS = {
    logs: 'logs',
    rum: 'rum',
    sessionReplay: 'replay',
};
export var INTAKE_SITE_US = 'datadoghq.com';
var INTAKE_SITE_US3 = 'us3.datadoghq.com';
var INTAKE_SITE_GOV = 'ddog-gov.com';
var INTAKE_SITE_EU = 'datadoghq.eu';
var CLASSIC_ALLOWED_SITES = [INTAKE_SITE_US, INTAKE_SITE_EU];
var INTAKE_V1_ALLOWED_SITES = [INTAKE_SITE_US, INTAKE_SITE_US3, INTAKE_SITE_EU, INTAKE_SITE_GOV];
export function createEndpointBuilder(initConfiguration, buildEnv, endpointType, source) {
    var sdkVersion = buildEnv.sdkVersion;
    var proxyUrl = initConfiguration.proxyUrl && normalizeUrl(initConfiguration.proxyUrl);
    var _a = initConfiguration.site, site = _a === void 0 ? INTAKE_SITE_US : _a, clientToken = initConfiguration.clientToken, env = initConfiguration.env, proxyHost = initConfiguration.proxyHost, service = initConfiguration.service, version = initConfiguration.version, intakeApiVersion = initConfiguration.intakeApiVersion, useAlternateIntakeDomains = initConfiguration.useAlternateIntakeDomains;
    var host = buildHost(endpointType);
    var path = buildPath(endpointType);
    function build() {
        var queryParameters = buildQueryParameters(endpointType, source);
        var endpoint = "https://" + host + path + "?" + queryParameters;
        if (proxyUrl) {
            return proxyUrl + "?ddforward=" + encodeURIComponent(endpoint);
        }
        else if (proxyHost) {
            return "https://" + proxyHost + path + "?ddhost=" + host + "&" + queryParameters;
        }
        return endpoint;
    }
    function buildIntakeUrl() {
        if (proxyUrl) {
            return proxyUrl + "?ddforward";
        }
        var endpoint = build();
        return endpoint.slice(0, endpoint.indexOf('?'));
    }
    function buildHost(endpointType) {
        if (shouldUseAlternateDomain(endpointType)) {
            var endpoint_1 = ENDPOINTS.alternate[endpointType];
            var domainParts = site.split('.');
            var extension = domainParts.pop();
            var suffix = domainParts.join('-') + "." + extension;
            return endpoint_1 + ".browser-intake-" + suffix;
        }
        var endpoint = ENDPOINTS.classic[endpointType];
        return endpoint + "-http-intake.logs." + site;
    }
    function buildPath(endpointType) {
        return shouldUseIntakeV2(endpointType) ? "/api/v2/" + INTAKE_TRACKS[endpointType] : "/v1/input/" + clientToken;
    }
    function buildQueryParameters(endpointType, source) {
        var tags = "sdk_version:" + sdkVersion +
            ("" + (env ? ",env:" + env : '')) +
            ("" + (service ? ",service:" + service : '')) +
            ("" + (version ? ",version:" + version : ''));
        var parameters = "ddsource=" + (source || 'browser') + "&ddtags=" + encodeURIComponent(tags);
        if (shouldUseIntakeV2(endpointType)) {
            parameters +=
                "&dd-api-key=" + clientToken +
                    ("&dd-evp-origin-version=" + encodeURIComponent(sdkVersion)) +
                    "&dd-evp-origin=browser" +
                    ("&dd-request-id=" + generateUUID());
        }
        if (endpointType === 'rum') {
            parameters += "&batch_time=" + timeStampNow();
        }
        return parameters;
    }
    function shouldUseIntakeV2(endpointType) {
        return intakeApiVersion === 2 || !includes(INTAKE_V1_ALLOWED_SITES, site) || endpointType === 'sessionReplay';
    }
    function shouldUseAlternateDomain(endpointType) {
        return useAlternateIntakeDomains || !includes(CLASSIC_ALLOWED_SITES, site) || endpointType === 'sessionReplay';
    }
    return {
        build: build,
        buildIntakeUrl: buildIntakeUrl,
    };
}
//# sourceMappingURL=endpointBuilder.js.map