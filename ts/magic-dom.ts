import Console from './console.js'
import { $ } from './jquery.js'
import lib, { debounce } from './lib.js'


interface DOMTreeNode {
    tag?: keyof HTMLElementTagNameMap,
    classList?: string | string[],
    attribute?: Record<string, string | number>,
    children?: Record<string, DOMTreeNode>
}


const magicDOM = {
    /**
     * Create a HTMLElement the easy way
     * @param       tagName             HTMLElement type
     * @param       prop                HTMLElement prop
     * @param       prop.id             HTMLElement id
     * @param       prop.classList      HTMLElement class list
     * @param       prop.attribute      HTMLElement attribute
     * @param       prop.child          HTMLElement child
     */
    createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, {
        id = undefined,
        classList = undefined,
        attribute = undefined,
        children = undefined
    }: {
        id?: string,
        classList?: string | string[],
        attribute?: Record<string, string | number>,
        children?: string | HTMLElement | HTMLElement[]
    } = {}): HTMLElementTagNameMap[K] {
        const container: HTMLElementTagNameMap[K] = document.createElement(tagName)

        /** add id to the container */
        if (id) container.id = id

        /** add class list to the container */
        if (typeof classList === 'string')
            container.classList.add(classList)

        if (classList instanceof Array)
            container.classList.add(...classList)

        /** add attribute to the container */
        if (attribute)
            for (let value in attribute)
                container.setAttribute(value, attribute[value].toString())

        /** append child to the container */
        if (typeof children === 'string')
            container.innerText = children

        if (children instanceof HTMLElement)
            container.appendChild(children)

        if (children instanceof Array)
            container.append(...children)

        return container
    },


    createTree<K extends keyof HTMLElementTagNameMap>(
        tag: K,
        classList?: string | string[],
        attribute?: Record<string, string | number>,
        children?: string | HTMLElement | HTMLElement[] | Record<string, DOMTreeNode>
    ): HTMLElementTagNameMap[K] & {
        [key: string]: HTMLElement
    } {
        let container: HTMLElementTagNameMap[K] & {
            [key: string]: any
        } = magicDOM.createElement(tag, { classList, attribute })

        if (children === undefined) return container

        if (typeof children === 'string') {
            container.innerText = children
            return container
        }

        if (children instanceof HTMLElement) {
            container.appendChild(children)
            return container
        }

        if (children instanceof Array) {
            container.append(...children)
            return container
        }

        for (let key in children) {
            const child: DOMTreeNode = children[key]
            const tag_: keyof HTMLElementTagNameMap = child.tag ? child.tag : 'div'
            const classList_: string | string[] | undefined = child.classList
            const attribute_: Record<string, string | number> | undefined = child.attribute
            const children_: Record<string, DOMTreeNode> | undefined = child.children

            const child_: HTMLElement & {
                [key: string]: HTMLElement
            } = magicDOM.createTree(
                tag_,
                classList_,
                attribute_,
                children_
            )

            container.appendChild(child_)
            Object.assign(container, { [key]: child_ })
        }

        return container
    },


    /**
    * empty node
    * @param { HTMLElement } node node to empty
    */
    emptyNode(node: HTMLElement): void {
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
        comfortablePercentage = undefined
    }: {
        color?: 'pink' | 'blue',
        startValue?: number,
        min?: number,
        max?: number,
        step?: number
        comfortablePercentage?: number
    } = {}) {
        const container: HTMLDivElement & {
            input?: HTMLInputElement,
            leftTrack?: HTMLSpanElement,
            thumb?: HTMLSpanElement,
            rightTrack?: HTMLSpanElement
        } = this.createTree('div', 'slider', { 'data-color': color }, {
            input: { tag: 'input', attribute: { type: 'range', placeholder: 'none', min, max, step } },
            leftTrack: { tag: 'span', classList: 'slider__left-track' },
            thumb: { tag: 'span', classList: 'slider__thumb' },
            rightTrack: { tag: 'span', classList: 'slider__right-track' },
        })
        if (!container.input) return


        const inputHandlers: Function[] = []
        const changeHandlers: Function[] = []

        let sliderTick: number = -1


        /** handler for the slider */
        function handleMouseupEvent(): void {
            sliderTick = 0
            container.classList.remove('dragging')
        }
        /** this function is used to render the slider */
        function editSlider(): void {
            if (!(container.thumb && container.leftTrack && container.rightTrack && container.input))
                throw new Error(`'magicDOM.createSlider()' : found undefined in tree`)


            /** change drag style */
            ++sliderTick
            if (sliderTick > 1) container.classList.add('dragging')


            /** render the position of the thumb */
            let value: number = parseInt(container.input.value)
            let pos: number = (value - min) / (max - min)

            container.thumb.style.left = `calc(20px + (100% - 40px) * ${pos})`
            container.leftTrack.style.width = `calc(10px + (100% - 40px) * ${pos})`
            container.rightTrack.style.width = `calc(100% - (30px + (100% - 40px) * ${pos}))`


            /** dataset */
            if (!comfortablePercentage) return
            container.dataset.isHigh = (value / max) >= comfortablePercentage ? 'yes' : 'no'
        }
        function handleInputEvent(this: HTMLInputElement, event: Event): void {
            inputHandlers.forEach((handler: Function): any => handler(this.value, event))
            editSlider()
        }
        function handleChangeEvent(this: HTMLInputElement, event: Event): void {
            changeHandlers.forEach((handler: Function): any => handler(this.value, event))
        }

        $(container.input)
            .on('mouseup', handleMouseupEvent)
            .on('input', handleInputEvent)
            .on('change', handleChangeEvent)


        /** initial first state */
        container.input.value = startValue.toString()
        container.input.dispatchEvent(new Event("input"))


        return {
            container,
            input: container.input,
            toUseTooltip: false,

            tooltip(contentCallback: (val: string) => string = (val) => val) {
                if (this.toUseTooltip) return

                if (typeof contentCallback !== "function")
                    throw new Error("createSlider().tooltip() : `contentCallback` is not valid")

                import('./tooltip').then(module => {
                    const tooltip = module.default

                    const inputHandler: () => void = (): void => {
                        if (sliderTick < 1) return
                        tooltip.show(contentCallback(this.input.value))
                    }

                    $(this.input).on('input', inputHandler)
                    $(this.container)
                        .on('mousemove', tooltip.move)
                        .on('mouseleave', tooltip.hide)
                })

                return this
            },


            get value(): number { return parseInt(this.input.value) },
            set value(newValue: number) {
                this.input.value = newValue.toString()
                this.input.dispatchEvent(new Event('input'))
            },


            /** @param { Function } func (value, event) */
            onInput(func: Function) {
                if (typeof func !== 'function')
                    throw new Error("createSlider().onInput() : `func` not a valid function")

                inputHandlers.push(func)

                return this
            },


            /** @param { Function } func (value, event) */
            onChange(func: Function) {
                if (typeof func !== 'function')
                    throw new Error("createSlider().onChange() : `func` not a valid function")

                changeHandlers.push(func)

                return this
            }
        }
    },


    toHTMLElement(html: string): ChildNode | null {
        const template: HTMLTemplateElement = document.createElement("template")
        template.innerHTML = html.trim()

        const fin: ChildNode | null = template.content.firstChild
        template.remove()

        return fin
    },


    scrollable(container: HTMLElement & {
        scrollBox: HTMLDivElement
    }, maxPath: number = 100) {
        if (container.dataset.scrollable) return

        let box: HTMLDivElement = magicDOM.createElement('div', { classList: 'sbox' })
        while (container.firstChild) box.append(container.firstChild)

        $(container).css('overflow', 'overlay')
        container.scrollBox = box


        let translate: number = 0

        const MINIMIZED: 0.075 = 0.075

        const moveBack: Function = debounce(() => {
            translate = 0
            $(box).css('transform', 'translateY(0)')
        }, 100)

        const onWheelHandler: (event: WheelEvent) => void = (event: WheelEvent): void => {
            let { deltaY } = event
            translate = lib.clamp(-maxPath, translate - deltaY * MINIMIZED, maxPath)

            $(box).css('transform', `translateY(${translate}px)`)

            moveBack()
        }

        $(container)
            .dataset('scrollable', 'true')
            .on('wheel', onWheelHandler)


        return {
            container,
            scrollBox: box,

            append(...args: string[] | HTMLElement[]) {
                this.scrollBox.append(...args)
                return this
            }
        }
    }
}


export default magicDOM
