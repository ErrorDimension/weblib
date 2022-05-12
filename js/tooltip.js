import Console from './console';
import cursor from './cursor';
import { $ } from './jquery';
import lib, { throttle } from './lib';
import magicDOM from './magic-dom';
import modCase from './modcase';
const windowIsDefined = typeof window !== 'undefined';
windowIsDefined && customElements.define('tooltip-container', class HTMLTooltipContainer extends HTMLDivElement {
    constructor() {
        super();
    }
}, { extends: 'div' });
windowIsDefined && customElements.define('tooltip-content', class HTMLTooltipContent extends HTMLDivElement {
    constructor() {
        super();
    }
}, { extends: 'div' });
const OFFSET = 135;
const LARGE_X_AXIS = 3 / 4;
const LARGE_Y_AXIS = 77 / 100;
const MOUSE_OFFSET_X = 13;
const MOUSE_OFFSET_Y = 25;
const tooltip = {
    tooltipLog: new Console('zatooltip', { background: 'rgba(92, 92, 92, 0.4)' }),
    initialized: false,
    hideTimeout: -1,
    container: windowIsDefined ? document.createElement('tooltip-container') : null,
    content: windowIsDefined ? document.createElement('tooltip-content') : null,
    hooks: [],
    processor: {
        dataset: {
            process: (target, key) => target.dataset[key],
            attach: (hook) => {
                if (!windowIsDefined)
                    return;
                let key = modCase.camel.kebab(hook.key);
                $(`[data-${key}]`).each(function () {
                    tooltip.attachEvent(this, hook);
                });
            }
        },
        attribute: {
            process: (target, key) => {
                const data = target.getAttribute(key);
                return data === null ? undefined : data;
            },
            attach: (hook) => {
                if (!windowIsDefined)
                    return;
                let key = hook.key;
                $(`[${key}]`).each(function () {
                    tooltip.attachEvent(this, hook);
                });
            }
        }
    },
    init() {
        if (this.container === null || this.content === null)
            return;
        if (lib.isOnMobile() || this.initialized)
            return;
        /** insert tooltip to the document */
        this.container.appendChild(this.content);
        document.body.insertBefore(this.container, document.body.firstChild);
        /** observe the tooltip */
        const observerOptions = { childList: true, subtree: true };
        new ResizeObserver(this.move).observe(this.content);
        new MutationObserver(this.scan).observe(document.body, observerOptions);
        /** initial mouse event */
        cursor.watch(true);
        this.move();
        /** inform that the tooltip is successfully attached */
        this.initialized = true;
        Console.okay(this.tooltipLog, 'Successfully initialized');
    },
    scan(_) {
        tooltip.hooks.forEach((hook) => tooltip.processor[hook.on].attach(hook));
    },
    getValue(target, hook) {
        if (!(target instanceof HTMLElement))
            return undefined;
        return this.processor[hook.on].process(target, hook.key);
    },
    /**
     * This function add tooltip hook into the document
     * @param       prop                hook properties
     * @param       prop.on             on 'dataset' or 'attribute'
     * @param       prop.key            key to attach tooltip on
     * @param       prop.handler        handler content
     * @param       prop.destroy        fallback event after hide the tooltip
     * @param       prop.priority       decide which hook is chosen to execute
     * @param       prop.noPadding      decide whether to disable padding prop or not
     */
    addHook({ on, key, handler = ({ target, value, update }) => value, destroy = () => { }, priority = 1, noPadding = false }) {
        if (!(['attribute', 'dataset'].includes(on)))
            throw new Error(`tooltip.addHook() : '{on}' is not a valid option : ${on}`);
        if (typeof on === 'undefined')
            throw new Error(`'tooltip.addHook()' : '{on}' is not defined`);
        if (typeof key === 'undefined')
            throw new Error(`'tooltip.addHook()' : '{key}' is not defined`);
        let hook = { on, key, handler, destroy, priority, noPadding };
        this.hooks.push(hook);
        this.hooks.sort(function (a, b) {
            if (!(a.priority && b.priority))
                throw new Error("'tooltip.addHook()' : '{priority}' is not valid");
            if (a.priority < b.priority)
                return 1;
            if (a.priority > b.priority)
                return -1;
            return 0;
        });
        this.processor[on].attach(hook);
    },
    attachEvent(target, hook) {
        if (target.tooltipListened === true)
            return;
        const hooks = typeof hook === 'object' ? [hook] : this.hooks;
        for (let fncHook of hooks) {
            if (!this.getValue(target, fncHook))
                continue;
            if (target.tooltipChecked === true)
                break;
            /** get the key of the hook */
            let { key } = fncHook;
            if (fncHook.on === 'dataset')
                key = `data-${modCase.camel.kebab(key)}`;
            /** initialize the observer and the functions of the hook */
            const observer = new MutationObserver(() => {
                this.mouseenter(fncHook, target);
            });
            const mouseenter = () => {
                this.mouseenter(fncHook, target);
                observer.observe(target, { attributeFilter: [key] });
            };
            const mouseleave = () => {
                this.mouseleave(fncHook);
                observer.disconnect();
            };
            /** attach event handlers onto the target */
            $(target)
                .on('mouseenter', mouseenter)
                .on('mouseleave', mouseleave);
            target.tooltipChecked = true;
            break;
        }
        target.tooltipListened = target.tooltipChecked;
    },
    mouseenter(hook, target) {
        if (!this.container)
            return;
        /** get value for the tooltip */
        let value = this.getValue(target, hook);
        let content = (typeof hook.handler === 'undefined')
            ? undefined
            : hook.handler({
                target,
                value,
                update: (data) => this.update(data)
            });
        /** handle no padding option */
        if (hook.noPadding)
            $(this.container).css({
                '--padding': '0px',
                '--padding-duration': '0ms'
            });
        /** show the tooltip if content is defined */
        if (content)
            this.show(content);
    },
    mouseleave(hook) {
        if (!this.container)
            return;
        const { destroy } = hook;
        const { hide } = this;
        destroy && destroy();
        hide();
        if (hook.noPadding)
            $(this.container).css({
                '--padding': null,
                '--padding-duration': null
            });
    },
    show(content) {
        if (!this.container)
            return;
        this.container.dataset.activated = '';
        this.update(content);
        window.clearTimeout(this.hideTimeout);
        this.move();
        $(window).on('mousemove', this.move);
    },
    move: throttle(function (_) {
        const { container } = tooltip;
        if (!container)
            return;
        let { innerWidth, innerHeight } = window;
        let { clientWidth, clientHeight } = container;
        let { positionX, positionY } = cursor;
        let isMoreOuterX = innerWidth * LARGE_X_AXIS < positionX;
        let isMoreOuterY = innerHeight * LARGE_Y_AXIS < positionY;
        let isLargerThanScreenX = innerWidth - clientWidth - OFFSET < positionX;
        let isLargerThanScreenY = innerWidth - clientHeight - OFFSET < positionY;
        let posX = (isMoreOuterX || isLargerThanScreenX)
            ? positionX - clientWidth - MOUSE_OFFSET_X
            : positionX + MOUSE_OFFSET_X;
        let posY = (isMoreOuterY || isLargerThanScreenY)
            ? positionY - clientHeight - MOUSE_OFFSET_Y
            : positionY + MOUSE_OFFSET_Y;
        lib.cssFrame(() => {
            $(container).css({
                '--position-x': posX,
                '--position-y': posY
            });
        });
    }, 55),
    hide() {
        function hide() {
            if (!tooltip.container)
                return;
            $(tooltip.container).dataset('activated', null);
            $(window).off('mousemove', tooltip.move);
        }
        tooltip.hideTimeout = window.setTimeout(hide, 200);
    },
    update(content) {
        if (!(content && this.content))
            return;
        this.glow();
        if (content instanceof HTMLElement) {
            magicDOM.emptyNode(this.content);
            this.content.appendChild(content);
            return;
        }
        this.content.innerText = content;
    },
    glow: throttle(() => {
        const { container } = tooltip;
        if (!container)
            return;
        $(container).css('animation-name', 'undefined');
        lib.cssFrame(() => { $(container).css('animation-name', null); });
    }, 301),
};
export default tooltip;
/** @brief default tooltip hook */
tooltip.addHook({
    on: 'attribute',
    key: 'title',
    handler: ({ target, value }) => {
        if (target.tooltipTitle)
            return target.tooltipTitle;
        target.tooltipTitle = value;
        target.removeAttribute('title');
        return value;
    }
});
