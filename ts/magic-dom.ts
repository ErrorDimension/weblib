import { $ } from './jquery'


interface DOMTreeNode {
    tag?: keyof HTMLElementTagNameMap,
    classList?: string | string[],
    attribute?: Record<string, string | number>,
    children?: Record<string, DOMTreeNode> | string | HTMLElement | HTMLElement[]
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
        id, classList, attribute, children
    }: {
        id?: string,
        classList?: string | string[],
        attribute?: Record<string, string | number>,
        children?: string | HTMLElement | HTMLElement[]
    } = {
            id: undefined,
            classList: undefined,
            attribute: undefined,
            children: undefined
        }): HTMLElementTagNameMap[K] {
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
                container.setAttribute(value, attribute[value]?.toString())

        /** append child to the container */
        if (typeof children === 'string')
            container.textContent = children

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
        children?: string | HTMLElement | HTMLElement[] | Record<string, DOMTreeNode | HTMLElement>
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
            const child: DOMTreeNode | HTMLElement = children[key]

            if (child instanceof HTMLElement) {
                container.append(child)
                Object.assign(container, { [key]: child })
                continue
            }

            const tag_: keyof HTMLElementTagNameMap = child.tag ? child.tag : 'div'
            const classList_: string | string[] | undefined = child.classList
            const attribute_: Record<string, string | number> | undefined = child.attribute
            const children_ = child.children

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


    /** this function only return the first child */
    toHTMLElement<T extends HTMLElement>(htmlString: string): T {
        const template: HTMLTemplateElement = document.createElement("template")
        template.innerHTML = htmlString.trim()

        const fin: ChildNode | null = template.content.firstChild
        if (fin === null)
            throw new Error(`'magicDOM.toHTMLElement()' : can't`)
        template.remove()

        return fin as T
    },
}


export class Slider {
    /**
    * @param           option                               option for the slider
    * @param           option.color                         slider color ('pink' | 'blue')
    * @param           option.startValue                    slider's start value
    * @param           option.min                           slider's minimum value
    * @param           option.max                           slider's maximum value
    * @param           option.step                          slider's step
    * @param           option.comfortablePercentage         percentage
    */
    constructor({
        color = 'pink',
        startValue = 0,
        min = 0,
        max = 10,
        step = 1,
        comfortablePct = 0
    }: {
        color: 'pink' | 'blue',
        startValue: number,
        min: number,
        max: number,
        step: number
        comfortablePct: number
    } = {
            color: 'pink',
            startValue: 0,
            min: 0,
            max: 10,
            step: 1,
            comfortablePct: 0
        }) {
        /** initialize the components */
        this.container = magicDOM.createTree('div', 'slider', {
            'data-color': color
        }, {
            input: { tag: 'input', attribute: { type: 'range', placeholder: 'none', min, max, step } },
            left: { classList: 'slider__track--left' },
            thumb: { classList: 'slider__thumb' },
            right: { classList: 'slider__track--right' },
        })

        this.input = this.container.input as HTMLInputElement
        this.left = this.container.left as HTMLDivElement
        this.thumb = this.container.thumb as HTMLDivElement
        this.right = this.container.right as HTMLDivElement

        this.min = min
        this.max = max
        this.comfortablePct = comfortablePct


        /** attach event handlers */
        const self: this = this

        const removeDragState: () => void = (): void =>
            self.removeDragState()
        const handleInputEvent: (event: Event) => void = (event: Event): void =>
            self.handleInputEvent(event)
        const handleChangeEvent: (event: Event) => void = (event: Event): void =>
            self.handleChangeEvent(event)

        $(this.input)
            .on('mouseup', removeDragState)
            .on('touchend', removeDragState)
            .on('input', handleInputEvent)
            .on('change', handleChangeEvent)


        /** initialize the initial value */
        this.input.value = startValue?.toString()
        this.input.dispatchEvent(new Event("input"))
    }


    container: HTMLDivElement & {
        input?: HTMLInputElement,
        left?: HTMLDivElement
        thumb?: HTMLDivElement
        right?: HTMLDivElement
    }

    input: HTMLInputElement

    private left: HTMLDivElement
    private thumb: HTMLDivElement
    private right: HTMLDivElement


    private inputHandlers: ((value: string, event: Event) => void)[] = []
    private changeHandlers: ((value: string, event: Event) => void)[] = []


    onInput(func: (value: string, event: Event) => void): void {
        this.inputHandlers.push(func)
    }


    onChange(func: (value: string, event: Event) => void): void {
        this.changeHandlers.push(func)
    }


    private removeDragState(): void {
        this.slideTick = 0
        this.container.classList.remove('slider--dragging')
    }

    private handleInputEvent(event: Event): void {
        this.inputHandlers.forEach((handler: (value: string, event: Event) => void): void => {
            handler(this.input.value, event)
        })
        this.reRender()
    }

    private handleChangeEvent(event: Event): void {
        this.changeHandlers.forEach((handler: (value: string, event: Event) => void): void => {
            handler(this.input.value, event)
        })
    }


    private min: number
    private max: number
    private comfortablePct: number

    private slideTick: number = -1

    private reRender(): void {
        ++this.slideTick
        if (this.slideTick > 1) this.container.classList.add('slider--dragging')

        let value: number = parseInt(this.input.value)
        let position: number = (value - this.min) / (this.max - this.min)

        this.thumb.style.left = `calc(20px + (100% - 40px) * ${position})`
        this.left.style.width = `calc(10px + (100% - 40px) * ${position})`
        this.right.style.width = `calc(100% - (30px + (100% - 40px) * ${position}))`

        if (this.comfortablePct)
            $(this.container)
                .dataset(
                    'uncomfortable',
                    (value / this.max) >= this.comfortablePct ? '' : null
                )
    }


    private __usingTooltip: boolean = false
    get usingTooltip(): boolean { return this.__usingTooltip }

    tooltip(decorationCallback: (value: string) => string = (value: string): string => value): this {
        if (typeof decorationCallback !== "function")
            throw new Error("magicDOM().Slider().tooltip() : `decorationCallback` is not valid")

        let isHidden: boolean = true

        import('./tooltip').then(module => {
            const tooltip = module.default

            const handleMousedownEvent: () => void = (): void => {
                if (!isHidden) return

                tooltip.show(decorationCallback(this.input.value))
                isHidden = false
            }

            const handleMousemoveEvent: () => void = (): void => {
                if (isHidden) return
                tooltip.move()
            }

            const handleMouseleaveEvent: () => void = (): void => {
                isHidden = true
                tooltip.hide()
            }

            $(this.container)
                .on('mousedown', handleMousedownEvent)
                .on('mousemove', handleMousemoveEvent)
                .on('mouseleave', handleMouseleaveEvent)

            const handleInputEvent: () => void = (): void => {
                if (isHidden) return
                tooltip.update(decorationCallback(this.input.value))
            }

            $(this.input).on('input', handleInputEvent)
        })

        this.__usingTooltip = true

        return this
    }
}

export default magicDOM
