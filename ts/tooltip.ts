import Console from './console'
import cursor from './cursor'
import { $ } from './jquery'
import lib, { throttle } from './lib'
import magicDOM from './magic-dom'
import modCase from './modcase'


const windowIsDefined = typeof window !== 'undefined'


windowIsDefined && customElements.define(
    'tooltip-container',
    class HTMLTooltipContainer extends HTMLDivElement {
        constructor() {
            super()
        }
    },
    { extends: 'div' }
)


windowIsDefined && customElements.define(
    'tooltip-content',
    class HTMLTooltipContent extends HTMLDivElement {
        constructor() {
            super()
        }
    },
    { extends: 'div' }
)


interface Hook {
    on: 'dataset' | 'attribute',
    key: string,
    handler?: ({
        target,
        value,
        update
    }: {
        target: HTMLElement,
        value?: string,
        update: (data: string | HTMLElement) => void
    }) => HTMLElement | string | undefined,
    destroy?: () => void,
    priority?: number,
    noPadding?: boolean
}

const tooltip = {
    tooltipLog: new Console('zatooltip', { background: 'rgba(92, 92, 92, 0.4)' }),

    initialized: false,

    hideTimeout: -1,

    container: windowIsDefined ? document.createElement('tooltip-container') : null,
    content: windowIsDefined ? document.createElement('tooltip-content') : null,

    hooks: [] as Hook[],

    processor: {
        dataset: {
            process: (target: HTMLElement, key: string): string | undefined => target.dataset[key],

            attach: (hook: Hook): void => {
                if (!windowIsDefined) return

                let kebabCase: string = modCase.camel.kebab(hook.key)
                let targets: NodeListOf<HTMLElement> = document.querySelectorAll(`[data-${kebabCase}]`)

                targets.forEach((target: HTMLElement): void => tooltip.attachEvent(target, hook))
            }
        },

        attribute: {
            process: (target: HTMLElement, key: string): string | undefined => {
                const data: string | null = target.getAttribute(key)
                return data === null ? undefined : data
            },

            attach: (hook: Hook): void => {
                if (!windowIsDefined) return

                let targets: NodeListOf<HTMLElement> = document.querySelectorAll(`[${hook.key}]`)

                targets.forEach((target: HTMLElement): void => tooltip.attachEvent(target, hook))
            }
        }
    },


    init(): void {
        if (this.container === null || this.content === null) return
        if (lib.isOnMobile() || this.initialized) return

        const { container, content } = this
        container.appendChild(content)

        const { body } = document
        body.insertBefore(container, body.firstChild)

        new ResizeObserver(this.move).observe(this.content)

        const observerOptions = { childList: true, subtree: true }
        new MutationObserver(this.scan).observe(body, observerOptions)

        cursor.watch(true)

        this.initialized = true
        Console.okay(this.tooltipLog, 'Successfully initialized')
    },


    scan(_: any): void { this.hooks?.forEach((hook: Hook): void => this.processor[hook.on].attach(hook)) },


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
        handler = ({ target, value, update }) => value,
        destroy = () => { /* logic here */ },
        priority = 1,
        noPadding = false
    }: Hook): void {
        if (!['attribute', 'dataset'].includes(on))
            throw new Error(`tooltip.addHook() : '${on}' is not a valid option`)


        let hook: Hook = { on, key, handler, destroy, priority, noPadding }
        this.hooks.push(hook)
        this.hooks.sort(function (a: Hook, b: Hook): 1 | -1 | 0 {
            if (!(a.priority && b.priority))
                throw new Error("'tooltip.addHook()' : 'priority' is not valid")

            if (a.priority < b.priority)
                return 1
            if (a.priority > b.priority)
                return -1
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


            let { key } = fncHook
            if (fncHook.on === 'dataset')
                key = `data-${modCase.camel.kebab(key)}`


            const mouseenterCallback: () => void = (): void => this.mouseenter(fncHook, target)
            const observer: MutationObserver = new MutationObserver(mouseenterCallback)

            const mouseenter: () => void = (): void => {
                this.mouseenter(fncHook, target)
                observer.observe(target, { attributeFilter: [key] })
            }
            const mouseleave: () => void = (): void => {
                this.mouseleave(fncHook)
                observer.disconnect()
            }

            $(target).on('mouseenter', mouseenter)
            $(target).on('mouseleave', mouseleave)


            target.tooltipChecked = true
            break
        }

        target.tooltipListened = target.tooltipChecked
    },


    mouseenter(hook: Hook, target: HTMLElement): void {
        if (this.container === null) return

        let value: string | undefined = this.getValue(target, hook)
        let content: string | HTMLElement | undefined = (typeof hook.handler === 'undefined')
            ? undefined
            : hook.handler({
                target,
                value,
                update: (data: string | HTMLElement): void => this.update(data)
            })

        if (hook.noPadding)
            $(this.container).css({
                '--padding': '0px',
                'transition': 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1), padding 0s linear'
            })

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
                'transition': null
            })
    },


    show(content: HTMLElement | string): void {
        if (!this.container) return

        this.container.dataset.activated = ''
        this.update(content)

        window.clearTimeout(this.hideTimeout)

        this.move()
        window.addEventListener('mousemove', this.move)
    },


    move: throttle(function (_: any): void {
        const { container } = tooltip

        if (!container) return

        let { innerWidth, innerHeight } = window
        let { clientWidth, clientHeight } = container
        let { positionX, positionY } = cursor

        const OFFSET: number = 135
        const LARGE_X_AXIS: number = 3 / 4
        const LARGE_Y_AXIS: number = 77 / 100

        let isMoreOuterX: boolean = innerWidth * LARGE_X_AXIS < positionX
        let isLargerThanScreenX: boolean = innerWidth - clientWidth - OFFSET < positionX
        let isMoreOuterY: boolean = innerHeight * LARGE_Y_AXIS < positionY
        let isLargerThanScreenY: boolean = innerWidth - clientHeight - OFFSET < positionY

        let xPos: number = (isMoreOuterX || isLargerThanScreenX)
            ? positionX - clientWidth - 13
            : positionX + 13

        let yPos: number = (isMoreOuterY || isLargerThanScreenY)
            ? positionY - clientHeight - 25
            : positionY + 25

        lib.cssFrame((): void => {
            $(container).css('transform', `translate(${xPos}px, ${yPos}px)`)
        })
    }, 55),


    hide(): void {
        const hide: () => void = (): void => {
            if (!tooltip.container) return

            delete tooltip.container.dataset.activated
            window.removeEventListener('mousemove', tooltip.move)
        }

        tooltip.hideTimeout = window.setTimeout(hide, 200)
    },


    update(content: HTMLElement | string): void {
        if (!(content && this.content)) return

        this.glow()

        if (content instanceof HTMLElement) {
            magicDOM.emptyNode(this.content)
            this.content.append(content)

            return
        }

        this.content.innerText = content
    },


    glow: throttle((): void => {
        const { container } = tooltip
        if (!container) return

        $(container).css('animation', 'none')
        lib.cssFrame(() => $(container).css('animation', null))
    }, 350),
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
