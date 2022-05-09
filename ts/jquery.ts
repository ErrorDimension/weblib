import modCase from './modcase.js'


type ELoELO = EventListenerOrEventListenerObject
type EventOptions = boolean | AddEventListenerOptions
type EventType<Type> =
    Type extends Window ? WindowEventMap :
    Type extends Document ? DocumentEventMap :
    HTMLElementEventMap

class JHTMLElement<T extends (Window | Document | HTMLElement | Node)> extends Array<T> {
    css(
        property: string | Record<string, string | null>,
        val?: string | null
    ): JHTMLElement<T> {
        const self = this

        this.forEach(element => {
            if (!(element instanceof HTMLElement)) return self

            if (typeof property === 'string' && val !== undefined)
                element.style.setProperty(modCase.camel.kebab(property), val)

            if (property instanceof Object)
                for (let key in property) {
                    const prop: string = modCase.camel.kebab(key)
                    const value: string | null = property[key]
                    element.style.setProperty(prop, value)
                }
        })

        return self
    }


    attr(
        nameOrProps: string | Record<string, string | null>,
        val?: string | null
    ): JHTMLElement<T> {
        const self = this

        this.forEach(element => {
            if (!(element instanceof HTMLElement)) return self

            if (typeof nameOrProps === 'string' && val !== undefined) {
                if (val === null) {
                    element.removeAttribute(nameOrProps)
                    return self
                }

                element.setAttribute(nameOrProps, val)
                return self
            }

            if (nameOrProps instanceof Object)
                for (let key in nameOrProps) {
                    const name: string = key
                    const value: string | null = nameOrProps[key]

                    if (value !== undefined) element.removeAttribute(name)
                    else element.setAttribute(name, value)
                }
        })

        return self
    }


    dataset(
        nameOrProps: string | Record<string, string | null>,
        val?: string | null
    ): JHTMLElement<T> {
        const self = this

        this.forEach(element => {
            if (!(element instanceof HTMLElement)) return self

            if (typeof nameOrProps === 'string' && val === null)
                delete element.dataset[nameOrProps]

            if (typeof nameOrProps === 'string')
                element.dataset[nameOrProps] = val === null ? undefined : val

            if (nameOrProps instanceof Object)
                for (let key in nameOrProps) {
                    const value: string | null = nameOrProps[key]

                    if (value === null) delete element.dataset[key]
                    else element.dataset[key] = value
                }
        })

        return self
    }


    each(func: (index: number) => any): JHTMLElement<T> {
        if (typeof func !== 'function') throw new Error('"jquery.each()" : "func" is not a function')

        this.forEach((element, index) => func.call(element, index))
        return this
    }


    /**
     * add event listener onto a list of object
     * @param       event               event type
     * @param       listener            callback listener
     * @param       option              options
     */
    on<K extends keyof EventType<T>>
        (event: K, listener: (this: T, ev: EventType<T>[K]) => any, option?: EventOptions): JHTMLElement<T>
    /**
    * add event listener onto a list of object
    * @param        event               event type
    * @param        listener            callback listener
    * @param        option              options
    */
    on(event: string, listener: ELoELO, option?: EventOptions): JHTMLElement<T>
    /**
    * add event listener onto a list of object
    * @param        event               event type
    * @param        listener            callback listener
    * @param        option              options
    */
    on<K extends keyof EventType<T>>(
        event: K | string,
        listener: ((this: T, ev: EventType<T>[K] | Event) => void) | ELoELO,
        option?: EventOptions
    ): JHTMLElement<T> {
        if (typeof event !== 'string') throw new Error(`'JQuery.on() : 'event' is not valid`)
        if (typeof listener !== 'function') throw new Error(`'JQuery.on() : 'listener' is not valid`)

        this.forEach(element => element.addEventListener(event, listener, option))

        return this
    }


    off<K extends keyof EventType<T>>
        (event: K, listener: (this: T, ev: EventType<T>[K]) => any, option?: EventOptions): JHTMLElement<T>
    off(event: string, listener: ELoELO, option?: EventOptions): JHTMLElement<T>
    off<K extends keyof EventType<T>>(
        event: K | string,
        listener: ((this: T, ev: EventType<T>[K] | Event) => void) | ELoELO,
        option?: EventOptions
    ): JHTMLElement<T> {
        if (typeof event !== 'string') throw new Error(`'JQuery.on() : 'event' is not valid`)
        if (typeof listener !== 'function') throw new Error(`'JQuery.on() : 'listener' is not valid`)

        this.forEach(element => element.removeEventListener(event, listener, option))

        return this
    }


    addClass(...className: string[]): JHTMLElement<T> {
        const self = this

        this.forEach(element => {
            if (!(element instanceof HTMLElement)) return self
            element.classList.add(...className)
        })

        return this
    }


    removeClass(...className: string[]): JHTMLElement<T> {
        const self = this

        this.forEach(element => {
            if (!(element instanceof HTMLElement)) return self
            element.classList.remove(...className)
        })

        return this
    }


    toggleClass(className: string): JHTMLElement<T> {
        const self = this

        this.forEach(element => {
            if (!(element instanceof HTMLElement)) return self
            element.classList.toggle(className)
        })

        return this
    }
}


type QuerySelector = null | Element | HTMLElement

export function $$(query: string): QuerySelector
export function $$(query: string, element: HTMLElement): QuerySelector
export function $$(query: string, containerQuery: string): QuerySelector
export function $$(queryOrObj: string, queryOrElement?: HTMLElement | string): QuerySelector {
    if (typeof queryOrObj === 'string' && typeof queryOrElement === 'string') {
        const container = document.querySelector(queryOrElement)

        if (container !== null)
            return container.querySelector(queryOrObj)

        return null
    }

    if (typeof queryOrObj === 'string' && queryOrElement instanceof HTMLElement)
        return queryOrElement.querySelector(queryOrObj)

    return document.querySelector(queryOrObj)
}


type JSelection = string | NodeList | HTMLElement | Window | Document

export function $(query: string, element: HTMLElement): JHTMLElement<HTMLElement>
export function $(query: string, containerQuery: string): JHTMLElement<HTMLElement>
export function $(query: string): JHTMLElement<HTMLElement>
export function $(elements: NodeList): JHTMLElement<HTMLElement>
export function $(element: HTMLElement): JHTMLElement<HTMLElement>
export function $(w: Window): JHTMLElement<Window>
export function $(d: Document): JHTMLElement<Document>
export function $(queryOrObj: JSelection, queryOrElement?: HTMLElement | string)
    : JHTMLElement<Node | HTMLElement | Window | Document> {
    if (typeof queryOrObj === 'string' && queryOrElement instanceof HTMLElement)
        return new JHTMLElement(...queryOrElement.querySelectorAll<HTMLElement>(queryOrObj))

    if (typeof queryOrObj === 'string' && typeof queryOrElement === 'string') {
        const container = document.querySelector(queryOrElement)

        if (container !== null)
            return new JHTMLElement(...container.querySelectorAll<HTMLElement>(queryOrObj))

        return new JHTMLElement()
    }

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
