import { createDeflateWorker, DeflateWorker } from './deflateWorker';
export declare function startDeflateWorker(callback: (worker?: DeflateWorker) => void, createDeflateWorkerImpl?: typeof createDeflateWorker): void;
export declare function resetDeflateWorkerState(): void;
/**
 * Starts the deflate worker and handle messages and errors
 *
 * The spec allow browsers to handle worker errors differently:
 * - Chromium throws an exception
 * - Firefox fires an error event
 *
 * more details: https://bugzilla.mozilla.org/show_bug.cgi?id=1736865#c2
 */
export declare function doStartDeflateWorker(createDeflateWorkerImpl?: typeof createDeflateWorker): DeflateWorker | undefined;
