import { ResourceType, ServerDuration } from '@datadog/browser-core';
import { RumPerformanceResourceTiming } from '../../../browser/performanceCollection';
import { PerformanceResourceDetailsElement } from '../../../rawRumEvent.types';
import { RumConfiguration } from '../../configuration';
export interface PerformanceResourceDetails {
    redirect?: PerformanceResourceDetailsElement;
    dns?: PerformanceResourceDetailsElement;
    connect?: PerformanceResourceDetailsElement;
    ssl?: PerformanceResourceDetailsElement;
    first_byte: PerformanceResourceDetailsElement;
    download: PerformanceResourceDetailsElement;
}
export declare const FAKE_INITIAL_DOCUMENT = "initial_document";
export declare function computeResourceKind(timing: RumPerformanceResourceTiming): ResourceType | ResourceType.OTHER;
export declare function isRequestKind(timing: RumPerformanceResourceTiming): boolean;
export declare function computePerformanceResourceDuration(entry: RumPerformanceResourceTiming): ServerDuration;
export declare function computePerformanceResourceDetails(entry: RumPerformanceResourceTiming): PerformanceResourceDetails | undefined;
export declare function toValidEntry(entry: RumPerformanceResourceTiming): RumPerformanceResourceTiming | undefined;
export declare function computeSize(entry: RumPerformanceResourceTiming): number | undefined;
export declare function isAllowedRequestUrl(configuration: RumConfiguration, url: string): boolean | "";
