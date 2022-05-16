import modCase from './modcase.js'


type ELoELO = EventListenerOrEventListenerObject
type EOp = boolean | AddEventListenerOptions

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


    /**
     * @param       event               event type 
     * @param       listener            listener function
     * @param       option              options
     */
    on<Key extends K<Type>>(event: Key, listener: (this: Type, ev: E<Type>[Key]) => any, option?: EOp): JHTMLElement<Type>
    /**
     * @param       event               event type 
     * @param       listener            listener function
     * @param       option              options
     */
    on(event: string, listener: ELoELO, option?: EOp): JHTMLElement<Type>
    on<Key extends K<Type>>(event: Ev<Key>, listener: Fn<Type, Key>, option?: EOp): JHTMLElement<Type> {
        if (typeof event !== 'string') throw new Error(`'JQuery.on() : 'event' is not valid`)
        if (typeof listener !== 'function') throw new Error(`'JQuery.on() : 'listener' is not valid`)

        this.forEach((element: Type): void => element.addEventListener(event, listener, option))

        return this
    }


    /**
     * @param       event               event type 
     * @param       listener            listener function
     * @param       option              options
     */
    off<Key extends K<Type>>(event: Key, listener: (this: Type, ev: E<Type>[Key]) => any, option?: EOp): JHTMLElement<Type>
    /**
     * @param       event               event type 
     * @param       listener            listener function
     * @param       option              options
     */
    off(event: string, listener: ELoELO, option?: EOp): JHTMLElement<Type>
    off<Key extends K<Type>>(event: Ev<Key>, listener: Fn<Type, Key>, option?: EOp): JHTMLElement<Type> {
        if (typeof event !== 'string') throw new Error(`'JQuery.on() : 'event' is not valid`)
        if (typeof listener !== 'function') throw new Error(`'JQuery.on() : 'listener' is not valid`)

        this.forEach((element: Type): void => element.removeEventListener(event, listener, option))

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


export function $$<T extends HTMLElement>(query: string): T
export function $$<T extends HTMLElement>(query: string, element?: HTMLElement): T
export function $$<T extends HTMLElement>(query: string, containerQuery?: string): T
export function $$<T extends HTMLElement>(query: string, queryOrContainer?: string | HTMLElement): T {
    if (query === undefined)
        throw new Error(`'jqueryy()' : 'query' is not defined`)


    if (typeof query === 'string' && typeof queryOrContainer === 'string') {
        const container = document.querySelector<T>(queryOrContainer)
        if (container === null) throw new Error(`'jqueryy()' : 'queryOrContainer' returned null`)

        const element = container.querySelector<T>(query)
        if (element === null) throw new Error(`'jqueryy()' : 'query' returned null (string)`)

        return element
    }


    if (typeof query === 'string' && queryOrContainer instanceof HTMLElement) {
        const element = queryOrContainer.querySelector<T>(query)
        if (element === null) throw new Error(`'jqueryy()' : 'query' returned null (html)`)

        return element
    }


    const el = document.querySelector<T>(query)
    if (el === null) throw new Error(`'jqueryy()' : 'query' returned null (o string)`)


    return el
}


type JSelection = string | NodeList | HTMLElement | Window | Document

export function $(doc: Document): JHTMLElement<Document>
export function $(win: Window): JHTMLElement<Window>
export function $<T extends HTMLElement>(query: string, containerQuery: string): JHTMLElement<T>
export function $<T extends HTMLElement>(query: string, element: HTMLElement): JHTMLElement<T>
export function $<T extends HTMLElement>(query: string): JHTMLElement<T>
export function $<T extends HTMLElement>(elements: NodeList): JHTMLElement<T>
export function $<T extends HTMLElement>(element: T): JHTMLElement<T>
export function $(queryOrObj: JSelection, queryOrElement?: HTMLElement | string)
    : JHTMLElement<Node | HTMLElement | Window | Document> {
    if (typeof queryOrObj === 'string' && typeof queryOrElement === 'string') {
        const container: Element | null = document.querySelector(queryOrElement)
        const qsa: NodeListOf<Element> | undefined = container?.querySelectorAll(queryOrObj)
        const elements: NodeListOf<Element> | never[] = qsa ? qsa : []

        return new JHTMLElement(...elements)
    }


    if (typeof queryOrObj === 'string' && queryOrElement instanceof HTMLElement)
        return new JHTMLElement(...queryOrElement.querySelectorAll<HTMLElement>(queryOrObj))


    if (typeof queryOrObj === 'string')
        return new JHTMLElement(...document.querySelectorAll<HTMLElement>(queryOrObj))


    if (queryOrObj instanceof NodeList)
        return new JHTMLElement(...queryOrObj)


    if (queryOrObj instanceof HTMLElement)
        return new JHTMLElement(queryOrObj)


    return new JHTMLElement<Window | Document>(queryOrObj)
}


const jquery = { $$, $ }
export default jquery
