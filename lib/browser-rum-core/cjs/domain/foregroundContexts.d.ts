import { RelativeTime, Duration } from '@datadog/browser-core';
import { InForegroundPeriod } from '../rawRumEvent.types';
export declare const MAX_NUMBER_OF_SELECTABLE_FOREGROUND_PERIODS = 500;
export declare const MAX_NUMBER_OF_STORED_FOREGROUND_PERIODS = 2500;
export interface ForegroundContexts {
    isInForegroundAt: (startTime: RelativeTime) => boolean | undefined;
    selectInForegroundPeriodsFor: (startTime: RelativeTime, duration: Duration) => InForegroundPeriod[] | undefined;
    stop: () => void;
}
export interface ForegroundPeriod {
    start: RelativeTime;
    end?: RelativeTime;
}
export declare function startForegroundContexts(): ForegroundContexts;
export declare function addNewForegroundPeriod(): void;
export declare function closeForegroundPeriod(): void;
