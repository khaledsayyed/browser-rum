import { __assign } from "tslib";
import { isExperimentalFeatureEnabled } from '@datadog/browser-core';
import { RecordType } from '../../types';
import { serializeDocument } from './serialize';
import { initObservers } from './observer';
import { IncrementalSource } from './types';
import { MutationController } from './mutationObserver';
import { getVisualViewport, getScrollX, getScrollY, getWindowHeight, getWindowWidth } from './viewports';
export function record(options) {
    var emit = options.emit;
    // runtime checks for user options
    if (!emit) {
        throw new Error('emit function is required');
    }
    var mutationController = new MutationController();
    var takeFullSnapshot = function () {
        mutationController.flush(); // process any pending mutation before taking a full snapshot
        emit({
            data: {
                height: getWindowHeight(),
                href: window.location.href,
                width: getWindowWidth(),
            },
            type: RecordType.Meta,
        });
        emit({
            data: {
                has_focus: document.hasFocus(),
            },
            type: RecordType.Focus,
        });
        emit({
            data: {
                node: serializeDocument(document, options.defaultPrivacyLevel),
                initialOffset: {
                    left: getScrollX(),
                    top: getScrollY(),
                },
            },
            type: RecordType.FullSnapshot,
        });
        if (isExperimentalFeatureEnabled('visualviewport') && window.visualViewport) {
            emit({
                data: getVisualViewport(),
                type: RecordType.VisualViewport,
            });
        }
    };
    takeFullSnapshot();
    var stopObservers = initObservers({
        mutationController: mutationController,
        defaultPrivacyLevel: options.defaultPrivacyLevel,
        inputCb: function (v) {
            return emit({
                data: __assign({ source: IncrementalSource.Input }, v),
                type: RecordType.IncrementalSnapshot,
            });
        },
        mediaInteractionCb: function (p) {
            return emit({
                data: __assign({ source: IncrementalSource.MediaInteraction }, p),
                type: RecordType.IncrementalSnapshot,
            });
        },
        mouseInteractionCb: function (d) {
            return emit({
                data: __assign({ source: IncrementalSource.MouseInteraction }, d),
                type: RecordType.IncrementalSnapshot,
            });
        },
        mousemoveCb: function (positions, source) {
            return emit({
                data: {
                    positions: positions,
                    source: source,
                },
                type: RecordType.IncrementalSnapshot,
            });
        },
        mutationCb: function (m) {
            return emit({
                data: __assign({ source: IncrementalSource.Mutation }, m),
                type: RecordType.IncrementalSnapshot,
            });
        },
        scrollCb: function (p) {
            return emit({
                data: __assign({ source: IncrementalSource.Scroll }, p),
                type: RecordType.IncrementalSnapshot,
            });
        },
        styleSheetRuleCb: function (r) {
            return emit({
                data: __assign({ source: IncrementalSource.StyleSheetRule }, r),
                type: RecordType.IncrementalSnapshot,
            });
        },
        viewportResizeCb: function (d) {
            return emit({
                data: __assign({ source: IncrementalSource.ViewportResize }, d),
                type: RecordType.IncrementalSnapshot,
            });
        },
        focusCb: function (data) {
            return emit({
                type: RecordType.Focus,
                data: data,
            });
        },
        visualViewportResizeCb: function (data) {
            emit({
                data: data,
                type: RecordType.VisualViewport,
            });
        },
    });
    return {
        stop: stopObservers,
        takeFullSnapshot: takeFullSnapshot,
        flushMutations: function () { return mutationController.flush(); },
    };
}
//# sourceMappingURL=record.js.map