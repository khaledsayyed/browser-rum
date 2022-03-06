export declare const NodePrivacyLevel: {
    readonly IGNORE: "ignore";
    readonly HIDDEN: "hidden";
    readonly ALLOW: "allow";
    readonly MASK: "mask";
    readonly MASK_USER_INPUT: "mask-user-input";
};
export declare type NodePrivacyLevel = typeof NodePrivacyLevel[keyof typeof NodePrivacyLevel];
export declare const PRIVACY_ATTR_NAME = "data-dd-privacy";
export declare const PRIVACY_CLASS_INPUT_IGNORED = "dd-privacy-input-ignored";
export declare const PRIVACY_CLASS_INPUT_MASKED = "dd-privacy-input-masked";
export declare const PRIVACY_ATTR_VALUE_INPUT_IGNORED = "input-ignored";
export declare const PRIVACY_ATTR_VALUE_INPUT_MASKED = "input-masked";
export declare const PRIVACY_ATTR_VALUE_ALLOW = "allow";
export declare const PRIVACY_ATTR_VALUE_MASK = "mask";
export declare const PRIVACY_ATTR_VALUE_MASK_USER_INPUT = "mask-user-input";
export declare const PRIVACY_ATTR_VALUE_HIDDEN = "hidden";
export declare const PRIVACY_CLASS_ALLOW = "dd-privacy-allow";
export declare const PRIVACY_CLASS_MASK = "dd-privacy-mask";
export declare const PRIVACY_CLASS_MASK_USER_INPUT = "dd-privacy-mask-user-input";
export declare const PRIVACY_CLASS_HIDDEN = "dd-privacy-hidden";
export declare const CENSORED_STRING_MARK = "***";
export declare const CENSORED_IMG_MARK = "data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
export declare const FORM_PRIVATE_TAG_NAMES: {
    [tagName: string]: true;
};
