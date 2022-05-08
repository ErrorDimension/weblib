import modCase from './modcase.js'


type OptionalString = undefined | string | null


class JHTMLElement extends Array<HTMLElement> {
    css(
        keyOrObj: string | { [key: string]: string | null },
        val: OptionalString = undefined
    ): JHTMLElement {
        this.forEach(element => {
            if ((typeof keyOrObj === 'string' || keyOrObj instanceof String) && val !== undefined)
                element.style.setProperty(modCase.camel.kebab(keyOrObj as string), val)

            if (keyOrObj instanceof Object)
                for (let key in keyOrObj) {
                    const prop: string = modCase.camel.kebab(key)
                    const value: string = keyOrObj[key] as string
                    element.style.setProperty(prop, value)
                }
        })

        return this
    }


    attr(
        keyOrObj: string | { [key: string]: string | null },
        val: OptionalString = undefined
    ): JHTMLElement {
        this.forEach(element => {
            if ((typeof keyOrObj === 'string' || keyOrObj instanceof String) && val !== undefined) {
                element.setAttribute(keyOrObj as string, val!)
                if (val === null)
                    element.removeAttribute(keyOrObj as string)
            }

            if (keyOrObj instanceof Object)
                for (let key in keyOrObj) {
                    element.setAttribute(key, keyOrObj[key] as string)
                    if (keyOrObj[key] === null)
                        element.removeAttribute(key)
                }
        })

        return this
    }


    each(func: (index: keyof this & number) => any): JHTMLElement {
        if (typeof func !== 'function') throw new Error('"jquery.each()" : "func" is not a function')

        this.forEach((element, index) => func.call(element, index))
        return this
    }


    setdata(
        keyOrObj: string | { [key: string]: string | null },
        val: OptionalString = undefined
    ): JHTMLElement {
        this.forEach(element => {
            if ((typeof keyOrObj === 'string' || keyOrObj instanceof String) && val !== undefined)
                element.dataset[modCase.kebab.camel(keyOrObj as string)!] = val!

            if (keyOrObj instanceof Object)
                for (let key in keyOrObj) element.dataset[modCase.kebab.camel(key)] = keyOrObj[key] as string
        })

        return this
    }


    on(
        event: keyof HTMLElementEventMap,
        cbOrSelector: (
            this: HTMLElement,
            ev: WheelEvent | HTMLElementEventMap[keyof HTMLElementEventMap]
        ) => any | EventListenerOrEventListenerObject,
        cbOrOption?: Function | boolean | AddEventListenerOptions,
        option?: boolean | AddEventListenerOptions
    ): JHTMLElement {
        if (typeof cbOrSelector === 'function')
            this.forEach(el => {
                el.addEventListener(
                    event,
                    cbOrSelector,
                    cbOrOption as boolean | AddEventListenerOptions
                )
            })

        if (typeof cbOrSelector === 'string' && typeof cbOrOption === 'function')
            this.forEach(el => {
                if (el.matches(cbOrSelector))
                    el.addEventListener(
                        event,
                        cbOrOption as (this: HTMLElement, ev: HTMLElementEventMap[keyof HTMLElementEventMap]) => any,
                        option)
            })

        return this
    }


    off(
        event: keyof HTMLElementEventMap,
        cbOrSelector: (
            this: HTMLElement,
            ev: WheelEvent | HTMLElementEventMap[keyof HTMLElementEventMap]
        ) => any | EventListenerOrEventListenerObject,
        cbOrOption?: Function | boolean | AddEventListenerOptions,
        option?: boolean | AddEventListenerOptions
    ): JHTMLElement {
        if (typeof cbOrSelector === 'function')
            this.forEach(el => {
                el.removeEventListener(
                    event,
                    cbOrSelector,
                    cbOrOption as boolean | AddEventListenerOptions
                )
            })

        if (typeof cbOrSelector === 'string' && typeof cbOrOption === 'function')
            this.forEach(el => {
                if (el.matches(cbOrSelector))
                    el.removeEventListener(
                        event,
                        cbOrOption as (this: HTMLElement, ev: HTMLElementEventMap[keyof HTMLElementEventMap]) => any,
                        option)
            })

        return this
    }


    next(): (Element | null)[] {
        return this
            .map(e => e.nextElementSibling)
            .filter(e => e !== null)
    }


    prev(): (Element | null)[] {
        return this
            .map(e => e.previousElementSibling)
            .filter(e => e !== null)
    }


    addClass(...className: string[]): JHTMLElement {
        this.forEach(e => e.classList.add(...className))
        return this
    }


    removeClass(...className: string[]): JHTMLElement {
        this.forEach(e => e.classList.remove(...className))
        return this
    }


    toggleClass(className: string): JHTMLElement {
        this.forEach(e => e.classList.toggle(className))
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


export function $(query: string, element: HTMLElement): JHTMLElement
export function $(query: string, containerQuery: string): JHTMLElement
export function $(query: string): JHTMLElement
export function $(elements: NodeList): JHTMLElement
export function $(element: HTMLElement): JHTMLElement
export function $(global: Window | Document): JHTMLElement
export function $(queryOrObj: any, queryOrElement?: HTMLElement | string): JHTMLElement {
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
        return new JHTMLElement(...queryOrObj as NodeListOf<any>)

    if (queryOrObj instanceof HTMLElement)
        return new JHTMLElement(queryOrObj)

    return new JHTMLElement(queryOrObj)
}


const jquery = { $$, $ }
export default jquery
