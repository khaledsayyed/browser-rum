import { Duration, EventEmitter, RelativeTime } from '@datadog/browser-core';
import { LifeCycle } from '../../lifeCycle';
export declare const TIMING_MAXIMUM_DELAY: number;
export interface Timings {
    firstContentfulPaint?: Duration;
    domInteractive?: Duration;
    domContentLoaded?: Duration;
    domComplete?: Duration;
    loadEvent?: Duration;
    largestContentfulPaint?: Duration;
    firstInputDelay?: Duration;
    firstInputTime?: Duration;
}
export declare function trackInitialViewTimings(lifeCycle: LifeCycle, callback: (timings: Timings) => void): {
    stop: () => void;
};
export declare function trackNavigationTimings(lifeCycle: LifeCycle, callback: (timings: Partial<Timings>) => void): {
    stop: () => void;
};
export declare function trackFirstContentfulPaintTiming(lifeCycle: LifeCycle, callback: (fcpTiming: RelativeTime) => void): {
    stop: () => void;
};
/**
 * Track the largest contentful paint (LCP) occurring during the initial View.  This can yield
 * multiple values, only the most recent one should be used.
 * Documentation: https://web.dev/lcp/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/master/src/getLCP.ts
 */
export declare function trackLargestContentfulPaintTiming(lifeCycle: LifeCycle, emitter: EventEmitter, callback: (lcpTiming: RelativeTime) => void): {
    stop: () => void;
};
/**
 * Track the first input occurring during the initial View to return:
 * - First Input Delay
 * - First Input Time
 * Callback is called at most one time.
 * Documentation: https://web.dev/fid/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/master/src/getFID.ts
 */
export declare function trackFirstInputTimings(lifeCycle: LifeCycle, callback: ({ firstInputDelay, firstInputTime }: {
    firstInputDelay: Duration;
    firstInputTime: Duration;
}) => void): {
    stop: () => void;
};
