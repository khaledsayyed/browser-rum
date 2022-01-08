import { CreationReason, Record, SegmentContext, SegmentMeta } from '../../types';
import { DeflateWorker } from './deflateWorker';
export declare class Segment {
    private worker;
    readonly context: SegmentContext;
    private creationReason;
    isFlushed: boolean;
    flushReason?: string;
    private id;
    private start;
    private end;
    private recordsCount;
    private hasFullSnapshot;
    constructor(worker: DeflateWorker, context: SegmentContext, creationReason: CreationReason, initialRecord: Record, onWrote: (compressedSize: number) => void, onFlushed: (data: Uint8Array, rawSize: number) => void);
    addRecord(record: Record): void;
    flush(reason?: string): void;
    get meta(): SegmentMeta;
}
