import { __assign } from "tslib";
import { BuildMode } from '../../boot/init';
import { objectValues } from '../../tools/utils';
import { createEndpointBuilder, INTAKE_SITE_US } from './endpointBuilder';
export function computeTransportConfiguration(initConfiguration, buildEnv) {
    var endpointBuilders = computeEndpointBuilders(initConfiguration, buildEnv);
    var intakeEndpoints = objectValues(endpointBuilders).map(function (builder) { return builder.buildIntakeUrl(); });
    var replicaConfiguration = computeReplicaConfiguration(initConfiguration, buildEnv, intakeEndpoints);
    return __assign(__assign({ isIntakeUrl: function (url) { return intakeEndpoints.some(function (intakeEndpoint) { return url.indexOf(intakeEndpoint) === 0; }); } }, endpointBuilders), { replica: replicaConfiguration });
}
function computeEndpointBuilders(initConfiguration, buildEnv) {
    if (buildEnv.buildMode === BuildMode.E2E_TEST) {
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
        logsEndpointBuilder: createEndpointBuilder(initConfiguration, buildEnv, 'logs'),
        rumEndpointBuilder: createEndpointBuilder(initConfiguration, buildEnv, 'rum'),
        sessionReplayEndpointBuilder: createEndpointBuilder(initConfiguration, buildEnv, 'sessionReplay'),
    };
    if (initConfiguration.internalMonitoringApiKey) {
        return __assign(__assign({}, endpointBuilders), { internalMonitoringEndpointBuilder: createEndpointBuilder(__assign(__assign({}, initConfiguration), { clientToken: initConfiguration.internalMonitoringApiKey }), buildEnv, 'logs', 'browser-agent-internal-monitoring') });
    }
    return endpointBuilders;
}
function computeReplicaConfiguration(initConfiguration, buildEnv, intakeEndpoints) {
    if (buildEnv.buildMode !== BuildMode.STAGING || initConfiguration.replica === undefined) {
        return;
    }
    var replicaConfiguration = __assign(__assign({}, initConfiguration), { site: INTAKE_SITE_US, applicationId: initConfiguration.replica.applicationId, clientToken: initConfiguration.replica.clientToken, useAlternateIntakeDomains: true, intakeApiVersion: 2 });
    var replicaEndpointBuilders = {
        logsEndpointBuilder: createEndpointBuilder(replicaConfiguration, buildEnv, 'logs'),
        rumEndpointBuilder: createEndpointBuilder(replicaConfiguration, buildEnv, 'rum'),
        internalMonitoringEndpointBuilder: createEndpointBuilder(replicaConfiguration, buildEnv, 'logs', 'browser-agent-internal-monitoring'),
    };
    intakeEndpoints.push.apply(intakeEndpoints, objectValues(replicaEndpointBuilders).map(function (builder) { return builder.buildIntakeUrl(); }));
    return __assign({ applicationId: initConfiguration.replica.applicationId }, replicaEndpointBuilders);
}
//# sourceMappingURL=transportConfiguration.js.map