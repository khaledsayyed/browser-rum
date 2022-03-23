"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeTransportConfiguration = void 0;
var tslib_1 = require("tslib");
var init_1 = require("../../boot/init");
var utils_1 = require("../../tools/utils");
var endpointBuilder_1 = require("./endpointBuilder");
function computeTransportConfiguration(initConfiguration, buildEnv) {
    var endpointBuilders = computeEndpointBuilders(initConfiguration, buildEnv);
    var intakeEndpoints = utils_1.objectValues(endpointBuilders).map(function (builder) { return builder.buildIntakeUrl(); });
    var replicaConfiguration = computeReplicaConfiguration(initConfiguration, buildEnv, intakeEndpoints);
    return tslib_1.__assign(tslib_1.__assign({ isIntakeUrl: function (url) { return intakeEndpoints.some(function (intakeEndpoint) { return url.indexOf(intakeEndpoint) === 0; }); } }, endpointBuilders), { replica: replicaConfiguration });
}
exports.computeTransportConfiguration = computeTransportConfiguration;
function computeEndpointBuilders(initConfiguration, buildEnv) {
    if (buildEnv.buildMode === init_1.BuildMode.E2E_TEST) {
        var e2eEndpointBuilder = function (placeholder) { return ({
            build: function () { return placeholder; },
            buildIntakeUrl: function () { return placeholder; },
        }); };
        return {
            logsEndpointBuilder: e2eEndpointBuilder('<<< E2E LOGS ENDPOINT >>>'),
            rumEndpointBuilder: e2eEndpointBuilder('<<< E2E RUM ENDPOINT >>>'),
            sessionReplayEndpointBuilder: e2eEndpointBuilder('<<< E2E SESSION REPLAY ENDPOINT >>>'),
            internalMonitoringEndpointBuilder: e2eEndpointBuilder('<<< E2E INTERNAL MONITORING ENDPOINT >>>'),
        };
    }
    var endpointBuilders = {
        logsEndpointBuilder: endpointBuilder_1.createEndpointBuilder(initConfiguration, buildEnv, 'logs'),
        rumEndpointBuilder: endpointBuilder_1.createEndpointBuilder(initConfiguration, buildEnv, 'rum'),
        sessionReplayEndpointBuilder: endpointBuilder_1.createEndpointBuilder(initConfiguration, buildEnv, 'sessionReplay'),
    };
    if (initConfiguration.internalMonitoringApiKey) {
        return tslib_1.__assign(tslib_1.__assign({}, endpointBuilders), { internalMonitoringEndpointBuilder: endpointBuilder_1.createEndpointBuilder(tslib_1.__assign(tslib_1.__assign({}, initConfiguration), { clientToken: initConfiguration.internalMonitoringApiKey }), buildEnv, 'logs', 'browser-agent-internal-monitoring') });
    }
    return endpointBuilders;
}
function computeReplicaConfiguration(initConfiguration, buildEnv, intakeEndpoints) {
    if (buildEnv.buildMode !== init_1.BuildMode.STAGING || initConfiguration.replica === undefined) {
        return;
    }
    var replicaConfiguration = tslib_1.__assign(tslib_1.__assign({}, initConfiguration), { site: endpointBuilder_1.INTAKE_SITE_US, applicationId: initConfiguration.replica.applicationId, clientToken: initConfiguration.replica.clientToken, useAlternateIntakeDomains: true, intakeApiVersion: 2 });
    var replicaEndpointBuilders = {
        logsEndpointBuilder: endpointBuilder_1.createEndpointBuilder(replicaConfiguration, buildEnv, 'logs'),
        rumEndpointBuilder: endpointBuilder_1.createEndpointBuilder(replicaConfiguration, buildEnv, 'rum'),
        internalMonitoringEndpointBuilder: endpointBuilder_1.createEndpointBuilder(replicaConfiguration, buildEnv, 'logs', 'browser-agent-internal-monitoring'),
    };
    intakeEndpoints.push.apply(intakeEndpoints, utils_1.objectValues(replicaEndpointBuilders).map(function (builder) { return builder.buildIntakeUrl(); }));
    return tslib_1.__assign({ applicationId: initConfiguration.replica.applicationId }, replicaEndpointBuilders);
}
//# sourceMappingURL=transportConfiguration.js.map