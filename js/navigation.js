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
                        window.location.pathname === link.dataset.href)
                        return;
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
            setTimeout(indicate, 200, currentLink);
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
    }
};
export default navigation;
