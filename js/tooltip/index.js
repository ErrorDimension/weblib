import lib, { throttle } from './../lib';
import modCase from './../case';
import cursor from './../cursor';
import { $ } from './../jquery';
import Console from './../console';
customElements.define('tooltip-container', class HTMLTooltipContainer extends HTMLDivElement {
    constructor() {
        super();
    }
}, { extends: 'div' });
customElements.define('tooltip-content', class HTMLTooltipContent extends HTMLDivElement {
    constructor() {
        super();
    }
}, { extends: 'div' });
function emptyNode(node) {
    while (node.firstChild)
        node.firstChild.remove();
}
const tooltip = {
    tooltipLog: new Console('zatooltip', { background: 'rgba(92, 92, 92, 0.4)' }),
    initialized: false,
    hideTimeout: -1,
    container: document.createElement('tooltip-container'),
    content: document.createElement('tooltip-content'),
    hooks: [],
    processor: {
        dataset: {
            process: (target, key) => target.dataset[key],
            attach: (hook) => {
                let kebabCase = modCase.camel.kebab(hook.key);
                let targets = document
                    .querySelectorAll(`[data-${kebabCase}]:not([data-tooltip-checked])`);
                targets.forEach(target => tooltip.attachEvent(target, hook));
            }
        },
        attribute: {
            process: (target, key) => {
                const data = target.getAttribute(key);
                return data === null ? undefined : data;
            },
            attach: (hook) => {
                let targets = document
                    .querySelectorAll(`[${hook.key}]:not([data-tooltip-checked])`);
                targets.forEach(target => tooltip.attachEvent(target, hook));
            }
        }
    },
    init() {
        if (lib.isOnMobile() || this.initialized)
            return;
        this.container.appendChild(this.content);
        document.body.insertBefore(this.container, document.body.firstChild);
        new ResizeObserver(() => this.move())
            .observe(this.content);
        new MutationObserver(() => this.scan())
            .observe(document.body, { childList: true, subtree: true });
        this.initialized = true;
        cursor.watch(true);
        Console.okay(this.tooltipLog, 'Successfully initialized');
    },
    scan() { this.hooks.forEach(hook => this.processor[hook.on].attach(hook)); },
    getValue(target, hook) {
        if (typeof target !== 'object')
            return;
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
        if (!['attribute', 'dataset'].includes(on))
            throw new Error(`tooltip.addHook() : '${on}' is not a valid option`);
        let hook = { on, key, handler, destroy, priority, noPadding };
        this.hooks.push(hook);
        this.hooks.sort(function (a, b) {
            if (a.priority < b.priority)
                return 1;
            if (a.priority > b.priority)
                return -1;
            return 0;
        });
        this.processor[on].attach(hook);
    },
    attachEvent(target, hook) {
        let hooks = typeof hook === 'object' ? [hook] : this.hooks;
        for (let fncHook of hooks) {
            if (!this.getValue(target, fncHook))
                continue;
            if (target.dataset.tooltipListening === '')
                break;
            let { key } = fncHook;
            if (fncHook.on === 'dataset')
                key = `data-${modCase.camel.kebab(key)}`;
            const observer = new MutationObserver(() => this.mouseenter(fncHook, target));
            target.addEventListener('mouseenter', () => {
                this.mouseenter(fncHook, target);
                observer.observe(target, { attributeFilter: [key] });
            });
            target.addEventListener('mouseleave', () => {
                this.mouseleave(fncHook);
                observer.disconnect();
            });
            target.dataset.tooltipListening = '';
            break;
        }
        target.dataset.tooltipChecked = '';
    },
    mouseenter(hook, target) {
        let value = this.getValue(target, hook);
        let content = (typeof hook.handler === 'undefined')
            ? undefined
            : hook.handler({
                target,
                value,
                update: (data) => this.update(data)
            });
        if (hook.noPadding)
            $(this.container).css({
                '--padding': '0px',
                'transition': 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1), padding 0s linear'
            });
        if (content || typeof content === 'boolean')
            this.show(content);
    },
    mouseleave(hook) {
        (typeof hook.destroy !== 'undefined') && hook.destroy();
        this.hide();
        if (hook.noPadding)
            $(this.container).css({
                '--padding': null,
                'transition': null
            });
    },
    show(content) {
        this.container.dataset.activated = '';
        this.update(content);
        clearTimeout(this.hideTimeout);
        this.move();
        window.addEventListener('mousemove', this.move);
    },
    move: throttle(function () {
        const { container } = tooltip;
        let { innerWidth, innerHeight } = window;
        let { clientWidth, clientHeight } = container;
        let { positionX, positionY } = cursor;
        const OFFSET = 135;
        const LARGE_X_AXIS = 3 / 4;
        const LARGE_Y_AXIS = 77 / 100;
        let isMoreOuterX = innerWidth * LARGE_X_AXIS < positionX;
        let isLargerThanScreenX = innerWidth - clientWidth - OFFSET < positionX;
        let isMoreOuterY = innerHeight * LARGE_Y_AXIS < positionY;
        let isLargerThanScreenY = innerWidth - clientHeight - OFFSET < positionY;
        let xPos = (isMoreOuterX || isLargerThanScreenX)
            ? positionX - clientWidth - 13
            : positionX + 13;
        let yPos = (isMoreOuterY || isLargerThanScreenY)
            ? positionY - clientHeight - 25
            : positionY + 25;
        lib.cssFrame(() => $(container)
            .css({ 'transform': `translate(${xPos}px, ${yPos}px)` }));
    }, 55),
    hide() {
        this.hideTimeout = setTimeout(() => {
            delete this.container.dataset.activated;
            window.removeEventListener('mousemove', this.move);
        }, 200);
    },
    update(content) {
        if (!content)
            return;
        this.glow();
        if (content instanceof HTMLElement) {
            emptyNode(this.content);
            this.content.append(content);
            return;
        }
        this.content.innerText = content;
    },
    glow: throttle(() => {
        tooltip.container.style.animation = 'none';
        lib.cssFrame(() => $(tooltip.container).css('animation', null));
    }, 350),
};
export default tooltip;
/** @brief default tooltip hook */
tooltip.addHook({
    on: 'attribute',
    key: 'title',
    handler: ({ target, value }) => {
        if (target.dataset.tiptitle)
            return target.dataset.tiptitle;
        target.dataset.tiptitle = value;
        target.removeAttribute('title');
        return value;
    }
});