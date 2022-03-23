import { Observable } from '../tools/observable';
import { Duration, ClocksState } from '../tools/timeUtils';
interface FetchContextBase {
    method: string;
    startClocks: ClocksState;
    input: RequestInfo;
    init?: RequestInit;
    url: string;
}
export interface FetchStartContext extends FetchContextBase {
    state: 'start';
}
export interface FetchCompleteContext extends FetchContextBase {
    state: 'complete';
    duration: Duration;
    status: number;
    response?: Response;
    responseText: string;
    responseType?: string;
    isAborted: boolean;
    error?: Error;
}
export declare type FetchContext = FetchStartContext | FetchCompleteContext;
export declare function initFetchObservable(): Observable<FetchContext>;
export {};
