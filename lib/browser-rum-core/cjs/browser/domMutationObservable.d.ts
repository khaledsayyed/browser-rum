import { Observable } from '@datadog/browser-core';
export declare function createDOMMutationObservable(): Observable<void>;
declare type MutationObserverConstructor = new (callback: MutationCallback) => MutationObserver;
export declare function getMutationObserverConstructor(): MutationObserverConstructor | undefined;
export {};
