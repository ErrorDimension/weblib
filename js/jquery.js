import modCase from './modcase.js';
class JHTMLElement extends Array {
    css(keyOrObj, val = undefined) {
        this.forEach(element => {
            if ((typeof keyOrObj === 'string' || keyOrObj instanceof String) && val !== undefined)
                element.style.setProperty(modCase.camel.kebab(keyOrObj), val);
            if (keyOrObj instanceof Object)
                for (let key in keyOrObj) {
                    const prop = modCase.camel.kebab(key);
                    const value = keyOrObj[key];
                    element.style.setProperty(prop, value);
                }
        });
        return this;
    }
    attr(keyOrObj, val = undefined) {
        this.forEach(element => {
            if ((typeof keyOrObj === 'string' || keyOrObj instanceof String) && val !== undefined) {
                element.setAttribute(keyOrObj, val);
                if (val === null)
                    element.removeAttribute(keyOrObj);
            }
            if (keyOrObj instanceof Object)
                for (let key in keyOrObj) {
                    element.setAttribute(key, keyOrObj[key]);
                    if (keyOrObj[key] === null)
                        element.removeAttribute(key);
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
    setdata(keyOrObj, val = undefined) {
        this.forEach(element => {
            if ((typeof keyOrObj === 'string' || keyOrObj instanceof String) && val !== undefined)
                element.dataset[modCase.kebab.camel(keyOrObj)] = val;
            if (keyOrObj instanceof Object)
                for (let key in keyOrObj)
                    element.dataset[modCase.kebab.camel(key)] = keyOrObj[key];
        });
        return this;
    }
    on(event, cbOrSelector, cbOrOption, option) {
        if (typeof cbOrSelector === 'function')
            this.forEach(el => {
                el.addEventListener(event, cbOrSelector, cbOrOption);
            });
        if (typeof cbOrSelector === 'string' && typeof cbOrOption === 'function')
            this.forEach(el => {
                if (el.matches(cbOrSelector))
                    el.addEventListener(event, cbOrOption, option);
            });
        return this;
    }
    off(event, cbOrSelector, cbOrOption, option) {
        if (typeof cbOrSelector === 'function')
            this.forEach(el => {
                el.removeEventListener(event, cbOrSelector, cbOrOption);
            });
        if (typeof cbOrSelector === 'string' && typeof cbOrOption === 'function')
            this.forEach(el => {
                if (el.matches(cbOrSelector))
                    el.removeEventListener(event, cbOrOption, option);
            });
        return this;
    }
    next() {
        return this
            .map(e => e.nextElementSibling)
            .filter(e => e !== null);
    }
    prev() {
        return this
            .map(e => e.previousElementSibling)
            .filter(e => e !== null);
    }
    addClass(...className) {
        this.forEach(e => e.classList.add(...className));
        return this;
    }
    removeClass(...className) {
        this.forEach(e => e.classList.remove(...className));
        return this;
    }
    toggleClass(className) {
        this.forEach(e => e.classList.toggle(className));
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
