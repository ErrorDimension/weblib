/** @returns { HTMLElement } */
HTMLElement.prototype.css = function (keyOrObj, val = undefined) {
    if ((typeof keyOrObj === 'string' || keyOrObj instanceof String) && val !== undefined)
        this.style.setProperty(zacase.camelKebab(keyOrObj), val)

    if (keyOrObj instanceof Object)
        for (let key in keyOrObj) this.style.setProperty(zacase.camelKebab(key), keyOrObj[key])

    return this
}
/** @returns { HTMLElement } */
HTMLElement.prototype.attr = function (keyOrObj, val = undefined) {
    if ((typeof keyOrObj === 'string' || keyOrObj instanceof String) && val !== undefined) {
        this.setAttribute(keyOrObj, val)
        if (val === null)
            this.removeAttribute(keyOrObj)
    }

    if (keyOrObj instanceof Object)
        for (let key in keyOrObj) {
            this.setAttribute(key, keyOrObj[key])
            if (keyOrObj[key] === null)
                this.removeAttribute(key)
        }

    return this
}
/** @returns { HTMLElement } */
HTMLElement.prototype.setdata = function (keyOrObj, val = undefined) {
    if ((typeof keyOrObj === 'string' || keyOrObj instanceof String) && val !== undefined)
        this.dataset[zacase.kebabCamel(keyOrObj)] = val

    if (keyOrObj instanceof Object)
        for (let key in keyOrObj) this.dataset[zacase.kebabCamel(key)] = keyOrObj[key]

    return this
}
class JHTMLElement extends Array {
    /** @returns { HTMLElement } */
    get fc() { return this[0] }

    /** @returns { JHTMLElement } */
    ready(callback) {
        const isReady = this.every(el => { return el.readyState !== null && el.readyState !== 'loading' })

        if (isReady) callback()
        else this.on('DOMContentLoaded', callback)

        return this
    }

    /** @returns { JHTMLElement } */
    off(event, cbOrSelector, cbOrOption = undefined, option = undefined) {
        if (typeof cbOrSelector === 'function')
            this.forEach(el => el.removeEventListener(event, cbOrSelector, cbOrOption))

        if (typeof cbOrSelector === 'string' && typeof cbOrOption === 'function')
            this.forEach(el => {
                if (el.matches(cbOrSelector))
                    el.removeEventListener(event, cbOrOption, option)
            })

        return this
    }

    /** @returns { JHTMLElement } */
    on(event, cbOrSelector, cbOrOption = undefined, option = undefined) {
        if (typeof cbOrSelector === 'function')
            this.forEach(el => el.addEventListener(event, cbOrSelector, cbOrOption))

        if (typeof cbOrSelector === 'string' && typeof cbOrOption === 'function')
            this.forEach(el => {
                if (el.matches(cbOrSelector))
                    el.addEventListener(event, cbOrOption, option)
            })

        return this
    }

    /** @returns { HTMLElement } */
    next() {
        return this
            .map(e => e.nextElementSibling)
            .filter(e => e !== null)
    }

    /** @returns { HTMLElement } */
    prev() {
        return this
            .map(e => e.prevElementSibling)
            .filter(e => e !== null)
    }

    /** @returns { JHTMLElement } */
    addClass(...className) {
        this.forEach(e => e.classList.add(...className))
        return this
    }

    /** @returns { JHTMLElement } */
    removeClass(...className) {
        this.forEach(e => e.classList.remove(...className))
        return this
    }

    /** @returns { JHTMLElement } */
    toggleClass(className) {
        this.forEach(e => e.classList.toggle(className))
        return this
    }

    /** @returns { JHTMLElement } */
    css(keyOrObj, val = undefined) {
        this.forEach(e => e.css(keyOrObj, val))
        return this
    }

    /** @returns { JHTMLElement } */
    setdata(keyOrObj, val = undefined) {
        this.forEach(e => e.setdata(keyOrObj, val))
        return this
    }

    /** @returns { JHTMLElement } */
    attr(keyOrObj, val = undefined) {
        this.forEach(e => e.attr(keyOrObj, val))
        return this
    }
}


export function $() { }


export function $$() { }


export default { $, $$ }
