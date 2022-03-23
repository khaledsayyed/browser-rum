export declare const COOKIE_ACCESS_DELAY = 1000;
export interface CookieOptions {
    secure?: boolean;
    crossSite?: boolean;
    domain?: string;
}
export declare function setCookie(name: string, value: string, expireDelay: number, options?: CookieOptions): void;
export declare function getCookie(name: string): string | undefined;
export declare function deleteCookie(name: string, options?: CookieOptions): void;
export declare function areCookiesAuthorized(options: CookieOptions): boolean;
export declare function getCurrentSite(): string;
