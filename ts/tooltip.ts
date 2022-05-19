import { $ } from './jquery'
import Console from './console'
import cursor from './cursor'
import lib, { throttled } from './lib'
import magicDOM from './magic-dom'
import modCase from './modcase'


const logger: Console | undefined = typeof window === 'undefined'
    ? undefined
    : new Console('tooltip', { background: 'rgba(92, 92, 92, 0.4)' })

const OFFSET: number = 135
const LARGE_X_AXIS: number = 3 / 4
const LARGE_Y_AXIS: number = 77 / 100
const MOUSE_OFFSET_X: number = 13
const MOUSE_OFFSET_Y: number = 25

const MOVE_THROTTLE: number = 55

const HIDE_DURATION: number = 200
const DEACTIVATE_DURATION: number = 300


interface Hook {
    on: 'attribute' | 'dataset',
    key: string,
    handler?({ target, value, update }: {
        target: HTMLElement,
        value?: string,
        update(content: string | HTMLElement): void
    }): undefined | string | HTMLElement,
    follower?(): void,
    priority?: number,
    padding?: boolean
}


const tooltip: {
    readonly initialized: boolean,
    container?: HTMLElement,
    content?: HTMLElement,
    hideTimeoutId: number,
    glowing: boolean,
    hooks: Hook[],
    processor: {
        attribute: {
            process(target: HTMLElement, key: string): string | undefined,
            attach(hook: Hook): void
        },
        dataset: {
            process(target: HTMLElement, key: string): string | undefined,
            attach(hook: Hook): void
        }
    },
    init(): void,
    scan(_?: any): void,
    /**
     * {@linkcode       Hook}
     * 
     * @param           hook                
     * @param           hook.on             'attribute' or 'dataset'
     * @param           hook.key            hook's key
     * @param           hook.handler        return content for the tooltip
     * @param           hook.follower       event to fired after mouseleave
     * @param           hook.priority       ensure hook's priority
     * @param           hook.padding        decide to render padding or not
     * 
     * @example
     * ```typescript
     * tooltip.addHook({
     *  on: 'attribute',
     *  key: 'title'
     * })
     * ```
     */
    addHook({ on, key, handler, follower, priority, padding }: Hook): void,
    process(target: HTMLElement, { on, key }: Hook): string | undefined,
    attach(target: HTMLElement & { tooltipAttached?: boolean }, hook: Hook): void,
    mouseenter(target: HTMLElement, { on, key, handler, padding }: Hook): void,
    mouseleave({ follower, padding }: Hook): void,
    show(content: string | HTMLElement): void,
    hide(): void,
    move(_?: any): void,
    update(content: string | HTMLElement): void,
    glow(): void
} = {
    get initialized(): boolean { return !!(this.container && this.content) },

    container: undefined,
    content: undefined,

    hideTimeoutId: -1,

    glowing: false,

    hooks: [],

    processor: {
        attribute: {
            process(target: HTMLElement, key: string): string | undefined {
                const value: null | string = target.getAttribute(key)
                return value === null ? undefined : value
            },

            attach(hook: Hook): void {
                if (typeof window === 'undefined') return

                const key: string = hook.key
                $(`[${key}]`).each(function (): void { tooltip.attach(this, hook) })
            }
        },


        dataset: {
            process(target: HTMLElement, key: string): string | undefined { return target.dataset[key] },

            attach(hook: Hook): void {
                if (typeof window === 'undefined') return

                const key: string = modCase.camel.kebab(hook.key)
                $(`[data-${key}]`).each(function (): void { tooltip.attach(this, hook) })
            }
        }
    },


    init(): void {
        /** return if meet the conditions */
        if (lib.isMobile) return
        if (typeof window === 'undefined') return
        if (this.initialized) return


        /** initialize tooltip's container and content */
        class TContainer extends HTMLDivElement { constructor() { super() } }
        class TContent extends HTMLDivElement { constructor() { super() } }
        window.customElements.define('t-container', TContainer, { extends: 'div' })
        window.customElements.define('t-content', TContent, { extends: 'div' })

        this.container = document.createElement('t-container')
        this.content = document.createElement('t-content')

        this.container.append(this.content)
        $(this.container).dataset({ deactivated: '' })
        document.body.insertBefore(this.container, document.body.firstChild)


        /** observe the tooltip */
        new ResizeObserver(this.move).observe(this.container)
        new MutationObserver(this.scan).observe(document.body, {
            childList: true,
            subtree: true
        })


        /** initialize move event */
        cursor.watch(true)
        this.move()


        /** limit glowing rate */
        $(this.container).on('animationend', function (): void {
            $(this).dataset('glow', null)
            tooltip.glowing = false
        })


        /** inform success */
        Console.okay(logger, 'Successfully initialized')
    },


    scan(): void {
        /** scan for new elements in the document and attach tooltip events onto them */
        tooltip.hooks.forEach((hook: Hook): void => tooltip.processor[hook.on].attach(hook))
    },


    addHook({
        on,
        key,
        handler = ({ target, value, update }: {
            target: HTMLElement,
            value?: string,
            update(): void
        }): undefined | string | HTMLElement => value,
        follower = (): void => { /** logic here */ },
        priority = 1,
        padding = true
    }: Hook): void {
        if (!['attribute', 'dataset'].includes(on))
            throw new
                Error(`'tooltip.addHook()' : unexpected '${on}', expecting 'attribute' or 'dataset'`)


        const hook: Hook = { on, key, handler, follower, priority, padding }


        this.hooks.push(hook)
        this.hooks.sort(function (a: Hook, b: Hook): 1 | -1 | 0 {
            if (!(a.priority && b.priority))
                throw new Error("'tooltip.addHook()' : '{priority}' is not valid")

            if (a.priority < b.priority) return 1
            if (a.priority > b.priority) return -1
            return 0
        })


        this.processor[on].attach(hook)
    },


    process(target: HTMLElement, { on, key }: Hook): string | undefined {
        /** return the value from the target's key */
        return this.processor[on].process(target, key)
    },


    attach(target: HTMLElement & { tooltipAttached?: boolean }, hook: Hook): void {
        if (target.tooltipAttached) return
        if (!this.process(target, hook)) return


        /** key of the hook */
        let { key } = hook
        if (hook.on === 'dataset')
            key = `data - ${modCase.camel.kebab(key)} `


        /** observer */
        const observer: MutationObserver = new MutationObserver((): void => {
            this.mouseenter(target, hook)
        })


        /** attach tooltip event */
        $(target)
            .on('mouseenter', (): void => {
                this.mouseenter(target, hook)
                observer.observe(target, { attributeFilter: [key] })
            })
            .on('mouseleave', (): void => {
                this.mouseleave(hook)
                observer.disconnect()
            })


        /** inform that the target is having a tooltip event attached */
        target.tooltipAttached = true
    },


    mouseenter(target: HTMLElement, { on, key, handler, padding }: Hook): void {
        if (!this.container) return


        /** content of the tooltip */
        const value: string | undefined = this.process(target, { on, key })
        const content: string | HTMLElement | undefined = handler ? handler({
            target,
            value,
            update: (content_: string | HTMLElement): void => this.update(content_)
        }) : undefined


        /** handle padding option */
        if (!padding) $(this.container).css({
            '--padding': '0px',
            '--padding-duration': '0ms'
        })


        /** display content */
        if (content) this.show(content)
    },


    mouseleave({ follower, padding }: Hook): void {
        if (!this.container) return


        follower && follower()
        this.hide()


        if (!padding) $(this.container).css({
            '--padding': null,
            '--padding-duration': null
        })
    },


    show(content: string | HTMLElement): void {
        if (!this.container) return


        window.clearInterval(this.hideTimeoutId)


        $(this.container).dataset({
            'deactivated': null,
            'activated': ''
        })


        this.update(content)


        this.move()
        $(window).on('mousemove', tooltip.move)
    },


    hide(): void {
        const { container, content } = tooltip
        if (!(container && content)) return


        tooltip.hideTimeoutId = window.setTimeout((): void => {
            $(container).dataset('activated', null)

            tooltip.hideTimeoutId = window.setTimeout((): void => {
                $(container).dataset('deactivated', '')
                $(window).off('mousemove', tooltip.move)
            }, DEACTIVATE_DURATION)
        }, HIDE_DURATION)
    },


    move: throttled(function (_?: any): void {
        if (!tooltip.container) return

        const { container } = tooltip


        const { innerWidth, innerHeight } = window
        const { clientWidth, clientHeight } = container
        const { positionX, positionY } = cursor


        const isMoreOuterX: boolean = innerWidth * LARGE_X_AXIS < positionX
        const isMoreOuterY: boolean = innerHeight * LARGE_Y_AXIS < positionY
        const isLargerThanScreenX: boolean = innerWidth - clientWidth - OFFSET < positionX
        const isLargerThanScreenY: boolean = innerWidth - clientHeight - OFFSET < positionY


        const posX: number = (isMoreOuterX || isLargerThanScreenX)
            ? positionX - clientWidth - MOUSE_OFFSET_X
            : positionX + MOUSE_OFFSET_X

        const posY: number = (isMoreOuterY || isLargerThanScreenY)
            ? positionY - clientHeight - MOUSE_OFFSET_Y
            : positionY + MOUSE_OFFSET_Y


        lib.cssFrame((): void => {
            $(container).css({
                '--position-x': posX,
                '--position-y': posY
            })
        })
    }, MOVE_THROTTLE),


    update(content: string | HTMLElement): void {
        if (!this.content) return
        if (!content) return


        this.glow()


        magicDOM.emptyNode(this.content)
        this.content.append(content)
    },


    glow(): void {
        if (!this.container) return
        if (this.glowing) return


        $(this.container).dataset('glow', '')
    }
}


export default tooltip


/** @brief default tooltip hook */
tooltip.addHook({
    on: 'attribute',
    key: 'title',
    handler({ target, value }: {
        target: HTMLElement & { tooltipTitle?: string },
        value?: string
    }): string | undefined {
        if (target.tooltipTitle) return target.tooltipTitle


        target.tooltipTitle = value
        target.removeAttribute('title')


        return target.tooltipTitle
    }
})
