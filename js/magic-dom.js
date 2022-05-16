import { $ } from './jquery';
import lib, { debounce } from './lib';
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
    createElement(tagName, { id, classList, attribute, children } = {
        id: undefined,
        classList: undefined,
        attribute: undefined,
        children: undefined
    }) {
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
                container.setAttribute(value, attribute[value]?.toString());
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
    Slider: class {
        /**
        * @param           option                               option for the slider
        * @param           option.color                         slider color ('pink' | 'blue')
        * @param           option.startValue                    slider's start value
        * @param           option.min                           slider's minimum value
        * @param           option.max                           slider's maximum value
        * @param           option.step                          slider's step
        * @param           option.comfortablePercentage         percentage
        */
        constructor({ color = 'pink', startValue = 0, min = 0, max = 10, step = 1, comfortablePct = 0 } = {
            color: 'pink',
            startValue: 0,
            min: 0,
            max: 10,
            step: 1,
            comfortablePct: 0
        }) {
            /** initialize the components */
            this.container = magicDOM.createTree('div', 'slider', {
                'data-color': color
            }, {
                input: { tag: 'input', attribute: { type: 'range', placeholder: 'none', min, max, step } },
                left: { classList: 'slider__track--left' },
                thumb: { classList: 'slider__thumb' },
                right: { classList: 'slider__track--right' },
            });
            this.input = this.container.input;
            this.#left = this.container.left;
            this.#thumb = this.container.thumb;
            this.#right = this.container.right;
            this.#min = min;
            this.#max = max;
            this.#comfortablePct = comfortablePct;
            /** attach event handlers */
            const self = this;
            const removeDragState = () => self.#removeDragState();
            const handleInputEvent = (event) => self.#handleInputEvent(event);
            const handleChangeEvent = (event) => self.#handleChangeEvent(event);
            $(this.input)
                .on('mouseup', removeDragState)
                .on('touchend', removeDragState)
                .on('input', handleInputEvent)
                .on('change', handleChangeEvent);
            /** initialize the initial value */
            this.input.value = startValue?.toString();
            this.input.dispatchEvent(new Event("input"));
        }
        container;
        input;
        #left;
        #thumb;
        #right;
        #inputHandlers = [];
        #changeHandlers = [];
        #removeDragState() {
            this.#slideTick = 0;
            this.container.classList.remove('slider--dragging');
        }
        #handleInputEvent(event) {
            this.#inputHandlers.forEach((handler) => {
                handler(this.input.value, event);
            });
            this.#reRender();
        }
        #handleChangeEvent(event) {
            this.#changeHandlers.forEach((handler) => {
                handler(this.input.value, event);
            });
        }
        #min;
        #max;
        #comfortablePct;
        #slideTick = -1;
        #reRender() {
            ++this.#slideTick;
            if (this.#slideTick > 1)
                this.container.classList.add('slider--dragging');
            let value = parseInt(this.input.value);
            let position = (value - this.#min) / (this.#max - this.#min);
            this.#thumb.style.left = `calc(20px + (100% - 40px) * ${position})`;
            this.#left.style.width = `calc(10px + (100% - 40px) * ${position})`;
            this.#right.style.width = `calc(100% - (30px + (100% - 40px) * ${position}))`;
            if (this.#comfortablePct)
                $(this.container)
                    .dataset('uncomfortable', (value / this.#max) >= this.#comfortablePct ? '' : null);
        }
        #__usingTooltip = false;
        get usingTooltip() { return this.#__usingTooltip; }
        tooltip(decorationCallback = (value) => value) {
            if (typeof decorationCallback !== "function")
                throw new Error("magicDOM().Slider().tooltip() : `decorationCallback` is not valid");
            let isHidden = true;
            import('./tooltip').then(module => {
                const tooltip = module.default;
                const handleMousedownEvent = () => {
                    if (!isHidden)
                        return;
                    tooltip.show(decorationCallback(this.input.value));
                    isHidden = false;
                };
                const handleMousemoveEvent = () => {
                    if (isHidden)
                        return;
                    tooltip.move();
                };
                const handleMouseleaveEvent = () => {
                    isHidden = true;
                    tooltip.hide();
                };
                $(this.container)
                    .on('mousedown', handleMousedownEvent)
                    .on('mousemove', handleMousemoveEvent)
                    .on('mouseleave', handleMouseleaveEvent);
                const handleInputEvent = () => {
                    if (isHidden)
                        return;
                    tooltip.update(decorationCallback(this.input.value));
                };
                $(this.input).on('input', handleInputEvent);
            });
            this.#__usingTooltip = true;
            return this;
        }
    },
    toHTMLElement(htmlString) {
        const template = document.createElement("template");
        template.innerHTML = htmlString.trim();
        const fin = template.content.firstChild;
        if (fin === null)
            throw new Error(`'magicDOM.toHTMLElement()' : can't`);
        template.remove();
        return fin;
    },
    scrollable(container, maxPath = 100) {
        if (container.dataset.scrollable === '' && container.scrollable)
            return;
        let scrollBox = magicDOM.createElement('div', { classList: 'scrollable' });
        while (container.firstChild)
            scrollBox.append(container.firstChild);
        container.scrollBox = scrollBox;
        container.appendChild(scrollBox);
        let translate = 0;
        const MINIMIZED = 0.075;
        const moveBack = debounce(() => {
            translate = 0;
            $(scrollBox).css('transform', 'translateY(0)');
        }, 100);
        const onWheelHandler = (event) => {
            let { deltaY } = event;
            translate = lib.clamp(-maxPath, translate - deltaY * MINIMIZED, maxPath);
            $(scrollBox).css('transform', `translateY(${translate}px)`);
            moveBack();
        };
        $(container)
            .dataset('scrollable', '')
            .on('wheel', onWheelHandler, { passive: true });
        container.scrollable = true;
        return {
            container,
            scrollBox,
            append(...children) {
                this.scrollBox.append(...children);
                return this;
            }
        };
    }
};
export default magicDOM;
