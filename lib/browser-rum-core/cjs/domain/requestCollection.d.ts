import { Duration, RequestType, XhrCompleteContext, XhrStartContext, ClocksState, FetchStartContext, FetchCompleteContext } from '@datadog/browser-core';
import { RumSessionManager } from '..';
import { RumConfiguration } from './configuration';
import { LifeCycle } from './lifeCycle';
import { TraceIdentifier, Tracer } from './tracing/tracer';
export interface CustomContext {
    requestIndex: number;
    spanId?: TraceIdentifier;
    traceId?: TraceIdentifier;
}
export interface RumFetchStartContext extends FetchStartContext, CustomContext {
}
export interface RumFetchCompleteContext extends FetchCompleteContext, CustomContext {
}
export interface RumXhrStartContext extends XhrStartContext, CustomContext {
}
export interface RumXhrCompleteContext extends XhrCompleteContext, CustomContext {
}
export interface RequestStartEvent {
    requestIndex: number;
}
export interface RequestCompleteEvent {
    requestIndex: number;
    type: RequestType;
    method: string;
    url: string;
    status: number;
    responseText?: string;
    responseType?: string;
    startClocks: ClocksState;
    duration: Duration;
    spanId?: TraceIdentifier;
    traceId?: TraceIdentifier;
    xhr?: XMLHttpRequest;
    response?: Response;
    input?: RequestInfo;
    init?: RequestInit;
    error?: Error;
}
export declare function startRequestCollection(lifeCycle: LifeCycle, configuration: RumConfiguration, sessionManager: RumSessionManager): void;
export declare function trackXhr(lifeCycle: LifeCycle, configuration: RumConfiguration, tracer: Tracer): {
    stop: () => void;
};
export declare function trackFetch(lifeCycle: LifeCycle, configuration: RumConfiguration, tracer: Tracer): {
    stop: () => void;
};
