import { $, $$ } from './jquery';
import lib from './lib';
import magicDOM from './magic-dom';
class Glasium {
    static __isWatching = false;
    static get isWatching() { return this.__isWatching; }
    static watch() {
        if (this.__isWatching)
            return;
        this.__isWatching = true;
        $('[data-glasium]').each(function () { Glasium.init(this); });
    }
    static async #fillBackground(container, { scale, speed, count, shape, brightness }) {
        speed = lib.max(count * 1.25, speed);
        for (let i = 0; i < count; ++i) {
            let randomScale = lib.randomBetween(0.4, 2.0, false) * scale;
            let size = lib.clamp(140, 20 * randomScale, 235) * 1.9;
            let maxBrightness = lib.max(...brightness);
            let minBrightness = lib.min(...brightness);
            let randomBrightness = lib.randomBetween(minBrightness, maxBrightness, false);
            let position = lib.randomBetween(-5, 105, false);
            let delay = lib.randomBetween(-speed / 2.5, speed / 2, false, [0.97, 1.03]);
            let shapeStyle = shape === 'all'
                ? lib.randomItem(this.SHAPES) : shape;
            let filling = magicDOM.createElement('span', {
                classList: `glasium__background__shape--${shapeStyle}`
            });
            $(filling).css({
                '--size': `${size}px`,
                '--brightness': randomBrightness,
                left: `calc(${position}% - ${size}px / 2)`,
                animationDelay: `${delay}s`,
                animationDuration: `${speed / randomScale}s`
            });
            container.appendChild(filling);
        }
    }
    static #update(container, scale) {
        let SCALE_STEP = [
            100, 200, 300, 400, 500,
            600, 700, 800, 900, 1000,
            1100, 1200, 1300, 1400, 1500
        ];
        for (let step of SCALE_STEP)
            if (step >= container.offsetHeight + 0.866 * 30 * scale) {
                container.style.setProperty('--moving-size', `${step}px`);
                return;
            }
        container.style.setProperty('--moving-size', '1980px');
    }
    static change(container, { color = { background: '#44aadd', shape: '#44aadd' }, brightness = [0.87, 1.2], rotate = false } = {
        color: { background: '#44aadd', shape: '#44aadd' },
        brightness: [0.87, 1.2],
        rotate: false
    }) {
        if (!container.glasiumBackground)
            return;
        const background = container.glasiumBackground;
        $(background).css({
            '--background-color': color.background,
            '--shape-color': color.shape,
            '--rotation': rotate ? '360deg' : '0deg'
        });
        $('*', background).each(function () {
            let maxBrightness = lib.max(...brightness);
            let minBrightness = lib.min(...brightness);
            let randomBrightness = lib.randomBetween(minBrightness, maxBrightness, false);
            $(this).css('--brightness', randomBrightness);
        });
    }
    static SHAPES = [
        'triangle',
        'square',
        'hexagon',
        'circle',
        'all'
    ];
    static BRIGHTNESS = [[1.15, 1.35], [0.9, 1.1], [0.87, 1.2]];
    static COLOR = {
        blue: { background: '#44aadd', shape: '#44aadd' },
        red: { background: '#fb3852', shape: 'hsl(352, 85%, 50%)' },
        grey: { background: '#485e74', shape: '#485e74' },
        green: { background: '#38e538', shape: '#38e538' },
        pink: { background: '#ff66aa', shape: '#ff66aa' },
        darkred: { background: '#c52339', shape: '#c52339' },
        orange: { background: '#ffa502', shape: '#ffa502' },
        navyblue: { background: '#333d79', shape: '#333d79' },
        whitesmoke: { background: '#f6f6f6', shape: '#f6f6f6' },
        lightblue: { background: '#b9e8fd', shape: '#b9e8fd' },
        dark: { background: '#1e1e1e', shape: '#242424' },
        yellow: { background: '#ffc414', shape: '#fccc3de6' }
    };
    static init(container, { shape = 'triangle', color = { background: '#44aadd', shape: '#44aadd' }, brightness = [0.87, 1.2], scale = 2, speed = 34, count = 38, rotate = false } = {
        shape: 'triangle',
        color: { background: '#44aadd', shape: '#44aadd' },
        brightness: [0.87, 1.2],
        scale: 2,
        speed: 34,
        count: 38,
        rotate: false
    }) {
        if (!this.SHAPES.includes(shape))
            throw new Error(`'Glasium.init()' : '{shape}' is not valid`);
        /** check if there was a background before to re-initialize */
        const postBackground = $$('.glasium__background', container);
        if (postBackground)
            postBackground.remove();
        /** initial class list */
        const classList = ['glasium', ...container.classList];
        container.className = '';
        container.classList.add(...classList);
        $('*', container).each(function () {
            this.classList.add('glasium__content');
        });
        /** initialize background */
        const background = magicDOM.createElement('div', {
            classList: 'glasium__background'
        });
        $(background).css({
            '--background-color': color.background,
            '--shape-color': color.shape,
            '--rotation': rotate ? '360deg' : '0deg'
        });
        this.#fillBackground(background, { scale, speed, count, shape, brightness });
        container.insertBefore(background, container.firstChild);
        container.glasiumBackground = background;
        /** watch container's size */
        this.#update(background, scale);
        new ResizeObserver(() => this.#update(background, scale)).observe(container);
    }
    constructor(queryOrContainer, { shape = 'triangle', color = { background: '#44aadd', shape: '#44aadd' }, brightness = [0.87, 1.2], scale = 2, speed = 34, count = 38, rotate = false } = {
        shape: 'triangle',
        color: { background: '#44aadd', shape: '#44aadd' },
        brightness: [0.87, 1.2],
        scale: 2,
        speed: 34,
        count: 38,
        rotate: false
    }) {
        const findContainer = () => {
            if (typeof queryOrContainer === 'string') {
                const element = $$(queryOrContainer);
                if (element === null)
                    throw new Error(`'Glasium()' : 'queryOrContainer' returned null when selected`);
                return element;
            }
            return queryOrContainer;
        };
        this.container = findContainer();
        Glasium.init(this.container, { shape, color, brightness, rotate, scale, speed, count });
    }
    change({ color = { background: '#44aadd', shape: '#44aadd' }, brightness = [0.87, 1.2], rotate = false } = {
        color: { background: '#44aadd', shape: '#44aadd' },
        brightness: [0.87, 1.2],
        rotate: false
    }) {
        Glasium.change(this.container, { color, brightness, rotate });
    }
    container;
}
export default Glasium;
