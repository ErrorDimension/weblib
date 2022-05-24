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
        if (this.initialized)
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
        route(record) {
            if (!navigation.navbar)
                return;
            /** component */
            const component = {
                container: magicDOM.createElement('div', { classList: 'nav__component' })
            };
            /** indicator */
            const indicator = magicDOM.createElement('div', {
                classList: 'nav__indicator'
            });
            navigation.navbar.appendChild(indicator);
            /** background for routes */
            const isDark = () => document.body.dataset.theme === 'dark';
            const color = () => isDark() ? 'DARK' : 'WHITESMOKE';
            const brightness = () => isDark() ? 'DARK' : 'LIGHT';
            Glasium.init(component.container, {
                color: Glasium.COLOR[color()],
                brightness: Glasium.BRIGHTNESS[brightness()]
            });
            new MutationObserver(() => Glasium.change(component.container, {
                color: Glasium.COLOR[color()],
                brightness: Glasium.BRIGHTNESS[brightness()]
            })).observe(document.body, { attributeFilter: ['data-theme'] });
            /** navigation */
            let navigating = false;
            /** create routes */
            for (let key in record) {
                let { href, icon, tooltip } = record[key];
                icon = icon ? icon : 'home';
                tooltip = tooltip ? tooltip : { title: '', description: '' };
                /** link */
                const link = magicDOM.createElement('div', {
                    classList: 'nav__link',
                    attribute: { 'data-href': href },
                    children: magicDOM.toHTMLElement(`<i class="fa-solid fa-${icon}"></i>`)
                });
                new navigation.Tooltip(link).set(tooltip);
                /** link's events */
                $(link).on('click', () => {
                    if (!navigation.container ||
                        window.location.pathname === link.dataset.href ||
                        navigating)
                        return;
                    navigating = true;
                    /** loading state */
                    navigation.container.append(magicDOM.toHTMLElement('<div class="loading--cover"></div>'));
                    /** indicator and navigate */
                    indicate(link).then(() => 
                    // the code said it
                    window.location.pathname = link.dataset.href);
                });
                /** append link */
                component.container.append(link);
            }
            /** insert */
            navigation.insert(component, 'left', 2);
            /** indicate */
            function indicate(current) {
                return new Promise((resolve) => {
                    $('.nav__link--active').removeClass('nav__link--active');
                    $(current).addClass('nav__link--active');
                    const { left, width } = current.getBoundingClientRect();
                    $(indicator).css({
                        left: `${left}px`,
                        width: `${width}px`
                    });
                    window.setTimeout(() => resolve(), 200);
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
        button({ icon = 'code', colorName = 'BLUE', brightnessLevel = 'OTHER', alwaysActive = false, func = undefined } = {}) {
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
            container.append(magicDOM.toHTMLElement(`<i class='fa-solid fa-${icon}'></i>`));
            return {
                container,
                tooltip,
                clicker,
                set icon(iconName) {
                    $('i', this.container).remove();
                    this.container.append(magicDOM.toHTMLElement(`<i class='fa-solid fa-${iconName}'></i>`));
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
            this.#container = container;
            this.#windowNode = magicDOM.createElement('div', {
                classList: [
                    'nav__sub-window',
                    'nav__sub-window--deactivated'
                ],
                attribute: { 'data-id': this.#id }
            });
            this.#overlayNode = magicDOM.createElement('div', {
                classList: 'nav__sub-window__overlay',
                children: magicDOM.toHTMLElement(`<div class="loading--cover"></div>`)
            });
            this.#contentNode = magicDOM.createElement('div', {
                classList: 'nav__sub-window__content'
            });
            this.content = content;
            this.#windowNode.append(this.#overlayNode, this.#contentNode);
            this.#container.append(this.#windowNode);
            /** list */
            navigation.subWindowList.push(this);
            /** observer */
            new ResizeObserver(() => this.update()).observe(this.#contentNode);
            new ResizeObserver(() => this.update()).observe(this.#container);
            /** events */
            $(this.#container).on('click', ({ target }) => {
                if (target != this.#container)
                    return;
                this.toggle();
            });
        }
        update() {
            if (!(this.#contentNode && this.#windowNode))
                return;
            let height = this.#isShowing ? this.#contentNode.offsetHeight : 0;
            $(this.#windowNode).css('--height', `${height}px`);
            if (this.#isShowing) {
                if (!(this.#container && this.#windowNode))
                    return;
                let rect = this.#container.getBoundingClientRect();
                let width = this.#contentNode.offsetWidth;
                if (rect.left + rect.width / 2 + width / 2 < window.innerWidth &&
                    rect.left + rect.width / 2 > width / 2)
                    this.#windowNode.dataset.align = 'center';
                else if (width + rect.left > window.innerWidth)
                    this.#windowNode.dataset.align = 'right';
                else if (rect.left + width < window.innerWidth)
                    this.#windowNode.dataset.align = 'left';
                else {
                    this.#windowNode.dataset.align = 'expanded';
                    $(this.#windowNode).css('--width', null);
                    return;
                }
                $(this.#windowNode).css('--width', `${width}px`);
            }
        }
        show() {
            if (!(this.#windowNode && this.#container))
                return;
            window.clearTimeout(this.#hideTimeoutId);
            for (let item of navigation.subWindowList)
                if (item.id !== this.#id)
                    item.hide(false);
            navigation.setUnderlay(true);
            this.update();
            $(this.#windowNode)
                .addClass('nav__sub-window--activated')
                .removeClass('nav__sub-window--deactivated');
            $(this.#container)
                .dataset('swActivated', '');
            this.#isShowing = true;
        }
        hide(trusted = true) {
            if (!(this.#windowNode && this.#container))
                return;
            window.clearTimeout(this.#hideTimeoutId);
            if (trusted)
                navigation.setUnderlay(false);
            this.#windowNode.classList.remove('nav__sub-window--activated');
            this.#container.classList.remove('nav__sub-window__container--activated');
            $(this.#container)
                .dataset('swActivated', null);
            this.#isShowing = false;
            this.update();
            this.#hideTimeoutId = window.setTimeout(() => {
                if (!this.#windowNode)
                    return;
                this.#windowNode.classList.add('nav__sub-window--deactivated');
            }, 300);
        }
        toggle() {
            this.#isShowing ? this.hide() : this.show();
            this.#toggleHandlers.forEach((handler) => {
                handler(this.#isShowing);
            });
        }
        onToggle(func) {
            this.#toggleHandlers.push(func);
        }
        set loaded(loaded) {
            if (!this.#overlayNode)
                return;
            $(this.#overlayNode).css('display', loaded ? 'none' : 'block');
        }
        set content(content) {
            if (!this.#contentNode)
                return;
            magicDOM.emptyNode(this.#contentNode);
            this.#contentNode.append(content);
        }
        get isShowing() { return this.#isShowing; }
        get id() { return this.#id; }
        #id = lib.randomString(6);
        #isShowing = false;
        #hideTimeoutId = -1;
        #toggleHandlers = [];
        #container;
        #contentNode;
        #windowNode;
        #overlayNode;
    }
};
export default navigation;
