export declare function makePublicApi<T>(stub: T): T & {
    onReady(callback: () => void): void;
};
export declare function defineGlobal<Global, Name extends keyof Global>(global: Global, name: Name, api: Global[Name]): void;
export declare enum BuildMode {
    RELEASE = "release",
    STAGING = "staging",
    CANARY = "canary",
    E2E_TEST = "e2e-test"
}
export interface BuildEnv {
    buildMode: BuildMode;
    sdkVersion: string;
}
