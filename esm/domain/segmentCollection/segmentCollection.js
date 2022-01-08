import { addEventListener, monitor } from '@datadog/browser-core';
import { LifeCycleEventType } from '@datadog/browser-rum-core';
import { SEND_BEACON_BYTE_LENGTH_LIMIT } from '../../transport/send';
import { Segment } from './segment';
export var MAX_SEGMENT_DURATION = 30000;
var MAX_SEGMENT_SIZE = SEND_BEACON_BYTE_LENGTH_LIMIT;
// Segments are the main data structure for session replays. They contain context information used
// for indexing or UI needs, and a list of records (RRWeb 'events', renamed to avoid confusing
// namings). They are stored without any processing from the intake, and fetched one after the
// other while a session is being replayed. Their encoding (deflate) are carefully crafted to allow
// concatenating multiple segments together. Segments have a size overhead (meta), so our goal is to
// build segments containing as much records as possible while complying with the various flush
// strategies to guarantee a good replay quality.
//
// When the recording starts, a segment is initially created.  The segment is flushed (finalized and
// sent) based on various events (non-exhaustive list):
//
// * the page visibility change or becomes to unload
// * the segment duration reaches a limit
// * the encoded segment size reaches a limit
// * ...
//
// A segment cannot be created without its context.  If the RUM session ends and no session id is
// available when creating a new segment, records will be ignored, until the session is renewed and
// a new session id is available.
//
// Empty segments (segments with no record) aren't useful and should be ignored.
//
// To help investigate session replays issues, each segment is created with a "creation reason",
// indicating why the session has been created.
export function startSegmentCollection(lifeCycle, applicationId, sessionManager, parentContexts, send, worker) {
    return doStartSegmentCollection(lifeCycle, function () { return computeSegmentContext(applicationId, sessionManager, parentContexts); }, send, worker);
}
export function doStartSegmentCollection(lifeCycle, getSegmentContext, send, worker, emitter) {
    if (emitter === void 0) { emitter = window; }
    var state = {
        status: 0 /* WaitingForInitialRecord */,
        nextSegmentCreationReason: 'init',
    };
    var unsubscribeViewCreated = lifeCycle.subscribe(LifeCycleEventType.VIEW_CREATED, function () {
        flushSegment('view_change');
    }).unsubscribe;
    var unsubscribeBeforeUnload = lifeCycle.subscribe(LifeCycleEventType.BEFORE_UNLOAD, function () {
        flushSegment('before_unload');
    }).unsubscribe;
    var unsubscribeVisibilityChange = addEventListener(emitter, "visibilitychange" /* VISIBILITY_CHANGE */, function () {
        if (document.visibilityState === 'hidden') {
            flushSegment('visibility_hidden');
        }
    }, { capture: true }).stop;
    function flushSegment(nextSegmentCreationReason) {
        if (state.status === 1 /* SegmentPending */) {
            state.segment.flush(nextSegmentCreationReason || 'sdk_stopped');
            clearTimeout(state.expirationTimeoutId);
        }
        if (nextSegmentCreationReason) {
            state = {
                status: 0 /* WaitingForInitialRecord */,
                nextSegmentCreationReason: nextSegmentCreationReason,
            };
        }
        else {
            state = {
                status: 2 /* Stopped */,
            };
        }
    }
    function createNewSegment(creationReason, initialRecord) {
        var context = getSegmentContext();
        if (!context) {
            return;
        }
        var segment = new Segment(worker, context, creationReason, initialRecord, function (compressedSegmentSize) {
            if (!segment.isFlushed && compressedSegmentSize > MAX_SEGMENT_SIZE) {
                flushSegment('max_size');
            }
        }, function (data, rawSegmentSize) {
            send(data, segment.meta, rawSegmentSize, segment.flushReason);
        });
        state = {
            status: 1 /* SegmentPending */,
            segment: segment,
            expirationTimeoutId: setTimeout(monitor(function () {
                flushSegment('max_duration');
            }), MAX_SEGMENT_DURATION),
        };
    }
    return {
        addRecord: function (record) {
            switch (state.status) {
                case 0 /* WaitingForInitialRecord */:
                    createNewSegment(state.nextSegmentCreationReason, record);
                    break;
                case 1 /* SegmentPending */:
                    state.segment.addRecord(record);
                    break;
            }
        },
        stop: function () {
            flushSegment();
            unsubscribeViewCreated();
            unsubscribeBeforeUnload();
            unsubscribeVisibilityChange();
        },
    };
}
export function computeSegmentContext(applicationId, sessionManager, parentContexts) {
    var session = sessionManager.findTrackedSession();
    var viewContext = parentContexts.findView();
    if (!session || !viewContext) {
        return undefined;
    }
    return {
        application: {
            id: applicationId,
        },
        session: {
            id: session.id,
        },
        view: {
            id: viewContext.view.id,
        },
    };
}
export function setMaxSegmentSize(newSize) {
    if (newSize === void 0) { newSize = SEND_BEACON_BYTE_LENGTH_LIMIT; }
    MAX_SEGMENT_SIZE = newSize;
}
//# sourceMappingURL=segmentCollection.js.map