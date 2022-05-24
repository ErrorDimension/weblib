import Glasium from './glasium'
import { $, $$ } from './jquery'
import lib from './lib'
import magicDOM from './magic-dom'


interface Component {
    container: HTMLElement,
    tooltip: Tooltip,
    clicker: Clicker,
    subWindow?: SubWindow
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
    subWindowList: SubWindow[],
    init(containerQuery: string, contentQuery: string): void,
    insert(component: {
        container: HTMLElement,
        [key: string]: any
    }, location: 'left' | 'right', order?: number): void,
    setUnderlay(activate?: boolean): void,
    addComponent: {
        logo({ icon, title, onlyActive }: {
            icon?: string, title?: string, onlyActive?: boolean
        }): Component,
        route(record: Record<string, {
            href: string, icon?: string, tooltip?: {
                title?: string,
                description?: string
            }
        }>): void,
        hamburger(func?: () => void): Component,
        button({ icon, image, colorName, alwaysActive, brightnessLevel, func, text }: {
            icon?: string,
            image?: string,
            colorName?: string,
            alwaysActive?: boolean,
            brightnessLevel?: string,
            func?: (...args: any[]) => any,
            text?: string,
        }): Component & {
            set icon(icon: string)
            set image(src: string)
        },
        account(): Component & {
            set avatar(src: string)
            set userName(userName: string)
            set background(colorName: string)
        }
    },
    Tooltip: {
        new(target: HTMLElement): Tooltip,
        prototype: Tooltip
    },
    Clicker: {
        new(container: HTMLElement, onlyActive?: boolean): Clicker,
        prototype: Clicker,
    },
    SubWindow: {
        new(
            container: HTMLElement,
            content?: HTMLElement | string,
            color?: string
        ): SubWindow,
        prototype: SubWindow
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

    subWindowList: [],


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


        /** events */
        $(this.underlay).on('click', (): void => {
            for (let item of this.subWindowList)
                if (item.isShowing)
                    item.hide(false)


            this.setUnderlay(false)
        })
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


    addComponent: {
        logo({ icon = 'favicon.png', title = 'app name', onlyActive = false }: {
            icon?: string,
            title?: string,
            onlyActive?: boolean
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
            const clicker: Clicker = new navigation.Clicker(container, onlyActive)


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


            /** indicator */
            const indicator = magicDOM.createElement('div', {
                classList: 'nav__indicator'
            })

            navigation.navbar.appendChild(indicator)


            /** background for routes */
            const isDark: () => boolean = (): boolean => document.body.dataset.theme === 'dark'

            const color: () => string = (): string => isDark() ? 'DARK' : 'WHITESMOKE'
            const brightness: () => string = (): string => isDark() ? 'DARK' : 'LIGHT'

            Glasium.init(component.container, {
                color: Glasium.COLOR[color()],
                brightness: Glasium.BRIGHTNESS[brightness()]
            })

            new MutationObserver((): void => Glasium.change(component.container, {
                color: Glasium.COLOR[color()],
                brightness: Glasium.BRIGHTNESS[brightness()]
            })).observe(document.body, { attributeFilter: ['data-theme'] })


            /** navigation */
            let navigating: boolean = false


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
                    if (
                        !navigation.container ||
                        window.location.pathname === link.dataset.href ||
                        navigating
                    ) return

                    navigating = true


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

            window.setTimeout(indicate, 200, currentLink)
        },


        hamburger(func: (() => void) | undefined = undefined): Component {
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


            if (func) clicker.onClick(func)


            navigation.insert({ container }, 'right', 1)


            return {
                container,
                tooltip,
                clicker
            }
        },


        button({
            icon = 'code',
            image = undefined,
            colorName = 'BLUE',
            brightnessLevel = 'OTHER',
            alwaysActive = false,
            text = undefined,
            func = undefined
        }: {
            icon?: string,
            image?: string,
            colorName?: string,
            brightnessLevel?: string,
            alwaysActive?: boolean,
            text?: string,
            func?: (...args: any[]) => any
        } = {}): Component & {
            set icon(icon: string)
            set image(src: string)
        } {
            const container: HTMLSpanElement = magicDOM.createElement('span', {
                classList: ['nav__component', 'nav__button'],
            })

            const tooltip: Tooltip = new navigation.Tooltip(container)

            const clicker: Clicker = new navigation.Clicker(container, alwaysActive)

            if (func) clicker.onClick(func)


            navigation.insert({ container }, 'right', 3)


            Glasium.init(container, {
                count: 8,
                color: Glasium.COLOR[colorName], brightness: Glasium.BRIGHTNESS[brightnessLevel]
            })


            if (!image)
                container.append(magicDOM.toHTMLElement(
                    `<i class='fa-solid fa-${icon}'></i>`
                ))


            if (image)
                container.append(magicDOM.toHTMLElement(
                    `<img src='${image}' loading='lazy'></img>`
                ))


            if (text) {
                container.dataset.text = ''
                container.append(magicDOM.toHTMLElement(
                    `<div class='nav__button__text'>${text}</div>`
                ))
            }


            return {
                container,
                tooltip,
                clicker,


                set icon(iconName: string) {
                    $('i', this.container).remove()
                    $('img', this.container).remove()
                    this.container.append(magicDOM.toHTMLElement(
                        `<i class='fa-solid fa-${iconName}'></i>`)
                    )
                },


                set image(src: string) {
                    $('i', this.container).remove()

                    if (this.container.querySelector('img')) {
                        $$<HTMLImageElement>('img', this.container).src = src
                        return
                    }

                    this.container.append(magicDOM.toHTMLElement(
                        `<img src='${src}' loading='lazy'></img>`)
                    )
                }
            }
        },


        account(): Component & {
            set avatar(src: string)
            set userName(userName: string)
            set background(colorName: string)
        } {
            const button: Component & {
                set icon(iconName: string)
                set image(src: string)
            } = this.button({
                text: 'guest',
                image: 'guest.png'
            })

            const { container, tooltip, clicker } = button
            const subWindow: SubWindow = new navigation.SubWindow(container)


            /** pre produced account section */
            new Promise<void>((res): void => {
                subWindow.content = magicDOM.toHTMLElement(
                    `
                    <div class='s-account'>
                        Guest
                        <div>
                            <img src='guest.png' loading='lazy' />
                            <span>guest user</span>
                        </div>
                    </div>
                    `
                )


                Glasium.init($$('.s-account div'), {
                    color: Glasium.COLOR.LIGHTBLUE,
                    brightness: Glasium.BRIGHTNESS.LIGHT,
                    count: 28,
                    scale: 6
                })

                Glasium.change(container, {
                    color: Glasium.COLOR.RED
                })


                res()
            }).then((): void => {
                subWindow.loaded = true
            })


            return {
                container,
                tooltip,
                clicker,
                subWindow,


                set avatar(src: string) {
                    button.image = src
                },


                set userName(userName: string) {
                    $$('.nav__button__text').innerText = userName
                },


                set background(colorName: string) {
                    colorName = colorName.toUpperCase()

                    Glasium.change(this.container, {
                        color: Glasium.COLOR[colorName]
                    })
                }
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


            if (onlyActive) $(container).dataset('activated', '')


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
            if (!this.clickHandlers.length) return

            this.container.dataset.activated = ''
        }


        hide(): void {
            if (!this.container) return

            delete this.container.dataset.activated
        }
    },


    SubWindow: class {
        constructor(
            container: HTMLElement,
            content: HTMLElement | string = 'blank'
        ) {
            /** initialize the html */
            this.#container = container

            this.#windowNode = magicDOM.createElement('div', {
                classList: [
                    'nav__sub-window',
                    'nav__sub-window--deactivated'
                ],
                attribute: { 'data-id': this.#id }
            })

            this.#overlayNode = magicDOM.createElement('div', {
                classList: 'nav__sub-window__overlay',
                children: magicDOM.toHTMLElement(`<div class="loading--cover"></div>`)
            })

            this.#contentNode = magicDOM.createElement('div', {
                classList: 'nav__sub-window__content'
            })

            this.content = content

            this.#windowNode.append(this.#contentNode, this.#overlayNode)
            this.#container.append(this.#windowNode)


            /** list */
            navigation.subWindowList.push(this)


            /** observer */
            new ResizeObserver((): void => this.update()).observe(this.#contentNode)
            new ResizeObserver((): void => this.update()).observe(this.#container)

            $(window).on('resize', (): void => this.update())


            /** events */
            $(this.#container).on('click', ({ target }: MouseEvent): void => {
                if ((target as HTMLElement).matches('.nav__sub-window *')) return

                this.toggle()
            })
        }


        update(): void {
            lib.cssFrame((): void => {
                if (!(this.#contentNode && this.#windowNode)) return


                const { innerWidth } = window


                let height: number = this.#isShowing ? this.#contentNode.offsetHeight : 0
                $(this.#windowNode).css('--height', `${height}px`)


                if (this.#isShowing) {
                    if (!(this.#container && this.#windowNode)) return


                    let rect: DOMRect = this.#container.getBoundingClientRect()
                    let width: number = this.#contentNode.offsetWidth


                    if (width - rect.right < 0)
                        this.#windowNode.dataset.align = 'right'
                    else if (rect.left + width < innerWidth)
                        this.#windowNode.dataset.align = 'left'
                    else {
                        this.#windowNode.dataset.align = 'expanded'
                        $(this.#windowNode).css('--width', null)
                        return
                    }


                    $(this.#windowNode).css('--width', `${width}px`)
                }
            })
        }


        show(): void {
            if (!(this.#windowNode && this.#container)) return


            window.clearTimeout(this.#hideTimeoutId)


            for (let item of navigation.subWindowList)
                if (item.id !== this.#id)
                    item.hide(false)


            navigation.setUnderlay(true)


            this.update()


            $(this.#windowNode)
                .addClass('nav__sub-window--activated')
                .removeClass('nav__sub-window--deactivated')

            $(this.#container)
                .dataset('swActivated', '')


            this.#isShowing = true


            this.update()
        }


        hide(trusted: boolean = true): void {
            if (!(this.#windowNode && this.#container)) return


            window.clearTimeout(this.#hideTimeoutId)


            if (trusted) navigation.setUnderlay(false)


            this.#windowNode.classList.remove('nav__sub-window--activated')
            this.#container.classList.remove('nav__sub-window__container--activated')

            $(this.#container)
                .dataset('swActivated', null)


            this.#isShowing = false


            this.update()


            this.#hideTimeoutId = window.setTimeout((): void => {
                if (!this.#windowNode) return

                this.#windowNode.classList.add('nav__sub-window--deactivated')
            }, 300)
        }


        toggle(): void {
            this.#isShowing ? this.hide() : this.show()


            this.#toggleHandlers.forEach((handler: (...args: any[]) => any): void => {
                handler(this.#isShowing)
            })
        }


        onToggle(func: (...args: any[]) => any): void {
            this.#toggleHandlers.push(func)
        }


        set loaded(loaded: boolean) {
            if (!this.#overlayNode) return


            $(this.#overlayNode).css('display', loaded ? 'none' : 'block')
        }


        set content(content: HTMLElement | string) {
            if (!this.#contentNode) return


            magicDOM.emptyNode(this.#contentNode)


            this.#contentNode.append(content)
        }


        get isShowing(): boolean { return this.#isShowing }


        get id(): string { return this.#id }


        #id: string = lib.randomString(6)
        #isShowing: boolean = false
        #hideTimeoutId: number = -1

        #toggleHandlers: ((...args: any[]) => any)[] = []

        #container?: HTMLElement
        #contentNode?: HTMLElement
        #windowNode?: HTMLElement
        #overlayNode?: HTMLElement
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


interface SubWindow {
    readonly id: string
    readonly isShowing: boolean
    set loaded(loaded: boolean)
    set content(content: HTMLElement | string)
    show(): void
    hide(trusted?: boolean): void
    update(): void
    toggle(): void
    onToggle(func: (...args: any[]) => any): void
}
