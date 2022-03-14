"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRecording = void 0;
var tslib_1 = require("tslib");
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var record_1 = require("../domain/record");
var segmentCollection_1 = require("../domain/segmentCollection");
var send_1 = require("../transport/send");
var types_1 = require("../types");
function startRecording(lifeCycle, configuration, sessionManager, parentContexts, worker) {
    var _a = segmentCollection_1.startSegmentCollection(lifeCycle, configuration.applicationId, sessionManager, parentContexts, function (data, meta, rawSegmentSize, flushReason) {
        return send_1.send(configuration.sessionReplayEndpointBuilder, data, meta, rawSegmentSize, flushReason, {
            proxyApiKey: configuration.proxyApiKey
        });
    }, worker), addRecord = _a.addRecord, stopSegmentCollection = _a.stop;
    function addRawRecord(rawRecord) {
        addRecord(tslib_1.__assign(tslib_1.__assign({}, rawRecord), { timestamp: Date.now() }));
    }
    var _b = record_1.record({
        emit: addRawRecord,
        defaultPrivacyLevel: configuration.defaultPrivacyLevel,
    }), stopRecording = _b.stop, takeFullSnapshot = _b.takeFullSnapshot, flushMutations = _b.flushMutations;
    var unsubscribeViewEnded = lifeCycle.subscribe(browser_rum_core_1.LifeCycleEventType.VIEW_ENDED, function () {
        flushMutations();
        addRawRecord({
            type: types_1.RecordType.ViewEnd,
        });
    }).unsubscribe;
    var unsubscribeViewCreated = lifeCycle.subscribe(browser_rum_core_1.LifeCycleEventType.VIEW_CREATED, takeFullSnapshot).unsubscribe;
    return {
        stop: function () {
            unsubscribeViewEnded();
            unsubscribeViewCreated();
            stopRecording();
            stopSegmentCollection();
        },
    };
}
exports.startRecording = startRecording;
//# sourceMappingURL=startRecording.js.map