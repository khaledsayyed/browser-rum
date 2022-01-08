import { HookResetter } from './types';
export declare function hookSetter<T>(target: T, key: string | number | symbol, d: {
    set(this: T, value: unknown): void;
}): HookResetter;
export declare function isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent;
export declare function forEach<List extends {
    [index: number]: any;
}>(list: List, callback: (value: List[number], index: number, parent: List) => void): void;
