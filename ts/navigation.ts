import Glasium from './glasium'
import { $, $$ } from './jquery'
import lib from './lib'
import magicDOM from './magic-dom'


interface Component {
    container: HTMLElement,
    tooltip: Tooltip,
    clicker: Clicker
}


const navigation: {
    initialized: boolean,
    container?: HTMLElement,
    navbar?: HTMLElement,
    block: {
        left?: HTMLElement,
        right?: HTMLElement
    },
    tooltip?: HTMLElement & {
        t?: HTMLElement,
        d?: HTMLElement
    },
    underlay?: HTMLElement
    init(containerQuery: string, contentQuery: string): void,
    insert(component: {
        container: HTMLElement,
        [key: string]: any
    }, location: 'left' | 'right', order?: number): void,
    setUnderlay(activate?: boolean): void,
    component: {
        logo({ icon, title }: { icon?: string, title?: string }): Component,
        route(record: Record<string, {
            href: string, icon?: string, tooltip?: {
                title?: string,
                description?: string
            }
        }>): void,
        hamburger(func?: () => void): Component
    },
    Tooltip: {
        new(target: HTMLElement): Tooltip,
        prototype: Tooltip
    },
    Clicker: {
        new(container: HTMLElement, onlyActive?: boolean): Clicker,
        prototype: Clicker,
    }
} = {
    initialized: false,

    container: undefined,

    navbar: undefined,

    block: {
        left: undefined,
        right: undefined
    },

    tooltip: undefined,

    underlay: undefined,


    init(containerQuery: string, contentQuery: string): void {
        if (this.initialized) return
        this.initialized = true


        /** get container */
        const container: HTMLElement = $$(containerQuery)
        this.container = $$(contentQuery)


        /** stylesheet */
        const style: HTMLStyleElement = document.createElement('style')

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
        `

        container.appendChild(style)


        /** initialize nav component */
        this.block.left = magicDOM.createElement('div', { classList: 'nav--left' })
        this.block.right = magicDOM.createElement('div', { classList: 'nav--right' })

        this.tooltip = magicDOM.createTree('div', 'nav__tooltip', {}, {
            t: { classList: 'nav__tooltip__title' },
            d: { classList: 'nav__tooltip__description' }
        })

        this.underlay = magicDOM.createElement('div', { classList: 'nav__underlay' })

        this.navbar = magicDOM.createTree('div', 'nav', {}, {
            left: this.block.left,
            right: this.block.right,
            tooltip: this.tooltip,
            underlay: this.underlay
        })

        container.insertBefore(this.navbar, container.firstChild)
    },


    insert(component: {
        container: HTMLElement,
        [key: string]: any
    }, location: 'left' | 'right', order?: number): void {
        if (!['left', 'right'].includes(location)) return
        if (!this.block[location]) return

        this.block[location]?.append(component.container)

        if (order)
            $(component.container).css('order', order)
    },


    setUnderlay(activate: boolean = false): void {
        if (!this.underlay) return

        this.underlay.classList[activate ? 'add' : 'remove']
            ('nav__underlay--active')
    },


    component: {
        logo({ icon = 'favicon.png', title = 'app name' }: {
            icon?: string,
            title?: string
        } = {}): Component {
            const container: HTMLDivElement & {
                i?: HTMLImageElement,
                t?: HTMLDivElement
            } = magicDOM.createTree('div', 'nav__logo', {}, {
                i: {
                    tag: 'img', classList: 'nav__logo__icon', attribute: {
                        src: icon, alt: 'app logo', loading: 'lazy'
                    }
                },
                t: { classList: 'nav__logo__title', children: title }
            })
            const tooltip: Tooltip = new navigation.Tooltip(container)
            const clicker: Clicker = new navigation.Clicker(container, true)


            navigation.insert({ container }, 'left', 1)


            return {
                container,
                tooltip,
                clicker
            }
        },


        route(record: Record<string, {
            href: string, icon?: string, tooltip?: { title?: string, description?: string }
        }>): void {
            if (!navigation.navbar) return


            /** component */
            const component: { container: HTMLElement } = {
                container: magicDOM.createElement('div', { classList: 'nav__component' })
            }

            const indicator = magicDOM.createElement('div', {
                classList: 'nav__indicator'
            })

            navigation.navbar.appendChild(indicator)


            /** background for routes */
            const isDark: () => boolean = (): boolean => document.body.dataset.theme === 'dark'

            Glasium.init(component.container, {
                color: Glasium.COLOR[isDark() ? 'DARK' : 'WHITESMOKE']
            })

            new MutationObserver((): void => Glasium.init(component.container, {
                color: Glasium.COLOR[isDark() ? 'DARK' : 'WHITESMOKE']
            })).observe(document.body, { attributeFilter: ['data-theme'] })


            /** create routes */
            for (let key in record) {
                let { href, icon, tooltip } = record[key]

                icon = icon ? icon : 'home'
                tooltip = tooltip ? tooltip : { title: '', description: '' }


                /** link */
                const link: HTMLDivElement = magicDOM.createElement('div', {
                    classList: 'nav__link',
                    attribute: { 'data-href': href },
                    children: magicDOM.toHTMLElement(`<i class="fa-solid fa-${icon}"></i>`)
                })

                new navigation.Tooltip(link).set(tooltip)


                /** link's events */
                $(link).on('click', (): void => {
                    if (!navigation.container) return


                    /** loading state */
                    navigation.container.append(magicDOM.toHTMLElement(
                        '<div class="loading--cover"></div>'
                    ))


                    /** indicator and navigate */
                    indicate(link).then((): string =>
                        // the code said it
                        window.location.pathname = link.dataset.href as string
                    )
                })


                /** append link */
                component.container.append(link)
            }


            /** insert */
            navigation.insert(component, 'left', 2)


            /** indicate */
            function indicate(current: HTMLElement): Promise<void> {
                return new Promise<void>((resolve: (value: void | PromiseLike<void>) => void): void => {
                    $('.nav__link--active').removeClass('nav__link--active')
                    $(current).addClass('nav__link--active')

                    const { left, width } = current.getBoundingClientRect()

                    $(indicator).css({
                        left: `${left}px`,
                        width: `${width}px`
                    })

                    window.setTimeout((): void => resolve(), 200)
                })
            }

            const currentLink: HTMLElement | null = document
                .querySelector<HTMLElement>(`.nav__link[data-href="${window.location.pathname}"]`)

            if (!currentLink) return

            setTimeout(indicate, 200, currentLink)
        },


        hamburger(func: () => void = (): void => { /** empty */ }): Component {
            const container: HTMLDivElement = magicDOM.createElement('div', {
                classList: 'nav__hamburger', children: [
                    magicDOM.toHTMLElement(
                        `
                        <div class='nav__hamburger__box'>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        `
                    )
                ]
            })

            const tooltip: Tooltip = new navigation.Tooltip(container)
            const clicker: Clicker = new navigation.Clicker(container)


            clicker.onClick(func)


            navigation.insert({ container }, 'right', 1)


            return {
                container,
                tooltip,
                clicker
            }
        }
    },


    Tooltip: class {
        constructor(target: HTMLElement) {
            if (lib.isMobile) return
            if (!navigation.tooltip) return


            this.container = navigation.tooltip
            if (!this.container) return


            $(target)
                .on('mouseenter', (event: MouseEvent): void => this.show(event))
                .on('mouseleave', (): void => this.hide())
                .on('mousedown', (): void => this.hide())
        }


        title?: string = ''
        description?: string = ''
        flip?: boolean = false

        container?: HTMLElement & {
            t?: HTMLElement,
            d?: HTMLElement
        } = undefined


        set({
            title = '',
            description = '',
            flip = false
        }: {
            title?: string,
            description?: string,
            flip?: boolean
        } = {}): void {
            this.title = title !== '' ? title : this.title
            this.description = description !== '' ? description : this.description
            this.flip = flip
        }


        show({ target }: MouseEvent): void {
            if (
                navigation.underlay &&
                navigation.underlay.classList.contains('nav__underlay--active')
            ) return

            if (!navigation.navbar) return

            if (!(
                this.container &&
                this.container.t &&
                this.container.d
            )) return

            if (this.title === '' || typeof this.title === 'undefined') return


            const { innerWidth } = window
            const { left, right } = (target as HTMLElement).getBoundingClientRect()
            const { width } = this.container.getBoundingClientRect()


            this.container.t.innerText = this.title
            this.container.d.innerText = this.description ? this.description : ''


            $(this.container).css({
                left: this.flip ? null : `${left}px`,
                right: this.flip ? `${innerWidth - right}px` : null,
                textAlign: this.flip || left + width >= innerWidth ? 'right' : 'left'
            })


            $(this.container).addClass('nav__tooltip--active')
            $(navigation.navbar).addClass('nav--decorating')
        }


        hide(): void {
            if (!navigation.navbar) return
            if (!this.container) return


            $(this.container).removeClass('nav__tooltip--active')
            $(navigation.navbar).removeClass('nav--decorating')
        }
    },


    Clicker: class {
        constructor(container: HTMLElement, onlyActive: boolean = false) {
            this.container = container
            this.container.classList.add('nav__clicker')


            $(this.container).on('click', (): void => {
                if (!this.container) return


                if (onlyActive) {
                    for (let f of this.clickHandlers)
                        f(true)

                    this.activated = true
                } else {
                    let isActive: boolean = this.container.dataset.activated === ''

                    for (let f of this.clickHandlers)
                        f(!isActive)

                    this.toggle(isActive)
                }
            })
        }


        container?: HTMLElement = undefined

        clickHandlers: ((...args: any[]) => any)[] = []

        activated: boolean = false


        onClick(func: (...args: any[]) => any): number {
            return this.clickHandlers.push(func)
        }


        offClick(index: number): void {
            if (this.clickHandlers[index])
                this.clickHandlers[index] = (): void => { /** none */ }
        }


        toggle(isActive: boolean = this.activated): void {
            this.activated = !isActive


            if (this.activated) this.show()
            else this.hide()
        }


        show(): void {
            if (!this.container) return

            this.container.dataset.activated = ''
        }


        hide(): void {
            if (!this.container) return

            delete this.container.dataset.activated
        }
    }
}


export default navigation


interface Tooltip {
    title?: string
    description?: string
    flip?: boolean
    container?: HTMLElement & {
        t?: HTMLElement,
        d?: HTMLElement
    }
    set({ title, description, flip }: {
        title?: string,
        description?: string,
        flip?: boolean
    }): void
    show(event: MouseEvent): void
    hide(): void
}


interface Clicker {
    container?: HTMLElement
    clickHandlers: ((...args: any[]) => any)[]
    activated: boolean
    onClick(func: (...args: any[]) => any): number
    offClick(index: number): void
    toggle(isActive?: boolean): void
    show(): void
    hide(): void
}
