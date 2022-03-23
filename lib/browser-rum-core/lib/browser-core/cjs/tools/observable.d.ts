export interface Subscription {
    unsubscribe: () => void;
}
export declare class Observable<T> {
    private onFirstSubscribe?;
    private observers;
    private onLastUnsubscribe?;
    constructor(onFirstSubscribe?: (() => (() => void) | void) | undefined);
    subscribe(f: (data: T) => void): Subscription;
    notify(data: T): void;
}
