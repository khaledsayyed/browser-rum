import { __assign } from "tslib";
import { LifeCycleEventType, } from '@datadog/browser-rum-core';
import { record } from '../domain/record';
import { startSegmentCollection } from '../domain/segmentCollection';
import { send } from '../transport/send';
import { RecordType } from '../types';
export function startRecording(lifeCycle, configuration, sessionManager, parentContexts, worker) {
    var _a = startSegmentCollection(lifeCycle, configuration.applicationId, sessionManager, parentContexts, function (data, meta, rawSegmentSize, flushReason) {
        return send(configuration.sessionReplayEndpointBuilder, data, meta, rawSegmentSize, flushReason, {
            proxyApiKey: configuration.proxyApiKey
        });
    }, worker), addRecord = _a.addRecord, stopSegmentCollection = _a.stop;
    function addRawRecord(rawRecord) {
        addRecord(__assign(__assign({}, rawRecord), { timestamp: Date.now() }));
    }
    var _b = record({
        emit: addRawRecord,
        defaultPrivacyLevel: configuration.defaultPrivacyLevel,
    }), stopRecording = _b.stop, takeFullSnapshot = _b.takeFullSnapshot, flushMutations = _b.flushMutations;
    var unsubscribeViewEnded = lifeCycle.subscribe(LifeCycleEventType.VIEW_ENDED, function () {
        flushMutations();
        addRawRecord({
            type: RecordType.ViewEnd,
        });
    }).unsubscribe;
    var unsubscribeViewCreated = lifeCycle.subscribe(LifeCycleEventType.VIEW_CREATED, takeFullSnapshot).unsubscribe;
    return {
        stop: function () {
            unsubscribeViewEnded();
            unsubscribeViewCreated();
            stopRecording();
            stopSegmentCollection();
        },
    };
}
//# sourceMappingURL=startRecording.js.map