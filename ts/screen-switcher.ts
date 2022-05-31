import { $, $$ } from './jquery'
import Glasium from './glasium'
import ScrollBox from './scrollbox'
import magicDOM from "./magic-dom"


const screenSwitcher: {
    initialized?: boolean
    current?: HTMLElement
    container?: HTMLElement
    header?: HTMLElement
    content?: HTMLElement
    icon?: HTMLElement
    switcher?: HTMLElement
    switcherBtn?: HTMLElement
    switcherDes?: HTMLElement
    buttons?: HTMLElement
    firstInitialization?: boolean
    init({ query, collection, width, buttons }: {
        query: string
        collection: {
            name: string; icon: string; element: HTMLElement; description?: string
        }[]
        width?: number,
        buttons?: {
            icon: string
            text: string
            callback: () => void
            color?: string
        }[]
    }): void
    switch(btn: HTMLElement, { icon, element, description }: {
        icon: string,
        description?: string,
        element: HTMLElement
    }): void
} = {
    init({ query, collection, width = 1200, buttons = [] }: {
        query: string
        collection: {
            name: string; icon: string; element: HTMLElement; description?: string
        }[]
        width?: number
        buttons?: {
            icon: string
            text: string
            callback: () => void
            color?: string
        }[]
    }): void {
        if (typeof window === 'undefined' || this.initialized) return
        this.initialized = true


        /** init container */
        this.container = $$(query)


        /** initial stylesheet */
        let stylesheet: HTMLStyleElement = magicDOM.createElement('style', {
            children: `
            .screen {
                max-width: ${width ? `${width}px` : '100%'};
                width: 100%;
            }

            ${query} {
                display: flex;
                flex-direction: column;
            }
            
            ${query} >*:not(.screen, .loading--cover, .loading--big, .loading--small) {
                display: none;
            }
            `
        })

        this.container.append(stylesheet)


        /** start initializing */
        const screen: HTMLElement = magicDOM.createElement('div', { classList: 'screen' })
        this.header = magicDOM.createElement('div', { classList: 'screen__header' })
        this.content = magicDOM.createElement('div', { classList: 'screen__content' })

        screen.append(this.header, this.content)
        this.container.append(screen)


        /** header initializing */
        this.icon = magicDOM.createElement('i', {
            classList: ['screen__header__icon', 'fa-solid']
        })

        this.switcher = magicDOM.createElement('span', {
            classList: 'screen__header__switcher'
        })

        this.switcherBtn = magicDOM.createElement('div', {
            classList: 'screen__header__switcher__btn'
        })

        this.switcherDes = magicDOM.createElement('div', {
            classList: 'screen__header__switcher__des'
        })

        this.buttons = magicDOM.createElement('span', {
            classList: 'screen__header__buttons'
        })

        this.switcher.append(this.switcherBtn, this.switcherDes)
        this.header.append(this.icon, this.switcher, this.buttons)


        /** iterate */
        collection.forEach((item: {
            name: string, icon?: string, element: HTMLElement, description?: string
        }): void => {
            /** get info */
            item.name = item.name.toLowerCase()
            item.icon = item.icon ? item.icon : 'home'
            item.description = item.description ? item.description.toLowerCase() : undefined

            let { name, icon, element, description } = item


            /** btn */
            let btn: HTMLElement = magicDOM.createElement('button', { children: name })


            /** event */
            btn.onclick = (): void => this.switch(btn, { icon, element, description })


            /** append */
            this.switcherBtn!.append(btn)
        })


        /** buttons */
        buttons.forEach((buttonProps: {
            text: string
            icon: string
            callback: () => void
            color?: string
        }): void => {
            if (!this.buttons) return


            /** make button */
            let button: HTMLButtonElement = magicDOM.toHTMLElement(
                `
                <button>
                    <i class='fa-solid fa-${buttonProps.icon}'></i>
                    <div>${buttonProps.text}</div>
                </button>
                `
            )

            button.onclick = buttonProps.callback


            /** background */
            Glasium.init(button, {
                count: 8,
                color: Glasium.COLOR[buttonProps.color?.toUpperCase() ?? 'BLUE']
            })


            /** insert */
            this.buttons.append(button)
        })


        /** init first screen */
        this.switch(this.switcherBtn.firstElementChild as HTMLElement, collection[0])


        /** scroll box */
        new ScrollBox(this.content).init()
    },


    switch(btn: HTMLElement, { icon, element, description }: {
        icon: string,
        description?: string,
        element: HTMLElement
    }): void {
        if (!(this.icon && this.content && this.container && this.switcherDes)) return


        /** activate btn */
        $('.screen__header__switcher__btn button').dataset('active', null)
        btn.dataset.active = ''


        /** icon */
        this.icon.className = `screen__header__icon fa-solid fa-${icon}`


        /** content */
        if (this.firstInitialization && this.current) this.container.append(this.current)
        this.content.append(element)
        this.current = element


        /** description */
        this.switcherDes.textContent = description ? description : ''


        /** first initialization */
        this.firstInitialization = true
    }
}


export default screenSwitcher
