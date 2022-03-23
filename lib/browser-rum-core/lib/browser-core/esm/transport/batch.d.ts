import { Context } from '../tools/context';
import { HttpRequest } from './httpRequest';
export declare class Batch {
    private request;
    private maxSize;
    private bytesLimit;
    private maxMessageSize;
    private flushTimeout;
    private beforeUnloadCallback;
    private pushOnlyBuffer;
    private upsertBuffer;
    private bufferBytesSize;
    private bufferMessageCount;
    constructor(request: HttpRequest, maxSize: number, bytesLimit: number, maxMessageSize: number, flushTimeout: number, beforeUnloadCallback?: () => void);
    add(message: Context): void;
    upsert(message: Context, key: string): void;
    flush(reason?: string): void;
    sizeInBytes(candidate: string): number;
    private addOrUpdate;
    private process;
    private push;
    private remove;
    private hasMessageFor;
    private willReachedBytesLimitWith;
    private isFull;
    private flushPeriodically;
    private flushOnVisibilityHidden;
}
