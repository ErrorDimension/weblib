import { $, $$ } from './jquery';
import ScrollBox from './scrollbox';
import { debounce } from './lib';
import Glasium from './glasium';
const magicDOM = {
    /**
     * Create a HTMLElement the easy way
     * @param       tagName             HTMLElement type
     * @param       prop                HTMLElement prop
     * @param       prop.id             HTMLElement id
     * @param       prop.classList      HTMLElement class list
     * @param       prop.attribute      HTMLElement attribute
     * @param       prop.child          HTMLElement child
     */
    createElement(tagName, { id, classList, attribute, children } = {}) {
        var _a;
        const container = document.createElement(tagName);
        /** add id to the container */
        if (id)
            container.id = id;
        /** add class list to the container */
        if (typeof classList === 'string')
            container.classList.add(classList);
        if (classList instanceof Array)
            container.classList.add(...classList);
        /** add attribute to the container */
        if (attribute)
            for (let value in attribute)
                container.setAttribute(value, (_a = attribute[value]) === null || _a === void 0 ? void 0 : _a.toString());
        /** append child to the container */
        if (typeof children === 'string')
            container.textContent = children;
        if (children instanceof HTMLElement)
            container.appendChild(children);
        if (children instanceof Array)
            container.append(...children);
        return container;
    },
    createTree(tag, classList = [], attribute = {}, children = []) {
        let container = magicDOM.createElement(tag, { classList, attribute });
        if (children === undefined)
            return container;
        if (typeof children === 'string') {
            container.innerText = children;
            return container;
        }
        if (children instanceof HTMLElement) {
            container.appendChild(children);
            return container;
        }
        if (children instanceof Array) {
            container.append(...children);
            return container;
        }
        for (let key in children) {
            const child = children[key];
            if (child instanceof HTMLElement) {
                container.append(child);
                Object.assign(container, { [key]: child });
                continue;
            }
            const tag_ = child.tag ? child.tag : 'div';
            const classList_ = child.classList;
            const attribute_ = child.attribute;
            const children_ = child.children;
            const child_ = magicDOM.createTree(tag_, classList_, attribute_, children_);
            container.appendChild(child_);
            Object.assign(container, { [key]: child_ });
        }
        return container;
    },
    /**
    * empty node
    * @param { HTMLElement } node node to empty
    */
    emptyNode(node) {
        while (node.firstChild)
            node.firstChild.remove();
    },
    /** this function only return the first child */
    toHTMLElement(htmlString) {
        const template = document.createElement("template");
        template.innerHTML = htmlString.trim();
        const fin = template.content.firstChild;
        if (fin === null)
            throw new Error(`'magicDOM.toHTMLElement()' : can't`);
        template.remove();
        return fin;
    },
};
export default magicDOM;
class MagicDOMEventInput {
    constructor() {
        this.inputHandlers = [];
    }
    onInput(func) {
        this.inputHandlers.push(func);
        return this;
    }
}
class MagicDOMEventChange extends MagicDOMEventInput {
    constructor() {
        super(...arguments);
        this.changeHandlers = [];
    }
    onChange(func) {
        this.changeHandlers.push(func);
        return this;
    }
}
export class Slider {
    /**
    * @param           option                               option for the slider
    * @param           option.color                         slider color ('pink' | 'blue')
    * @param           option.startValue                    slider's start value
    * @param           option.min                           slider's minimum value
    * @param           option.max                           slider's maximum value
    * @param           option.step                          slider's step
    * @param           option.comfortablePercentage         percentage
    */
    constructor({ color = 'pink', startValue = 0, min = 0, max = 10, step = 1, comfortablePct = 0 } = {}) {
        /** handler collection */
        this.inputHandlers = [];
        this.changeHandlers = [];
        /** render utilities */
        this.slideTick = -1;
        /** tooltip events */
        this.__usingTooltip = false;
        /** initialize the components */
        this.component = magicDOM.createTree('div', 'slider', {
            'data-color': color
        }, {
            input: { tag: 'input', attribute: { type: 'range', placeholder: 'none', min, max, step } },
            left: { classList: 'slider__track--left' },
            thumb: { classList: 'slider__thumb' },
            right: { classList: 'slider__track--right' },
        });
        this.input = this.component.input;
        this.left = this.component.left;
        this.thumb = this.component.thumb;
        this.right = this.component.right;
        this.min = min;
        this.max = max;
        this.comfortablePct = comfortablePct;
        /** attach event handlers */
        const self = this;
        const removeDragState = () => self.removeDragState();
        const handleInputEvent = (event) => self.handleInputEvent(event);
        const handleChangeEvent = (event) => self.handleChangeEvent(event);
        $(this.input)
            .on('mouseup', removeDragState)
            .on('touchend', removeDragState)
            .on('input', handleInputEvent)
            .on('change', handleChangeEvent);
        /** initialize the initial value */
        this.input.value = startValue === null || startValue === void 0 ? void 0 : startValue.toString();
        this.input.dispatchEvent(new Event("input"));
    }
    /** public functions */
    onInput(func) {
        this.inputHandlers.push(func);
    }
    onChange(func) {
        this.changeHandlers.push(func);
    }
    removeDragState() {
        this.slideTick = 0;
        this.component.classList.remove('slider--dragging');
    }
    handleInputEvent(event) {
        this.inputHandlers.forEach((handler) => {
            handler(this.input.value, event);
        });
        this.render();
    }
    handleChangeEvent(event) {
        this.changeHandlers.forEach((handler) => {
            handler(this.input.value, event);
        });
    }
    render() {
        /** dragging state */
        ++this.slideTick;
        if (this.slideTick > 1)
            this.component.classList.add('slider--dragging');
        /** fetch value of the input */
        let value = parseInt(this.input.value);
        /** render */
        let position = (value - this.min) / (this.max - this.min);
        this.thumb.style.left = `calc(20px + (100% - 40px) * ${position})`;
        this.left.style.width = `calc(10px + (100% - 40px) * ${position})`;
        this.right.style.width = `calc(100% - (30px + (100% - 40px) * ${position}))`;
        /** handle uncomfortable values */
        if (this.comfortablePct)
            $(this.component)
                .dataset({ 'uncomfortable': (value / this.max) >= this.comfortablePct ? '' : null });
    }
    get usingTooltip() { return this.__usingTooltip; }
    tooltip({ handler = (value) => value } = {}) {
        if (typeof handler !== "function")
            throw new Error("Slider().tooltip() : `handler` is not valid function");
        /** self */
        const self = this;
        import('./tooltip').then(module => {
            const tooltip = module.default;
            /** specifier for the tooltip */
            let isHidden = true;
            function pointerDown() {
                if (!isHidden)
                    return;
                isHidden = false;
                tooltip.show(handler(self.input.value));
            }
            function pointerMove() {
                if (isHidden)
                    return;
                tooltip.move();
            }
            function pointerLeave() {
                isHidden = true;
                tooltip.hide();
            }
            $(this.component)
                .on('pointerdown', pointerDown)
                .on('pointermove', pointerMove)
                .on('pointerleave', pointerLeave);
            /** element's events */
            function input() {
                if (isHidden)
                    return;
                tooltip.update(handler(self.input.value));
            }
            $(this.input).on('input', input);
        });
        this.__usingTooltip = true;
        return this;
    }
}
export class Select extends MagicDOMEventInput {
    constructor({ color = 'pink', options = [], icon = 'list', searchTime = 500 } = {}) {
        super();
        /** props */
        this.activated = true;
        /** fetch props */
        this.options = options.length == 0
            ? [{ display: 'not initialized', value: 'undefined' }]
            : options.reduce((acc, val) => {
                let option = {
                    display: val.display,
                    value: val.value ? val.value : val.display
                };
                acc.push(option);
                return acc;
            }, []);
        this.searchTime = searchTime;
        /** init options box */
        this.currentHolder = magicDOM.createElement('div', {
            classList: 'select__text',
        });
        this.selectBox = magicDOM.createElement('div', {
            classList: 'select__box',
            children: this.createOptions()
        });
        /** select box is a scroll box */
        new ScrollBox(this.selectBox).init();
        /** init component */
        this.component = magicDOM.createTree('div', 'select', {
            'data-color': color,
            'tabindex': 0
        }, {
            icon: { tag: 'i', classList: ['fa-solid', `fa-${icon}`] },
            text: this.currentHolder,
            arrow: { tag: 'i', classList: ['fa-solid', `fa-angle-left`, 'select__arrow'] }
        });
        /** attaching events */
        this.attachEvents();
        /** appending */
        this.component.append(this.selectBox);
        /** initial selection */
        this.select(this.options[0]);
        this.currentOption = this.options[0];
    }
    /** getters */
    get value() {
        return this.currentOption.value;
    }
    /** events */
    attachEvents() {
        /** activate options box */
        const expander = magicDOM.createElement('div', {
            classList: 'expander'
        });
        $(expander).on('click', () => this.toggle());
        this.component.append(expander);
        /** event props */
        let searchQuery = '';
        const clearSearchQuery = debounce(() => searchQuery = '', this.searchTime);
        /** key events */
        $(this.component)
            .on('keydown', (event) => {
            switch (event.key.toLowerCase()) {
                case 'arrowdown': {
                    const index = (this.options.indexOf(this.currentOption) + 1) % this.options.length;
                    const nextOption = this.options[index];
                    this.select(nextOption, false);
                    break;
                }
                case 'arrowup': {
                    const index = this.options.indexOf(this.currentOption) - 1 == -1
                        ? this.options.length - 1
                        : this.options.indexOf(this.currentOption) - 1;
                    const prevOption = this.options[index];
                    this.select(prevOption, false);
                    break;
                }
                case ' ':
                case 'enter': {
                    this.toggle();
                    break;
                }
                default: {
                    if (event.key.length === 1)
                        searchQuery += event.key.toLowerCase();
                    clearSearchQuery();
                    const option = this.options.find((opt) => {
                        if (opt.display.toLowerCase().startsWith(searchQuery))
                            return opt;
                        return undefined;
                    });
                    if (option)
                        this.select(option, false);
                    break;
                }
            }
        });
    }
    handleInputEvent() {
        if (this.activated)
            return;
        this.inputHandlers.forEach((handler) => handler(this.value));
    }
    /** funcs */
    createOptions() {
        const options = [];
        this.options.forEach((option) => {
            if (!option.value)
                option.value = option.display;
            let optEl = magicDOM.createElement('div', {
                classList: 'select__option',
                children: option.display,
                attribute: { 'data-value': option.value }
            });
            /** events */
            optEl.onclick = () => {
                this.currentOption = option;
                this.select(option);
            };
            options.push(optEl);
        });
        return options;
    }
    select(option, toToggle = true) {
        toToggle && this.toggle();
        $('[data-current]', this.selectBox).dataset('current', null);
        this.currentHolder.textContent = option.display;
        this.currentOption = option;
        const currentElement = $$(`[data-value='${option.value}']`, this.selectBox);
        currentElement.dataset.current = '';
        if (this.activated)
            currentElement.scrollIntoView({
                block: 'nearest'
            });
        this.handleInputEvent();
    }
    /** public funcs */
    toggle() {
        /** activation */
        this.activated = !this.activated;
        $(this.component).dataset('activated', this.activated ? '' : null);
    }
}
export class Radio extends MagicDOMEventInput {
    constructor({ color = 'pink', options = [] } = {}) {
        super();
        this.__value = '';
        /** init component */
        this.component = magicDOM.createElement('div', {
            classList: 'radio',
            attribute: {
                'data-color': color,
                'tabindex': 0
            }
        });
        /** background */
        Glasium.init(this.component, {
            color: Glasium.COLOR[color.toUpperCase()],
            count: 8,
            scale: 3
        });
        /** get props */
        this.options = options.length == 0
            ? [{ display: 'not initialized', value: 'undefined', icon: 'border-none' }]
            : options.reduce((acc, val) => {
                let option = {
                    display: val.display,
                    value: val.value ? val.value : val.display,
                    icon: val.icon
                };
                acc.push(option);
                return acc;
            }, []);
        /** options init */
        this.makeOptions();
    }
    /** assets  */
    handleInputEvent() {
        this.inputHandlers.forEach((handler) => {
            handler(this.value);
        });
    }
    makeOptions() {
        this.options.forEach((option) => {
            const optEl = magicDOM.createElement('span', {
                classList: 'radio__option',
                attribute: {
                    title: option.display,
                    'data-value': option.value
                },
                children: magicDOM.createElement('i', {
                    classList: ['fa-solid', `fa-${option.icon}`]
                })
            });
            optEl.onclick = () => {
                this.__value = option.value;
                this.select(optEl);
            };
            this.component.append(optEl);
        });
    }
    /** getters */
    get value() { return this.__value; }
    /** public funcs */
    select(el) {
        $('[data-current]', this.component).dataset('current', null);
        $(el).dataset('current', '');
        this.handleInputEvent();
    }
}
