import modCase from './modcase.js';
class JHTMLElement extends Array {
    css(property, val) {
        const self = this;
        this.forEach(element => {
            if (!(element instanceof HTMLElement))
                return self;
            if (typeof property === 'string' && val !== undefined)
                element.style.setProperty(modCase.camel.kebab(property), val);
            if (property instanceof Object)
                for (let key in property) {
                    const prop = modCase.camel.kebab(key);
                    const value = property[key];
                    element.style.setProperty(prop, value);
                }
        });
        return self;
    }
    attr(nameOrProps, val) {
        const self = this;
        this.forEach(element => {
            if (!(element instanceof HTMLElement))
                return self;
            if (typeof nameOrProps === 'string' && val !== undefined) {
                if (val === null) {
                    element.removeAttribute(nameOrProps);
                    return self;
                }
                element.setAttribute(nameOrProps, val);
                return self;
            }
            if (nameOrProps instanceof Object)
                for (let key in nameOrProps) {
                    const name = key;
                    const value = nameOrProps[key];
                    if (value !== undefined)
                        element.removeAttribute(name);
                    else
                        element.setAttribute(name, value);
                }
        });
        return self;
    }
    dataset(nameOrProps, val) {
        const self = this;
        this.forEach(element => {
            if (!(element instanceof HTMLElement))
                return self;
            if (typeof nameOrProps === 'string' && val === null)
                delete element.dataset[nameOrProps];
            if (typeof nameOrProps === 'string')
                element.dataset[nameOrProps] = val === null ? undefined : val;
            if (nameOrProps instanceof Object)
                for (let key in nameOrProps) {
                    const value = nameOrProps[key];
                    if (value === null)
                        delete element.dataset[key];
                    else
                        element.dataset[key] = value;
                }
        });
        return self;
    }
    each(func) {
        if (typeof func !== 'function')
            throw new Error('"jquery.each()" : "func" is not a function');
        this.forEach((element, index) => func.call(element, index));
        return this;
    }
    /**
    * add an event listener onto a list of object
    * @param        { Event }                   event           event type
    * @param        { Function }                listener        callback listener
    * @param        { Boolean | object }        option          options
    */
    on(event, listener, option) {
        if (typeof event !== 'string')
            throw new Error(`'JQuery.on() : 'event' is not valid`);
        if (typeof listener !== 'function')
            throw new Error(`'JQuery.on() : 'listener' is not valid`);
        this.forEach(element => element.addEventListener(event, listener, option));
        return this;
    }
    /**
    * remove an event listener that attached onto a list of object
    * @param        { Event }                   event           event type
    * @param        { Function }                listener        callback listener
    * @param        { Boolean | object }        option          options
    */
    off(event, listener, option) {
        if (typeof event !== 'string')
            throw new Error(`'JQuery.on() : 'event' is not valid`);
        if (typeof listener !== 'function')
            throw new Error(`'JQuery.on() : 'listener' is not valid`);
        this.forEach(element => element.removeEventListener(event, listener, option));
        return this;
    }
    addClass(...className) {
        const self = this;
        this.forEach(element => {
            if (!(element instanceof HTMLElement))
                return self;
            element.classList.add(...className);
        });
        return this;
    }
    removeClass(...className) {
        const self = this;
        this.forEach(element => {
            if (!(element instanceof HTMLElement))
                return self;
            element.classList.remove(...className);
        });
        return this;
    }
    toggleClass(className) {
        const self = this;
        this.forEach(element => {
            if (!(element instanceof HTMLElement))
                return self;
            element.classList.toggle(className);
        });
        return this;
    }
}
export function $$(queryOrObj, queryOrElement) {
    if (typeof queryOrObj === 'string' && typeof queryOrElement === 'string') {
        const container = document.querySelector(queryOrElement);
        if (container !== null)
            return container.querySelector(queryOrObj);
        return null;
    }
    if (typeof queryOrObj === 'string' && queryOrElement instanceof HTMLElement)
        return queryOrElement.querySelector(queryOrObj);
    return document.querySelector(queryOrObj);
}
export function $(queryOrObj, queryOrElement) {
    if (typeof queryOrObj === 'string' && queryOrElement instanceof HTMLElement)
        return new JHTMLElement(...queryOrElement.querySelectorAll(queryOrObj));
    if (typeof queryOrObj === 'string' && typeof queryOrElement === 'string') {
        const container = document.querySelector(queryOrElement);
        if (container !== null)
            return new JHTMLElement(...container.querySelectorAll(queryOrObj));
        return new JHTMLElement();
    }
    if (typeof queryOrObj === 'string')
        return new JHTMLElement(...document.querySelectorAll(queryOrObj));
    if (queryOrObj instanceof NodeList)
        return new JHTMLElement(...queryOrObj);
    if (queryOrObj instanceof HTMLElement)
        return new JHTMLElement(queryOrObj);
    return new JHTMLElement(queryOrObj);
}
const jquery = { $$, $ };
export default jquery;
