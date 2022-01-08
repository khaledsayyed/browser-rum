import { NodePrivacyLevel } from '../../constants';
export declare const MAX_ATTRIBUTE_VALUE_CHAR_LENGTH = 100000;
/**
 * Get node privacy level by iterating over its ancestors. When the direct parent privacy level is
 * know, it is best to use something like:
 *
 * derivePrivacyLevelGivenParent(getNodeSelfPrivacyLevel(node), parentNodePrivacyLevel)
 */
export declare function getNodePrivacyLevel(node: Node, defaultPrivacyLevel: NodePrivacyLevel): NodePrivacyLevel;
/**
 * Reduces the next privacy level based on self + parent privacy levels
 */
export declare function reducePrivacyLevel(childPrivacyLevel: NodePrivacyLevel | undefined, parentNodePrivacyLevel: NodePrivacyLevel): NodePrivacyLevel;
/**
 * Determines the node's own privacy level without checking for ancestors.
 */
export declare function getNodeSelfPrivacyLevel(node: Node): NodePrivacyLevel | undefined;
/**
 * Helper aiming to unify `mask` and `mask-user-input` privacy levels:
 *
 * In the `mask` case, it is trivial: we should mask the element.
 *
 * In the `mask-user-input` case, we should mask the element only if it is a "form" element or the
 * direct parent is a form element for text nodes).
 *
 * Other `shouldMaskNode` cases are edge cases that should not matter too much (ex: should we mask a
 * node if it is ignored or hidden? it doesn't matter since it won't be serialized).
 */
export declare function shouldMaskNode(node: Node, privacyLevel: NodePrivacyLevel): boolean;
/**
 * Text censoring non-destructively maintains whitespace characters in order to preserve text shape
 * during replay.
 */
export declare const censorText: (text: string) => string;
export declare function getTextContent(textNode: Node, ignoreWhiteSpace: boolean, parentNodePrivacyLevel: NodePrivacyLevel): string | undefined;
