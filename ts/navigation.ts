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


interface AccountComponent extends Component {
    set avatar(src: string)
    set userName(userName: string)
    set background(colorName: string)
}


interface ButtonComponent extends Component {
    set icon(icon: string)
    set image(src: string)
}


interface Navigation {
    initialized: boolean
    container: HTMLElement | undefined
    navbar: HTMLElement | undefined
    block: {
        left: HTMLElement | undefined,
        right: HTMLElement | undefined
    }
    tooltip: (HTMLElement & {
        t?: HTMLElement,
        d?: HTMLElement
    }) | undefined
    underlay: HTMLElement | undefined
    subWindowList: SubWindow[]
    init(containerQuery: string, contentQuery: string): void
    insert(component: {
        container: HTMLElement,
        [key: string]: any
    }, location: 'left' | 'right', order?: number): void
    setUnderlay(activate?: boolean): void
    set loading(loading: boolean)
    account: {
        userToken: string | undefined,
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
        button({ icon, imageSrc, colorName, alwaysActive, brightnessLevel, func, text }: {
            icon?: string,
            imageSrc?: string,
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
}


/** {@linkcode Navigation} */
const navigation: Navigation = {
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
        const container: HTMLElement | null = $$(containerQuery)
        if (!container) return

        const con: HTMLElement | null = $$(contentQuery)
        if (!con) return

        this.container = con


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
        /** {@linkcode Component} */
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
            const indicator: HTMLDivElement = magicDOM.createElement('div', {
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
                const link: HTMLElement = makeLink(href, icon, spa)


                /** link's events */
                $(link).on('click', (): void => {
                    /** 404 and 500 handler */
                    if (!routes.includes(window.location.pathname)) {
                        navigating = true

                        navigation.loading = true
                        indicate(link).then((): void => {
                            // the code said it
                            window.location.pathname = link.dataset.href!
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
                        window.location.pathname = link.dataset.href!
                    })
                })


                /** link tooltip */
                new Tooltip(link).set(tooltip)


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


        /** {@linkcode Component} */
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


        /** {@linkcode ButtonComponent} */
        button({
            icon = 'code',
            imageSrc = undefined,
            colorName = 'BLUE',
            brightnessLevel = 'OTHER',
            alwaysActive = false,
            text = undefined,
            func = undefined
        }: {
            icon?: string,
            imageSrc?: string,
            colorName?: string,
            brightnessLevel?: string,
            alwaysActive?: boolean,
            text?: string,
            func?: (...args: any[]) => any
        } = {}): ButtonComponent {
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
                color: Glasium.COLOR[colorName.toUpperCase()],
                brightness: Glasium.BRIGHTNESS[brightnessLevel.toUpperCase()]
            })


            container.append(magicDOM.toHTMLElement(
                imageSrc
                    ? `<img src='${imageSrc}' loading='lazy'></img>`
                    : `<i class='fa-solid fa-${icon}'></i>`
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
                        const currentImage: HTMLImageElement | null = $$<HTMLImageElement>('img', this.container)
                        if (!currentImage) return

                        currentImage.src = src
                        return
                    }


                    this.container.append(magicDOM.toHTMLElement(
                        `<img src='${src}' loading='lazy'></img>`)
                    )
                }
            }
        },


        /** {@linkcode AccountComponent} */
        account(): AccountComponent {
            const button: Component & {
                set icon(iconName: string)
                set image(src: string)
            } = this.button({
                text: 'guest',
                imageSrc: 'guest.png',
                colorName: 'red'
            })

            const { container, tooltip, clicker } = button
            const subWindow: SubWindow = new SubWindow(container)

            clicker.onClick((): void => subWindow.toggle())


            return {
                container,
                tooltip,
                clicker,
                subWindow,


                set avatar(src: string) {
                    button.image = src
                },


                set userName(userName: string) {
                    $$('.nav__button__text')!.innerText = userName
                },


                set background(colorName: string) {
                    Glasium.change(this.container, {
                        color: Glasium.COLOR[colorName.toUpperCase()]
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


    /** props */
    private title: string = ''
    private description: string = ''
    private flip: boolean = false


    /** component */
    private container?: HTMLElement & {
        t?: HTMLElement,
        d?: HTMLElement
    }


    set({
        title = '',
        description = '',
        flip = false
    }: {
        title?: string,
        description?: string,
        flip?: boolean
    } = {}): void {
        this.title = title
        this.description = description
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

        if (this.title === '') return


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
        if (!(navigation.navbar && this.container)) return


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


    /** component */
    private container: HTMLElement


    /** handler collection */
    private clickHandlers: ((...args: any[]) => any)[] = []


    /** props */
    private __activated: boolean = false


    /** prop getters */
    get activated(): boolean { return this.__activated }


    /** public functions */
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
        if (this.clickHandlers.length === 0) return

        this.container.dataset.activated = ''
    }


    hide(): void {
        delete this.container.dataset.activated
    }
}


export class SubWindow {
    constructor(
        container: HTMLElement,
        content: HTMLElement | string = 'blank'
    ) {
        /** initialize the html */
        this.container = container

        this.windowNode = magicDOM.createElement('div', {
            classList: [
                'nav__sub-window',
                'nav__sub-window--deactivated'
            ],
            attribute: { 'data-id': this.__id }
        })

        this.overlayNode = magicDOM.createElement('div', {
            classList: 'nav__sub-window__overlay',
            children: magicDOM.toHTMLElement(`<div class="loading--cover"></div>`)
        })

        this.contentNode = magicDOM.createElement('div', {
            classList: 'nav__sub-window__content'
        })

        this.content = content

        this.windowNode.append(this.contentNode, this.overlayNode)
        this.container.append(this.windowNode)


        /** list */
        navigation.subWindowList.push(this)


        /** observer */
        new ResizeObserver((): void => this.update()).observe(this.contentNode)
        new ResizeObserver((): void => this.update()).observe(this.container)

        $(window).on('resize', (): void => this.update())
    }


    /** public functions */
    update(): void {
        lib.cssFrame((): void => {
            if (!navigation.container) return


            const { clientWidth } = navigation.container


            let height: number = this.__isShowing ? this.contentNode.offsetHeight : 0
            $(this.windowNode).css('--height', `${height}px`)


            let rect: DOMRect = this.container.getBoundingClientRect()
            let width: number = this.contentNode.offsetWidth


            if (width - rect.right < 0)
                this.windowNode.dataset.align = 'right'
            else if (rect.left + width < clientWidth)
                this.windowNode.dataset.align = 'left'
            else {
                this.windowNode.dataset.align = 'expanded'
                $(this.windowNode).css({
                    '--width': `${clientWidth}px`,
                    '--left': rect.left
                })

                return
            }


            $(this.windowNode).css('--width', `${width}px`)
        })
    }


    show(): void {
        window.clearTimeout(this.__hideTimeoutId)


        for (let item of navigation.subWindowList)
            if (item.id !== this.__id)
                item.hide(false)


        navigation.setUnderlay(true)


        this.update()


        $(this.windowNode)
            .addClass('nav__sub-window--activated')
            .removeClass('nav__sub-window--deactivated')

        $(this.container)
            .dataset('swActivated', '')


        this.__isShowing = true


        this.update()
    }


    hide(trusted: boolean = true): void {
        window.clearTimeout(this.__hideTimeoutId)


        if (trusted) navigation.setUnderlay(false)


        this.windowNode.classList.remove('nav__sub-window--activated')
        this.container.classList.remove('nav__sub-window__container--activated')

        $(this.container)
            .dataset('swActivated', null)


        this.__isShowing = false


        this.update()


        this.__hideTimeoutId = window.setTimeout((): void => {
            if (!this.windowNode) return

            this.windowNode.classList.add('nav__sub-window--deactivated')
        }, 300)
    }


    toggle(): void {
        this.__isShowing ? this.hide() : this.show()


        this.toggleHandlers.forEach((handler: (...args: any[]) => any): void => {
            handler(this.__isShowing)
        })
    }


    onToggle(func: (...args: any[]) => any): void {
        this.toggleHandlers.push(func)
    }


    /** setters */
    set loaded(loaded: boolean) {
        $(this.overlayNode).css('display', loaded ? 'none' : 'block')
    }


    set content(content: HTMLElement | string) {
        magicDOM.emptyNode(this.contentNode)

        this.contentNode.append(content)

        this.update()
    }


    /** props getters */
    get id(): string { return this.__id }
    get isShowing(): boolean { return this.__isShowing }


    /** props */
    private __id: string = lib.randomString(6)
    private __isShowing: boolean = false
    private __hideTimeoutId: number = -1


    /** handlers collection */
    private toggleHandlers: ((...args: any[]) => any)[] = []


    /** component */
    private container: HTMLElement


    /** component nodes */
    private contentNode: HTMLElement
    private windowNode: HTMLElement
    private overlayNode: HTMLElement
}


export default navigation


const or: (...args: any[]) => boolean = (...args: any[]): boolean => args.some((arg: any): any => arg)


function makeLink(href: string, icon: string, spa: boolean = false): HTMLElement {
    if (spa) {
        let anchor: HTMLElement | null = document.querySelector(`a[data-href='${href}']`)

        if (!anchor)
            throw new Error('navigation.addComponent.route()')


        anchor.classList.add('nav__link')
        anchor.append(magicDOM.toHTMLElement(`<i class="fa-solid fa-${icon}"></i>`))


        return anchor
    }


    return magicDOM.createElement('div', {
        classList: 'nav__link',
        attribute: { 'data-href': href },
        children: magicDOM.toHTMLElement(`<i class="fa-solid fa-${icon}"></i>`)
    })
}
