"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.record = void 0;
var tslib_1 = require("tslib");
var browser_core_1 = require("@datadog/browser-core");
var types_1 = require("../../types");
var serialize_1 = require("./serialize");
var observer_1 = require("./observer");
var types_2 = require("./types");
var mutationObserver_1 = require("./mutationObserver");
var viewports_1 = require("./viewports");
function record(options) {
    var emit = options.emit;
    // runtime checks for user options
    if (!emit) {
        throw new Error('emit function is required');
    }
    var mutationController = new mutationObserver_1.MutationController();
    var takeFullSnapshot = function () {
        mutationController.flush(); // process any pending mutation before taking a full snapshot
        emit({
            data: {
                height: viewports_1.getWindowHeight(),
                href: window.location.href,
                width: viewports_1.getWindowWidth(),
            },
            type: types_1.RecordType.Meta,
        });
        emit({
            data: {
                has_focus: document.hasFocus(),
            },
            type: types_1.RecordType.Focus,
        });
        emit({
            data: {
                node: serialize_1.serializeDocument(document, options.defaultPrivacyLevel),
                initialOffset: {
                    left: viewports_1.getScrollX(),
                    top: viewports_1.getScrollY(),
                },
            },
            type: types_1.RecordType.FullSnapshot,
        });
        if (browser_core_1.isExperimentalFeatureEnabled('visualviewport') && window.visualViewport) {
            emit({
                data: viewports_1.getVisualViewport(),
                type: types_1.RecordType.VisualViewport,
            });
        }
    };
    takeFullSnapshot();
    var stopObservers = observer_1.initObservers({
        mutationController: mutationController,
        defaultPrivacyLevel: options.defaultPrivacyLevel,
        inputCb: function (v) {
            return emit({
                data: tslib_1.__assign({ source: types_2.IncrementalSource.Input }, v),
                type: types_1.RecordType.IncrementalSnapshot,
            });
        },
        mediaInteractionCb: function (p) {
            return emit({
                data: tslib_1.__assign({ source: types_2.IncrementalSource.MediaInteraction }, p),
                type: types_1.RecordType.IncrementalSnapshot,
            });
        },
        mouseInteractionCb: function (d) {
            return emit({
                data: tslib_1.__assign({ source: types_2.IncrementalSource.MouseInteraction }, d),
                type: types_1.RecordType.IncrementalSnapshot,
            });
        },
        mousemoveCb: function (positions, source) {
            return emit({
                data: {
                    positions: positions,
                    source: source,
                },
                type: types_1.RecordType.IncrementalSnapshot,
            });
        },
        mutationCb: function (m) {
            return emit({
                data: tslib_1.__assign({ source: types_2.IncrementalSource.Mutation }, m),
                type: types_1.RecordType.IncrementalSnapshot,
            });
        },
        scrollCb: function (p) {
            return emit({
                data: tslib_1.__assign({ source: types_2.IncrementalSource.Scroll }, p),
                type: types_1.RecordType.IncrementalSnapshot,
            });
        },
        styleSheetRuleCb: function (r) {
            return emit({
                data: tslib_1.__assign({ source: types_2.IncrementalSource.StyleSheetRule }, r),
                type: types_1.RecordType.IncrementalSnapshot,
            });
        },
        viewportResizeCb: function (d) {
            return emit({
                data: tslib_1.__assign({ source: types_2.IncrementalSource.ViewportResize }, d),
                type: types_1.RecordType.IncrementalSnapshot,
            });
        },
        focusCb: function (data) {
            return emit({
                type: types_1.RecordType.Focus,
                data: data,
            });
        },
        visualViewportResizeCb: function (data) {
            emit({
                data: data,
                type: types_1.RecordType.VisualViewport,
            });
        },
    });
    return {
        stop: stopObservers,
        takeFullSnapshot: takeFullSnapshot,
        flushMutations: function () { return mutationController.flush(); },
    };
}
exports.record = record;
//# sourceMappingURL=record.js.map