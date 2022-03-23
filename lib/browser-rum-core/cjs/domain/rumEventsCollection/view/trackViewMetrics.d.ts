import { Duration, Observable } from '@datadog/browser-core';
import { ViewLoadingType } from '../../../rawRumEvent.types';
import { LifeCycle } from '../../lifeCycle';
import { EventCounts } from '../../trackEventCounts';
export interface ViewMetrics {
    eventCounts: EventCounts;
    loadingTime?: Duration;
    cumulativeLayoutShift?: number;
}
export declare function trackViewMetrics(lifeCycle: LifeCycle, domMutationObservable: Observable<void>, scheduleViewUpdate: () => void, loadingType: ViewLoadingType): {
    stop: () => void;
    setLoadEvent: (loadEvent: Duration) => void;
    viewMetrics: ViewMetrics;
};
