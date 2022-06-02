import { $, $$ } from './jquery';
import Glasium from './glasium';
import magicDOM from "./magic-dom";
const screenSwitcher = {
    init({ query, collection, width = 1200, buttons = [] }) {
        if (typeof window === 'undefined' || this.initialized)
            return;
        this.initialized = true;
        /** init container */
        let container = $$(query);
        if (!container)
            return;
        this.container = container;
        /** initial stylesheet */
        let stylesheet = magicDOM.createElement('style', {
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
        });
        this.container.append(stylesheet);
        /** start initializing */
        const screen = magicDOM.createElement('div', { classList: 'screen' });
        this.header = magicDOM.createElement('div', { classList: 'screen__header' });
        this.content = magicDOM.createElement('div', { classList: 'screen__content' });
        screen.append(this.header, this.content);
        this.container.append(screen);
        /** header initializing */
        this.icon = magicDOM.createElement('i', {
            classList: ['screen__header__icon', 'fa-solid']
        });
        this.switcher = magicDOM.createElement('span', {
            classList: 'screen__header__switcher'
        });
        this.switcherBtn = magicDOM.createElement('div', {
            classList: 'screen__header__switcher__btn'
        });
        this.switcherDes = magicDOM.createElement('div', {
            classList: 'screen__header__switcher__des'
        });
        this.buttons = magicDOM.createElement('span', {
            classList: 'screen__header__buttons'
        });
        this.switcher.append(this.switcherBtn, this.switcherDes);
        this.header.append(this.icon, this.switcher, this.buttons);
        /** iterate */
        collection.forEach((item) => {
            var _a, _b;
            /** get info */
            item.name = item.name.toLowerCase();
            item.icon = item.icon ? item.icon : 'home';
            item.description = (_b = (_a = item.description) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '';
            let { name, icon, element, description } = item;
            /** btn */
            let btn = magicDOM.createElement('button', { children: name });
            /** event */
            btn.onclick = () => this.switch(btn, { icon, element, description });
            /** append */
            this.switcherBtn.append(btn);
        });
        /** buttons */
        buttons.forEach((buttonProps) => {
            var _a, _b;
            if (!this.buttons)
                return;
            /** make button */
            let button = magicDOM.toHTMLElement(`
                <button>
                    <i class='fa-solid fa-${buttonProps.icon}'></i>
                    <div>${buttonProps.text}</div>
                </button>
                `);
            button.onclick = buttonProps.callback;
            /** background */
            Glasium.init(button, {
                count: 8,
                color: Glasium.COLOR[(_b = (_a = buttonProps.color) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : 'BLUE']
            });
            /** insert */
            this.buttons.append(button);
        });
        /** init first screen */
        this.switch(this.switcherBtn.firstElementChild, collection[0]);
    },
    switch(btn, { icon, element, description }) {
        if (!(this.icon && this.content && this.container && this.switcherDes))
            return;
        /** activate btn */
        $('.screen__header__switcher__btn button').dataset('active', null);
        btn.dataset.active = '';
        /** icon */
        this.icon.className = `screen__header__icon fa-solid fa-${icon}`;
        /** content */
        if (this.firstInitialization && this.current)
            this.container.append(this.current);
        this.content.append(element);
        this.current = element;
        /** description */
        this.switcherDes.textContent = description ? description : '';
        /** first initialization */
        this.firstInitialization = true;
    }
};
export default screenSwitcher;
