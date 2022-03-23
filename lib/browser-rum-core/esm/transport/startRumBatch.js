import { Batch, combine, HttpRequest } from '@datadog/browser-core';
import { LifeCycleEventType } from '../domain/lifeCycle';
import { RumEventType } from '../rawRumEvent.types';
export function startRumBatch(configuration, lifeCycle) {
    var batch = makeRumBatch(configuration, lifeCycle);
    lifeCycle.subscribe(LifeCycleEventType.RUM_EVENT_COLLECTED, function (serverRumEvent) {
        if (serverRumEvent.type === RumEventType.VIEW) {
            batch.upsert(serverRumEvent, serverRumEvent.view.id);
        }
        else {
            batch.add(serverRumEvent);
        }
    });
    return {
        stop: function () { return batch.stop(); },
    };
}
function makeRumBatch(configuration, lifeCycle) {
    var primaryBatch = createRumBatch(configuration.rumEndpointBuilder, function () {
        return lifeCycle.notify(LifeCycleEventType.BEFORE_UNLOAD);
    });
    var replicaBatch;
    var replica = configuration.replica;
    if (replica !== undefined) {
        replicaBatch = createRumBatch(replica.rumEndpointBuilder);
    }
    function createRumBatch(endpointBuilder, unloadCallback) {
        return new Batch(new HttpRequest(endpointBuilder, configuration.batchBytesLimit, { proxyApiKey: configuration.proxyApiKey }), configuration.maxBatchSize, configuration.batchBytesLimit, configuration.maxMessageSize, configuration.flushTimeout, unloadCallback);
    }
    function withReplicaApplicationId(message) {
        return combine(message, { application: { id: replica.applicationId } });
    }
    var stopped = false;
    return {
        add: function (message) {
            if (stopped) {
                return;
            }
            primaryBatch.add(message);
            if (replicaBatch) {
                replicaBatch.add(withReplicaApplicationId(message));
            }
        },
        stop: function () {
            stopped = true;
        },
        upsert: function (message, key) {
            if (stopped) {
                return;
            }
            primaryBatch.upsert(message, key);
            if (replicaBatch) {
                replicaBatch.upsert(withReplicaApplicationId(message), key);
            }
        },
    };
}
//# sourceMappingURL=startRumBatch.js.map