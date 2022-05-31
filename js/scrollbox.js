/**
 * @filename                    scrollbox.ts
 * @extension_files             _scroll.scss
 * todo remake this
 */
import { $, magicDOM } from './index';
import lib, { debounce } from './lib';
export default class ScrollBox {
    container;
    /**
     * {@linkcode ScrollBoxOptions}
     *
     * @param           container                   container
     * @param           options
     * @param           options.horizontal          horizontal scrolling
     * @param           options.velocity            over-scroll's velocity
     */
    constructor(container, { horizontal = false, velocity = 0.2 } = {}) {
        this.container = container;
        if (this.container.querySelector('.scroll__box'))
            return;
        /** append all children from the container into the scrollbox */
        this.content.append(...this.container.childNodes);
        /** append components into container */
        this.container.append(this.vBar, this.hBar, this.content);
        /** after initialization, all append made gonna flow into scrollbox instead */
        this.container.append = (...nodes) => this.content.append(...nodes);
        this.container.appendChild = (node) => this.content.appendChild(node);
        /** classlist */
        this.container.classList.add('scroll');
        /** options fetching */
        this.horizontal = horizontal || this.content.scrollWidth - this.content.offsetWidth > 0;
        this.velocity = velocity;
        /** properties */
        this.scrollableX = this.content.scrollWidth - this.content.offsetWidth;
        this.scrollableY = this.content.scrollHeight - this.content.offsetHeight;
        /** attached events */
        this.attachEvents();
        /** resize observer */
        new ResizeObserver(() => {
            /** options */
            this.horizontal = this.horizontal || this.content.scrollWidth - this.content.offsetWidth > 0;
            /** properties */
            this.scrollableX = this.content.scrollWidth - this.content.offsetWidth;
            this.scrollableY = this.content.scrollHeight - this.content.offsetHeight;
            /** init */
            this.init();
        }).observe(this.content);
    }
    /** components */
    content = magicDOM.createElement('div', {
        classList: 'scroll__box'
    });
    vBar = magicDOM.createTree('div', 'scroll__bar--vertical', {
        'data-hidden': ''
    }, {
        thumb: { classList: 'scroll__thumb' }
    });
    hBar = magicDOM.createTree('div', 'scroll__bar--horizontal', {
        'data-hidden': ''
    }, {
        thumb: { classList: 'scroll__thumb' }
    });
    /** properties */
    scrollableX = 0;
    scrollableY = 0;
    delta = 0;
    cursorStartPoint = { x: 0, y: 0 };
    /** options */
    horizontal = false;
    velocity = 0;
    init() {
        /** specify the presence of scrollbars */
        if (this.scrollableY > 0)
            delete this.vBar.dataset.hidden;
        if (this.scrollableX > 0)
            delete this.hBar.dataset.hidden;
        /** initial render */
        this.renderComponents();
    }
    __vDrag = (e) => this.verticalDragging(e);
    __hDrag = (e) => this.horizontalDragging(e);
    __vDown = (e) => this.verticalThumbDown(e);
    __hDown = (e) => this.horizontalThumbDown(e);
    verticalThumbDown(event) {
        event.preventDefault();
        /** dataset */
        $(this.container).dataset('dragging', '');
        // Calculate cursor position relative to selected
        let r = event.target.getBoundingClientRect();
        this.cursorStartPoint.y = event.clientY - r.top;
        $(window)
            .on('pointermove', this.__vDrag)
            .on('pointerup', () => {
            $(window).off("pointermove", this.__vDrag);
            /** remove dataset */
            $(this.container).dataset('dragging', null);
        });
    }
    horizontalThumbDown(event) {
        event.preventDefault();
        /** dataset */
        $(this.content).dataset('dragging', '');
        // Calculate cursor position relative to selected
        let r = event.target.getBoundingClientRect();
        this.cursorStartPoint.x = event.clientX - r.left;
        $(window)
            .on('pointermove', this.__hDrag)
            .on('pointerup', () => {
            $(window).off("pointermove", this.__hDrag);
            /** remove dataset */
            $(this.container).dataset('dragging', null);
        });
    }
    verticalDragging(event) {
        lib.cssFrame(() => {
            if (!(this.vBar.thumb))
                return;
            let barRect = this.vBar.getBoundingClientRect();
            let thumbRect = this.vBar.thumb.getBoundingClientRect();
            let top = barRect.top + this.cursorStartPoint.y;
            let bottom = (barRect.top + barRect.height) - (thumbRect.height - this.cursorStartPoint.y);
            // since those scroll function clamped set themselves, more calculations are not needed
            let scrollPercentage = (event.clientY - top) / (bottom - top);
            let scrollDistance = this.scrollableY * scrollPercentage;
            this.content.scrollTop = scrollDistance;
        });
    }
    horizontalDragging(event) {
        lib.cssFrame(() => {
            if (!(this.hBar.thumb))
                return;
            let barRect = this.hBar.getBoundingClientRect();
            let thumbRect = this.hBar.thumb.getBoundingClientRect();
            let left = barRect.left + this.cursorStartPoint.x;
            let right = (barRect.left + barRect.width) - (thumbRect.width - this.cursorStartPoint.x);
            // since those scroll function clamped set themselves, more calculations are not needed
            let scrollPercentage = (event.clientX - left) / (right - left);
            let scrollDistance = this.scrollableX * scrollPercentage;
            this.content.scrollLeft = scrollDistance;
        });
    }
    attachEvents() {
        if (!(this.hBar.thumb && this.vBar.thumb))
            return;
        /** @brief events attaching */
        /** vertical bar */
        $(this.vBar.thumb).on("pointerdown", this.__vDown);
        /** horizontal bar */
        $(this.hBar.thumb).on("pointerdown", this.__hDown);
        /** content */ // todo sometime, scroll don't work, and sometime, wheel don't work
        $(this.content)
            .on('scroll', this.__renderComponents)
            .on('wheel', this.__overScrolling, { passive: false });
    }
    __overScrolling = (e) => this.overScrolling(e);
    overScrolling(event) {
        if (event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            !this.scrollableY)
            return;
        /** @brief over scrolling effect */
        if ((this.content.scrollTop >= this.scrollableY - 1 && event.deltaY > 0) || /** at bottom */
            (this.content.scrollTop === 0 && event.deltaY < 0) /** at top */) {
            event.stopImmediatePropagation();
            lib.cssFrame(() => {
                /** update thumb */
                this.renderComponents();
                /** calculate delta */
                this.delta += event.deltaY * this.velocity;
            });
        }
        /** remove over scroll effect */
        this.deleteOverScrollingState();
    }
    deleteOverScrollingState = debounce(() => {
        this.delta = 0; // todo delta decreasing slowly
        this.renderComponents();
        $(this.content).css('transform', null);
    }, 150);
    __renderComponents = () => this.renderComponents();
    renderComponents() {
        lib.cssFrame(() => {
            /** calculate content's visible percentage */
            let yPercent = this.content.offsetHeight / (lib.abs(this.delta) + this.content.scrollHeight) * 100;
            let xPercent = this.content.offsetWidth / this.content.scrollWidth * 100;
            /** calculate thumb's position */
            let yPos = (this.content.scrollTop + lib.max(this.delta, 0)) / (this.content.scrollHeight + this.delta) * 100;
            let xPos = this.content.scrollLeft / this.content.scrollWidth * 100;
            /** vertical */
            $(this.vBar).css({
                '--scrollbar-thumb-percent': yPercent,
                '--scrollbar-thumb-pos': yPos
            });
            /** horizontal */
            $(this.hBar).css({
                '--scrollbar-thumb-percent': xPercent,
                '--scrollbar-thumb-pos': xPos
            });
            /** over scrolling effect */
            if (this.delta !== 0)
                $(this.content).css('transform', `translate(0, ${-this.delta}px)`);
        });
    }
}
