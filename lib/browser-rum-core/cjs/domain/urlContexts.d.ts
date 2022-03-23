import { RelativeTime, Observable } from '@datadog/browser-core';
import { UrlContext } from '../rawRumEvent.types';
import { LocationChange } from '../browser/locationChangeObservable';
import { LifeCycle } from './lifeCycle';
/**
 * We want to attach to an event:
 * - the url corresponding to its start
 * - the referrer corresponding to the previous view url (or document referrer for initial view)
 */
export declare const URL_CONTEXT_TIME_OUT_DELAY: number;
export interface UrlContexts {
    findUrl: (startTime?: RelativeTime) => UrlContext | undefined;
    stop: () => void;
}
export declare function startUrlContexts(lifeCycle: LifeCycle, locationChangeObservable: Observable<LocationChange>, location: Location): {
    findUrl: (startTime?: RelativeTime | undefined) => UrlContext | undefined;
    stop: () => void;
};
