import modCase from '../case';
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
export function $$(conOrQuery, query) {
    const array_ = query ? $(conOrQuery, query) : $(conOrQuery);
    if (array_.length)
        return array_[0];
    return null;
}
export function $(queryOrContainer, query) {
    if (typeof queryOrContainer === 'string')
        return new JHTMLElement(...document.querySelectorAll(queryOrContainer));
    if (queryOrContainer instanceof NodeList)
        return new JHTMLElement(...queryOrContainer);
    if (queryOrContainer instanceof HTMLElement && typeof query === 'string')
        return new JHTMLElement(...queryOrContainer.querySelectorAll(query));
    if (queryOrContainer instanceof HTMLElement)
        return new JHTMLElement(queryOrContainer);
    return new JHTMLElement(queryOrContainer);
}
const jquery = { $$, $ };
export default jquery;
