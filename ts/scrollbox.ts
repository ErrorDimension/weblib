/**
 * @filename                    scrollbox.ts
 * @extension_files             _scroll.scss
 * todo remake this
 */


import { $, magicDOM } from './index'
import lib, { debounce } from './lib'


interface ScrollBoxOptions {
    velocity?: number
}


export default class ScrollBox {
    /**
     * {@linkcode ScrollBoxOptions}
     * 
     * @param           container                   container 
     * @param           options
     * @param           options.horizontal          horizontal scrolling
     * @param           options.velocity            over-scroll's velocity
     */
    constructor(private container: HTMLElement, {
        velocity = 0.2
    }: ScrollBoxOptions = {}) {
        if (this.container.querySelector('.scroll__box')) return


        /** append all children from the container into the scrollbox */
        this.content.append(...this.container.childNodes)


        /** append components into container */
        this.container.append(this.vBar, this.hBar, this.content)


        /** after initialization, all append made gonna flow into scrollbox instead */
        this.container.append = (...nodes: (string | Node)[]): void => this.content.append(...nodes)
        this.container.appendChild = <T extends Node>(node: T): T => this.content.appendChild(node)


        /** classlist */
        this.container.classList.add('scroll')


        /** options fetching */
        this.velocity = velocity


        /** properties */
        this.scrollableX = this.content.scrollWidth - this.content.offsetWidth
        this.scrollableY = this.content.scrollHeight - this.content.offsetHeight


        /** attached events */
        this.attachEvents()


        /** resize observer */
        new ResizeObserver((): void => {
            /** properties */
            this.scrollableX = this.content.scrollWidth - this.content.offsetWidth
            this.scrollableY = this.content.scrollHeight - this.content.offsetHeight


            /** init */
            this.init()
        }).observe(this.content)
    }


    /** components */
    private content: HTMLElement = magicDOM.createElement('div', {
        classList: 'scroll__box'
    })

    private vBar: HTMLElement & {
        thumb?: HTMLElement
    } = magicDOM.createTree('div', 'scroll__bar--vertical', {
        'data-hidden': ''
    }, {
        thumb: { classList: 'scroll__thumb' }
    })

    private hBar: HTMLElement & {
        thumb?: HTMLElement
    } = magicDOM.createTree('div', 'scroll__bar--horizontal', {
        'data-hidden': ''
    }, {
        thumb: { classList: 'scroll__thumb' }
    })


    /** properties */
    private scrollableX: number = 0
    private scrollableY: number = 0

    private delta: number = 0

    private cursorStartPoint: {
        x: number
        y: number
    } = { x: 0, y: 0 }


    /** options */
    private velocity: number = 0


    init(): void {
        /** specify the presence of scrollbars */
        if (this.scrollableY > 0) delete this.vBar.dataset.hidden
        if (this.scrollableX > 0) delete this.hBar.dataset.hidden


        /** initial render */
        this.renderComponents()
    }


    private __vDrag: (e: PointerEvent) => void = (e: PointerEvent): void => this.verticalDragging(e)
    private __hDrag: (e: PointerEvent) => void = (e: PointerEvent): void => this.horizontalDragging(e)


    private __vDown: (e: PointerEvent) => void = (e: PointerEvent): void => this.verticalThumbDown(e)
    private __hDown: (e: PointerEvent) => void = (e: PointerEvent): void => this.horizontalThumbDown(e)


    private verticalThumbDown(event: PointerEvent): void {
        event.preventDefault()


        /** dataset */
        $(this.container).dataset('dragging', '')


        // Calculate cursor position relative to selected
        let r: DOMRect = (event.target as HTMLElement).getBoundingClientRect()

        this.cursorStartPoint.y = event.clientY - r.top


        $(window)
            .on('pointermove', this.__vDrag)
            .on('pointerup', (): void => {
                $(window).off("pointermove", this.__vDrag)


                /** remove dataset */
                $(this.container).dataset('dragging', null)
            })
    }


    private horizontalThumbDown(event: PointerEvent): void {
        event.preventDefault()


        /** dataset */
        $(this.container).dataset('dragging', '')


        // Calculate cursor position relative to selected
        let r: DOMRect = (event.target as HTMLElement).getBoundingClientRect()

        this.cursorStartPoint.x = event.clientX - r.left


        $(window)
            .on('pointermove', this.__hDrag)
            .on('pointerup', (): void => {
                $(window).off("pointermove", this.__hDrag)


                /** remove dataset */
                $(this.container).dataset('dragging', null)
            })
    }


    private verticalDragging(event: PointerEvent): void {
        lib.cssFrame((): void => {
            if (!(this.vBar.thumb)) return


            let barRect: DOMRect = this.vBar.getBoundingClientRect()
            let thumbRect: DOMRect = this.vBar.thumb.getBoundingClientRect()

            let top: number = barRect.top + this.cursorStartPoint.y
            let bottom: number = (barRect.top + barRect.height) - (thumbRect.height - this.cursorStartPoint.y)

            // since those scroll function clamped set themselves, more calculations are not needed
            let scrollPercentage: number = (event.clientY - top) / (bottom - top)

            let scrollDistance: number = this.scrollableY * scrollPercentage


            this.content.scrollTop = scrollDistance
        })
    }


    private horizontalDragging(event: PointerEvent): void {
        lib.cssFrame((): void => {
            if (!(this.hBar.thumb)) return


            let barRect: DOMRect = this.hBar.getBoundingClientRect()
            let thumbRect: DOMRect = this.hBar.thumb.getBoundingClientRect()

            let left: number = barRect.left + this.cursorStartPoint.x
            let right: number = (barRect.left + barRect.width) - (thumbRect.width - this.cursorStartPoint.x)

            // since those scroll function clamped set themselves, more calculations are not needed
            let scrollPercentage: number = (event.clientX - left) / (right - left)

            let scrollDistance: number = this.scrollableX * scrollPercentage


            this.content.scrollLeft = scrollDistance
        })
    }


    private attachEvents(): void {
        if (!(this.hBar.thumb && this.vBar.thumb)) return


        /** @brief events attaching */
        /** vertical bar */
        $(this.vBar.thumb).on("pointerdown", this.__vDown)


        /** horizontal bar */
        $(this.hBar.thumb).on("pointerdown", this.__hDown)


        /** content */ // todo sometime, scroll don't work, and sometime, wheel don't work
        $(this.content)
            .on('scroll', this.__renderComponents)
            .on('wheel', this.__overScrolling, { passive: false })
    }


    private __overScrolling: (e: WheelEvent) => void = (e: WheelEvent): void => this.overScrolling(e)

    private overScrolling(event: WheelEvent): void {
        if (
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            !this.scrollableY
        ) return


        /** @brief over scrolling effect */
        if (
            (this.content.scrollTop >= this.scrollableY - 1 && event.deltaY > 0) ||  /** at bottom */
            (this.content.scrollTop === 0 && event.deltaY < 0)                      /** at top */
        ) {
            event.stopImmediatePropagation()


            lib.cssFrame((): void => {
                /** update thumb */
                this.renderComponents()


                /** calculate delta */
                this.delta += event.deltaY * this.velocity
            })
        }


        /** remove over scroll effect */
        this.deleteOverScrollingState()
    }


    deleteOverScrollingState: () => void = debounce((): void => {
        this.delta = 0 // todo delta decreasing slowly
        this.renderComponents()


        $(this.content).css('transform', null)
    }, 150)


    private __renderComponents: () => void = (): void => this.renderComponents()

    private renderComponents(): void {
        lib.cssFrame((): void => {
            /** calculate content's visible percentage */
            let yPercent: number = this.content.offsetHeight / (lib.abs(this.delta) + this.content.scrollHeight) * 100
            let xPercent: number = this.content.offsetWidth / this.content.scrollWidth * 100


            /** calculate thumb's position */
            let yPos: number = (this.content.scrollTop + lib.max(this.delta, 0)) / (this.content.scrollHeight + this.delta) * 100
            let xPos: number = this.content.scrollLeft / this.content.scrollWidth * 100


            /** vertical */
            $(this.vBar).css({
                '--scrollbar-thumb-percent': yPercent,
                '--scrollbar-thumb-pos': yPos
            })


            /** horizontal */
            $(this.hBar).css({
                '--scrollbar-thumb-percent': xPercent,
                '--scrollbar-thumb-pos': xPos
            })


            /** over scrolling effect */
            if (this.delta !== 0)
                $(this.content).css('transform', `translate(0, ${-this.delta}px)`)
        })
    }
}
