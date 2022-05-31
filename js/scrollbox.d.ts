/**
 * @filename                    scrollbox.ts
 * @extension_files             _scroll.scss
 * todo remake this
 */
interface ScrollBoxOptions {
    horizontal?: boolean;
    velocity?: number;
}
export default class ScrollBox {
    private container;
    /**
     * {@linkcode ScrollBoxOptions}
     *
     * @param           container                   container
     * @param           options
     * @param           options.horizontal          horizontal scrolling
     * @param           options.velocity            over-scroll's velocity
     */
    constructor(container: HTMLElement, { horizontal, velocity }?: ScrollBoxOptions);
    /** components */
    private content;
    private vBar;
    private hBar;
    /** properties */
    private scrollableX;
    private scrollableY;
    private delta;
    private cursorStartPoint;
    /** options */
    private horizontal;
    private velocity;
    init(): void;
    private __vDrag;
    private __hDrag;
    private __vDown;
    private __hDown;
    private verticalThumbDown;
    private horizontalThumbDown;
    private verticalDragging;
    private horizontalDragging;
    private attachEvents;
    private __overScrolling;
    private overScrolling;
    deleteOverScrollingState: () => void;
    private __renderComponents;
    private renderComponents;
}
export {};
//# sourceMappingURL=scrollbox.d.ts.map