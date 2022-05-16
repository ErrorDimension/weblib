import { $, $$ } from './jquery';
import Glasium from './glasium';
import lib from './lib';
import magicDOM from './magic-dom';
const navigation = {
    initialized: false,
    container: undefined,
    block: {
        left: undefined,
        right: undefined
    },
    get havingContent() {
        return $$('.nav__underlay').classList.contains('.nav__underlay--active');
    },
    init(query) {
        if (typeof window === 'undefined')
            return;
        if (this.initialized)
            return;
        /** initialize the navigation component */
        this.block.left = magicDOM.createTree('div', 'nav--left', {}, {
            logo: {
                classList: 'nav__component', attribute: { id: 'nav-logo' }, children: {
                    component: {
                        classList: 'nav__logo', children: {
                            icon: {
                                tag: 'img', classList: 'nav__logo__icon', attribute: {
                                    src: 'favicon.png', alt: 'logo', loading: 'lazy'
                                }
                            },
                            boilerplate: { classList: 'nav__logo__title', children: 'logo' }
                        }
                    }
                }
            },
            route: { classList: 'nav__component', attribute: { id: 'nav-route' } }
        });
        this.block.right = magicDOM.createTree('div', 'nav--right', {}, {});
        this.container = magicDOM.createTree('nav', 'nav', { id: 'navigation' }, [
            this.block.left,
            this.block.right,
            magicDOM.toHTMLElement('<div class="nav__indicator"></div>'),
            magicDOM.toHTMLElement(`
            <div class="nav__tip">
                <div class="nav__tip__title"></div>
                <div class="nav__tip__des"></div>
            </div>
            `),
            magicDOM.toHTMLElement('<div class="nav__underlay"></div>'),
        ]);
        $$(query).insertBefore(this.container, $$(query).firstChild);
        /** prevent second run */
        this.initialized = true;
    },
    /** @brief navigation own components */
    route(record = {}) {
        if (typeof window === 'undefined')
            return;
        /** route initializing */
        const route = $$('#nav-route');
        /** current route */
        let current;
        $('a[name]')
            .each(function () {
            if (this.dataset.icon === 'done')
                return;
            /** get properties */
            const key = this.getAttribute('name'); // because the query said it all
            /** primary */
            let { icon, title, description } = record[key] ? record[key] : {
                icon: 'home',
                title: this.getAttribute('href')?.substring(1),
                description: ''
            };
            /** alternative */
            icon = icon ? icon : 'home';
            title = title ? title : this.getAttribute('href')?.substring(1);
            description = description ? description : '';
            /** icon on the anchor component */
            this.append(magicDOM.toHTMLElement(`<i class='fa-solid fa-${icon}'></i>`));
            /** tooltip on the anchor component */
            new navigation.Tooltip(this).set({ title, description });
            /** append */
            route.appendChild(this);
        })
            .on('click', function () {
            /** remove the previous current route */
            current.classList.remove('nav__link--active');
            /** initialize current route */
            current = this;
            current.classList.add('nav__link--active');
            /** rerender the nav indicator */
            indicate();
        })
            .addClass('nav__link')
            .dataset('icon', 'done');
        /** initializing current route */
        current = $$(`.nav__link[href = '${window.location.pathname}']`);
        current.classList.add('nav__link--active');
        /** nav indicator render function */
        function indicate() {
            const { left, width } = current.getBoundingClientRect();
            $('.nav__indicator').css({
                left: `${left}px`,
                width: `${width}px`
            });
        }
        /** starting */
        setTimeout(indicate, 1000);
        /** background and background mutation */
        const background = new Glasium(route, {
            color: Glasium.COLOR[document.body.dataset.theme === 'dark' ? 'DARK' : 'WHITESMOKE']
        });
        new MutationObserver(() => {
            background.change({
                color: Glasium.COLOR[document.body.dataset.theme === 'dark' ? 'DARK' : 'WHITESMOKE']
            });
        }).observe(document.body, { attributeFilter: ['data-theme'] });
    },
    logo({ title = 'logo', src = 'favicon.png' } = {}) {
        $$('.nav__logo__icon').src = src;
        $$('.nav__logo__title').innerText = title;
    },
    /** @brief nav component */
    Tooltip: class {
        constructor(target) {
            if (lib.isMobile)
                return;
            $(target)
                .on('mouseenter', (event) => this.show(event))
                .on('mouseleave', () => this.hide())
                .on('mousedown', () => this.hide());
        }
        title = '';
        description = '';
        flip = false;
        set({ title = '', description = '', flip = false } = {}) {
            this.title = title !== '' ? title : this.title;
            this.description = description !== '' ? description : this.description;
            this.flip = flip;
        }
        show({ target }) {
            if (navigation.havingContent)
                return;
            if (this.title === '' || typeof this.title === 'undefined')
                return;
            const { innerWidth } = window;
            const { left, right } = target.getBoundingClientRect();
            $$('.nav__tip__title').innerHTML = this.title;
            $$('.nav__tip__des').innerHTML = this.description ? this.description : '';
            $('.nav__tip').css({
                left: this.flip ? null : `${left}px`,
                right: this.flip ? `${innerWidth - right}px` : null,
                textAlign: this.flip ? 'right' : 'left'
            });
            $('.nav__tip').addClass('nav__tip--active');
            $('.nav').addClass('nav--has-tip');
        }
        hide() {
            $('.nav__tip').removeClass('nav__tip--active');
            $('.nav').removeClass('nav--has-tip');
        }
    }
};
export default navigation;
