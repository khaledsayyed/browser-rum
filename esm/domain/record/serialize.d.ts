import { NodePrivacyLevel } from '../../constants';
import { SerializedNodeWithId, DocumentNode, ElementNode } from './types';
declare type ParentNodePrivacyLevel = typeof NodePrivacyLevel.ALLOW | typeof NodePrivacyLevel.MASK | typeof NodePrivacyLevel.MASK_USER_INPUT;
export interface SerializeOptions {
    document: Document;
    serializedNodeIds?: Set<number>;
    ignoreWhiteSpace?: boolean;
    parentNodePrivacyLevel: ParentNodePrivacyLevel;
}
export declare function serializeDocument(document: Document, defaultPrivacyLevel: ParentNodePrivacyLevel): SerializedNodeWithId;
export declare function serializeNodeWithId(node: Node, options: SerializeOptions): SerializedNodeWithId | null;
export declare function serializeDocumentNode(document: Document, options: SerializeOptions): DocumentNode;
/**
 * Serialzing Element nodes involves capturing:
 * 1. HTML ATTRIBUTES:
 * 2. JS STATE:
 * - scroll offsets
 * - Form fields (input value, checkbox checked, otpion selection, range)
 * - Canvas state,
 * - Media (video/audio) play mode + currentTime
 * - iframe contents
 * - webcomponents
 * 3. CUSTOM PROPERTIES:
 * - height+width for when `hidden` to cover the element
 * 4. EXCLUDED INTERACTION STATE:
 * - focus (possible, but not worth perf impact)
 * - hover (tracked only via mouse activity)
 * - fullscreen mode
 */
export declare function serializeElementNode(element: Element, options: SerializeOptions): ElementNode | undefined;
/**
 * TODO: Preserve CSS element order, and record the presence of the tag, just don't render
 * We don't need this logic on the recorder side.
 * For security related meta's, customer can mask themmanually given they
 * are easy to identify in the HEAD tag.
 */
export declare function shouldIgnoreElement(element: Element): boolean;
export declare function serializeChildNodes(node: Node, options: SerializeOptions): SerializedNodeWithId[];
export declare function serializeAttribute(element: Element, nodePrivacyLevel: NodePrivacyLevel, attributeName: string): string | number | boolean | null;
export {};
