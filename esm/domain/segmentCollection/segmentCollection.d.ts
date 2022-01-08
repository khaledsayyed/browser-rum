import { EventEmitter } from '@datadog/browser-core';
import { LifeCycle, ParentContexts, RumSessionManager } from '@datadog/browser-rum-core';
import { Record, SegmentContext, SegmentMeta } from '../../types';
import { DeflateWorker } from './deflateWorker';
export declare const MAX_SEGMENT_DURATION = 30000;
export declare function startSegmentCollection(lifeCycle: LifeCycle, applicationId: string, sessionManager: RumSessionManager, parentContexts: ParentContexts, send: (data: Uint8Array, meta: SegmentMeta, rawSegmentSize: number, flushReason?: string) => void, worker: DeflateWorker): {
    addRecord: (record: Record) => void;
    stop: () => void;
};
export declare function doStartSegmentCollection(lifeCycle: LifeCycle, getSegmentContext: () => SegmentContext | undefined, send: (data: Uint8Array, meta: SegmentMeta, rawSegmentSize: number, flushReason?: string) => void, worker: DeflateWorker, emitter?: EventEmitter): {
    addRecord: (record: Record) => void;
    stop: () => void;
};
export declare function computeSegmentContext(applicationId: string, sessionManager: RumSessionManager, parentContexts: ParentContexts): {
    application: {
        id: string;
    };
    session: {
        id: string;
    };
    view: {
        id: string;
    };
} | undefined;
export declare function setMaxSegmentSize(newSize?: number): void;
