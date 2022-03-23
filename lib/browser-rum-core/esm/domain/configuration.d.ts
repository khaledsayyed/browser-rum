import { Configuration, DefaultPrivacyLevel, InitConfiguration } from '@datadog/browser-core';
import { RumEventDomainContext } from '../domainContext.types';
import { RumEvent } from '../rumEvent.types';
export interface RumInitConfiguration extends InitConfiguration {
    applicationId: string;
    beforeSend?: ((event: RumEvent, context: RumEventDomainContext) => void | boolean) | undefined;
    defaultPrivacyLevel?: DefaultPrivacyLevel | undefined;
}
export declare type HybridInitConfiguration = Omit<RumInitConfiguration, 'applicationId' | 'clientToken'>;
export interface RumConfiguration extends Configuration {
    actionNameAttribute: string | undefined;
    allowedTracingOrigins: Array<string | RegExp>;
    applicationId: string;
    defaultPrivacyLevel: DefaultPrivacyLevel;
    replaySampleRate: number;
    trackInteractions: boolean;
    trackViewsManually: boolean;
    proxyApiKey?: string;
    maxActionsPerMinute: number;
}
export declare function validateAndBuildRumConfiguration(initConfiguration: RumInitConfiguration): RumConfiguration | undefined;
