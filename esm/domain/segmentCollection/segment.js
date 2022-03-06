import { __assign } from "tslib";
import { addMonitoringMessage, monitor } from '@datadog/browser-core';
import { RecordType } from '../../types';
import * as replayStats from '../replayStats';
var nextId = 0;
var Segment = /** @class */ (function () {
    function Segment(worker, context, creationReason, initialRecord, onWrote, onFlushed) {
        var _this = this;
        this.worker = worker;
        this.context = context;
        this.creationReason = creationReason;
        this.isFlushed = false;
        this.id = nextId++;
        this.start = initialRecord.timestamp;
        this.end = initialRecord.timestamp;
        this.recordsCount = 1;
        this.hasFullSnapshot = initialRecord.type === RecordType.FullSnapshot;
        var viewId = this.context.view.id;
        replayStats.addSegment(viewId);
        replayStats.addRecord(viewId);
        var listener = monitor(function (_a) {
            var data = _a.data;
            if (data.type === 'errored' || data.type === 'initialized') {
                return;
            }
            if (data.id === _this.id) {
                replayStats.addWroteData(viewId, data.additionalRawSize);
                if (data.type === 'flushed') {
                    onFlushed(data.result, data.rawSize);
                    worker.removeEventListener('message', listener);
                }
                else {
                    onWrote(data.compressedSize);
                }
            }
            else if (data.id > _this.id) {
                // Messages should be received in the same order as they are sent, so if we receive a
                // message with an id superior to this Segment instance id, we know that another, more
                // recent Segment instance is being used.
                //
                // In theory, a "flush" response should have been received at this point, so the listener
                // should already have been removed. But if something goes wrong and we didn't receive a
                // "flush" response, remove the listener to avoid any leak, and send a monitor message to
                // help investigate the issue.
                worker.removeEventListener('message', listener);
                addMonitoringMessage("Segment did not receive a 'flush' response before being replaced.");
            }
        });
        worker.addEventListener('message', listener);
        this.worker.postMessage({ data: "{\"records\":[" + JSON.stringify(initialRecord), id: this.id, action: 'write' });
    }
    Segment.prototype.addRecord = function (record) {
        this.end = record.timestamp;
        this.recordsCount += 1;
        replayStats.addRecord(this.context.view.id);
        this.hasFullSnapshot || (this.hasFullSnapshot = record.type === RecordType.FullSnapshot);
        this.worker.postMessage({ data: "," + JSON.stringify(record), id: this.id, action: 'write' });
    };
    Segment.prototype.flush = function (reason) {
        this.worker.postMessage({
            data: "]," + JSON.stringify(this.meta).slice(1) + "\n",
            id: this.id,
            action: 'flush',
        });
        this.isFlushed = true;
        this.flushReason = reason;
    };
    Object.defineProperty(Segment.prototype, "meta", {
        get: function () {
            return __assign({ creation_reason: this.creationReason, end: this.end, has_full_snapshot: this.hasFullSnapshot, records_count: this.recordsCount, start: this.start }, this.context);
        },
        enumerable: false,
        configurable: true
    });
    return Segment;
}());
export { Segment };
//# sourceMappingURL=segment.js.map