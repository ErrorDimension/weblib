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

type PropValue = string | number | null

class JHTMLElement<Type extends Window | Document | HTMLElement | Node> extends Array<Type> {
    css(
        property: string | Record<string, PropValue>,
        val?: PropValue
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
                    let value: PropValue = property[key]
                    value = typeof value === 'number' ? value.toString() : value
                    element.style.setProperty(prop, value)
                }
        })

        return this
    }


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


    on<Key extends K<Type>>(event: Key, listener: (this: Type, ev: E<Type>[Key]) => any, option?: EOp): JHTMLElement<Type>
    on(event: string, listener: ELoELO, option?: EOp): JHTMLElement<Type>
    /**
    * add an event listener onto a list of elements
    * @param        { Event }                   event           event type
    * @param        { Function }                listener        callback listener
    * @param        { Boolean | object }        option          options
    */
    on<Key extends K<Type>>(event: Ev<Key>, listener: Fn<Type, Key>, option?: EOp): JHTMLElement<Type> {
        if (typeof event !== 'string') throw new Error(`'JQuery.on() : 'event' is not valid`)
        if (typeof listener !== 'function') throw new Error(`'JQuery.on() : 'listener' is not valid`)

        this.forEach((element: Type): void => element.addEventListener(event, listener, option))

        return this
    }


    off<Key extends K<Type>>(event: Key, listener: (this: Type, ev: E<Type>[Key]) => any, option?: EOp): JHTMLElement<Type>
    off(event: string, listener: ELoELO, option?: EOp): JHTMLElement<Type>
    /**
    * remove an event listener that attached to a list of elements
    * @param        { Event }                   event           event type
    * @param        { Function }                listener        callback listener
    * @param        { Boolean | object }        option          options
    */
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


export function $$(query: string): HTMLElement
export function $$(query: string, element?: HTMLElement): HTMLElement
export function $$(query: string, containerQuery?: string): HTMLElement
export function $$(query: string, queryOrContainer?: string | HTMLElement): HTMLElement {
    if (query === undefined)
        throw new Error(`'jqueryy()' : 'query' is not defined`)

    if (typeof query === 'string' && typeof queryOrContainer === 'string') {
        const container = document.querySelector<HTMLElement>(queryOrContainer)
        if (container === null) throw new Error(`'jqueryy()' : 'queryOrContainer' returned null`)

        const element = container.querySelector<HTMLElement>(query)
        if (element === null) throw new Error(`'jqueryy()' : 'query' returned null (string)`)

        return element
    }

    if (typeof query === 'string' && queryOrContainer instanceof HTMLElement) {
        const element = queryOrContainer.querySelector<HTMLElement>(query)
        if (element === null) throw new Error(`'jqueryy()' : 'query' returned null (html)`)

        return element
    }

    const el = document.querySelector<HTMLElement>(query)
    if (el === null) throw new Error(`'jqueryy()' : 'query' returned null (o string)`)

    return el
}


type JSelection = string | NodeList | HTMLElement | Window | Document

export function $(d: Document): JHTMLElement<Document>
export function $(w: Window): JHTMLElement<Window>
export function $(query: string, containerQuery: string): JHTMLElement<HTMLElement>
export function $(query: string, element: HTMLElement): JHTMLElement<HTMLElement>
export function $(query: string): JHTMLElement<HTMLElement>
export function $(elements: NodeList): JHTMLElement<HTMLElement>
export function $<HTMLElementType extends HTMLElement>
    (element: HTMLElementType): JHTMLElement<HTMLElementType>
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
