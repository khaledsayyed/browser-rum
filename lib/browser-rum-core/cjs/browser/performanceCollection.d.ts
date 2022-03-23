import { Duration, Omit, RelativeTime } from '@datadog/browser-core';
import { RumConfiguration } from '../domain/configuration';
import { LifeCycle } from '../domain/lifeCycle';
import { PerformanceEntryRepresentation } from '../domainContext.types';
export interface RumPerformanceResourceTiming {
    entryType: 'resource';
    initiatorType: string;
    name: string;
    startTime: RelativeTime;
    duration: Duration;
    fetchStart: RelativeTime;
    domainLookupStart: RelativeTime;
    domainLookupEnd: RelativeTime;
    connectStart: RelativeTime;
    secureConnectionStart: RelativeTime;
    connectEnd: RelativeTime;
    requestStart: RelativeTime;
    responseStart: RelativeTime;
    responseEnd: RelativeTime;
    redirectStart: RelativeTime;
    redirectEnd: RelativeTime;
    decodedBodySize: number;
    traceId?: string;
}
export interface RumPerformanceLongTaskTiming {
    entryType: 'longtask';
    startTime: RelativeTime;
    duration: Duration;
    toJSON(): PerformanceEntryRepresentation;
}
export interface RumPerformancePaintTiming {
    entryType: 'paint';
    name: 'first-paint' | 'first-contentful-paint';
    startTime: RelativeTime;
}
export interface RumPerformanceNavigationTiming {
    entryType: 'navigation';
    domComplete: RelativeTime;
    domContentLoadedEventEnd: RelativeTime;
    domInteractive: RelativeTime;
    loadEventEnd: RelativeTime;
}
export interface RumLargestContentfulPaintTiming {
    entryType: 'largest-contentful-paint';
    startTime: RelativeTime;
    size: number;
}
export interface RumFirstInputTiming {
    entryType: 'first-input';
    startTime: RelativeTime;
    processingStart: RelativeTime;
}
export interface RumLayoutShiftTiming {
    entryType: 'layout-shift';
    startTime: RelativeTime;
    value: number;
    hadRecentInput: boolean;
}
export declare type RumPerformanceEntry = RumPerformanceResourceTiming | RumPerformanceLongTaskTiming | RumPerformancePaintTiming | RumPerformanceNavigationTiming | RumLargestContentfulPaintTiming | RumFirstInputTiming | RumLayoutShiftTiming;
export declare function supportPerformanceTimingEvent(entryType: string): boolean;
export declare function supportPerformanceEntry(): boolean;
export declare function startPerformanceCollection(lifeCycle: LifeCycle, configuration: RumConfiguration): void;
export declare function retrieveInitialDocumentResourceTiming(callback: (timing: RumPerformanceResourceTiming) => void): void;
export declare type RelativePerformanceTiming = {
    -readonly [key in keyof Omit<PerformanceTiming, 'toJSON'>]: RelativeTime;
};
