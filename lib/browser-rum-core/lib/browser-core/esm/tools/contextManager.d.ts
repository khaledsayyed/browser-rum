import { Context } from './context';
export declare function createContextManager(): {
    get: () => Context;
    add: (key: string, value: any) => void;
    remove: (key: string) => void;
    set: (newContext: object) => void;
};
