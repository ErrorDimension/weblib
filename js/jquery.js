import modCase from './modcase.js';
class JHTMLElement extends Array {
    css(property, val) {
        this.forEach((element) => {
            if (!(element instanceof HTMLElement))
                return;
            if (typeof property === 'string' && val !== undefined)
                element.style.setProperty(modCase.camel.kebab(property), val);
            if (property instanceof Object)
                for (let key in property) {
                    const prop = modCase.camel.kebab(key);
                    const value = property[key];
                    element.style.setProperty(prop, value);
                }
        });
        return this;
    }
    attr(nameOrProps, val) {
        this.forEach((element) => {
            if (!(element instanceof HTMLElement))
                return;
            if (typeof nameOrProps === 'string' && val !== undefined)
                if (val === null)
                    element.removeAttribute(nameOrProps);
                else
                    element.setAttribute(nameOrProps, val);
            if (nameOrProps instanceof Object)
                for (let key in nameOrProps) {
                    const name = key;
                    const value = nameOrProps[key];
                    if (value === null)
                        element.removeAttribute(name);
                    else
                        element.setAttribute(name, value);
                }
        });
        return this;
    }
    dataset(nameOrProps, val) {
        this.forEach(function (element) {
            if (!(element instanceof HTMLElement))
                return;
            if (typeof nameOrProps === 'string' && val === null)
                delete element.dataset[nameOrProps];
            if (typeof nameOrProps === 'string' && typeof val === 'string')
                element.dataset[nameOrProps] = val;
            if (nameOrProps instanceof Object)
                for (let key in nameOrProps) {
                    const value = nameOrProps[key];
                    if (value === null)
                        delete element.dataset[key];
                    else
                        element.dataset[key] = value;
                }
        });
        return this;
    }
    each(func) {
        if (typeof func !== 'function')
            throw new Error('"jquery.each()" : "func" is not a function');
        this.forEach((element, index) => func.call(element, index));
        return this;
    }
    /**
    * add an event listener onto a list of elements
    * @param        { Event }                   event           event type
    * @param        { Function }                listener        callback listener
    * @param        { Boolean | object }        option          options
    */
    on(event, listener, option) {
        if (typeof event !== 'string')
            throw new Error(`'JQuery.on() : 'event' is not valid`);
        if (typeof listener !== 'function')
            throw new Error(`'JQuery.on() : 'listener' is not valid`);
        this.forEach((element) => element.addEventListener(event, listener, option));
        return this;
    }
    /**
    * remove an event listener that attached to a list of elements
    * @param        { Event }                   event           event type
    * @param        { Function }                listener        callback listener
    * @param        { Boolean | object }        option          options
    */
    off(event, listener, option) {
        if (typeof event !== 'string')
            throw new Error(`'JQuery.on() : 'event' is not valid`);
        if (typeof listener !== 'function')
            throw new Error(`'JQuery.on() : 'listener' is not valid`);
        this.forEach((element) => element.removeEventListener(event, listener, option));
        return this;
    }
    addClass(...className) {
        this.forEach(function (element) {
            if (!(element instanceof HTMLElement))
                return;
            element.classList.add(...className);
        });
        return this;
    }
    removeClass(...className) {
        this.forEach(function (element) {
            if (!(element instanceof HTMLElement))
                return;
            element.classList.remove(...className);
        });
        return this;
    }
    toggleClass(className) {
        this.forEach(function (element) {
            if (!(element instanceof HTMLElement))
                return;
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
    if (typeof queryOrObj === 'string' && typeof queryOrElement === 'string') {
        const container = document.querySelector(queryOrElement);
        const qsa = container?.querySelectorAll(queryOrObj);
        const elements = qsa ? qsa : [];
        return new JHTMLElement(...elements);
    }
    if (typeof queryOrObj === 'string' && queryOrElement instanceof HTMLElement)
        return new JHTMLElement(...queryOrElement.querySelectorAll(queryOrObj));
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
