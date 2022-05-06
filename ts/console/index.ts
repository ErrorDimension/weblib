import StopClock from './../stopclock'
import magicDOM from './../magic-dom'
import zalib from './../lib'
import { $ } from './../jquery'


const starterSC = new StopClock()


type Log = 'okay' | 'error' | 'warn' | 'debug' | 'info' | 'crit'


class Console {
    background: string
    color: string
    text: string
    displayTo?: string


    constructor(text: string, {
        color = 'white',
        background = 'rgb(255, 255, 255)',
        opacity = 0.55,
        displayTo = null
    } = {}) {
        function toRgba(clr: string) {
            if (clr.startsWith('rgba')) return clr
            if (clr.startsWith('rgb')) return `rgba(${clr.substring(4, clr.length - 1)}, ${opacity})`
            if (clr.startsWith('#')) {
                let { red, blue, green } = zalib.hexToRgb(clr)
                return `rgba(${red}, ${green}, ${blue}, ${opacity})`
            }

            let rgb = zalib.hexToRgb(zalib.hexCodeColor(clr))
            return `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${opacity})`
        }

        this.background = toRgba(background)
        this.text = text
        this.color = color
        if (typeof displayTo === 'string')
            this.displayTo = displayTo
    }


    static get #padding() {
        let userAgent = navigator.userAgent.toLowerCase()

        if (userAgent.match(/edg/i))                    /* Edge */
            return 16

        if (userAgent.match(/chrome|chromium|crios/i))  /* Chrome */
            return 10

        if (userAgent.match(/firefox|fxios/i))          /* Firefox */
            return "firefox"

        if (userAgent.match(/safari/i))                 /* Safari */
            return "safari"

        if (userAgent.match(/opr\//i))                  /* Opera */
            return "opera"

        return 'No browser detected'
    }


    static get #space() {
        switch (this.#padding) {
            case 10:
                return ' '
            case 16:
                return '  '
            default:
                return ' '
        }
    }


    /**
     * @param { object[] } args datas
     */
    static #dataChanneling(args: Console[], id: Log) {
        const style: string[] = []
        let text = `${this.#space}`


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


        if (["info", "okay", "debug"].includes(id))
            style[0] += `margin-inline-start: ${this.#padding}px`

        return { text, style }
    }


    static #log(id: Log, ...args: any[]) {
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
        ]
        const other = []

        for (let arg of args) {
            if (arg instanceof Console) {
                consoleClass.push(arg)
                continue
            }

            other.push(arg)
        }

        const { text, style } = this.#dataChanneling(consoleClass, id)


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


    static #infoLog = new Console('info', {
        color: 'white',
        background: 'rgb(196, 24, 196)',
        opacity: 0.95
    })
    static #debugLog = new Console('debug', {
        color: 'white',
        background: zalib.hexCodeColor('gray'),
        opacity: 0.55
    })
    static #okayLog = new Console('okay', {
        color: 'white',
        background: 'rgb(16, 186, 16)',
        opacity: 0.85
    })
    static #warnLog = new Console('warn', {
        color: 'white',
        background: '#ffc400',
        opacity: 0.8
    })
    static #errorLog = new Console('error', {
        color: 'white',
        background: '#c40000',
        opacity: 0.9
    })
    static #critLog = new Console('crit', {
        color: 'white',
        background: '#2b2a2a',
        opacity: 1
    })


    static display(query: string, {
        code = -1,
        description = 'Unknown',
        message = (cd: number | string, des: string): string | { bigMessage: string, smallMessage: string } => `[${cd}] >>> ${des}`,
        title = (cd: number | string = '', des: string = ''): string => `💣 Oh shit, it's an ERROR !!!`
    } = {}) {
        let container = $(query)[0]

        if (!(container instanceof HTMLElement)) {
            this.warn('`throw` : `logTo` is not a correct query/element')
            return
        }

        magicDOM.emptyNode(container)

        let msg = message(code, description)
        let bigMessage = msg
        let smallMessage = 'Reload the page or maybe try reaching out to the creator'

        if (msg instanceof Object) {
            bigMessage = msg.bigMessage
            smallMessage = msg.smallMessage
        }

        const errorBlock = magicDOM.createElement('div', {
            classList: 'error',
            child: [
                magicDOM.createElement('div', {
                    classList: 'error__title',
                    child: title(code, JSON.stringify(message))
                }),
                magicDOM.createElement('div', {
                    classList: [
                        'error__description',
                        'error__description--big'
                    ],
                    child: bigMessage as string
                }),
                magicDOM.createElement('div', {
                    classList: [
                        'error__description',
                        'error__description--small'
                    ],
                    child: smallMessage as string
                })
            ]
        })

        container.append(errorBlock)
    }


    static info(...args: any[]) { return this.#log('info', this.#infoLog, ...args) }
    static debug(...args: any[]) { return this.#log('debug', this.#debugLog, ...args) }
    static warn(...args: any[]) { return this.#log('warn', this.#warnLog, ...args) }
    static crit(...args: any[]) { return this.#log('crit', this.#critLog, ...args) }
    static error(...args: any[]) { return this.#log('error', this.#errorLog, ...args) }
    static okay(...args: any[]) { return this.#log('okay', this.#okayLog, ...args) }
    static init() {
        this.okay(`Log started at : ${zalib.prettyTime()}`)

        window.addEventListener("error", error => {
            if (error.error instanceof Object) {
                this.crit(`Uncaught [object Object] \nat ${error.filename}:${error.lineno}:${error.colno}\n`, error.error)
                return
            }

            this.crit(`${error.message} \nat ${error.filename}:${error.lineno}:${error.colno}`)
        })
    }
}


export default Console
