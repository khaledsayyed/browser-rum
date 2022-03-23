"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMonitoringBatch = void 0;
var transport_1 = require("../../transport");
function startMonitoringBatch(configuration) {
    var primaryBatch = createMonitoringBatch(configuration.internalMonitoringEndpointBuilder);
    var replicaBatch;
    if (configuration.replica !== undefined) {
        replicaBatch = createMonitoringBatch(configuration.replica.internalMonitoringEndpointBuilder);
    }
    function createMonitoringBatch(endpointBuilder) {
        return new transport_1.Batch(new transport_1.HttpRequest(endpointBuilder, configuration.batchBytesLimit, { proxyApiKey: configuration.proxyApiKey }), configuration.maxBatchSize, configuration.batchBytesLimit, configuration.maxMessageSize, configuration.flushTimeout);
    }
    return {
        add: function (message) {
            primaryBatch.add(message);
            if (replicaBatch) {
                replicaBatch.add(message);
            }
        },
    };
}
exports.startMonitoringBatch = startMonitoringBatch;
//# sourceMappingURL=startMonitoringBatch.js.map