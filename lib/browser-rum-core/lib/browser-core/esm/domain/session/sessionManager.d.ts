import { CookieOptions } from '../../browser/cookie';
import { Observable } from '../../tools/observable';
import { Context } from '../../tools/context';
import { RelativeTime } from '../../tools/timeUtils';
export interface SessionManager<TrackingType extends string> {
    findActiveSession: (startTime?: RelativeTime) => SessionContext<TrackingType> | undefined;
    renewObservable: Observable<void>;
    expireObservable: Observable<void>;
}
export interface SessionContext<TrackingType extends string> extends Context {
    id: string;
    trackingType: TrackingType;
}
export declare const VISIBILITY_CHECK_DELAY: number;
export declare function startSessionManager<TrackingType extends string>(options: CookieOptions, productKey: string, computeSessionState: (rawTrackingType?: string) => {
    trackingType: TrackingType;
    isTracked: boolean;
}): SessionManager<TrackingType>;
export declare function stopSessionManager(): void;
