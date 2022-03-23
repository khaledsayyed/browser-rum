import { EndpointBuilder } from '../domain/configuration/endpointBuilder';
/**
 * Use POST request without content type to:
 * - avoid CORS preflight requests
 * - allow usage of sendBeacon
 *
 * multiple elements are sent separated by \n in order
 * to be parsed correctly without content type header
 */
export declare class HttpRequest {
    private endpointBuilder;
    private bytesLimit;
    private options?;
    constructor(endpointBuilder: EndpointBuilder, bytesLimit: number, options?: {
        proxyApiKey?: string | undefined;
    } | undefined);
    send(data: string | FormData, size: number, flushReason?: string): void;
}
