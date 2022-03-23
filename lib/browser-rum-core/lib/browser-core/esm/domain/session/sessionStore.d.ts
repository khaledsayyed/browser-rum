import { CookieOptions } from '../../browser/cookie';
import { Observable } from '../../tools/observable';
export interface SessionStore {
    expandOrRenewSession: () => void;
    expandSession: () => void;
    getSession: () => SessionState;
    renewObservable: Observable<void>;
    expireObservable: Observable<void>;
    stop: () => void;
}
export interface SessionState {
    id?: string;
    created?: string;
    expire?: string;
    [key: string]: string | undefined;
}
export declare const SESSION_COOKIE_NAME = "_dd_s";
export declare const SESSION_EXPIRATION_DELAY: number;
export declare const SESSION_TIME_OUT_DELAY: number;
/**
 * Different session concepts:
 * - tracked, the session has an id and is updated along the user navigation
 * - not tracked, the session does not have an id but it is updated along the user navigation
 * - inactive, no session in store or session expired, waiting for a renew session
 */
export declare function startSessionStore<TrackingType extends string>(options: CookieOptions, productKey: string, computeSessionState: (rawTrackingType?: string) => {
    trackingType: TrackingType;
    isTracked: boolean;
}): SessionStore;
export declare function persistSession(session: SessionState, options: CookieOptions): void;
