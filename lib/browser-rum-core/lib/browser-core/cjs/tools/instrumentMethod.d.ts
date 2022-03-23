export declare function instrumentMethod<OBJECT extends {
    [key: string]: any;
}, METHOD extends keyof OBJECT>(object: OBJECT, method: METHOD, instrumentationFactory: (original: OBJECT[METHOD]) => (this: OBJECT, ...args: Parameters<OBJECT[METHOD]>) => ReturnType<OBJECT[METHOD]>): {
    stop: () => void;
};
export declare function instrumentMethodAndCallOriginal<OBJECT extends {
    [key: string]: any;
}, METHOD extends keyof OBJECT>(object: OBJECT, method: METHOD, { before, after, }: {
    before?: (this: OBJECT, ...args: Parameters<OBJECT[METHOD]>) => ReturnType<OBJECT[METHOD]>;
    after?: (this: OBJECT, ...args: Parameters<OBJECT[METHOD]>) => ReturnType<OBJECT[METHOD]>;
}): {
    stop: () => void;
};
