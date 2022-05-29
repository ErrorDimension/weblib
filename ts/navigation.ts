import Glasium from './glasium'
import { $, $$ } from './jquery'
import lib from './lib'
import magicDOM from './magic-dom'


interface Component {
    container: HTMLElement,
    tooltip: Tooltip,
    clicker: Clicker,
    subWindow: SubWindow
}


const navigation: {
    initialized: boolean,
    container?: HTMLElement
    navbar?: HTMLElement
    block: {
        left?: HTMLElement,
        right?: HTMLElement
    }
    tooltip?: HTMLElement & {
        t?: HTMLElement,
        d?: HTMLElement
    }
    underlay?: HTMLElement
    subWindowList: SubWindow[]
    init(containerQuery: string, contentQuery: string): void
    insert(component: {
        container: HTMLElement,
        [key: string]: any
    }, location: 'left' | 'right', order?: number): void
    setUnderlay(activate?: boolean): void
    set loading(loading: boolean)
    account: {
        userToken?: string,
        [key: string]: any
    }
    addComponent: {
        logo({ icon, title, onlyActive }: {
            icon?: string, title?: string, onlyActive?: boolean
        }): Component,
        route(record: Record<string, {
            href: string, icon?: string, tooltip?: {
                title?: string,
                description?: string
            }
        }>, spa?: boolean): void,
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
        if (this.initialized || typeof window === "undefined") return
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

        this.underlay.classList[activate ? 'add' : 'remove']('nav__underlay--active')
    },


    set loading(loading: boolean) {
        if (!this.container) return

        if (loading)
            this.container.append(magicDOM.toHTMLElement('<div class="loading--cover"></div>'))
        else
            this.container.querySelector('.loading--cover')?.remove()
    },


    account: {
        userToken: undefined
    },


    addComponent: {
        logo({ icon = 'favicon.png', title = 'app name', onlyActive = false }: {
            icon?: string
            title?: string
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

            const tooltip: Tooltip = new Tooltip(container)
            const clicker: Clicker = new Clicker(container, onlyActive)
            const subWindow: SubWindow = new SubWindow(container)


            navigation.insert({ container }, 'left', 1)


            return {
                container,
                tooltip,
                clicker,
                subWindow
            }
        },


        route(record: Record<string, {
            href: string, icon?: string, tooltip?: { title?: string, description?: string }
        }>, spa: boolean = false): void {
            if (!navigation.navbar) return


            /** indicator */
            const indicator = magicDOM.createElement('div', {
                classList: 'nav__indicator'
            })

            navigation.navbar.appendChild(indicator)


            /** component */
            const component: { container: HTMLElement } = {
                container: magicDOM.createElement('div', { classList: 'nav__component' })
            }


            /** background for routes */
            Glasium.init(component.container, {
                count: 8,
                onMutation: {
                    callback(): boolean {
                        return document.body.dataset.theme === 'dark'
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
            })


            /** navigation */
            let navigating: boolean = false
            let routes: string[] = []


            /** create routes */
            for (let key in record) {
                let { href, icon, tooltip } = record[key]


                /** specify which route is available */
                routes.push(href)


                /** init info from record */
                icon = icon ? icon : 'home'
                tooltip = tooltip ? tooltip : { title: '', description: '' }


                /** link */
                const link: HTMLElement = spa
                    ? $(`a[data-href='${href}']`)
                        .addClass('nav__link')
                        .append(magicDOM.toHTMLElement(`<i class="fa-solid fa-${icon}"></i>`))[0]
                    : magicDOM.createElement('div', {
                        classList: 'nav__link',
                        attribute: { 'data-href': href },
                        children: magicDOM.toHTMLElement(`<i class="fa-solid fa-${icon}"></i>`)
                    })

                new Tooltip(link).set(tooltip)


                /** link's events */
                $(link).on('click', (): void => {
                    /** 404 and 500 handler */
                    if (!routes.includes(window.location.pathname)) {
                        navigating = true

                        navigation.loading = true
                        indicate(link).then((): void => {
                            // the code said it
                            window.location.pathname = link.dataset.href as string
                        })

                        return
                    }


                    /** needless handler */
                    if (or(
                        window.location.pathname === link.dataset.href, // no need for navigate
                        navigating, // is navigating so return
                        spa // spa doesn't need more
                    )) {
                        indicate(link)

                        return
                    }


                    /** indicator and navigate */
                    navigating = true

                    navigation.loading = true
                    indicate(link).then((): void => {
                        /** the code said it */
                        window.location.pathname = link.dataset.href as string
                    })
                })


                /** append link */
                component.container.append(link)
            }


            /** insert */
            navigation.insert(component, 'left', 2)


            /** indicate and initial indication */
            function indicate(current: HTMLElement): Promise<void> {
                return new Promise<void>((resolve: (value: void | PromiseLike<void>) => void): void => {
                    $('.nav__link--active').removeClass('nav__link--active')
                    $(current).addClass('nav__link--active')


                    const { left, width } = current.getBoundingClientRect()

                    $(indicator).css({
                        left: `${left}px`,
                        width: `${width}px`
                    })


                    window.setTimeout(resolve, 200)
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

            const tooltip: Tooltip = new Tooltip(container)
            const clicker: Clicker = new Clicker(container)
            const subWindow: SubWindow = new SubWindow(container)

            if (func) clicker.onClick(func)


            navigation.insert({ container }, 'right', 1)


            return {
                container,
                tooltip,
                clicker,
                subWindow
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

            const tooltip: Tooltip = new Tooltip(container)
            const clicker: Clicker = new Clicker(container, alwaysActive)
            const subWindow: SubWindow = new SubWindow(container)

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
                subWindow,


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
            const subWindow: SubWindow = new SubWindow(container)

            clicker.onClick((): void => subWindow.toggle())


            /** background color */
            Glasium.change(container, {
                color: Glasium.COLOR.RED // because initially button is whitesmoke
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
}



export class Tooltip {
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


    private title?: string = ''
    private description?: string = ''
    private flip?: boolean = false

    private container?: HTMLElement & {
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
}


export class Clicker {
    constructor(container: HTMLElement, onlyActive: boolean = false) {
        this.container = container
        this.container.classList.add('nav__clicker')


        if (onlyActive) $(container).dataset('activated', '')


        /** handle click event */
        const clickBox: HTMLElement = magicDOM.createElement('div', { classList: 'nav__clicker__box' })
        this.container.append(clickBox)

        $(clickBox).on('click', (): void => {
            if (!this.container) return


            if (onlyActive) {
                for (let f of this.clickHandlers)
                    f(true)

                this.__activated = true
            } else {
                let isActive: boolean = this.container.dataset.activated === ''

                for (let f of this.clickHandlers)
                    f(!isActive)

                this.toggle(isActive)
            }
        })
    }


    private container?: HTMLElement = undefined

    private clickHandlers: ((...args: any[]) => any)[] = []

    private __activated: boolean = false

    get activated(): boolean { return this.__activated }


    onClick(func: (...args: any[]) => any): number {
        return this.clickHandlers.push(func)
    }


    offClick(index: number): void {
        if (this.clickHandlers[index])
            this.clickHandlers[index] = (): void => { /** none */ }
    }


    toggle(isActive: boolean = this.__activated): void {
        this.__activated = !isActive


        if (this.__activated) this.show()
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
}


export class SubWindow {
    constructor(
        container: HTMLElement,
        content: HTMLElement | string = 'blank'
    ) {
        /** initialize the html */
        this.__container = container

        this.__windowNode = magicDOM.createElement('div', {
            classList: [
                'nav__sub-window',
                'nav__sub-window--deactivated'
            ],
            attribute: { 'data-id': this.__id }
        })

        this.__overlayNode = magicDOM.createElement('div', {
            classList: 'nav__sub-window__overlay',
            children: magicDOM.toHTMLElement(`<div class="loading--cover"></div>`)
        })

        this.__contentNode = magicDOM.createElement('div', {
            classList: 'nav__sub-window__content'
        })

        this.content = content

        this.__windowNode.append(this.__contentNode, this.__overlayNode)
        this.__container.append(this.__windowNode)


        /** list */
        navigation.subWindowList.push(this)


        /** observer */
        new ResizeObserver((): void => this.update()).observe(this.__contentNode)
        new ResizeObserver((): void => this.update()).observe(this.__container)

        $(window).on('resize', (): void => this.update())
    }


    update(): void {
        lib.cssFrame((): void => {
            if (!(this.__contentNode && this.__windowNode && navigation.container && this.__container)) return


            const { clientWidth } = navigation.container


            let height: number = this.__isShowing ? this.__contentNode.offsetHeight : 0
            $(this.__windowNode).css('--height', `${height}px`)


            let rect: DOMRect = this.__container.getBoundingClientRect()
            let width: number = this.__contentNode.offsetWidth


            if (width - rect.right < 0)
                this.__windowNode.dataset.align = 'right'
            else if (rect.left + width < clientWidth)
                this.__windowNode.dataset.align = 'left'
            else {
                this.__windowNode.dataset.align = 'expanded'
                $(this.__windowNode).css({
                    '--width': `${clientWidth}px`,
                    '--left': rect.left
                })

                return
            }


            $(this.__windowNode).css('--width', `${width}px`)
        })
    }


    show(): void {
        if (!(this.__windowNode && this.__container)) return


        window.clearTimeout(this.__hideTimeoutId)


        for (let item of navigation.subWindowList)
            if (item.id !== this.__id)
                item.hide(false)


        navigation.setUnderlay(true)


        this.update()


        $(this.__windowNode)
            .addClass('nav__sub-window--activated')
            .removeClass('nav__sub-window--deactivated')

        $(this.__container)
            .dataset('swActivated', '')


        this.__isShowing = true


        this.update()
    }


    hide(trusted: boolean = true): void {
        if (!(this.__windowNode && this.__container)) return


        window.clearTimeout(this.__hideTimeoutId)


        if (trusted) navigation.setUnderlay(false)


        this.__windowNode.classList.remove('nav__sub-window--activated')
        this.__container.classList.remove('nav__sub-window__container--activated')

        $(this.__container)
            .dataset('swActivated', null)


        this.__isShowing = false


        this.update()


        this.__hideTimeoutId = window.setTimeout((): void => {
            if (!this.__windowNode) return

            this.__windowNode.classList.add('nav__sub-window--deactivated')
        }, 300)
    }


    toggle(): void {
        this.__isShowing ? this.hide() : this.show()


        this.__toggleHandlers.forEach((handler: (...args: any[]) => any): void => {
            handler(this.__isShowing)
        })
    }


    onToggle(func: (...args: any[]) => any): void {
        this.__toggleHandlers.push(func)
    }


    set loaded(loaded: boolean) {
        if (!this.__overlayNode) return


        $(this.__overlayNode).css('display', loaded ? 'none' : 'block')
    }


    set content(content: HTMLElement | string) {
        if (!this.__contentNode) return


        magicDOM.emptyNode(this.__contentNode)


        this.__contentNode.append(content)

        this.update()
    }


    get isShowing(): boolean { return this.__isShowing }


    get id(): string { return this.__id }


    private __id: string = lib.randomString(6)
    private __isShowing: boolean = false
    private __hideTimeoutId: number = -1

    private __toggleHandlers: ((...args: any[]) => any)[] = []

    private __container?: HTMLElement
    private __contentNode?: HTMLElement
    private __windowNode?: HTMLElement
    private __overlayNode?: HTMLElement
}


export default navigation


const or: (...args: any[]) => boolean = (...args: any[]): boolean => args.some((arg: any): any => arg)
