import Console from './console.js'
import { $ } from './jquery.js'
import lib, { debounce } from './lib.js'


type QuerySelector = null | Element | HTMLElement

type DOMTreeNode = {
    tag?: string,
    classList?: string | string[],
    id?: string,
    attribute?: Record<string, string | number>,
    child?: HTMLElement | string | { [key: string | number]: DOMTreeNode }
}


const magicDOM = {
    /**
     * Create a HTMLElement the easy way
     * @param       type                HTMLElement type
     * @param       prop                HTMLElement prop
     * @param       prop.id             HTMLElement id
     * @param       prop.classList      HTMLElement class list
     * @param       prop.attribute      HTMLElement attribute
     * @param       prop.child          HTMLElement child
     */
    createElement(type: string = 'div', {
        id = undefined,
        classList = [],
        attribute = {},
        child = undefined,
    }: {
        id?: string,
        classList?: string | string[],
        attribute?: Record<string, string | number>
        child?: string | HTMLElement | Array<HTMLElement>
    } = {}) {
        const element = document.createElement(type)


        if (typeof id === 'string') element.id = id


        if (typeof classList === 'string') element.classList.add(classList)
        else if (classList.length) element.classList.add(...classList)


        for (let key in attribute)
            element.setAttribute(key, attribute[key].toString())


        if (child === undefined || child === null) return element

        if (child instanceof HTMLElement) {
            element.append(child)
            return element
        }

        if (typeof child === 'string') {
            element.innerText = child
            return element
        }

        if (child.length)
            element.append(...child)


        return element
    },


    createTree({
        tag = 'div',
        classList = [],
        id = undefined,
        attribute = {},
        child = undefined
    }: DOMTreeNode = {}) {
        const container = magicDOM.createElement(tag, { id, classList, attribute })


        if (child === undefined) return container

        if (typeof child === 'string') {
            container.innerText = child
            return container
        }

        if (child instanceof HTMLElement) {
            container.appendChild(child)
            return container
        }

        for (let key in child) {
            if (!(child[key] instanceof Object))
                throw new Error(`'magicDOM.createTree()' : '{ child }' is not valid : \n`)

            let child_ = magicDOM.createTree(child[key])
            Object.assign(container, { [key]: child_ })
            container.appendChild(child_)
        }


        return container
    },


    /**
    * @brief empty the %HTMLElement node
    * @param { HTMLElement } node node to empty
    */
    emptyNode(node: HTMLElement) {
        while (node.firstChild)
            node.firstChild.remove()
    },


    /**
     * 
     * @param           option
     * @param           option.color
     * @param           option.startValue
     * @param           option.min
     * @param           option.max
     * @param           option.step
     * @param           option.highValue        Between 0 and 1
     */
    createSlider({
        color = 'pink',
        startValue = 0,
        min = 0,
        max = 11,
        step = 1,
        highValue = undefined
    }: {
        color?: 'pink' | 'blue',
        startValue?: number,
        min?: number,
        max?: number,
        step?: number
        highValue?: number
    } = {}) {
        let container = this.createTree({
            classList: 'slider', attribute: { 'data-color': color }, child: {
                input: {
                    tag: 'input', attribute: {
                        type: 'range',
                        min,
                        max,
                        step,
                        placeholder: 'none'
                    }
                },
                leftTrack: { tag: 'span', classList: 'slider__left-track' },
                thumb: { tag: 'span', classList: 'slider__thumb' },
                rightTrack: { tag: 'span', classList: 'slider__right-track' },
            }
        })
        let input = container.querySelector('input') as HTMLInputElement
        let leftTrack = container.querySelector('.slider__left-track') as HTMLSpanElement
        let rightTrack = container.querySelector('.slider__right-track') as HTMLSpanElement
        let thumb = container.querySelector('.slider__thumb') as HTMLSpanElement


        let downTick = 0
        const inputHandlers: Function[] = []
        const changeHandlers: Function[] = []

        function edit() {
            ++downTick
            if (downTick > 1)
                container.classList.add('dragging')

            let value = parseInt(input.value)
            let pos: number = (value - min) / (max - min)
            container.dataset.inputTooltip = input.value

            thumb.style.left = `calc(20px + (100% - 40px) * ${pos})`
            leftTrack.style.width = `calc(10px + (100% - 40px) * ${pos})`
            rightTrack.style.width = `calc(100% - (30px + (100% - 40px) * ${pos}))`

            if (!highValue) return

            let isHigh = (value / max) >= highValue
            container.dataset.isHigh = isHigh ? 'yes' : 'no'
        }

        function stop_dragState() {
            downTick = 0
            container.classList.remove('dragging')
        }


        $(input)
            .on('mouseup', stop_dragState)
            .on('input', (event) => {
                let target = event.target as HTMLInputElement
                inputHandlers.forEach(handler => handler(target.value, event))
                edit()
            })
            .on('change', (event) => {
                let target = event.target as HTMLInputElement
                changeHandlers.forEach(handler => handler(target.value, event))
            })


        input.value = startValue.toString()
        input.dispatchEvent(new Event("input"))
        --downTick

        return {
            container,
            input,
            usedTooltip: false,

            useTooltip(func = (data: string | undefined) => data) {
                if (this.usedTooltip)
                    return

                const log = new Console('slider', {
                    background: 'pink', opacity: 0.9
                })
                Console.info(log, 'zatooltip will be ready to be displayed')

                import('./tooltip').then(obj => {
                    this.usedTooltip = true

                    obj.default.addHook({
                        on: 'dataset',
                        key: 'inputTooltip',
                        handler: ({ value }) => {
                            if (downTick >= 1) return func(value)
                        },
                    })
                })

                return this
            },

            set value(newValue) {
                this.input.value = newValue
                this.input.dispatchEvent(new Event('input'))
            },

            get value() { return this.input.value },

            /** @param { Function } func (value, event) */
            onInput(func: Function) {
                if (!func || typeof func !== 'function')
                    throw new Error("createSlider().on_input() : `func` not a valid function")

                inputHandlers.push(func)

                return this
            },

            /** @param { Function } func (value, event) */
            onChange(func: Function) {
                if (!func || typeof func !== 'function')
                    throw new Error("createSlider().on_change() : `func` not a valid function")

                changeHandlers.push(func)

                return this
            }
        }
    },


    createHam(id = undefined) {
        let container = this.createElement('div', {
            classList: ['hamburger'],
            child: this.createElement('div', {
                classList: 'hamburger__content', child: [
                    this.createElement('div', { classList: 'hamburger__content__first-line' }),
                    this.createElement('div', { classList: 'hamburger__content__second-line' }),
                    this.createElement('div', { classList: 'hamburger__content__third-line' }),
                ]
            }),
            id
        })

        let isActivated = false

        const toggleHandlers: Function[] = []
        const activateHandlers: Function[] = []
        const deactivateHandlers: Function[] = []


        const t = (event?: Event) => {
            $(container).toggleClass("hamburger--activated")
            toggleHandlers.forEach(handler => handler(event))
            let currentHandlers = isActivated ? deactivateHandlers : activateHandlers
            currentHandlers.forEach(handler => handler(event))
            isActivated = !isActivated
        }

        const d = (event?: Event) => {
            $(container).removeClass("hamburger--activated")
            deactivateHandlers.forEach(handler => handler(event))
        }

        const a = (event?: Event) => {
            $(container).addClass("hamburger--activated")
            activateHandlers.forEach(handler => handler(event))
        }

        $(container).on('click', t)


        return {
            container,


            /** @param { Function } func (event) */
            onToggle(func: Function) {
                if (!func || typeof func !== 'function')
                    throw new Error("createHam().onToggle() : `func` not a valid function")

                toggleHandlers.push(func)
                return this
            },


            /** @param { Function } func (event) */
            onActivate(func: Function) {
                if (!func || typeof func !== 'function')
                    throw new Error("createHam().onActivate() : `func` not a valid function")

                activateHandlers.push(func)
                return this
            },


            /** @param { Function } func (event) */
            onDeactivate(func: Function) {
                if (!func || typeof func !== 'function')
                    throw new Error("createHam().onDeactivate() : `func` not a valid function")

                deactivateHandlers.push(func)
                return this
            },


            activate() {
                isActivated = true
                a()

                return this
            },


            deactivate() {
                isActivated = false
                d()

                return this
            },


            toggle() {
                isActivated = !isActivated
                t()

                return this
            }
        }
    },


    toHTMLElement(html: string) {
        const template = document.createElement("template")
        template.innerHTML = html.trim()

        const fin = template.content.firstChild
        template.remove()

        return fin
    },


    bind(container: HTMLElement, obj: Record<number | string, HTMLElement>) {
        for (let key in obj) {
            container.appendChild(obj[key])
            Object.assign(container, { [key]: obj[key] })
        }
    },


    scrollable(container: HTMLElement, maxPath = 100) {
        if (container.dataset.scrollable) return

        let sbox = magicDOM.createElement('div', { classList: 'sbox' })
        while (container.firstChild) sbox.append(container.firstChild)

        $(container).css('overflow', 'overlay')
        magicDOM.bind(container, { scrollBox: sbox })


        let translate = 0

        const moveBack = debounce(() => {
            translate = 0
            $(sbox).css('transform', 'translateY(0)')
        }, 100)

        const MINIMIZED = 0.075
        $(container)
            .setdata('scrollable', 'true')
            .on('wheel', (event: any) => {
                let { deltaY } = event
                translate = lib.clamp(-maxPath, translate - deltaY * MINIMIZED, maxPath)

                $(sbox).css('transform', `translateY(${translate}px)`)

                moveBack()
            })


        return {
            container,
            scrollBox: sbox,

            append(...args: string[] | HTMLElement[]) {
                this.scrollBox.append(...args)
                return this
            }
        }
    }
}


export default magicDOM