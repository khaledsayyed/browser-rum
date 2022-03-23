export declare const SYNTHETICS_TEST_ID_COOKIE_NAME = "datadog-synthetics-public-id";
export declare const SYNTHETICS_RESULT_ID_COOKIE_NAME = "datadog-synthetics-result-id";
export declare const SYNTHETICS_INJECTS_RUM_COOKIE_NAME = "datadog-synthetics-injects-rum";
export interface BrowserWindow extends Window {
    _DATADOG_SYNTHETICS_PUBLIC_ID?: string;
    _DATADOG_SYNTHETICS_RESULT_ID?: string;
    _DATADOG_SYNTHETICS_INJECTS_RUM?: boolean;
}
export declare function getSyntheticsContext(): {
    test_id: string;
    result_id: string;
    injected: boolean;
} | undefined;
export declare function willSyntheticsInjectRum(): boolean;
