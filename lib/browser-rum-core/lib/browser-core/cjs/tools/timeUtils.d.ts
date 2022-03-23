export declare type Duration = number & {
    d: 'Duration in ms';
};
export declare type ServerDuration = number & {
    s: 'Duration in ns';
};
export declare type TimeStamp = number & {
    t: 'Epoch time';
};
export declare type RelativeTime = number & {
    r: 'Time relative to navigation start';
} & {
    d: 'Duration in ms';
};
export declare type ClocksState = {
    relative: RelativeTime;
    timeStamp: TimeStamp;
};
export declare function relativeToClocks(relative: RelativeTime): {
    relative: RelativeTime;
    timeStamp: TimeStamp;
};
export declare function currentDrift(): number;
export declare function toServerDuration(duration: Duration): ServerDuration;
export declare function toServerDuration(duration: Duration | undefined): ServerDuration | undefined;
export declare function timeStampNow(): TimeStamp;
export declare function relativeNow(): RelativeTime;
export declare function clocksNow(): {
    relative: RelativeTime;
    timeStamp: TimeStamp;
};
export declare function clocksOrigin(): {
    relative: RelativeTime;
    timeStamp: TimeStamp;
};
export declare function elapsed(start: TimeStamp, end: TimeStamp): Duration;
export declare function elapsed(start: RelativeTime, end: RelativeTime): Duration;
/**
 * Get the time since the navigation was started.
 *
 * Note: this does not use `performance.timeOrigin` because it doesn't seem to reflect the actual
 * time on which the navigation has started: it may be much farther in the past, at least in Firefox 71.
 * Related issue in Firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=1429926
 */
export declare function getRelativeTime(timestamp: TimeStamp): RelativeTime;
export declare function getTimeStamp(relativeTime: RelativeTime): TimeStamp;
export declare function looksLikeRelativeTime(time: RelativeTime | TimeStamp): time is RelativeTime;
export declare function resetNavigationStart(): void;
