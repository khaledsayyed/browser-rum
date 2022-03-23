import { RawError } from '..';
export declare type EventRateLimiter = ReturnType<typeof createEventRateLimiter>;
export declare function createEventRateLimiter(eventType: string, limit: number, onLimitReached: (limitError: RawError) => void): {
    isLimitReached(): boolean;
};
