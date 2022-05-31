/**
 * @filename                    scrollbox.ts
 * @extension_files             _scroll.scss
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
     * @param container container to initialize custom scrollbar into
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
    /** performance props */
    private attachedEvents;
    init(): void;
    private __vDrag;
    private __hDrag;
    private verticalThumbDown;
    private horizontalThumbDown;
    private verticalDragging;
    private horizontalDragging;
    private attachEvents;
    private updateThumb;
}
export {};
//# sourceMappingURL=scrollbox.d.ts.map