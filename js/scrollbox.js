/**
 * @filename                    scrollbox.ts
 * @extension_files             _scroll.scss
 */
import { $, magicDOM } from './index';
import lib, { debounce } from './lib';
export default class ScrollBox {
    container;
    /**
     * {@linkcode ScrollBoxOptions}
     *
     * @param container container to initialize custom scrollbar into
     */
    constructor(container, { horizontal = false, velocity = 0.2 } = {}) {
        this.container = container;
        /** append all children from the container into the scrollbox */
        this.content.append(...this.container.childNodes);
        /** append components into container */
        this.container.append(this.vBar, this.hBar, this.content);
        /** after initialization, all append made gonna flow into scrollbox instead */
        this.container.append = this.content.append;
        this.container.appendChild = this.content.appendChild;
        /** classlist */
        this.container.classList.add('scroll');
        /** options fetching */
        this.horizontal = horizontal || this.content.scrollWidth - this.content.offsetWidth > 0;
        this.velocity = velocity;
        /** properties */
        this.scrollableX = this.content.scrollWidth - this.content.offsetWidth;
        this.scrollableY = this.content.scrollHeight - this.content.offsetHeight;
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
    /** performance props */
    attachedEvents = false;
    init() {
        /** specify the presence of scrollbars */
        if (this.scrollableY > 0)
            delete this.vBar.dataset.hidden;
        if (this.scrollableX > 0)
            delete this.hBar.dataset.hidden;
        /** attach events */
        if (this.attachedEvents)
            return;
        this.attachedEvents = true;
        this.attachEvents();
        /** initial update */
        this.updateThumb();
    }
    __vDrag = (e) => this.verticalDragging(e);
    __hDrag = (e) => this.horizontalDragging(e);
    verticalThumbDown(event) {
        $(this.content).dataset('dragging', '');
        // Calculate cursor position relative to selected
        let r = event.target.getBoundingClientRect();
        this.cursorStartPoint.y = event.clientY - r.top;
        $(window)
            .on('mousemove', this.__vDrag)
            .on('mouseup', () => {
            $(window).off("mousemove", this.__vDrag);
            $(this.content).dataset('dragging', null);
        });
    }
    horizontalThumbDown(event) {
        $(this.content).dataset('dragging', '');
        // Calculate cursor position relative to selected
        let r = event.target.getBoundingClientRect();
        this.cursorStartPoint.x = event.clientX - r.left;
        $(window)
            .on('mousemove', this.__hDrag)
            .on('mouseup', () => {
            $(window).off("mousemove", this.__hDrag);
            $(this.content).dataset('dragging', null);
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
            let scrollPercentage = lib.clamp(0, (event.clientY - top) / (bottom - top), 1);
            let scrollValue = (this.content.scrollHeight - this.content.offsetHeight) * scrollPercentage;
            this.content.scrollTop = scrollValue;
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
            let scrollPercentage = lib.clamp(0, (event.clientX - left) / (right - left), 1);
            let scrollValue = (this.content.scrollWidth - this.content.offsetWidth) * scrollPercentage;
            this.content.scrollLeft = scrollValue;
        });
    }
    attachEvents() {
        if (!(this.hBar.thumb && this.vBar.thumb))
            return;
        /** function props */
        const deleteOverScrollingState = debounce(() => {
            lib.cssFrame(() => {
                this.delta = 0; // todo delta decreasing slowly
                this.updateThumb();
                $(this.content).css('transform', null);
            });
        }, 150);
        /** @brief events attaching */
        /** vertical bar */
        $(this.vBar.thumb)
            .on("mousedown", (e) => this.verticalThumbDown(e));
        /** horizontal bar */
        $(this.hBar.thumb)
            .on("mousedown", (e) => this.horizontalThumbDown(e));
        /** content */ // todo sometime, scroll don't work, and sometime, wheel don't work
        $(this.content)
            .on('scroll', () => this.updateThumb())
            .on('wheel', (event) => {
            if (event.ctrlKey || event.shiftKey || event.altKey)
                return;
            /** @brief over scrolling effect */
            if ((this.content.scrollTop >= this.scrollableY - 1 && event.deltaY > 0) || /** at bottom */
                (this.content.scrollTop === 0 && event.deltaY < 0) /** at top */) {
                lib.cssFrame(() => {
                    event.stopPropagation();
                    event.preventDefault();
                    /** update thumb */
                    this.updateThumb();
                    /** calculate delta */
                    this.delta += event.deltaY * this.velocity;
                });
            }
            /** remove over scroll effect */
            deleteOverScrollingState();
        }, { passive: false });
    }
    updateThumb() {
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
    }
}
