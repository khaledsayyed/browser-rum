export declare function catchUserErrors<Args extends any[], R>(fn: (...args: Args) => R, errorMsg: string): (...args: Args) => R | undefined;
