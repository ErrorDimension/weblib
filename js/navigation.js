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
        if (!(this.container && this.container.underlay))
            return false;
        return this.container.underlay.classList.contains('.nav__underlay--active');
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
        this.container = magicDOM.createTree('nav', 'nav', { id: 'navigation' }, {
            left: this.block.left,
            right: this.block.right,
            indicator: magicDOM.toHTMLElement('<div class="nav__indicator"></div>'),
            tooltip: magicDOM.createTree('div', 'nav__tooltip', {}, {
                t: { classList: 'nav__tooltip__title' },
                d: { classList: 'nav__tooltip__description' }
            })
        });
        $$(query).insertBefore(this.container, $$(query).firstChild);
        /** prevent second run */
        this.initialized = true;
    },
    component: {
        logo({ title = 'logo', src = 'favicon.png' } = {}) {
            $$('.nav__logo__icon').src = src;
            $$('.nav__logo__title').innerText = title;
        },
        route(record = {}) {
            /** route initializing */
            const route = $$('#nav-route');
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
                /** icon on the anchor component */
                this.append(magicDOM.toHTMLElement(`<i class='fa-solid fa-${icon}'></i>`));
                /** tooltip on the anchor component */
                new navigation.Tooltip(this).set({ title, description });
                /** append */
                route.appendChild(this);
            })
                .on('click', function () {
                if (!lib.urlExists(window.location.pathname))
                    window.location.pathname = this.href.split('/').pop();
                /** remove active class from previous navigation */
                $('.nav__link--active').removeClass('.nav__link--active');
                /** rerender the nav indicator */
                indicate(this);
            }, { passive: true })
                .addClass('nav__link')
                .dataset('icon', 'done');
            /** nav indicator render function */
            function indicate(current) {
                if (!current)
                    return;
                const { left, width } = current.getBoundingClientRect();
                /** active this navigation */
                $(current).addClass('nav__link--active');
                $('.nav__indicator').css({
                    left: `${left}px`,
                    width: `${width}px`
                });
            }
            /** starting */
            setTimeout(indicate, 1000, document
                .querySelector(`.nav__link[href="${window.location.pathname}"]`));
            /** background and background mutation */
            Glasium.init(route, {
                color: Glasium.COLOR[document.body.dataset.theme === 'dark' ? 'DARK' : 'WHITESMOKE']
            });
            new MutationObserver(() => {
                Glasium.change(route, {
                    color: Glasium.COLOR[document.body.dataset.theme === 'dark' ? 'DARK' : 'WHITESMOKE']
                });
            }).observe(document.body, { attributeFilter: ['data-theme'] });
        },
    },
    Tooltip: class {
        constructor(target) {
            if (lib.isMobile)
                return;
            if (!navigation.container)
                return;
            this.container = navigation.container.tooltip;
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
            if (navigation.havingContent)
                return;
            if (!(this.container && this.container.t && this.container.d))
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
            $(navigation.container).addClass('nav--has-tooltip');
        }
        hide() {
            if (!this.container)
                return;
            $(this.container).removeClass('nav__tooltip--active');
            $(navigation.container).removeClass('nav--has-tooltip');
        }
    }
};
export default navigation;
