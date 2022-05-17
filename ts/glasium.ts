import { $, $$ } from './jquery'
import lib from './lib'
import magicDOM from './magic-dom'


type Shape = 'triangle' | 'square' | 'hexagon' | 'all' | 'circle'

interface Properties {
    shape?: Shape,
    color?: { background: string, shape: string },
    brightness?: [number, number],
    scale?: number,
    speed?: number,
    count?: number,
    rotate?: boolean
}

class Glasium {
    static __isWatching: boolean = false
    static get isWatching(): boolean { return this.__isWatching }

    static watch(): void {
        if (this.__isWatching) return
        this.__isWatching = true

        $('[data-glasium]').each(function (): void { Glasium.init(this) })
    }


    static async #fillBackground(container: HTMLDivElement, { scale, speed, count, shape, brightness }: {
        scale: number,
        speed: number,
        count: number,
        shape: Shape,
        brightness: [number, number]
    }): Promise<void> {
        speed = lib.max(count * 1.25, speed)

        for (let i = 0; i < count; ++i) {
            let randomScale = lib.randomBetween(0.4, 2.0, false) * scale

            let size = lib.clamp(140, 20 * randomScale, 235) * 1.9

            let maxBrightness = lib.max(...brightness)
            let minBrightness = lib.min(...brightness)
            let randomBrightness = lib.randomBetween(
                minBrightness,
                maxBrightness,
                false
            )

            let position = lib.randomBetween(0, 100, false)

            let delay = lib.randomBetween(
                -speed / 2.5,
                speed / 2,
                false,
                [0.97, 1.03]
            )

            let shapeStyle: Shape = shape === 'all'
                ? lib.randomItem(this.SHAPES) : shape
            let filling = magicDOM.createElement('span', {
                classList: `glasium__background__shape--${shapeStyle}`
            })

            $(filling).css({
                '--size': `${size}px`,
                '--brightness': randomBrightness,
                left: `calc(${position}% - ${size}px / 2)`,
                animationDelay: `${delay}s`,
                animationDuration: `${speed / randomScale}s`
            })

            container.appendChild(filling)
        }
    }


    static #update(container: HTMLDivElement, scale: number): void {
        let SCALE_STEP: number[] = [
            100, 200, 300, 400, 500,
            600, 700, 800, 900, 1000,
            1100, 1200, 1300, 1400, 1500
        ]

        for (let step of SCALE_STEP)
            if (step >= container.offsetHeight + 0.866 * 30 * scale) {
                container.style.setProperty('--moving-size', `${step}px`)
                return
            }

        container.style.setProperty('--moving-size', '1980px')
    }


    static change(container: HTMLElement & {
        glasiumBackground?: HTMLDivElement
    }, {
        color = { background: '#44aadd', shape: '#44aadd' },
        brightness = [0.87, 1.2],
        rotate = false
    }: {
        color?: { background: string, shape: string },
        brightness?: [number, number],
        rotate?: boolean
    } = {}): void {
        if (!container.glasiumBackground) return

        const background = container.glasiumBackground

        $(background).css({
            '--background-color': color.background,
            '--shape-color': color.shape,
            '--rotation': rotate ? '360deg' : '0deg'
        })

        $('*', background).each(function () {
            let maxBrightness = lib.max(...brightness)
            let minBrightness = lib.min(...brightness)
            let randomBrightness = lib.randomBetween(
                minBrightness,
                maxBrightness,
                false
            )

            $(this).css('--brightness', randomBrightness)
        })
    }


    static SHAPES: Shape[] = [
        'triangle',
        'square',
        'hexagon',
        'circle',
        'all'
    ]
    static BRIGHTNESS: [number, number][] = [[1.15, 1.35], [0.9, 1.1], [0.87, 1.2]]
    static COLOR: Record<string, { background: string, shape: string }> = {
        BLUE: { background: '#44aadd', shape: '#44aadd' },
        RED: { background: '#fb3852', shape: 'hsl(352, 85%, 50%)' },
        GREY: { background: '#485e74', shape: '#485e74' },
        GREEN: { background: '#38e538', shape: '#38e538' },
        PINK: { background: '#ff66aa', shape: '#ff66aa' },
        DARKRED: { background: '#c52339', shape: '#c52339' },
        ORANGE: { background: '#ffa502', shape: '#ffa502' },
        NAVYBLUE: { background: '#333d79', shape: '#333d79' },
        WHITESMOKE: { background: '#f6f6f6', shape: '#f6f6f6' },
        LIGHTBLUE: { background: '#b9e8fd', shape: '#b9e8fd' },
        DARK: { background: '#1e1e1e', shape: '#242424' },
        YELLOW: { background: '#ffc414', shape: '#fccc3de6' }
    }

    static init(container: HTMLElement & {
        glasiumBackground?: HTMLDivElement
    }, {
        shape = 'triangle',
        color = { background: '#44aadd', shape: '#44aadd' },
        brightness = [0.87, 1.2],
        scale = 2,
        speed = 34,
        count = 19,
        rotate = false
    }: Properties = {}): void {
        if (!this.SHAPES.includes(shape))
            throw new Error(`'Glasium.init()' : '{shape}' is not valid`)


        /** initial class list */
        const classList = [...container.classList]
        container.className = ''
        container.classList.add('glasium', ...classList)

        $('*', container).addClass('glasium__content')
        new MutationObserver(() => {
            $('*:not(.glasium__background)', container).addClass('glasium__content')
        }).observe(container, {
            childList: true,
            subtree: true
        })


        /** check if there was a background before to re-initialize */
        container.querySelector('.glasium__background')?.remove()


        /** initialize background */
        const background: HTMLDivElement = magicDOM.createElement('div')

        $(background).css({
            '--background-color': color.background,
            '--shape-color': color.shape,
            '--rotation': rotate ? '360deg' : '0deg'
        }).addClass('glasium__background')

        this.#fillBackground(background, { scale, speed, count, shape, brightness })

        container.insertBefore(background, container.firstChild)
        container.glasiumBackground = background


        /** watch container's size */
        this.#update(background, scale)
        new ResizeObserver((): void => this.#update(background, scale))
            .observe(container)
    }


    constructor(queryOrContainer: string | HTMLElement, {
        shape = 'triangle',
        color = { background: '#44aadd', shape: '#44aadd' },
        brightness = [0.87, 1.2],
        scale = 2,
        speed = 34,
        count = 38,
        rotate = false
    }: Properties = {}) {
        const findContainer = () => {
            if (typeof queryOrContainer === 'string') {
                const element = $$(queryOrContainer)
                if (element === null)
                    throw new Error(`'Glasium()' : 'queryOrContainer' returned null when selected`)
                return element
            }

            return queryOrContainer
        }

        this.container = findContainer()

        Glasium.init(this.container, { shape, color, brightness, rotate, scale, speed, count })
    }


    container: HTMLElement & { glasiumBackground?: HTMLDivElement }


    change({
        color = { background: '#44aadd', shape: '#44aadd' },
        brightness = [0.87, 1.2],
        rotate = false
    }: {
        color?: { background: string, shape: string },
        brightness?: [number, number],
        rotate?: boolean
    } = {}): void { Glasium.change(this.container, { color, brightness, rotate }) }
}


export default Glasium
