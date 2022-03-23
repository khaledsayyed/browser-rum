import { monitor, Observable } from '@datadog/browser-core';
export function createDOMMutationObservable() {
    var MutationObserver = getMutationObserverConstructor();
    var observable = new Observable(function () {
        if (!MutationObserver) {
            return;
        }
        var observer = new MutationObserver(monitor(function () { return observable.notify(); }));
        observer.observe(document, {
            attributes: true,
            characterData: true,
            childList: true,
            subtree: true,
        });
        return function () { return observer.disconnect(); };
    });
    return observable;
}
export function getMutationObserverConstructor() {
    var constructor;
    var browserWindow = window;
    // Angular uses Zone.js to provide a context persisting across async tasks.  Zone.js replaces the
    // global MutationObserver constructor with a patched version to support the context propagation.
    // There is an ongoing issue[1][2] with this setup when using a MutationObserver within a Angular
    // component: on some occasions, the callback is being called in an infinite loop, causing the
    // page to freeze (even if the callback is completely empty).
    //
    // To work around this issue, we are using the Zone __symbol__ API to get the original, unpatched
    // MutationObserver constructor.
    //
    // [1] https://github.com/angular/angular/issues/26948
    // [2] https://github.com/angular/angular/issues/31712
    if (browserWindow.Zone) {
        var symbol = browserWindow.Zone.__symbol__('MutationObserver');
        constructor = browserWindow[symbol];
    }
    if (!constructor) {
        constructor = browserWindow.MutationObserver;
    }
    return constructor;
}
//# sourceMappingURL=domMutationObservable.js.map