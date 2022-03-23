import { Observable } from '@datadog/browser-core';
import { RecorderApi } from '../../../boot/rumPublicApi';
import { LifeCycle } from '../../lifeCycle';
import { ForegroundContexts } from '../../foregroundContexts';
import { LocationChange } from '../../../browser/locationChangeObservable';
import { RumConfiguration } from '../../configuration';
export declare function startViewCollection(lifeCycle: LifeCycle, configuration: RumConfiguration, location: Location, domMutationObservable: Observable<void>, locationChangeObservable: Observable<LocationChange>, foregroundContexts: ForegroundContexts, recorderApi: RecorderApi, initialViewName?: string): {
    addTiming: (name: string, time?: import("@datadog/browser-core").TimeStamp | import("@datadog/browser-core").RelativeTime) => void;
    startView: (name?: string | undefined, startClocks?: import("@datadog/browser-core").ClocksState | undefined) => void;
    stop: () => void;
    stopView: () => void;
};
