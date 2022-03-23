import { RumPerformanceResourceTiming } from '../../../browser/performanceCollection';
import { RequestCompleteEvent } from '../../requestCollection';
/**
 * Look for corresponding timing in resource timing buffer
 *
 * Observations:
 * - Timing (start, end) are nested inside the request (start, end)
 * - Some timing can be not exactly nested, being off by < 1 ms
 * - Browsers generate a timing entry for OPTIONS request
 *
 * Strategy:
 * - from valid nested entries (with 1 ms error margin)
 * - if a single timing match, return the timing
 * - if two following timings match (OPTIONS request), return the timing for the actual request
 * - otherwise we can't decide, return undefined
 */
export declare function matchRequestTiming(request: RequestCompleteEvent): RumPerformanceResourceTiming | undefined;
