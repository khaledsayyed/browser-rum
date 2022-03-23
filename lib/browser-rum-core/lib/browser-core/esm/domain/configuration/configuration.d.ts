import { BuildEnv } from '../../boot/init';
import { CookieOptions } from '../../browser/cookie';
import { TransportConfiguration } from './transportConfiguration';
export declare const DefaultPrivacyLevel: {
    readonly ALLOW: "allow";
    readonly MASK: "mask";
    readonly MASK_USER_INPUT: "mask-user-input";
};
export declare type DefaultPrivacyLevel = typeof DefaultPrivacyLevel[keyof typeof DefaultPrivacyLevel];
export interface InitConfiguration {
    clientToken: string;
    applicationId?: string | undefined;
    actionNameAttribute?: string | undefined;
    internalMonitoringApiKey?: string | undefined;
    allowedTracingOrigins?: Array<string | RegExp> | undefined;
    sampleRate?: number | undefined;
    replaySampleRate?: number | undefined;
    site?: string | undefined;
    enableExperimentalFeatures?: string[] | undefined;
    silentMultipleInit?: boolean | undefined;
    trackInteractions?: boolean | undefined;
    trackViewsManually?: boolean | undefined;
    proxyHost?: string | undefined;
    proxyUrl?: string | undefined;
    proxyApiKey?: string;
    beforeSend?: BeforeSendCallback | undefined;
    defaultPrivacyLevel?: DefaultPrivacyLevel | undefined;
    service?: string | undefined;
    env?: string | undefined;
    version?: string | undefined;
    useAlternateIntakeDomains?: boolean | undefined;
    intakeApiVersion?: 1 | 2 | undefined;
    useCrossSiteSessionCookie?: boolean | undefined;
    useSecureSessionCookie?: boolean | undefined;
    trackSessionAcrossSubdomains?: boolean | undefined;
    replica?: ReplicaUserConfiguration | undefined;
}
export declare type BeforeSendCallback = (event: any, context?: any) => unknown;
interface ReplicaUserConfiguration {
    applicationId?: string;
    clientToken: string;
}
export interface Configuration extends TransportConfiguration {
    beforeSend: BeforeSendCallback | undefined;
    cookieOptions: CookieOptions;
    sampleRate: number;
    service: string | undefined;
    silentMultipleInit: boolean;
    proxyApiKey?: string;
    maxErrorsPerMinute: number;
    maxInternalMonitoringMessagesPerPage: number;
    requestErrorResponseLengthLimit: number;
    batchBytesLimit: number;
    flushTimeout: number;
    maxBatchSize: number;
    maxMessageSize: number;
}
export declare function validateAndBuildConfiguration(initConfiguration: InitConfiguration, buildEnv: BuildEnv): Configuration | undefined;
export declare function buildCookieOptions(initConfiguration: InitConfiguration): CookieOptions;
export {};
