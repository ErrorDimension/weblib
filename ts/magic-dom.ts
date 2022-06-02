import { $, $$ } from './jquery'
import ScrollBox from './scrollbox'
import { debounce } from './lib'


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
        id?: string
        classList?: string | string[]
        attribute?: Record<string, string | number>
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
        classList: string | string[] = [],
        attribute: Record<string, string | number> = {},
        children: string | HTMLElement | HTMLElement[] | Record<string, DOMTreeNode | HTMLElement> = []
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


export default magicDOM


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
        color?: 'pink' | 'blue',
        startValue?: number,
        min?: number,
        max?: number,
        step?: number
        comfortablePct?: number
    } = {}) {
        /** initialize the components */
        this.component = magicDOM.createTree('div', 'slider', {
            'data-color': color
        }, {
            input: { tag: 'input', attribute: { type: 'range', placeholder: 'none', min, max, step } },
            left: { classList: 'slider__track--left' },
            thumb: { classList: 'slider__thumb' },
            right: { classList: 'slider__track--right' },
        })

        this.input = this.component.input as HTMLInputElement
        this.left = this.component.left as HTMLDivElement
        this.thumb = this.component.thumb as HTMLDivElement
        this.right = this.component.right as HTMLDivElement

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


    /** component */
    component: HTMLDivElement & {
        input?: HTMLInputElement,
        left?: HTMLDivElement
        thumb?: HTMLDivElement
        right?: HTMLDivElement
    }

    input: HTMLInputElement


    /** component assets */
    private left: HTMLDivElement
    private thumb: HTMLDivElement
    private right: HTMLDivElement


    /** handler collection */
    private inputHandlers: ((value: string, event: Event) => void)[] = []
    private changeHandlers: ((value: string, event: Event) => void)[] = []


    /** public functions */
    onInput(func: (value: string, event: Event) => void): void {
        this.inputHandlers.push(func)
    }


    onChange(func: (value: string, event: Event) => void): void {
        this.changeHandlers.push(func)
    }


    private removeDragState(): void {
        this.slideTick = 0
        this.component.classList.remove('slider--dragging')
    }


    private handleInputEvent(event: Event): void {
        this.inputHandlers.forEach((handler: (value: string, event: Event) => void): void => {
            handler(this.input.value, event)
        })


        this.render()
    }


    private handleChangeEvent(event: Event): void {
        this.changeHandlers.forEach((handler: (value: string, event: Event) => void): void => {
            handler(this.input.value, event)
        })
    }


    /** properties */
    private min: number
    private max: number
    private comfortablePct: number


    /** render utilities */
    private slideTick: number = -1

    private render(): void {
        /** dragging state */
        ++this.slideTick
        if (this.slideTick > 1)
            this.component.classList.add('slider--dragging')


        /** fetch value of the input */
        let value: number = parseInt(this.input.value)


        /** render */
        let position: number = (value - this.min) / (this.max - this.min)

        this.thumb.style.left = `calc(20px + (100% - 40px) * ${position})`
        this.left.style.width = `calc(10px + (100% - 40px) * ${position})`
        this.right.style.width = `calc(100% - (30px + (100% - 40px) * ${position}))`


        /** handle uncomfortable values */
        if (this.comfortablePct) $(this.component)
            .dataset({ 'uncomfortable': (value / this.max) >= this.comfortablePct ? '' : null })
    }


    /** tooltip events */
    private __usingTooltip: boolean = false
    get usingTooltip(): boolean { return this.__usingTooltip }

    tooltip({ handler = (value: string): string => value }: { handler?: (value: string) => string } = {}): this {
        if (typeof handler !== "function")
            throw new Error("Slider().tooltip() : `handler` is not valid function")


        /** self */
        const self: this = this


        import('./tooltip').then(module => {
            const tooltip = module.default


            /** specifier for the tooltip */
            let isHidden: boolean = true

            function pointerDown(): void {
                if (!isHidden) return
                isHidden = false

                tooltip.show(handler(self.input.value))
            }

            function pointerMove(): void {
                if (isHidden) return

                tooltip.move()
            }

            function pointerLeave(): void {
                isHidden = true

                tooltip.hide()
            }

            $(this.component)
                .on('pointerdown', pointerDown)
                .on('pointermove', pointerMove)
                .on('pointerleave', pointerLeave)


            /** element's events */
            function input(): void {
                if (isHidden) return

                tooltip.update(handler(self.input.value))
            }

            $(this.input).on('input', input)
        })

        this.__usingTooltip = true

        return this
    }
}


interface SelectOption {
    display: string
    value: string
}

export class Select {
    constructor({
        color = 'pink',
        options = [],
        icon = 'list',
        searchTime = 500
    }: {
        color?: 'blue' | 'pink'
        options?: Array<{ display: string; value?: string }>
        icon?: string
        searchTime?: number
    } = {}) {
        /** fetch props */
        this.options = options.length == 0
            ? [{ display: 'not initialized', value: 'undefined' }]
            : options.reduce((
                acc: { display: string; value: string }[],
                val: { display: string; value?: string }
            ): { display: string; value: string }[] => {
                let option: { display: string; value: string } = {
                    display: val.display,
                    value: val.value ? val.value : val.display
                }

                acc.push(option)

                return acc
            }, [])

        this.searchTime = searchTime


        /** init options box */
        this.currentHolder = magicDOM.createElement('div', {
            classList: 'select__text',
        })

        this.selectBox = magicDOM.createElement('div', {
            classList: 'select__box',
            children: this.createOptions()
        })


        /** select box is a scroll box */
        new ScrollBox(this.selectBox).init()


        /** init component */
        this.component = magicDOM.createTree('div', 'select', {
            'data-color': color,
            'tabindex': 0
        }, {
            icon: { tag: 'i', classList: ['fa-solid', `fa-${icon}`] },
            text: this.currentHolder,
            arrow: { tag: 'i', classList: ['fa-solid', `fa-angle-left`, 'select__arrow'] }
        })


        /** attaching events */
        this.attachEvents()


        /** appending */
        this.component.append(this.selectBox)


        /** initial selection */
        this.select(this.options[0])
        this.currentOption = this.options[0]
    }


    /** component */
    component: HTMLElement

    private selectBox: HTMLElement

    private currentHolder: HTMLElement


    /** props */
    private activated: boolean = true

    private options: Array<{ display: string; value: string }>
    private currentOption: { display: string; value: string }

    private changeHandlers: ((value: string) => any)[] = []
    private inputHandlers: ((value: string) => any)[] = []

    private searchTime: number


    /** getters */
    get value(): string {
        return this.currentOption.value
    }


    /** events */
    private attachEvents(): void {
        /** activate options box */
        const expander: HTMLElement = magicDOM.createElement('div', {
            classList: 'expander'
        })

        $(expander).on('click', (): void => this.toggle())

        this.component.append(expander)


        /** event props */
        let searchQuery: string = ''

        const clearSearchQuery: () => void = debounce((): string => searchQuery = '', this.searchTime)


        /** key events */
        $(this.component)
            .on('keydown', (event: KeyboardEvent): void => {
                switch (event.key.toLowerCase()) {
                    case 'arrowdown': {
                        const index: number = (this.options.indexOf(this.currentOption) + 1) % this.options.length

                        const nextOption: {
                            display: string
                            value: string
                        } = this.options[index]

                        this.select(nextOption, false)

                        break
                    }


                    case 'arrowup': {
                        const index: number = this.options.indexOf(this.currentOption) - 1 == -1
                            ? this.options.length - 1
                            : this.options.indexOf(this.currentOption) - 1

                        const prevOption: {
                            display: string
                            value: string
                        } = this.options[index]

                        this.select(prevOption, false)

                        break
                    }


                    case ' ':
                    case 'enter': {
                        this.toggle()
                        break
                    }


                    default: {
                        if (event.key.length === 1) searchQuery += event.key.toLowerCase()
                        clearSearchQuery()

                        const option: SelectOption | undefined = this.options.find((opt: {
                            display: string
                            value: string
                        }): SelectOption | undefined => {
                            if (opt.display.toLowerCase().startsWith(searchQuery)) return opt
                            return undefined
                        })

                        if (option) this.select(option, false)

                        break
                    }
                }
            })
    }


    private handleChangeEvent(): void {
        this.changeHandlers.forEach((handler: (value: string) => any): void => handler(this.value))
    }


    private handleInputEvent(): void {
        if (this.activated) return
        this.inputHandlers.forEach((handler: (value: string) => any): void => handler(this.value))
    }


    /** funcs */
    private createOptions(): Array<HTMLElement> {
        const options: Array<HTMLElement> = []


        this.options.forEach((option: { display: string; value: string }): void => {
            if (!option.value) option.value = option.display


            let optEl: HTMLElement = magicDOM.createElement('div', {
                classList: 'select__option',
                children: option.display,
                attribute: { 'data-value': option.value }
            })


            /** events */
            optEl.onclick = (): void => {
                this.currentOption = option
                this.select(option)
            }


            options.push(optEl)
        })


        return options
    }


    private select(option: { display: string; value: string }, toToggle: boolean = true): void {
        toToggle && this.toggle()

        $('[data-current]', this.selectBox).dataset('current', null)

        this.currentHolder.textContent = option.display

        this.currentOption = option

        const currentElement: HTMLElement = $$(
            `[data-value='${option.value}']`,
            this.selectBox
        )!

        currentElement.dataset.current = ''

        if (this.activated) currentElement.scrollIntoView({
            block: 'nearest'
        })

        this.handleChangeEvent()
    }


    /** public funcs */
    toggle(): void {
        /** activation */
        this.activated = !this.activated
        $(this.component).dataset('activated', this.activated ? '' : null)


        if (this.activated === false) this.handleInputEvent()
    }


    onChange(func: (value: string) => any): this {
        this.changeHandlers.push(func)

        return this
    }


    onInput(func: (value: string) => any): this {
        this.inputHandlers.push(func)

        return this
    }
}
