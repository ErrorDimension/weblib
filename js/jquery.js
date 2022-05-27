import modCase from './modcase.js';
class JHTMLElement extends Array {
    css(property, val) {
        this.forEach((element) => {
            if (!(element instanceof HTMLElement))
                return;
            if (typeof property === 'string' && val !== undefined) {
                val = typeof val === 'number' ? val.toString() : val;
                element.style.setProperty(modCase.camel.kebab(property), val);
            }
            if (property instanceof Object)
                for (let key in property) {
                    const prop = modCase.camel.kebab(key);
                    let value = property[key];
                    value = typeof value === 'number' ? value.toString() : value;
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
    remove() {
        this.forEach(function (element) {
            if (element instanceof HTMLElement)
                element.remove();
        });
    }
    on(event, listener, option) {
        if (typeof event !== 'string')
            throw new Error(`'JQuery.on() : 'event' is not valid`);
        if (typeof listener !== 'function')
            throw new Error(`'JQuery.on() : 'listener' is not valid`);
        this.forEach((element) => element.addEventListener(event, listener, option));
        return this;
    }
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
export function $$(a, b) {
    if (a === undefined)
        throw new Error(`'jqueryy()' : 'query' is not defined`);
    if (typeof a === 'string' && typeof b === 'string') {
        const container = document.querySelector(b);
        if (container === null)
            throw new Error(`'jqueryy()' : 'queryOrContainer' returned null`);
        const element = container.querySelector(a);
        if (element === null)
            throw new Error(`'jqueryy()' : 'query' returned null (string)`);
        return element;
    }
    if (typeof a === 'string' && b instanceof HTMLElement) {
        const element = b.querySelector(a);
        if (element === null)
            throw new Error(`'jqueryy()' : 'query' returned null (html)`);
        return element;
    }
    const el = document.querySelector(a);
    if (el === null)
        throw new Error(`'jqueryy()' : 'query' returned null (o string)`);
    return el;
}
export function $(a, b) {
    if (typeof a === 'string' && typeof b === 'string') {
        const container = document.querySelector(b);
        const qsa = container?.querySelectorAll(a);
        const elements = qsa ? qsa : [];
        return new JHTMLElement(...elements);
    }
    if (typeof a === 'string' && b instanceof HTMLElement)
        return new JHTMLElement(...b.querySelectorAll(a));
    if (typeof a === 'string')
        return new JHTMLElement(...document.querySelectorAll(a));
    if (a instanceof NodeList)
        return new JHTMLElement(...a);
    if (a instanceof HTMLElement)
        return new JHTMLElement(a);
    return new JHTMLElement(a);
}
const jquery = { $$, $ };
export default jquery;
