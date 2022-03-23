import { TimeStamp } from '@datadog/browser-core';
interface DocumentTraceData {
    traceId: string;
    traceTime: TimeStamp;
}
export declare const INITIAL_DOCUMENT_OUTDATED_TRACE_ID_THRESHOLD: number;
export declare function getDocumentTraceId(document: Document): string | undefined;
export declare function getDocumentTraceDataFromMeta(document: Document): DocumentTraceData | undefined;
export declare function getDocumentTraceDataFromComment(document: Document): DocumentTraceData | undefined;
export declare function createDocumentTraceData(traceId: string | undefined | null, rawTraceTime: string | undefined | null): DocumentTraceData | undefined;
export declare function findTraceComment(document: Document): string | undefined;
export {};
