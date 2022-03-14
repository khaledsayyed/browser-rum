import { EndpointBuilder } from '@datadog/browser-core';
import { SegmentMeta } from '../types';
export declare const SEND_BEACON_BYTE_LENGTH_LIMIT = 60000;
export declare function send(endpointBuilder: EndpointBuilder, data: Uint8Array, meta: SegmentMeta, rawSegmentSize: number, flushReason?: string, httpRequestOptions?: {
    proxyApiKey?: string;
}): void;
export declare function toFormEntries(input: object, onEntry: (key: string, value: string) => void, prefix?: string): void;
