import { Duration, Observable } from '@datadog/browser-core';
import { LifeCycle } from './lifeCycle';
export declare const PAGE_ACTIVITY_VALIDATION_DELAY = 100;
export declare const PAGE_ACTIVITY_END_DELAY = 100;
export interface PageActivityEvent {
    isBusy: boolean;
}
export declare type IdlePageEvent = {
    hadActivity: true;
    duration: Duration;
} | {
    hadActivity: false;
};
/**
 * Wait for the next idle page time
 *
 * Detection lifecycle:
 * ```
 *                           Wait idle page
 *              .-------------------'--------------------.
 *              v                                        v
 *     [Wait for a page activity ]          [Wait for a maximum duration]
 *     [timeout: VALIDATION_DELAY]          [  timeout: maxDuration     ]
 *          /                  \                           |
 *         v                    v                          |
 *  [No page activity]   [Page activity]                   |
 *         |                   |,----------------------.   |
 *         v                   v                       |   |
 *     (Discard)     [Wait for a page activity]        |   |
 *                   [   timeout: END_DELAY   ]        |   |
 *                       /                \            |   |
 *                      v                  v           |   |
 *             [No page activity]    [Page activity]   |   |
 *                      |                 |            |   |
 *                      |                 '------------'   |
 *                      '-----------. ,--------------------'
 *                                   v
 *                                 (End)
 * ```
 *
 * Note: by assuming that maxDuration is greater than VALIDATION_DELAY, we are sure that if the
 * process is still alive after maxDuration, it has been validated.
 */
export declare function waitIdlePage(lifeCycle: LifeCycle, domMutationObservable: Observable<void>, idlePageCallback: (event: IdlePageEvent) => void, maxDuration?: number): {
    stop: () => void;
};
export declare function doWaitIdlePage(pageActivityObservable: Observable<PageActivityEvent>, idlePageCallback: (event: IdlePageEvent) => void, maxDuration?: number): {
    stop: () => void;
};
export declare function createPageActivityObservable(lifeCycle: LifeCycle, domMutationObservable: Observable<void>): Observable<PageActivityEvent>;
