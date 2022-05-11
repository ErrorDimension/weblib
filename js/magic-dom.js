import { $ } from './jquery.js';
import lib, { debounce } from './lib.js';
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
    createElement(tagName, { id = undefined, classList = undefined, attribute = undefined, children = undefined } = {}) {
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
                container.setAttribute(value, attribute[value].toString());
        /** append child to the container */
        if (typeof children === 'string')
            container.innerText = children;
        if (children instanceof HTMLElement)
            container.appendChild(children);
        if (children instanceof Array)
            container.append(...children);
        return container;
    },
    createTree(tag, classList, attribute, children) {
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
    /**
     *
     * @param           option
     * @param           option.color
     * @param           option.startValue
     * @param           option.min
     * @param           option.max
     * @param           option.step
     * @param           option.highValue        Between 0 and 1
     */
    createSlider({ color = 'pink', startValue = 0, min = 0, max = 11, step = 1, comfortablePercentage = undefined } = {}) {
        const container = this.createTree('div', 'slider', { 'data-color': color }, {
            input: { tag: 'input', attribute: { type: 'range', placeholder: 'none', min, max, step } },
            leftTrack: { tag: 'span', classList: 'slider__left-track' },
            thumb: { tag: 'span', classList: 'slider__thumb' },
            rightTrack: { tag: 'span', classList: 'slider__right-track' },
        });
        if (!container.input)
            return;
        const inputHandlers = [];
        const changeHandlers = [];
        let sliderTick = -1;
        /** handler for the slider */
        function handleMouseupEvent() {
            sliderTick = 0;
            container.classList.remove('dragging');
        }
        /** this function is used to render the slider */
        function editSlider() {
            if (!(container.thumb && container.leftTrack && container.rightTrack && container.input))
                throw new Error(`'magicDOM.createSlider()' : found undefined in tree`);
            /** change drag style */
            ++sliderTick;
            if (sliderTick > 1)
                container.classList.add('dragging');
            /** render the position of the thumb */
            let value = parseInt(container.input.value);
            let pos = (value - min) / (max - min);
            container.thumb.style.left = `calc(20px + (100% - 40px) * ${pos})`;
            container.leftTrack.style.width = `calc(10px + (100% - 40px) * ${pos})`;
            container.rightTrack.style.width = `calc(100% - (30px + (100% - 40px) * ${pos}))`;
            /** dataset */
            if (!comfortablePercentage)
                return;
            container.dataset.isHigh = (value / max) >= comfortablePercentage ? 'yes' : 'no';
        }
        function handleInputEvent(event) {
            inputHandlers.forEach((handler) => handler(this.value, event));
            editSlider();
        }
        function handleChangeEvent(event) {
            changeHandlers.forEach((handler) => handler(this.value, event));
        }
        $(container.input)
            .on('mouseup', handleMouseupEvent)
            .on('input', handleInputEvent)
            .on('change', handleChangeEvent);
        /** initial first state */
        container.input.value = startValue.toString();
        container.input.dispatchEvent(new Event("input"));
        return {
            container,
            input: container.input,
            toUseTooltip: false,
            tooltip(contentCallback = (val) => val) {
                if (this.toUseTooltip)
                    return;
                if (typeof contentCallback !== "function")
                    throw new Error("createSlider().tooltip() : `contentCallback` is not valid");
                import('./tooltip').then(module => {
                    const tooltip = module.default;
                    const inputHandler = () => {
                        if (sliderTick < 1)
                            return;
                        tooltip.show(contentCallback(this.input.value));
                    };
                    $(this.input).on('input', inputHandler);
                    $(this.container)
                        .on('mousemove', tooltip.move)
                        .on('mouseleave', tooltip.hide);
                });
                return this;
            },
            get value() { return parseInt(this.input.value); },
            set value(newValue) {
                this.input.value = newValue.toString();
                this.input.dispatchEvent(new Event('input'));
            },
            /** @param { Function } func (value, event) */
            onInput(func) {
                if (typeof func !== 'function')
                    throw new Error("createSlider().onInput() : `func` not a valid function");
                inputHandlers.push(func);
                return this;
            },
            /** @param { Function } func (value, event) */
            onChange(func) {
                if (typeof func !== 'function')
                    throw new Error("createSlider().onChange() : `func` not a valid function");
                changeHandlers.push(func);
                return this;
            }
        };
    },
    toHTMLElement(html) {
        const template = document.createElement("template");
        template.innerHTML = html.trim();
        const fin = template.content.firstChild;
        template.remove();
        return fin;
    },
    scrollable(container, maxPath = 100) {
        if (container.dataset.scrollable)
            return;
        let box = magicDOM.createElement('div', { classList: 'sbox' });
        while (container.firstChild)
            box.append(container.firstChild);
        $(container).css('overflow', 'overlay');
        container.scrollBox = box;
        let translate = 0;
        const MINIMIZED = 0.075;
        const moveBack = debounce(() => {
            translate = 0;
            $(box).css('transform', 'translateY(0)');
        }, 100);
        const onWheelHandler = (event) => {
            let { deltaY } = event;
            translate = lib.clamp(-maxPath, translate - deltaY * MINIMIZED, maxPath);
            $(box).css('transform', `translateY(${translate}px)`);
            moveBack();
        };
        $(container)
            .dataset('scrollable', 'true')
            .on('wheel', onWheelHandler);
        return {
            container,
            scrollBox: box,
            append(...args) {
                this.scrollBox.append(...args);
                return this;
            }
        };
    }
};
export default magicDOM;
