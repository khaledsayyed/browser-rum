import { RawError } from '../../tools/error';
import { Observable } from '../../tools/observable';
export declare function trackRuntimeError(errorObservable: Observable<RawError>): {
    stop: () => void;
};
