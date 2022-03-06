"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordType = exports.IncrementalSource = void 0;
var types_1 = require("./domain/record/types");
Object.defineProperty(exports, "IncrementalSource", { enumerable: true, get: function () { return types_1.IncrementalSource; } });
exports.RecordType = {
    FullSnapshot: 2,
    IncrementalSnapshot: 3,
    Meta: 4,
    Focus: 6,
    ViewEnd: 7,
    VisualViewport: 8,
};
//# sourceMappingURL=types.js.map