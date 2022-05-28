import Glasium from './glasium';
import { $, $$ } from './jquery';
import lib from './lib';
import magicDOM from './magic-dom';
const navigation = {
    initialized: false,
    container: undefined,
    navbar: undefined,
    block: {
        left: undefined,
        right: undefined
    },
    tooltip: undefined,
    underlay: undefined,
    subWindowList: [],
    init(containerQuery, contentQuery) {
        if (this.initialized || typeof window === "undefined")
            return;
        this.initialized = true;
        /** get container */
        const container = $$(containerQuery);
        this.container = $$(contentQuery);
        /** stylesheet */
        const style = document.createElement('style');
        style.textContent = `
        ${containerQuery} {
            position: absolute;
            inset: 0;
            
            display: flex;
            flex-direction: column;

            place-items: center;

            width: 100%;
            height: calc(100% - var(--nav-height));

            margin-block-start: var(--nav-height);
        }

        ${contentQuery} {
            width: 100%;
            height: 100%;
        }
        `;
        container.appendChild(style);
        /** initialize nav component */
        this.block.left = magicDOM.createElement('div', { classList: 'nav--left' });
        this.block.right = magicDOM.createElement('div', { classList: 'nav--right' });
        this.tooltip = magicDOM.createTree('div', 'nav__tooltip', {}, {
            t: { classList: 'nav__tooltip__title' },
            d: { classList: 'nav__tooltip__description' }
        });
        this.underlay = magicDOM.createElement('div', { classList: 'nav__underlay' });
        this.navbar = magicDOM.createTree('div', 'nav', {}, {
            left: this.block.left,
            right: this.block.right,
            tooltip: this.tooltip,
            underlay: this.underlay
        });
        container.insertBefore(this.navbar, container.firstChild);
        /** events */
        $(this.underlay).on('click', () => {
            for (let item of this.subWindowList)
                if (item.isShowing)
                    item.hide(false);
            this.setUnderlay(false);
        });
    },
    insert(component, location, order) {
        if (!['left', 'right'].includes(location))
            return;
        if (!this.block[location])
            return;
        this.block[location]?.append(component.container);
        if (order)
            $(component.container).css('order', order);
    },
    setUnderlay(activate = false) {
        if (!this.underlay)
            return;
        this.underlay.classList[activate ? 'add' : 'remove']('nav__underlay--active');
    },
    set loading(loading) {
        if (!this.container)
            return;
        if (loading)
            this.container.append(magicDOM.toHTMLElement('<div class="loading--cover"></div>'));
        else
            this.container.querySelector('.loading--cover')?.remove();
    },
    account: {
        userToken: undefined
    },
    addComponent: {
        logo({ icon = 'favicon.png', title = 'app name', onlyActive = false } = {}) {
            const container = magicDOM.createTree('div', 'nav__logo', {}, {
                i: {
                    tag: 'img', classList: 'nav__logo__icon', attribute: {
                        src: icon, alt: 'app logo', loading: 'lazy'
                    }
                },
                t: { classList: 'nav__logo__title', children: title }
            });
            const tooltip = new navigation.Tooltip(container);
            const clicker = new navigation.Clicker(container, onlyActive);
            navigation.insert({ container }, 'left', 1);
            return {
                container,
                tooltip,
                clicker
            };
        },
        route(record, spa = false) {
            if (!navigation.navbar)
                return;
            /** indicator */
            const indicator = magicDOM.createElement('div', {
                classList: 'nav__indicator'
            });
            navigation.navbar.appendChild(indicator);
            /** component */
            const component = {
                container: magicDOM.createElement('div', { classList: 'nav__component' })
            };
            /** background for routes */
            Glasium.init(component.container, {
                count: 8,
                onMutation: {
                    callback() {
                        return document.body.dataset.theme === 'dark';
                    },
                    false: {
                        color: Glasium.COLOR.WHITESMOKE,
                        brightness: Glasium.BRIGHTNESS.LIGHT
                    },
                    true: {
                        color: Glasium.COLOR.DARK,
                        brightness: Glasium.BRIGHTNESS.DARK
                    },
                    observing: document.body,
                    options: {
                        attributeFilter: ['data-theme']
                    }
                }
            });
            /** navigation */
            let navigating = false;
            let routes = [];
            /** create routes */
            for (let key in record) {
                let { href, icon, tooltip } = record[key];
                /** specify which route is available */
                routes.push(href);
                /** init info from record */
                icon = icon ? icon : 'home';
                tooltip = tooltip ? tooltip : { title: '', description: '' };
                /** link */
                const link = spa
                    ? $(`a[data-href='${href}']`)
                        .addClass('nav__link')
                        .append(magicDOM.toHTMLElement(`<i class="fa-solid fa-${icon}"></i>`))[0]
                    : magicDOM.createElement('div', {
                        classList: 'nav__link',
                        attribute: { 'data-href': href },
                        children: magicDOM.toHTMLElement(`<i class="fa-solid fa-${icon}"></i>`)
                    });
                new navigation.Tooltip(link).set(tooltip);
                /** link's events */
                $(link).on('click', () => {
                    /** 404 and 500 handler */
                    if (!routes.includes(window.location.pathname)) {
                        navigating = true;
                        navigation.loading = true;
                        indicate(link).then(() => {
                            // the code said it
                            window.location.pathname = link.dataset.href;
                        });
                        return;
                    }
                    /** needless handler */
                    if (or(window.location.pathname === link.dataset.href, // no need for navigate
                    navigating, // is navigating so return
                    spa // spa doesn't need more
                    )) {
                        indicate(link);
                        return;
                    }
                    /** indicator and navigate */
                    navigating = true;
                    navigation.loading = true;
                    indicate(link).then(() => {
                        /** the code said it */
                        window.location.pathname = link.dataset.href;
                    });
                });
                /** append link */
                component.container.append(link);
            }
            /** insert */
            navigation.insert(component, 'left', 2);
            /** indicate and initial indication */
            function indicate(current) {
                return new Promise((resolve) => {
                    $('.nav__link--active').removeClass('nav__link--active');
                    $(current).addClass('nav__link--active');
                    const { left, width } = current.getBoundingClientRect();
                    $(indicator).css({
                        left: `${left}px`,
                        width: `${width}px`
                    });
                    window.setTimeout(resolve, 200);
                });
            }
            const currentLink = document
                .querySelector(`.nav__link[data-href="${window.location.pathname}"]`);
            if (!currentLink)
                return;
            window.setTimeout(indicate, 200, currentLink);
        },
        hamburger(func = undefined) {
            const container = magicDOM.createElement('div', {
                classList: 'nav__hamburger', children: [
                    magicDOM.toHTMLElement(`
                        <div class='nav__hamburger__box'>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        `)
                ]
            });
            const tooltip = new navigation.Tooltip(container);
            const clicker = new navigation.Clicker(container);
            if (func)
                clicker.onClick(func);
            navigation.insert({ container }, 'right', 1);
            return {
                container,
                tooltip,
                clicker
            };
        },
        button({ icon = 'code', image = undefined, colorName = 'BLUE', brightnessLevel = 'OTHER', alwaysActive = false, text = undefined, func = undefined } = {}) {
            const container = magicDOM.createElement('span', {
                classList: ['nav__component', 'nav__button'],
            });
            const tooltip = new navigation.Tooltip(container);
            const clicker = new navigation.Clicker(container, alwaysActive);
            if (func)
                clicker.onClick(func);
            navigation.insert({ container }, 'right', 3);
            Glasium.init(container, {
                count: 8,
                color: Glasium.COLOR[colorName], brightness: Glasium.BRIGHTNESS[brightnessLevel]
            });
            if (!image)
                container.append(magicDOM.toHTMLElement(`<i class='fa-solid fa-${icon}'></i>`));
            if (image)
                container.append(magicDOM.toHTMLElement(`<img src='${image}' loading='lazy'></img>`));
            if (text) {
                container.dataset.text = '';
                container.append(magicDOM.toHTMLElement(`<div class='nav__button__text'>${text}</div>`));
            }
            return {
                container,
                tooltip,
                clicker,
                set icon(iconName) {
                    $('i', this.container).remove();
                    $('img', this.container).remove();
                    this.container.append(magicDOM.toHTMLElement(`<i class='fa-solid fa-${iconName}'></i>`));
                },
                set image(src) {
                    $('i', this.container).remove();
                    if (this.container.querySelector('img')) {
                        $$('img', this.container).src = src;
                        return;
                    }
                    this.container.append(magicDOM.toHTMLElement(`<img src='${src}' loading='lazy'></img>`));
                }
            };
        },
        account() {
            const button = this.button({
                text: 'guest',
                image: 'guest.png'
            });
            const { container, tooltip, clicker } = button;
            const subWindow = new navigation.SubWindow(container);
            /** background color */
            Glasium.change(container, {
                color: Glasium.COLOR.RED // because initially button is whitesmoke
            });
            return {
                container,
                tooltip,
                clicker,
                subWindow,
                set avatar(src) {
                    button.image = src;
                },
                set userName(userName) {
                    $$('.nav__button__text').innerText = userName;
                },
                set background(colorName) {
                    colorName = colorName.toUpperCase();
                    Glasium.change(this.container, {
                        color: Glasium.COLOR[colorName]
                    });
                }
            };
        }
    },
    Tooltip: class {
        constructor(target) {
            if (lib.isMobile)
                return;
            if (!navigation.tooltip)
                return;
            this.container = navigation.tooltip;
            if (!this.container)
                return;
            $(target)
                .on('mouseenter', (event) => this.show(event))
                .on('mouseleave', () => this.hide())
                .on('mousedown', () => this.hide());
        }
        title = '';
        description = '';
        flip = false;
        container = undefined;
        set({ title = '', description = '', flip = false } = {}) {
            this.title = title !== '' ? title : this.title;
            this.description = description !== '' ? description : this.description;
            this.flip = flip;
        }
        show({ target }) {
            if (navigation.underlay &&
                navigation.underlay.classList.contains('nav__underlay--active'))
                return;
            if (!navigation.navbar)
                return;
            if (!(this.container &&
                this.container.t &&
                this.container.d))
                return;
            if (this.title === '' || typeof this.title === 'undefined')
                return;
            const { innerWidth } = window;
            const { left, right } = target.getBoundingClientRect();
            const { width } = this.container.getBoundingClientRect();
            this.container.t.innerText = this.title;
            this.container.d.innerText = this.description ? this.description : '';
            $(this.container).css({
                left: this.flip ? null : `${left}px`,
                right: this.flip ? `${innerWidth - right}px` : null,
                textAlign: this.flip || left + width >= innerWidth ? 'right' : 'left'
            });
            $(this.container).addClass('nav__tooltip--active');
            $(navigation.navbar).addClass('nav--decorating');
        }
        hide() {
            if (!navigation.navbar)
                return;
            if (!this.container)
                return;
            $(this.container).removeClass('nav__tooltip--active');
            $(navigation.navbar).removeClass('nav--decorating');
        }
    },
    Clicker: class {
        constructor(container, onlyActive = false) {
            this.container = container;
            this.container.classList.add('nav__clicker');
            if (onlyActive)
                $(container).dataset('activated', '');
            $(this.container).on('click', () => {
                if (!this.container)
                    return;
                if (onlyActive) {
                    for (let f of this.clickHandlers)
                        f(true);
                    this.activated = true;
                }
                else {
                    let isActive = this.container.dataset.activated === '';
                    for (let f of this.clickHandlers)
                        f(!isActive);
                    this.toggle(isActive);
                }
            });
        }
        container = undefined;
        clickHandlers = [];
        activated = false;
        onClick(func) {
            return this.clickHandlers.push(func);
        }
        offClick(index) {
            if (this.clickHandlers[index])
                this.clickHandlers[index] = () => { };
        }
        toggle(isActive = this.activated) {
            this.activated = !isActive;
            if (this.activated)
                this.show();
            else
                this.hide();
        }
        show() {
            if (!this.container)
                return;
            if (!this.clickHandlers.length)
                return;
            this.container.dataset.activated = '';
        }
        hide() {
            if (!this.container)
                return;
            delete this.container.dataset.activated;
        }
    },
    SubWindow: class {
        constructor(container, content = 'blank') {
            /** initialize the html */
            this.__container = container;
            this.__windowNode = magicDOM.createElement('div', {
                classList: [
                    'nav__sub-window',
                    'nav__sub-window--deactivated'
                ],
                attribute: { 'data-id': this.__id }
            });
            this.__overlayNode = magicDOM.createElement('div', {
                classList: 'nav__sub-window__overlay',
                children: magicDOM.toHTMLElement(`<div class="loading--cover"></div>`)
            });
            this.__contentNode = magicDOM.createElement('div', {
                classList: 'nav__sub-window__content'
            });
            this.content = content;
            this.__windowNode.append(this.__contentNode, this.__overlayNode);
            this.__container.append(this.__windowNode);
            /** list */
            navigation.subWindowList.push(this);
            /** observer */
            new ResizeObserver(() => this.update()).observe(this.__contentNode);
            new ResizeObserver(() => this.update()).observe(this.__container);
            $(window).on('resize', () => this.update());
            /** events */
            $(this.__container).on('click', ({ target }) => {
                if (target.matches('.nav__sub-window *'))
                    return;
                this.toggle();
            });
        }
        update() {
            lib.cssFrame(() => {
                if (!(this.__contentNode && this.__windowNode && navigation.container))
                    return;
                const { clientWidth } = navigation.container;
                let height = this.__isShowing ? this.__contentNode.offsetHeight : 0;
                $(this.__windowNode).css('--height', `${height}px`);
                if (this.__isShowing) {
                    if (!(this.__container && this.__windowNode))
                        return;
                    let rect = this.__container.getBoundingClientRect();
                    let width = this.__contentNode.offsetWidth;
                    if (width - rect.right < 0)
                        this.__windowNode.dataset.align = 'right';
                    else if (rect.left + width < clientWidth)
                        this.__windowNode.dataset.align = 'left';
                    else {
                        this.__windowNode.dataset.align = 'expanded';
                        $(this.__windowNode).css({
                            '--width': `${clientWidth}px`,
                            '--left': rect.left
                        });
                        return;
                    }
                    $(this.__windowNode).css('--width', `${width}px`);
                }
            });
        }
        show() {
            if (!(this.__windowNode && this.__container))
                return;
            window.clearTimeout(this.__hideTimeoutId);
            for (let item of navigation.subWindowList)
                if (item.id !== this.__id)
                    item.hide(false);
            navigation.setUnderlay(true);
            this.update();
            $(this.__windowNode)
                .addClass('nav__sub-window--activated')
                .removeClass('nav__sub-window--deactivated');
            $(this.__container)
                .dataset('swActivated', '');
            this.__isShowing = true;
            this.update();
        }
        hide(trusted = true) {
            if (!(this.__windowNode && this.__container))
                return;
            window.clearTimeout(this.__hideTimeoutId);
            if (trusted)
                navigation.setUnderlay(false);
            this.__windowNode.classList.remove('nav__sub-window--activated');
            this.__container.classList.remove('nav__sub-window__container--activated');
            $(this.__container)
                .dataset('swActivated', null);
            this.__isShowing = false;
            this.update();
            this.__hideTimeoutId = window.setTimeout(() => {
                if (!this.__windowNode)
                    return;
                this.__windowNode.classList.add('nav__sub-window--deactivated');
            }, 300);
        }
        toggle() {
            this.__isShowing ? this.hide() : this.show();
            this.__toggleHandlers.forEach((handler) => {
                handler(this.__isShowing);
            });
        }
        onToggle(func) {
            this.__toggleHandlers.push(func);
        }
        set loaded(loaded) {
            if (!this.__overlayNode)
                return;
            $(this.__overlayNode).css('display', loaded ? 'none' : 'block');
        }
        set content(content) {
            if (!this.__contentNode)
                return;
            magicDOM.emptyNode(this.__contentNode);
            this.__contentNode.append(content);
            this.update();
        }
        get isShowing() { return this.__isShowing; }
        get id() { return this.__id; }
        __id = lib.randomString(6);
        __isShowing = false;
        __hideTimeoutId = -1;
        __toggleHandlers = [];
        __container;
        __contentNode;
        __windowNode;
        __overlayNode;
    }
};
export default navigation;
const or = (...args) => args.some((arg) => arg);
