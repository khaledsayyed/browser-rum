"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORM_PRIVATE_TAG_NAMES = exports.CENSORED_IMG_MARK = exports.CENSORED_STRING_MARK = exports.PRIVACY_CLASS_HIDDEN = exports.PRIVACY_CLASS_MASK_USER_INPUT = exports.PRIVACY_CLASS_MASK = exports.PRIVACY_CLASS_ALLOW = exports.PRIVACY_ATTR_VALUE_HIDDEN = exports.PRIVACY_ATTR_VALUE_MASK_USER_INPUT = exports.PRIVACY_ATTR_VALUE_MASK = exports.PRIVACY_ATTR_VALUE_ALLOW = exports.PRIVACY_ATTR_VALUE_INPUT_MASKED = exports.PRIVACY_ATTR_VALUE_INPUT_IGNORED = exports.PRIVACY_CLASS_INPUT_MASKED = exports.PRIVACY_CLASS_INPUT_IGNORED = exports.PRIVACY_ATTR_NAME = exports.NodePrivacyLevel = void 0;
var tslib_1 = require("tslib");
var browser_core_1 = require("@datadog/browser-core");
exports.NodePrivacyLevel = tslib_1.__assign(tslib_1.__assign({}, browser_core_1.DefaultPrivacyLevel), { IGNORE: 'ignore', HIDDEN: 'hidden' });
exports.PRIVACY_ATTR_NAME = 'data-dd-privacy';
// Deprecate via temporary Alias
exports.PRIVACY_CLASS_INPUT_IGNORED = 'dd-privacy-input-ignored'; // DEPRECATED, aliased to mask-user-input
exports.PRIVACY_CLASS_INPUT_MASKED = 'dd-privacy-input-masked'; // DEPRECATED, aliased to mask-user-input
exports.PRIVACY_ATTR_VALUE_INPUT_IGNORED = 'input-ignored'; // DEPRECATED, aliased to mask-user-input
exports.PRIVACY_ATTR_VALUE_INPUT_MASKED = 'input-masked'; // DEPRECATED, aliased to mask-user-input
// Privacy Attrs
exports.PRIVACY_ATTR_VALUE_ALLOW = 'allow';
exports.PRIVACY_ATTR_VALUE_MASK = 'mask';
exports.PRIVACY_ATTR_VALUE_MASK_USER_INPUT = 'mask-user-input';
exports.PRIVACY_ATTR_VALUE_HIDDEN = 'hidden';
// Privacy Classes - not all customers can set plain HTML attributes, so support classes too
exports.PRIVACY_CLASS_ALLOW = 'dd-privacy-allow';
exports.PRIVACY_CLASS_MASK = 'dd-privacy-mask';
exports.PRIVACY_CLASS_MASK_USER_INPUT = 'dd-privacy-mask-user-input';
exports.PRIVACY_CLASS_HIDDEN = 'dd-privacy-hidden';
// Private Replacement Templates
exports.CENSORED_STRING_MARK = '***';
exports.CENSORED_IMG_MARK = 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';
exports.FORM_PRIVATE_TAG_NAMES = {
    INPUT: true,
    OUTPUT: true,
    TEXTAREA: true,
    SELECT: true,
    OPTION: true,
    DATALIST: true,
    OPTGROUP: true,
};
//# sourceMappingURL=constants.js.map