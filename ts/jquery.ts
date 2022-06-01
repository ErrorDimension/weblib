import modCase from './modcase'


type ELoELO = EventListenerOrEventListenerObject

type E<Type> =
    Type extends Window ? WindowEventMap :
    Type extends Document ? DocumentEventMap :
    Type extends HTMLElement ? HTMLElementEventMap : never
type K<Type> = keyof E<Type>
type Ev<Key> = Key | string
type Fn<Type, Key extends K<Type>> = ((this: Type, ev: E<Type>[Key] | Event) => any) | ELoELO


class JHTMLElement<Type extends Window | Document | HTMLElement | Node> extends Array<Type> {
    css(property: string, value: string | number | null): JHTMLElement<Type>
    css(record: Record<string, string | number | null>): JHTMLElement<Type>
    css(
        property: string | Record<string, string | number | null>,
        val?: string | number | null
    ): JHTMLElement<Type> {
        this.forEach((element: Type): void => {
            if (!(element instanceof HTMLElement)) return

            if (typeof property === 'string' && val !== undefined) {
                val = typeof val === 'number' ? val.toString() : val
                element.style.setProperty(modCase.camel.kebab(property), val)
            }

            if (property instanceof Object)
                for (let key in property) {
                    const prop: string = modCase.camel.kebab(key)
                    let value: string | number | null = property[key]
                    value = typeof value === 'number' ? value.toString() : value
                    element.style.setProperty(prop, value)
                }
        })

        return this
    }


    attr(name: string, value: string): JHTMLElement<Type>
    attr(record: Record<string, string | null>): JHTMLElement<Type>
    attr(
        nameOrProps: string | Record<string, string | null>,
        val?: string | null
    ): JHTMLElement<Type> {
        this.forEach((element: Type): void => {
            if (!(element instanceof HTMLElement)) return

            if (typeof nameOrProps === 'string' && val !== undefined)
                if (val === null) element.removeAttribute(nameOrProps)
                else element.setAttribute(nameOrProps, val)

            if (nameOrProps instanceof Object)
                for (let key in nameOrProps) {
                    const name: string = key
                    const value: string | null = nameOrProps[key]

                    if (value === null) element.removeAttribute(name)
                    else element.setAttribute(name, value)
                }
        })

        return this
    }


    dataset(name: string, value: string | null): JHTMLElement<Type>
    dataset(record: Record<string, string | null>): JHTMLElement<Type>
    dataset(
        nameOrProps: string | Record<string, string | null>,
        val?: string | null
    ): JHTMLElement<Type> {
        this.forEach(function (element: Type): void {
            if (!(element instanceof HTMLElement)) return

            if (typeof nameOrProps === 'string' && val === null)
                delete element.dataset[nameOrProps]

            if (typeof nameOrProps === 'string' && typeof val === 'string')
                element.dataset[nameOrProps] = val

            if (nameOrProps instanceof Object)
                for (let key in nameOrProps) {
                    const value: string | null = nameOrProps[key]

                    if (value === null) delete element.dataset[key]
                    else element.dataset[key] = value
                }
        })

        return this
    }


    each(func: (this: Type, index: number) => any): JHTMLElement<Type> {
        if (typeof func !== 'function') throw new Error('"jquery.each()" : "func" is not a function')

        this.forEach((element: Type, index: number): void => func.call(element, index))
        return this
    }


    remove(): JHTMLElement<Type> {
        this.forEach(function (element: Type): void {
            if (element instanceof HTMLElement) element.remove()
        })

        return this
    }


    append(...nodes: (string | Node)[]): JHTMLElement<Type> {
        this.forEach(function (element: Type): void {
            if (element instanceof HTMLElement)
                element.append(...nodes)
        })

        return this
    }


    /**
     * @param       event               event type 
     * @param       listener            listener function
     * @param       options             options
     */
    on<Key extends K<Type>>(event: Key, listener: (this: Type, ev: E<Type>[Key]) => any, options?: boolean | AddEventListenerOptions): JHTMLElement<Type>
    /**
     * @param       event               event type 
     * @param       listener            listener function
     * @param       options             options
     */
    on(event: string, listener: ELoELO, options?: boolean | AddEventListenerOptions): JHTMLElement<Type>
    on<Key extends K<Type>>(a: Ev<Key>, b: Fn<Type, Key>, c?: boolean | AddEventListenerOptions): JHTMLElement<Type> {
        if (typeof a !== 'string') throw new Error(`'JQuery.on() : 'event' is not valid`)
        if (typeof b !== 'function') throw new Error(`'JQuery.on() : 'listener' is not valid`)

        this.forEach((element: Type): void => element.addEventListener(a, b, c))

        return this
    }


    /**
     * @param       event               event type 
     * @param       listener            listener function
     * @param       options             options
     */
    off<Key extends K<Type>>(event: Key, listener: (this: Type, ev: E<Type>[Key]) => any, options?: boolean | AddEventListenerOptions): JHTMLElement<Type>
    /**
     * @param       event               event type 
     * @param       listener            listener function
     * @param       options             options
     */
    off(event: string, listener: ELoELO, options?: boolean | AddEventListenerOptions): JHTMLElement<Type>
    off<Key extends K<Type>>(a: Ev<Key>, b: Fn<Type, Key>, c?: boolean | AddEventListenerOptions): JHTMLElement<Type> {
        if (typeof a !== 'string') throw new Error(`'JQuery.on() : 'event' is not valid`)
        if (typeof b !== 'function') throw new Error(`'JQuery.on() : 'listener' is not valid`)

        this.forEach((element: Type): void => element.removeEventListener(a, b, c))

        return this
    }


    addClass(...className: string[]): JHTMLElement<Type> {
        this.forEach(function (element: Type): void {
            if (!(element instanceof HTMLElement)) return
            element.classList.add(...className)
        })

        return this
    }


    removeClass(...className: string[]): JHTMLElement<Type> {
        this.forEach(function (element: Type): void {
            if (!(element instanceof HTMLElement)) return
            element.classList.remove(...className)
        })

        return this
    }


    toggleClass(className: string): JHTMLElement<Type> {
        this.forEach(function (element: Type): void {
            if (!(element instanceof HTMLElement)) return
            element.classList.toggle(className)
        })

        return this
    }
}


export function $$<T extends HTMLElement>(query: string): T | null
export function $$<T extends HTMLElement>(query: string, element?: HTMLElement): T | null
export function $$<T extends HTMLElement>(query: string, fromQuery?: string): T | null
export function $$<T extends HTMLElement>(a: string, b?: string | HTMLElement): T | null {
    if (typeof a === 'string' && typeof b === 'string') {
        const container: T | null = document.querySelector<T>(b)

        if (container === null) return null

        return container.querySelector<T>(a)
    }


    if (typeof a === 'string' && b instanceof HTMLElement)
        return b.querySelector<T>(a)


    return document.querySelector<T>(a)
}


export function $(doc: Document): JHTMLElement<Document>
export function $(win: Window): JHTMLElement<Window>
export function $<T extends HTMLElement>(query: string, fromQuery: string): JHTMLElement<T>
export function $<T extends HTMLElement>(query: string, element: HTMLElement): JHTMLElement<T>
export function $<T extends HTMLElement>(query: string): JHTMLElement<T>
export function $<T extends HTMLElement>(elements: NodeList): JHTMLElement<T>
export function $<T extends HTMLElement>(element: T): JHTMLElement<T>
export function $<T extends HTMLElement>(a: Document | Window | string | NodeList | T, b?: HTMLElement | string)
    : JHTMLElement<Node | HTMLElement | Window | Document> {
    if (typeof a === 'string' && typeof b === 'string') {
        const container: Element | null = document.querySelector(b)
        const qsa: NodeListOf<Element> | undefined = container?.querySelectorAll(a)
        const elements: NodeListOf<Element> | any[] = qsa ? qsa : []

        return new JHTMLElement(...elements)
    }


    if (typeof a === 'string' && b instanceof HTMLElement)
        return new JHTMLElement(...b.querySelectorAll<HTMLElement>(a))


    if (typeof a === 'string')
        return new JHTMLElement(...document.querySelectorAll<HTMLElement>(a))


    if (a instanceof NodeList)
        return new JHTMLElement(...a)


    if (a instanceof HTMLElement)
        return new JHTMLElement(a)


    return new JHTMLElement<Window | Document>(a)
}


const jquery = { $$, $ }
export default jquery
