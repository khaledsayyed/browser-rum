import { RelativeTime } from './timeUtils';
export declare const CLEAR_OLD_CONTEXTS_INTERVAL: number;
export declare class ContextHistory<Context> {
    private expireDelay;
    private current;
    private currentStart;
    private previousContexts;
    private clearOldContextsInterval;
    constructor(expireDelay: number);
    find(startTime?: RelativeTime): Context | undefined;
    setCurrent(current: Context, startTime: RelativeTime): void;
    getCurrent(): Context | undefined;
    clearCurrent(): void;
    closeCurrent(endTime: RelativeTime): void;
    clearOldContexts(): void;
    reset(): void;
    stop(): void;
}
