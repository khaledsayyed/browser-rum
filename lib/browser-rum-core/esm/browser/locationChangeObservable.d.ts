import { Observable } from '@datadog/browser-core';
export interface LocationChange {
    oldLocation: Readonly<Location>;
    newLocation: Readonly<Location>;
}
export declare function createLocationChangeObservable(location: Location): Observable<LocationChange>;
