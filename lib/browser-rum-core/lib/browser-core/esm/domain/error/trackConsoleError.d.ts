import { RawError } from '../../tools/error';
import { Observable } from '../../tools/observable';
export declare function trackConsoleError(errorObservable: Observable<RawError>): void;
export declare function resetConsoleErrorProxy(): void;
