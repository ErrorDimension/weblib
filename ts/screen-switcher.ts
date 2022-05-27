import { $, $$ } from './jquery'
import magicDOM from "./magic-dom"


const screenSwitcher: {
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
    init(query: string, collection: {
        name: string, icon: string, element: HTMLElement, description?: string
    }[], width?: number): void
    switch(btn: HTMLElement, { icon, element, description }: {
        icon: string,
        description?: string,
        element: HTMLElement
    }): void
} = {
    init(query: string, collection: {
        name: string, icon: string, element: HTMLElement, description?: string
    }[], width: number = 1200): void {
        if (typeof window === 'undefined') return


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


        /** init first screen */
        this.switch(this.switcherBtn.firstElementChild as HTMLElement, collection[0])
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
