import StopClock from './stopclock';
import magicDOM from './magic-dom';
import zalib from './lib';
import { $, $$ } from './jquery';
const starterSC = new StopClock();
class Console {
    text;
    color;
    background;
    constructor(text, { color = 'white', background = 'rgb(255, 255, 255)', opacity = 0.55 } = {}) {
        function toRgba(clr) {
            if (clr.startsWith('rgba'))
                return clr;
            if (clr.startsWith('rgb'))
                return `rgba(${clr.substring(4, clr.length - 1)}, ${opacity})`;
            if (clr.startsWith('#')) {
                let { red, blue, green } = zalib.hexToRgb(clr);
                return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
            }
            let rgb = zalib.hexToRgb(zalib.hexCodeColor(clr));
            return `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${opacity})`;
        }
        this.text = text;
        this.color = color;
        this.background = toRgba(background);
    }
    static initialized = false;
    static get #padding() {
        let userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.match(/edg/i)) /* Edge */
            return 16;
        if (userAgent.match(/chrome|chromium|crios/i)) /* Chrome */
            return 10;
        if (userAgent.match(/firefox|fxios/i)) /* Firefox */
            return "firefox";
        if (userAgent.match(/safari/i)) /* Safari */
            return "safari";
        if (userAgent.match(/opr\//i)) /* Opera */
            return "opera";
        return 'No browser detected';
    }
    static get #space() {
        switch (this.#padding) {
            case 10:
                return ' ';
            case 16:
                return '  ';
            default:
                return ' ';
        }
    }
    /**
     * @param { object[] } args datas
     */
    static #dataChanneling(args, id) {
        const style = [];
        let text = `${this.#space}`;
        args.forEach((arg, idx) => {
            const stylePallette = [
                'border-radius: 4px;',
                `font-weight: bold;`,
                `background-color: ${arg.background};`,
                'margin-block-end: 0.25em;',
                'padding-inline: 1em;',
                `color: ${arg.color};`
            ];
            text += `%c${arg.text}%c `;
            style.push(stylePallette.join(''), 'visibility: hidden');
        });
        if (["info", "okay", "debug"].includes(id))
            style[0] += `margin-inline-start: ${this.#padding}px`;
        return { text, style };
    }
    static #log(id, ...args) {
        const consoleClass = [
            new Console(zalib.prettyTime({ format: 'HH:mm:ss' }), {
                background: zalib.hexCodeColor('blue'),
                opacity: 0.75
            }),
            new Console(zalib.round(starterSC.click, 3).toFixed(3), {
                background: zalib.hexCodeColor('aqua'),
                opacity: 0.85
            }),
            new Console(window.location.pathname, {
                background: '#f48287',
                opacity: 0.9
            })
        ];
        const other = [];
        for (let arg of args) {
            if (arg instanceof Console) {
                consoleClass.push(arg);
                continue;
            }
            other.push(arg);
        }
        const { text, style } = this.#dataChanneling(consoleClass, id);
        switch (id) {
            case 'debug':
                return console.debug.call(console, text, ...style, ...other);
            case 'info':
            case 'okay':
                return console.log.call(console, text, ...style, ...other);
            case 'warn':
                return console.warn.call(console, text, ...style, ...other);
            case 'error':
            case 'crit':
                return console.error.call(console, text, ...style, ...other);
        }
    }
    static #infoLog = new Console('info', {
        color: 'white',
        background: 'rgb(196, 24, 196)',
        opacity: 0.95
    });
    static #debugLog = new Console('debug', {
        color: 'white',
        background: zalib.hexCodeColor('gray'),
        opacity: 0.55
    });
    static #okayLog = new Console('okay', {
        color: 'white',
        background: 'rgb(16, 186, 16)',
        opacity: 0.85
    });
    static #warnLog = new Console('warn', {
        color: 'white',
        background: '#ffc400',
        opacity: 0.8
    });
    static #errorLog = new Console('error', {
        color: 'white',
        background: '#c40000',
        opacity: 0.9
    });
    static #critLog = new Console('crit', {
        color: 'white',
        background: '#2b2a2a',
        opacity: 1
    });
    static display(queryOrElement, { code = -1, icon = '💣', title = `Oh shit, it's an ERROR !!!`, message = `Unknown`, description = 'Reload the page or maybe try reaching out to the creator', } = {}) {
        let container = typeof queryOrElement === 'string'
            ? $$(queryOrElement)
            : $(queryOrElement)[0];
        if (!(container instanceof HTMLElement))
            throw new Error(`'Console.display()' : 'queryOrElement' is not valid`);
        magicDOM.emptyNode(container);
        const errorBlock = magicDOM.createTree({
            classList: 'error', child: {
                t: { classList: 'error__title', child: `${icon} ${title}` },
                m: { classList: 'error__message', child: `[${code}] >>> ${message}` },
                d: { classList: 'error__description', child: description }
            }
        });
        container.append(errorBlock);
    }
    static info(...args) { return this.#log('info', this.#infoLog, ...args); }
    static debug(...args) { return this.#log('debug', this.#debugLog, ...args); }
    static warn(...args) { return this.#log('warn', this.#warnLog, ...args); }
    static crit(...args) { return this.#log('crit', this.#critLog, ...args); }
    static error(...args) { return this.#log('error', this.#errorLog, ...args); }
    static okay(...args) { return this.#log('okay', this.#okayLog, ...args); }
    static init() {
        if (this.initialized)
            return;
        this.okay(`Log started at : ${zalib.prettyTime()}`);
        $(window).on('error', function ({ message, filename, lineno, colno, error }) {
            if (error instanceof Object) {
                Console.crit(`Uncaught [object Object]\nat ${error.filename}:${error.lineno}:${error.colno}\n`, error);
                return;
            }
            Console.crit(`${message}\nat ${filename}:${lineno}:${colno}`);
        });
        this.initialized = true;
    }
}
export default Console;
