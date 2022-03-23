import { Batch, HttpRequest } from '../../transport';
export function startMonitoringBatch(configuration) {
    var primaryBatch = createMonitoringBatch(configuration.internalMonitoringEndpointBuilder);
    var replicaBatch;
    if (configuration.replica !== undefined) {
        replicaBatch = createMonitoringBatch(configuration.replica.internalMonitoringEndpointBuilder);
    }
    function createMonitoringBatch(endpointBuilder) {
        return new Batch(new HttpRequest(endpointBuilder, configuration.batchBytesLimit, { proxyApiKey: configuration.proxyApiKey }), configuration.maxBatchSize, configuration.batchBytesLimit, configuration.maxMessageSize, configuration.flushTimeout);
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
//# sourceMappingURL=startMonitoringBatch.js.map