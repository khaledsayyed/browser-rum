import { Duration, ClocksState, TimeStamp, Observable, RelativeTime } from '@datadog/browser-core';
import { ViewLoadingType, ViewCustomTimings } from '../../../rawRumEvent.types';
import { LifeCycle } from '../../lifeCycle';
import { EventCounts } from '../../trackEventCounts';
import { LocationChange } from '../../../browser/locationChangeObservable';
import { Timings } from './trackInitialViewTimings';
export interface ViewEvent {
    id: string;
    name?: string;
    location: Readonly<Location>;
    timings: Timings;
    customTimings: ViewCustomTimings;
    eventCounts: EventCounts;
    documentVersion: number;
    startClocks: ClocksState;
    duration: Duration;
    isActive: boolean;
    loadingTime?: Duration;
    loadingType: ViewLoadingType;
    cumulativeLayoutShift?: number;
}
export interface ViewCreatedEvent {
    id: string;
    name?: string;
    startClocks: ClocksState;
}
export interface ViewEndedEvent {
    endClocks: ClocksState;
}
export declare const THROTTLE_VIEW_UPDATE_PERIOD = 3000;
export declare const SESSION_KEEP_ALIVE_INTERVAL: number;
export declare function trackViews(location: Location, lifeCycle: LifeCycle, domMutationObservable: Observable<void>, locationChangeObservable: Observable<LocationChange>, areViewsTrackedAutomatically: boolean, initialViewName?: string): {
    addTiming: (name: string, time?: RelativeTime | TimeStamp) => void;
    startView: (name?: string | undefined, startClocks?: ClocksState | undefined) => void;
    stop: () => void;
    stopView: () => void;
};
