import Console from './console'
import cursor from './cursor'
import { $ } from './jquery'
import lib, { throttled } from './lib'
import magicDOM from './magic-dom'
import modCase from './modcase'


const windowIsDefined: boolean = typeof window !== 'undefined'


windowIsDefined && customElements.define(
    'tooltip-container',
    class TooltipContainer extends HTMLDivElement {
        constructor() {
            super()
        }
    },
    { extends: 'div' }
)


windowIsDefined && customElements.define(
    'tooltip-content',
    class TooltipContent extends HTMLDivElement {
        constructor() {
            super()
        }
    },
    { extends: 'div' }
)


interface HandlerArguments {
    target: HTMLElement,
    value?: string,
    update: (content: string | HTMLElement) => void
}

interface Hook {
    on: 'dataset' | 'attribute',
    key: string,
    handler?: ({ target, value, update }: HandlerArguments) => HTMLElement | string | undefined,
    destroy?: () => void,
    priority?: number,
    noPadding?: boolean
}

const OFFSET: number = 135
const LARGE_X_AXIS: number = 3 / 4
const LARGE_Y_AXIS: number = 77 / 100
const MOUSE_OFFSET_X: number = 13
const MOUSE_OFFSET_Y: number = 25

const tooltip: {
    logger: Console,
    initialized: boolean,
    hideTimeout: number,
    container?: HTMLElement,
    content?: HTMLElement,
    hooks: Hook[],
    processor: {
        dataset: {
            process: (target: HTMLElement, key: string) => string | undefined,
            attach: (hook: Hook) => void
        },
        attribute: {
            process: (target: HTMLElement, key: string) => string | undefined,
            attach: (hook: Hook) => void
        },
    },
    init(): void,
    scan(_?: any): void,
    getValue(target: HTMLElement, hook: Hook): string | undefined,
    addHook({ on, key, handler, destroy, priority, noPadding }: Hook): void,
    attachEvent(target: HTMLElement & {
        tooltipListened?: boolean,
        tooltipChecked?: boolean
    }, hook: Hook): void,
    mouseenter(hook: Hook, target: HTMLElement): void,
    mouseleave(hook: Hook): void,
    show(content: HTMLElement | string): void,
    hide(): void,
    move(_?: any): void,
    update(content: HTMLElement | string): void,
    glowing: boolean,
    glow(): void
} = {
    logger: new Console('zatooltip', { background: 'rgba(92, 92, 92, 0.4)' }),

    initialized: false,

    hideTimeout: -1,

    container: windowIsDefined ? document.createElement('tooltip-container') : undefined,
    content: windowIsDefined ? document.createElement('tooltip-content') : undefined,

    hooks: [],


    processor: {
        dataset: {
            process: (target: HTMLElement, key: string): string | undefined => target.dataset[key],

            attach: (hook: Hook): void => {
                if (!windowIsDefined) return

                let key: string = modCase.camel.kebab(hook.key)

                $(`[data-${key}]`).each(function (): void {
                    tooltip.attachEvent(this, hook)
                })
            }
        },

        attribute: {
            process: (target: HTMLElement, key: string): string | undefined => {
                const data: string | null = target.getAttribute(key)
                return data === null ? undefined : data
            },

            attach: (hook: Hook): void => {
                if (!windowIsDefined) return

                let key: string = hook.key

                $(`[${key}]`).each(function () {
                    tooltip.attachEvent(this, hook)
                })
            }
        }
    },


    init(): void {
        const { container, content } = this
        if (!(container && content)) return
        if (this.initialized) return
        if (lib.isMobile) return


        /** insert tooltip to the document */
        container.appendChild(content)
        document.body.insertBefore(container, document.body.firstChild)


        /** observe the tooltip */
        new ResizeObserver(this.move).observe(container)
        new MutationObserver(this.scan).observe(document.body, {
            childList: true,
            subtree: true
        })


        /** initial mouse event */
        cursor.watch(true)
        this.move()


        /** limit glowing rate */
        $(container).on('animationend', (): void => {
            $(container).dataset('glow', null)
            this.glowing = false
        })


        /** inform that the tooltip is successfully attached */
        this.initialized = true
        Console.okay(this.logger, 'Successfully initialized')
    },


    scan(_?: any): void {
        tooltip.hooks.forEach((hook: Hook): void => tooltip.processor[hook.on].attach(hook))
    },


    getValue(target: HTMLElement, hook: Hook): string | undefined {
        if (!(target instanceof HTMLElement)) return undefined
        return this.processor[hook.on].process(target, hook.key)
    },


    /**
     * This function add tooltip hook into the document
     * @param       prop                hook properties
     * @param       prop.on             on 'dataset' or 'attribute'
     * @param       prop.key            key to attach tooltip on
     * @param       prop.handler        handler content
     * @param       prop.destroy        fallback event after hide the tooltip
     * @param       prop.priority       decide which hook is chosen to execute
     * @param       prop.noPadding      decide whether to disable padding prop or not
     */
    addHook({
        on,
        key,
        handler = ({ target, value, update }: HandlerArguments): string | undefined => value,
        destroy = (): void => { /* logic here */ },
        priority = 1,
        noPadding = false
    }: Hook): void {
        if (!['attribute', 'dataset'].includes(on))
            throw new Error(
                `tooltip.addHook() : unexpected '{on}', expecting 'attribute' or 'dataset'`
            )
        if (typeof on === 'undefined')
            throw new Error(`'tooltip.addHook()' : '{on}' is not defined`)
        if (typeof key === 'undefined')
            throw new Error(`'tooltip.addHook()' : '{key}' is not defined`)


        let hook: Hook = { on, key, handler, destroy, priority, noPadding }
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


    attachEvent(target: HTMLElement & {
        tooltipListened?: boolean,
        tooltipChecked?: boolean
    }, hook: Hook): void {
        if (target.tooltipListened === true) return


        const hooks: Hook[] = typeof hook === 'object' ? [hook] : this.hooks

        for (let fncHook of hooks) {
            if (!this.getValue(target, fncHook)) continue
            if (target.tooltipChecked === true) break


            /** get the key of the hook */
            let { key } = fncHook
            if (fncHook.on === 'dataset')
                key = `data-${modCase.camel.kebab(key)}`


            /** initialize the observer and the functions of the hook */
            const observer: MutationObserver = new MutationObserver((): void => {
                this.mouseenter(fncHook, target)
            })

            const mouseenter: () => void = (): void => {
                this.mouseenter(fncHook, target)
                observer.observe(target, { attributeFilter: [key] })
            }

            const mouseleave: () => void = (): void => {
                this.mouseleave(fncHook)
                observer.disconnect()
            }


            /** attach event handlers onto the target */
            $(target)
                .on('mouseenter', mouseenter)
                .on('mouseleave', mouseleave)


            target.tooltipChecked = true
            break
        }


        target.tooltipListened = target.tooltipChecked
    },


    mouseenter(hook: Hook, target: HTMLElement): void {
        if (!this.container) return


        /** get value for the tooltip */
        let value: string | undefined = this.getValue(target, hook)
        let content: string | HTMLElement | undefined = (typeof hook.handler === 'undefined')
            ? undefined
            : hook.handler({
                target,
                value,
                update: (data: string | HTMLElement): void => this.update(data)
            })


        /** handle no padding option */
        if (hook.noPadding)
            $(this.container).css({
                '--padding': '0px',
                '--padding-duration': '0ms'
            })


        /** show the tooltip if content is defined */
        if (content) this.show(content)
    },


    mouseleave(hook: Hook): void {
        if (!this.container) return

        const { destroy } = hook
        const { hide } = this

        destroy && destroy()
        hide()

        if (hook.noPadding)
            $(this.container).css({
                '--padding': null,
                '--padding-duration': null
            })
    },


    show(content: HTMLElement | string): void {
        if (!this.container) return

        window.clearTimeout(this.hideTimeout)

        $(this.container).dataset({
            'deactivated': null,
            'activated': ''
        })
        this.update(content)

        this.move()
        $(window).on('mousemove', this.move)
    },


    hide(): void {
        const { container, content } = tooltip
        if (!(container && content)) return

        tooltip.hideTimeout = window.setTimeout(function (): void {
            $(container).dataset('activated', null)

            tooltip.hideTimeout = window.setTimeout((): void => {
                $(container).dataset('deactivated', '')
                $(window).off('mousemove', tooltip.move)
                magicDOM.emptyNode(content)
            }, 300)
        }, 200)
    },


    move: throttled(function (_?: any): void {
        const { container } = tooltip
        if (!container) return


        let { innerWidth, innerHeight } = window
        let { clientWidth, clientHeight } = container
        let { positionX, positionY } = cursor


        let isMoreOuterX: boolean = innerWidth * LARGE_X_AXIS < positionX
        let isMoreOuterY: boolean = innerHeight * LARGE_Y_AXIS < positionY
        let isLargerThanScreenX: boolean = innerWidth - clientWidth - OFFSET < positionX
        let isLargerThanScreenY: boolean = innerWidth - clientHeight - OFFSET < positionY


        let posX: number = (isMoreOuterX || isLargerThanScreenX)
            ? positionX - clientWidth - MOUSE_OFFSET_X
            : positionX + MOUSE_OFFSET_X

        let posY: number = (isMoreOuterY || isLargerThanScreenY)
            ? positionY - clientHeight - MOUSE_OFFSET_Y
            : positionY + MOUSE_OFFSET_Y


        lib.cssFrame((): void => {
            $(container).css({
                '--position-x': posX,
                '--position-y': posY
            })
        })
    }, 55),


    update(content: HTMLElement | string): void {
        if (!(content && this.content)) return

        this.glow()

        if (content instanceof HTMLElement) {
            this.content.appendChild(content)
            return
        }

        this.content.innerText = content
    },


    glowing: false,
    glow(): void {
        if (!this.container) return
        if (this.glowing) return

        $(this.container).dataset('glow', '')
    },
}


export default tooltip


/** @brief default tooltip hook */
tooltip.addHook({
    on: 'attribute',
    key: 'title',
    handler: ({ target, value }: {
        target: HTMLElement & { tooltipTitle?: string },
        value?: string
    }): string | undefined => {
        if (target.tooltipTitle) return target.tooltipTitle

        target.tooltipTitle = value
        target.removeAttribute('title')
        return value
    }
})
