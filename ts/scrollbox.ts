/**
 * @filename                    scrollbox.ts
 * @extension_files             _scroll.scss
 */


import { $, magicDOM } from './index'
import lib, { debounce } from './lib'


interface ScrollBoxOptions {
    horizontal?: boolean
    velocity?: number
}


export default class ScrollBox {
    /**
     * {@linkcode ScrollBoxOptions}
     * 
     * @param container container to initialize custom scrollbar into
     */
    constructor(private container: HTMLElement, {
        horizontal = false,
        velocity = 0.2
    }: ScrollBoxOptions = {}) {
        /** append all children from the container into the scrollbox */
        this.content.append(...this.container.childNodes)


        /** append components into container */
        this.container.append(this.vBar, this.hBar, this.content)


        /** after initialization, all append made gonna flow into scrollbox instead */
        this.container.append = this.content.append
        this.container.appendChild = this.content.appendChild


        /** classlist */
        this.container.classList.add('scroll')


        /** options fetching */
        this.horizontal = horizontal || this.content.scrollWidth - this.content.offsetWidth > 0
        this.velocity = velocity


        /** properties */
        this.scrollableX = this.content.scrollWidth - this.content.offsetWidth
        this.scrollableY = this.content.scrollHeight - this.content.offsetHeight


        /** resize observer */
        new ResizeObserver((): void => {
            /** options */
            this.horizontal = this.horizontal || this.content.scrollWidth - this.content.offsetWidth > 0


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
    private horizontal: boolean = false
    private velocity: number = 0


    /** performance props */
    private attachedEvents: boolean = false

    init(): void {
        /** specify the presence of scrollbars */
        if (this.scrollableY > 0) delete this.vBar.dataset.hidden
        if (this.scrollableX > 0) delete this.hBar.dataset.hidden


        /** attach events */
        if (this.attachedEvents) return
        this.attachedEvents = true

        this.attachEvents()


        /** initial update */
        this.updateThumb()
    }


    private __vDrag: (e: MouseEvent) => void = (e: MouseEvent): void => this.verticalDragging(e)
    private __hDrag: (e: MouseEvent) => void = (e: MouseEvent): void => this.horizontalDragging(e)


    private verticalThumbDown(event: MouseEvent): void {
        $(this.content).dataset('dragging', '')


        // Calculate cursor position relative to selected
        let r: DOMRect = (event.target as HTMLElement).getBoundingClientRect()

        this.cursorStartPoint.y = event.clientY - r.top


        $(window)
            .on('mousemove', this.__vDrag)
            .on('mouseup', (): void => {
                $(window).off("mousemove", this.__vDrag)

                $(this.content).dataset('dragging', null)
            })
    }


    private horizontalThumbDown(event: MouseEvent): void {
        $(this.content).dataset('dragging', '')


        // Calculate cursor position relative to selected
        let r: DOMRect = (event.target as HTMLElement).getBoundingClientRect()

        this.cursorStartPoint.x = event.clientX - r.left


        $(window)
            .on('mousemove', this.__hDrag)
            .on('mouseup', (): void => {
                $(window).off("mousemove", this.__hDrag)

                $(this.content).dataset('dragging', null)
            })
    }


    private verticalDragging(event: MouseEvent): void {
        lib.cssFrame((): void => {
            if (!(this.vBar.thumb)) return


            let barRect: DOMRect = this.vBar.getBoundingClientRect()
            let thumbRect: DOMRect = this.vBar.thumb.getBoundingClientRect()

            let top: number = barRect.top + this.cursorStartPoint.y
            let bottom: number = (barRect.top + barRect.height) - (thumbRect.height - this.cursorStartPoint.y)

            let scrollPercentage: number = lib.clamp(0, (event.clientY - top) / (bottom - top), 1)

            let scrollValue: number = (this.content.scrollHeight - this.content.offsetHeight) * scrollPercentage


            this.content.scrollTop = scrollValue
        })
    }


    private horizontalDragging(event: MouseEvent): void {
        lib.cssFrame((): void => {
            if (!(this.hBar.thumb)) return


            let barRect: DOMRect = this.hBar.getBoundingClientRect()
            let thumbRect: DOMRect = this.hBar.thumb.getBoundingClientRect()

            let left: number = barRect.left + this.cursorStartPoint.x
            let right: number = (barRect.left + barRect.width) - (thumbRect.width - this.cursorStartPoint.x)

            let scrollPercentage: number = lib.clamp(0, (event.clientX - left) / (right - left), 1)

            let scrollValue: number = (this.content.scrollWidth - this.content.offsetWidth) * scrollPercentage


            this.content.scrollLeft = scrollValue
        })
    }



    private attachEvents(): void {
        if (!(this.hBar.thumb && this.vBar.thumb)) return


        /** function props */
        const deleteOverScrollingState: () => void = debounce((): void => {
            lib.cssFrame((): void => {
                this.delta = 0 // todo delta decreasing slowly
                this.updateThumb()
                $(this.content).css('transform', null)
            })
        }, 150)


        /** @brief events attaching */
        /** vertical bar */
        $(this.vBar.thumb)
            .on("mousedown", (e: MouseEvent): void => this.verticalThumbDown(e))


        /** horizontal bar */
        $(this.hBar.thumb)
            .on("mousedown", (e: MouseEvent): void => this.horizontalThumbDown(e))


        /** content */ // todo sometime, scroll don't work, and sometime, wheel don't work
        $(this.content)
            .on('scroll', (): void => this.updateThumb())
            .on('wheel', (event: WheelEvent): void => {
                if (event.ctrlKey || event.shiftKey || event.altKey || !this.scrollableY) return


                /** @brief over scrolling effect */
                if (
                    (this.content.scrollTop >= this.scrollableY - 1 && event.deltaY > 0) ||  /** at bottom */
                    (this.content.scrollTop === 0 && event.deltaY < 0)                      /** at top */
                ) {
                    lib.cssFrame((): void => {
                        event.stopPropagation()
                        event.preventDefault()


                        /** update thumb */
                        this.updateThumb()


                        /** calculate delta */
                        this.delta += event.deltaY * this.velocity
                    })
                }


                /** remove over scroll effect */
                deleteOverScrollingState()
            }, { passive: false })
    }


    private updateThumb(): void {
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
    }
}
