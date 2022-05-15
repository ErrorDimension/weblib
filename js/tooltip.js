import { $ } from './jquery';
import Console from './console';
import cursor from './cursor';
import lib, { throttled } from './lib';
import magicDOM from './magic-dom';
import modCase from './modcase';
const windowIsNotDefined = typeof window === 'undefined';
const logger = windowIsNotDefined
    ? undefined
    : new Console('tooltip', { background: 'rgba(92, 92, 92, 0.4)' });
const OFFSET = 135;
const LARGE_X_AXIS = 3 / 4;
const LARGE_Y_AXIS = 77 / 100;
const MOUSE_OFFSET_X = 13;
const MOUSE_OFFSET_Y = 25;
const MOVE_THROTTLE = 55;
const HIDE_DURATION = 200;
const DEACTIVATE_DURATION = 300;
const tooltip = {
    get initialized() { return !!(this.container && this.content); },
    container: undefined,
    content: undefined,
    hideTimeoutId: -1,
    glowing: false,
    hooks: [],
    processor: {
        attribute: {
            process(target, key) {
                const value = target.getAttribute(key);
                return value === null ? undefined : value;
            },
            attach(hook) {
                if (windowIsNotDefined)
                    return;
                const key = hook.key;
                $(`[${key}]`).each(function () { tooltip.attach(this, hook); });
            }
        },
        dataset: {
            process(target, key) { return target.dataset[key]; },
            attach(hook) {
                if (windowIsNotDefined)
                    return;
                const key = modCase.camel.kebab(hook.key);
                $(`[data-${key}]`).each(function () { tooltip.attach(this, hook); });
            }
        }
    },
    init() {
        /** return if meet the conditions */
        if (windowIsNotDefined)
            return;
        if (this.initialized)
            return;
        /** initialize tooltip's container and content */
        class TContainer extends HTMLDivElement {
            constructor() { super(); }
        }
        class TContent extends HTMLDivElement {
            constructor() { super(); }
        }
        window.customElements.define('t-container', TContainer, { extends: 'div' });
        window.customElements.define('t-content', TContent, { extends: 'div' });
        this.container = document.createElement('t-container');
        this.content = document.createElement('t-content');
        this.container.append(this.content);
        $(this.container).dataset({ deactivated: '' });
        document.body.insertBefore(this.container, document.body.firstChild);
        /** observe the tooltip */
        new ResizeObserver(this.move).observe(this.container);
        new MutationObserver(this.scan).observe(document.body, {
            childList: true,
            subtree: true
        });
        /** initialize move event */
        cursor.watch(true);
        this.move();
        /** limit glowing rate */
        $(this.container).on('animationend', function () {
            $(this).dataset('glow', null);
            tooltip.glowing = false;
        });
        /** inform success */
        Console.okay(logger, 'Successfully initialized');
    },
    scan() {
        /** scan for new elements in the document and attach tooltip events onto them */
        tooltip.hooks.forEach((hook) => tooltip.processor[hook.on].attach(hook));
    },
    addHook({ on, key, handler = ({ target, value, update }) => value, follower = () => { }, priority = 1, padding = true }) {
        if (!['attribute', 'dataset'].includes(on))
            throw new Error(`'tooltip.addHook()' : unexpected '${on}', expecting 'attribute' or 'dataset'`);
        const hook = { on, key, handler, follower, priority, padding };
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
    process(target, { on, key }) {
        /** return the value from the target's key */
        return this.processor[on].process(target, key);
    },
    attach(target, hook) {
        if (target.tooltipAttached)
            return;
        if (!this.process(target, hook))
            return;
        /** key of the hook */
        let { key } = hook;
        if (hook.on === 'dataset')
            key = `data - ${modCase.camel.kebab(key)} `;
        /** observer */
        const observer = new MutationObserver(() => {
            this.mouseenter(target, hook);
        });
        /** attach tooltip event */
        $(target)
            .on('mouseenter', () => {
            this.mouseenter(target, hook);
            observer.observe(target, { attributeFilter: [key] });
        })
            .on('mouseleave', () => {
            this.mouseleave(hook);
            observer.disconnect();
        });
        /** inform that the target is having a tooltip event attached */
        target.tooltipAttached = true;
    },
    mouseenter(target, { on, key, handler, padding }) {
        if (!this.container)
            return;
        /** content of the tooltip */
        const value = this.process(target, { on, key });
        const content = handler ? handler({
            target,
            value,
            update: (content_) => this.update(content_)
        }) : undefined;
        /** handle padding option */
        if (!padding)
            $(this.container).css({
                '--padding': '0px',
                '--padding-duration': '0ms'
            });
        /** display content */
        if (content)
            this.show(content);
    },
    mouseleave({ follower, padding }) {
        if (!this.container)
            return;
        follower && follower();
        this.hide();
        if (!padding)
            $(this.container).css({
                '--padding': null,
                '--padding-duration': null
            });
    },
    show(content) {
        if (!this.container)
            return;
        window.clearInterval(this.hideTimeoutId);
        $(this.container).dataset({
            'deactivated': null,
            'activated': ''
        });
        this.update(content);
        this.move();
        $(window).on('mousemove', tooltip.move);
    },
    hide() {
        const { container, content } = tooltip;
        if (!(container && content))
            return;
        tooltip.hideTimeoutId = window.setTimeout(() => {
            $(container).dataset('activated', null);
            tooltip.hideTimeoutId = window.setTimeout(() => {
                $(container).dataset('deactivated', '');
                $(window).off('mousemove', tooltip.move);
            }, DEACTIVATE_DURATION);
        }, HIDE_DURATION);
    },
    move: throttled(function (_) {
        if (!tooltip.container)
            return;
        const { container } = tooltip;
        const { innerWidth, innerHeight } = window;
        const { clientWidth, clientHeight } = container;
        const { positionX, positionY } = cursor;
        const isMoreOuterX = innerWidth * LARGE_X_AXIS < positionX;
        const isMoreOuterY = innerHeight * LARGE_Y_AXIS < positionY;
        const isLargerThanScreenX = innerWidth - clientWidth - OFFSET < positionX;
        const isLargerThanScreenY = innerWidth - clientHeight - OFFSET < positionY;
        const posX = (isMoreOuterX || isLargerThanScreenX)
            ? positionX - clientWidth - MOUSE_OFFSET_X
            : positionX + MOUSE_OFFSET_X;
        const posY = (isMoreOuterY || isLargerThanScreenY)
            ? positionY - clientHeight - MOUSE_OFFSET_Y
            : positionY + MOUSE_OFFSET_Y;
        lib.cssFrame(() => {
            $(container).css({
                '--position-x': posX,
                '--position-y': posY
            });
        });
    }, MOVE_THROTTLE),
    update(content) {
        if (!this.content)
            return;
        if (!content)
            return;
        this.glow();
        magicDOM.emptyNode(this.content);
        this.content.append(content);
    },
    glow() {
        if (!this.container)
            return;
        if (this.glowing)
            return;
        $(this.container).dataset('glow', '');
    }
};
export default tooltip;
/** @brief default tooltip hook */
tooltip.addHook({
    on: 'attribute',
    key: 'title',
    handler({ target, value }) {
        if (target.tooltipTitle)
            return target.tooltipTitle;
        target.tooltipTitle = value;
        target.removeAttribute('title');
        return target.tooltipTitle;
    }
});
