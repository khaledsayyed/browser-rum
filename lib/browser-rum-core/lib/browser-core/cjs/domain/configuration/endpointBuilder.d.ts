import { BuildEnv } from '../../boot/init';
import { InitConfiguration } from './configuration';
export declare const ENDPOINTS: {
    alternate: {
        logs: string;
        rum: string;
        sessionReplay: string;
    };
    classic: {
        logs: string;
        rum: string;
        sessionReplay: undefined;
    };
};
export declare type EndpointType = keyof typeof ENDPOINTS[IntakeType];
export declare const INTAKE_SITE_US = "datadoghq.com";
declare type IntakeType = keyof typeof ENDPOINTS;
export declare type EndpointBuilder = ReturnType<typeof createEndpointBuilder>;
export declare function createEndpointBuilder(initConfiguration: InitConfiguration, buildEnv: BuildEnv, endpointType: EndpointType, source?: string): {
    build: () => string;
    buildIntakeUrl: () => string;
};
export {};
