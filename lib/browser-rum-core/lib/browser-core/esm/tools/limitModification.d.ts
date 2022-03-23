import { Context } from './context';
/**
 * Current limitation:
 * - field path do not support array, 'a.b.c' only
 */
export declare function limitModification<T extends Context, Result>(object: T, modifiableFieldPaths: string[], modifier: (object: T) => Result): Result | undefined;
