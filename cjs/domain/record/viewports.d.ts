/**
 * Browsers have not standardized various dimension properties. Mobile devices typically report
 * dimensions in reference to the visual viewport, while desktop uses the layout viewport. For example,
 * Mobile Chrome will change innerWidth when a pinch zoom takes place, while Chrome Desktop (mac) will not.
 *
 * With the new Viewport API, we now calculate and normalize dimension properties to the layout viewport.
 * If the VisualViewport API is not supported by a browser, it isn't reasonably possible to detect or normalize
 * which viewport is being measured. Therefore these exported functions will fallback to assuming that the layout
 * viewport is being measured by the browser
 */
import type { VisualViewportRecord } from '../../types';
interface LayoutCoordinates {
    layoutViewportX: number;
    layoutViewportY: number;
    visualViewportX: number;
    visualViewportY: number;
}
export declare const convertMouseEventToLayoutCoordinates: (clientX: number, clientY: number) => LayoutCoordinates;
export declare const getVisualViewport: () => VisualViewportRecord['data'];
export declare function getWindowWidth(): number;
export declare function getWindowHeight(): number;
export declare function getScrollX(): number;
export declare function getScrollY(): number;
export {};
