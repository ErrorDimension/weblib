import StopClock from './stopclock'
import magicDOM from './magic-dom'
import zalib from './lib'
import { $, $$ } from './jquery'
import Glasium from './glasium'


const starterSC = new StopClock()


type Log = 'okay' | 'error' | 'warn' | 'debug' | 'info' | 'crit'


class Console {
    text: string

    color?: string
    background?: string


    constructor(text: string, {
        color = 'white',
        background = 'rgb(255, 255, 255)',
        opacity = 0.55
    }: {
        color?: string
        background?: string
        opacity?: number
    } = {}) {
        function toRgba(clr: string) {
            if (clr.startsWith('rgba')) return clr
            if (clr.startsWith('rgb'))
                return `rgba(${clr.substring(4, clr.length - 1)}, ${opacity})`
            if (clr.startsWith('#')) {
                let { red, blue, green } = zalib.hexToRgb(clr)
                return `rgba(${red}, ${green}, ${blue}, ${opacity})`
            }

            let rgb = zalib.hexToRgb(zalib.hexCodeColor(clr))
            return `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${opacity})`
        }


        this.text = text
        this.color = color
        this.background = toRgba(background)
    }


    private static initialized = false


    private static get padding() {
        if (typeof window === 'undefined') return

        let userAgent = navigator.userAgent.toLowerCase()

        if (userAgent.match(/edg/i))                    /* Edge */
            return 16

        if (userAgent.match(/chrome|chromium|crios/i))  /* Chrome */
            return 10

        if (userAgent.match(/firefox|fxios/i))          /* Firefox */
            return 12

        if (userAgent.match(/safari/i))                 /* Safari */
            return "safari"

        if (userAgent.match(/opr\//i))                  /* Opera */
            return "opera"

        return 'No browser detected'
    }


    private static get space() {
        switch (this.padding) {
            case 10:
                return ' '
            case 16:
                return '  '
            case 12:
                return '  '
            default:
                return ' '
        }
    }


    /**
     * @param { object[] } args datas
     */
    private static dataChanneling(args: Console[], id: Log) {
        const style: string[] = []
        let text = `${this.space}`


        args.forEach((arg: Console, idx: number) => {
            const stylePallette = [
                'border-radius: 4px;',
                `font-weight: bold;`,
                `background-color: ${arg.background};`,
                'margin-block-end: 0.25em;',
                'padding-inline: 1em;',
                `color: ${arg.color};`
            ]

            text += `%c${arg.text}%c `
            style.push(stylePallette.join(''), 'visibility: hidden')
        })


        const logArray: string[] = typeof window !== 'undefined' && navigator.userAgent.toLowerCase().match(/firefox|fxios/i)
            ? ["info", "okay", "debug", "warn"]
            : ["info", "okay", "debug"]

        if (logArray.includes(id))
            style[0] += `margin-inline-start: ${this.padding}px`


        return { text, style }
    }


    private static log(id: Log, ...args: any[]) {
        const consoleClass = [
            new Console(zalib.prettyTime({ format: 'HH:mm:ss' }), {
                background: zalib.hexCodeColor('blue'),
                opacity: 0.75
            }),
            new Console(zalib.round(starterSC.click, 3).toFixed(3), {
                background: zalib.hexCodeColor('aqua'),
                opacity: 0.85
            }),
            new Console(typeof window !== 'undefined'
                ? window.location.pathname
                : '/*', {
                background: '#f48287',
                opacity: 0.9
            })
        ]
        const other = []

        for (let arg of args) {
            if (arg instanceof Console) {
                consoleClass.push(arg)
                continue
            }

            other.push(arg)
        }

        const { text, style } = this.dataChanneling(consoleClass, id)


        switch (id) {
            case 'debug':
                return console.debug.call(console, text, ...style, ...other)
            case 'info': case 'okay':
                return console.log.call(console, text, ...style, ...other)
            case 'warn':
                return console.warn.call(console, text, ...style, ...other)
            case 'error': case 'crit':
                return console.error.call(console, text, ...style, ...other)
        }
    }


    private static infoLog: Console = new Console('info', {
        color: 'white',
        background: 'rgb(196, 24, 196)',
        opacity: 0.95
    })
    private static debugLog: Console = new Console('debug', {
        color: 'white',
        background: zalib.hexCodeColor('gray'),
        opacity: 0.55
    })
    private static okayLog: Console = new Console('okay', {
        color: 'white',
        background: 'rgb(16, 186, 16)',
        opacity: 0.85
    })
    private static warnLog: Console = new Console('warn', {
        color: 'white',
        background: '#ffc400',
        opacity: 0.8
    })
    private static errorLog: Console = new Console('error', {
        color: 'white',
        background: '#c40000',
        opacity: 0.9
    })
    private static critLog: Console = new Console('crit', {
        color: 'white',
        background: '#2b2a2a',
        opacity: 1
    })


    /**
     * display the error and callback buttons to the selected
     * @param   { String | HTMLElement }    queryOrElement      selected query or element
     * @param   { Object | undefined }      detail              detail for the error as well as the callbacks
     */
    static display(queryOrElement: string | HTMLElement, {
        code = -1,
        icon = '💣',
        title = `Oh dammyum, it's an ERROR !!!`,
        message = `Unknown`,
        description = 'Reload the page or maybe try reaching out to the creator',
        buttons = []
    }: {
        code?: number | string,
        icon?: string,
        description?: string
        message?: string,
        title?: string,
        buttons?: {
            text: string,
            colorName?: string,
            iconName?: string,
            callback?: (this: GlobalEventHandlers, ev: MouseEvent) => any
        }[]
    } = {}): void {
        let container = typeof queryOrElement === 'string'
            ? $$(queryOrElement)
            : $(queryOrElement)[0]


        if (!(container instanceof HTMLElement))
            throw new Error(`'Console.display()' : 'queryOrElement' is not valid`)


        magicDOM.emptyNode(container)


        const errorBlock: HTMLDivElement = magicDOM.createTree(
            'div', 'error', {}, {
            t: { classList: 'error__title', children: `${icon} ${title}` },
            m: { classList: 'error__message', children: `[${code}] >>> ${message}` },
            d: { classList: 'error__description', children: description },
            c: { classList: 'error__callback' }
        })


        let colorIdx: number = 0
        const COLORS: string[] = ['BLUE', 'PURPLE', 'GREEN', 'YELLOW', "PINK"]


        const createBtn: (
            text: string,
            colorName?: string,
            iconName?: string,
            callback?: (this: GlobalEventHandlers, ev: MouseEvent) => any
        ) => HTMLButtonElement = (
            text: string,
            colorName?: string,
            iconName?: string,
            callback?: (this: GlobalEventHandlers, ev: MouseEvent) => any
        ): HTMLButtonElement => {
                const btn: HTMLButtonElement = magicDOM.toHTMLElement(`
                        <button>
                            <i class='fa-solid fa-${iconName ? iconName : 'circle'}'></i>
                            <div>${text}</div>
                        </button>
                    `)


                let color: string = colorName ? colorName : COLORS[colorIdx]

                Glasium.init(btn, { color: Glasium.COLOR[color] })

                colorIdx = (colorIdx + 1) % COLORS.length


                btn.onclick = callback ? callback : (): void => {/** empty */ }


                return btn
            }


        const callbackContainer: HTMLElement = errorBlock.querySelector('.error__callback') as HTMLElement


        buttons.forEach(button => {
            const btn: HTMLButtonElement = createBtn(
                button.text,
                button.colorName,
                button.iconName,
                button.callback
            )

            callbackContainer.append(btn)
        })


        container.append(errorBlock)
    }


    static info(...args: any[]): void { return this.log('info', this.infoLog, ...args) }
    static debug(...args: any[]): void { return this.log('debug', this.debugLog, ...args) }
    static warn(...args: any[]): void { return this.log('warn', this.warnLog, ...args) }
    static crit(...args: any[]): void { return this.log('crit', this.critLog, ...args) }
    static error(...args: any[]): void { return this.log('error', this.errorLog, ...args) }
    static okay(...args: any[]): void { return this.log('okay', this.okayLog, ...args) }
    static init(): void {
        if (typeof window === 'undefined') return
        if (this.initialized) return

        this.okay(`Log started at : ${zalib.prettyTime()}`)

        $(window).on('error', function ({ message, filename, lineno, colno, error }: ErrorEvent): void {
            if (error instanceof Object) {
                Console.crit(`Uncaught [object Object]\nat ${filename}:${lineno}:${colno}`, error)
                return
            }

            Console.crit(`${message}\nat ${filename}:${lineno}:${colno}`)
        })

        this.initialized = true
    }
}


export default Console
