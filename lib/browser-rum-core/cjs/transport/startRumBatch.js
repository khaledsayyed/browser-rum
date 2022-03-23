"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRumBatch = void 0;
var browser_core_1 = require("@datadog/browser-core");
var lifeCycle_1 = require("../domain/lifeCycle");
var rawRumEvent_types_1 = require("../rawRumEvent.types");
function startRumBatch(configuration, lifeCycle) {
    var batch = makeRumBatch(configuration, lifeCycle);
    lifeCycle.subscribe(lifeCycle_1.LifeCycleEventType.RUM_EVENT_COLLECTED, function (serverRumEvent) {
        if (serverRumEvent.type === rawRumEvent_types_1.RumEventType.VIEW) {
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
exports.startRumBatch = startRumBatch;
function makeRumBatch(configuration, lifeCycle) {
    var primaryBatch = createRumBatch(configuration.rumEndpointBuilder, function () {
        return lifeCycle.notify(lifeCycle_1.LifeCycleEventType.BEFORE_UNLOAD);
    });
    var replicaBatch;
    var replica = configuration.replica;
    if (replica !== undefined) {
        replicaBatch = createRumBatch(replica.rumEndpointBuilder);
    }
    function createRumBatch(endpointBuilder, unloadCallback) {
        return new browser_core_1.Batch(new browser_core_1.HttpRequest(endpointBuilder, configuration.batchBytesLimit, { proxyApiKey: configuration.proxyApiKey }), configuration.maxBatchSize, configuration.batchBytesLimit, configuration.maxMessageSize, configuration.flushTimeout, unloadCallback);
    }
    function withReplicaApplicationId(message) {
        return browser_core_1.combine(message, { application: { id: replica.applicationId } });
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