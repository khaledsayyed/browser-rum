"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeNodeWithId = exports.NodePrivacyLevel = exports.PRIVACY_CLASS_HIDDEN = exports.PRIVACY_ATTR_VALUE_HIDDEN = exports.PRIVACY_ATTR_NAME = exports.MouseInteractions = exports.MediaInteractions = void 0;
var tslib_1 = require("tslib");
/**
 * Entry point consumed by the Datadog Web app to mutualize some types, constant and logic for
 * tests.
 *
 * WARNING: this module is not intended for public usages, and won't follow semver for breaking
 * changes.
 */
var record_1 = require("../domain/record");
Object.defineProperty(exports, "MediaInteractions", { enumerable: true, get: function () { return record_1.MediaInteractions; } });
Object.defineProperty(exports, "MouseInteractions", { enumerable: true, get: function () { return record_1.MouseInteractions; } });
var constants_1 = require("../constants");
Object.defineProperty(exports, "PRIVACY_ATTR_NAME", { enumerable: true, get: function () { return constants_1.PRIVACY_ATTR_NAME; } });
Object.defineProperty(exports, "PRIVACY_ATTR_VALUE_HIDDEN", { enumerable: true, get: function () { return constants_1.PRIVACY_ATTR_VALUE_HIDDEN; } });
Object.defineProperty(exports, "PRIVACY_CLASS_HIDDEN", { enumerable: true, get: function () { return constants_1.PRIVACY_CLASS_HIDDEN; } });
Object.defineProperty(exports, "NodePrivacyLevel", { enumerable: true, get: function () { return constants_1.NodePrivacyLevel; } });
(0, tslib_1.__exportStar)(require("../types"), exports);
var record_2 = require("../domain/record");
Object.defineProperty(exports, "serializeNodeWithId", { enumerable: true, get: function () { return record_2.serializeNodeWithId; } });
//# sourceMappingURL=internal.js.map