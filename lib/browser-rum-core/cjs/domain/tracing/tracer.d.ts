import { RumConfiguration } from '../configuration';
import { RumFetchCompleteContext, RumFetchStartContext, RumXhrCompleteContext, RumXhrStartContext } from '../requestCollection';
import { RumSessionManager } from '../rumSessionManager';
export interface Tracer {
    traceFetch: (context: Partial<RumFetchStartContext>) => void;
    traceXhr: (context: Partial<RumXhrStartContext>, xhr: XMLHttpRequest) => void;
    clearTracingIfNeeded: (context: RumFetchCompleteContext | RumXhrCompleteContext) => void;
}
/**
 * Clear tracing information to avoid incomplete traces. Ideally, we should do it when the the
 * request did not reach the server, but we the browser does not expose this. So, we clear tracing
 * information if the request ended with status 0 without being aborted by the application.
 *
 * Reasoning:
 *
 * * Applications are usually aborting requests after a bit of time, for example when the user is
 * typing (autocompletion) or navigating away (in a SPA). With a performant device and good
 * network conditions, the request is likely to reach the server before being canceled.
 *
 * * Requests aborted otherwise (ex: lack of internet, CORS issue, blocked by a privacy extension)
 * are likely to finish quickly and without reaching the server.
 *
 * Of course it might not be the case every time, but it should limit having incomplete traces a
 * bit..
 * */
export declare function clearTracingIfNeeded(context: RumFetchCompleteContext | RumXhrCompleteContext): void;
export declare function startTracer(configuration: RumConfiguration, sessionManager: RumSessionManager): Tracer;
export declare function isTracingSupported(): boolean;
export declare class TraceIdentifier {
    private buffer;
    constructor();
    toString(radix: number): string;
    /**
     * Format used everywhere except the trace intake
     */
    toDecimalString(): string;
    private readInt32;
}
