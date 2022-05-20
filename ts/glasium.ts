import { $, $$ } from './jquery'
import lib from './lib'
import magicDOM from './magic-dom'


type Shape = 'triangle' | 'square' | 'hexagon' | 'all' | 'circle'

interface Properties {
    shape?: Shape,
    color?: { background: string, shape: string, invertContrast: boolean },
    brightness?: [number, number],
    scale?: number,
    speed?: number,
    count?: number,
    rotate?: boolean
}

class Glasium {
    static SHAPES: GBackgroundShape[] = [
        'triangle',
        'square',
        'hexagon',
        'circle',
        'all'
    ]

    static BRIGHTNESS: Record<string, [number, number]> = {
        DARK: [1.14, 1.3],
        LIGHT: [0.9, 1.05],
        OTHER: [0.9, 1.2],
    }

    static COLOR: Record<string, GBackgroundColor> = {
        BLUE: { background: '#44aadd', shape: '#44aadd', invertContrast: false },
        RED: { background: '#fb3852', shape: 'hsl(352, 85%, 50%)', invertContrast: false },
        GREY: { background: '#485e74', shape: '#485e74', invertContrast: false },
        GREEN: { background: '#38e538', shape: '#38e538', invertContrast: false },
        PINK: { background: '#ff66aa', shape: '#ff66aa', invertContrast: false },
        DARKRED: { background: '#c52339', shape: '#c52339', invertContrast: false },
        ORANGE: { background: '#ffa502', shape: '#ffa502', invertContrast: false },
        NAVYBLUE: { background: '#333d79', shape: '#333d79', invertContrast: false },
        WHITESMOKE: { background: '#f6f6f6', shape: '#f6f6f6', invertContrast: true },
        LIGHTBLUE: { background: '#b9e8fd', shape: '#b9e8fd', invertContrast: true },
        DARK: { background: '#1e1e1e', shape: '#242424', invertContrast: false },
        YELLOW: { background: '#ffc414', shape: '#fccc3de6', invertContrast: false }
    }


    static #shape(background: HTMLElement, {
        shape = 'triangle',
        count = 10,
        brightness = Glasium.BRIGHTNESS.OTHER,
        scale = 2,
        speed = 2
    }: GBackground): void {
        for (let i: number = 0; i < count; ++i) {
            /** insert shape */
            const shapeType: GBackgroundShape = shape === 'all'
                ? lib.randomItem(Glasium.SHAPES) : shape

            const item: HTMLElement = magicDOM.createElement('div', {
                classList: `glasium__shape--${shapeType}`
            })

            background.append(item)


            /** css value */
            let randomScale: number = lib.randomBetween(0.4, 2, false) * scale
            let randomBrightness: number = lib.randomBetween(
                brightness[0], brightness[1], false,
                [0.97, 1.03]
            )
            let size: number = 26 * randomScale
            let position: number = lib.randomBetween(0, 100, false)
            let speedPerFiveSeconds: number = lib.randomBetween(0.67, 1.35, false) * 5 / speed
            let delay: number = lib.randomBetween(-speedPerFiveSeconds / 2, speedPerFiveSeconds / 2, false)


            /** css */
            $(item).css({
                '--size': `${size}px`,
                '--brightness': randomBrightness,
                left: `calc(${position}% - ${size}px / 2)`,
                animationDelay: `${delay}s`,
                animationDuration: `${speedPerFiveSeconds}s`
            })
        }
    }


    static #background(element: HTMLElement, {
        shape = 'triangle',
        color = this.COLOR.BLUE,
        brightness = this.BRIGHTNESS.OTHER,
        scale = 2,
        speed = 2,
        count = 10,
        rotate = false
    }: GBackground): void {
        /** insert background */
        const background: HTMLDivElement = magicDOM.createElement('div', {
            classList: 'glasium__background'
        })

        element.appendChild(background)


        /** css for the background and element */
        $(background).css({
            '--background-color': color.background,
            '--rotation': rotate ? '360deg' : '0deg',
            '--shape-color': color.shape,
            '--background-height': `${background.offsetHeight}px`
        })

        element.style.color = color.invertContrast ? 'black' : 'white'


        /** watch size */
        new ResizeObserver((): void => {
            $(background).css('--background-height', `${background.offsetHeight}px`)
        }).observe(background)


        /** fill the background with shapes */
        this.#shape(background, { shape, brightness, scale, speed, count })
    }


    /**
     * @param       element                     element
     * @param       options.shape               shape inside the background
     * @param       options.color               color for the background
     * @param       options.brightness          brightness 
     * @param       options.scale               scale size (bigger number is bigger size)
     * @param       options.speed               speed (how many iterations per 5 seconds)
     * @param       options.count               shape count
     * @param       options.rotate              rotation
     */
    static init(element: HTMLElement, {
        shape = 'triangle',
        color = this.COLOR.BLUE,
        brightness = this.BRIGHTNESS.OTHER,
        scale = 2,
        speed = 2,
        count = 10,
        rotate = false
    }: GBackground = {}): void {
        /** remove current background */
        let currentBackground: Element | null = element.querySelector('.glasium__background')

        if (currentBackground) currentBackground.remove()


        /** initialize class list */
        const classList: string[] = [...element.classList]
        element.className = ''
        element.classList.add('glasium', ...classList)


        /** initialize background */
        this.#background(element, { shape, color, brightness, scale, speed, count, rotate })
    }


    static change(element: HTMLElement, {
        shape = 'triangle',
        color = this.COLOR.BLUE,
        brightness = this.BRIGHTNESS.OTHER,
        scale = 2,
        speed = 2,
        count = 10,
        rotate = false
    }: GBackground = {}): void {
        const background: HTMLElement | null = element.querySelector('.glasium__background')

        if (background === null) return


        /** background css */
        $(background).css({
            '--background-color': color.background,
            '--rotation': rotate ? '360deg' : '0deg',
            '--shape-color': color.shape,
            '--background-height': `${background.offsetHeight}px`
        })

        element.style.color = color.invertContrast ? 'black' : 'white'


        /** shape css */
        $('*', background).each(function (): void {
            /** change shape */
            const shapeType: GBackgroundShape = shape === 'all'
                ? lib.randomItem(Glasium.SHAPES) : shape

            this.className = ''
            this.classList.add(`glasium__shape--${shapeType}`)


            /** css value */
            let randomScale: number = lib.randomBetween(0.4, 2, false) * scale
            let randomBrightness: number = lib.randomBetween(
                brightness[0], brightness[1], false,
                [0.97, 1.03]
            )
            let size: number = 26 * randomScale
            let position: number = lib.randomBetween(0, 100, false)
            let speedPerFiveSeconds: number = lib.randomBetween(0.67, 1.35, false) * 5 / speed
            let delay: number = lib.randomBetween(-speedPerFiveSeconds / 2, speedPerFiveSeconds / 2, false)


            /** css */
            $(this).css({
                '--size': `${size}px`,
                '--brightness': randomBrightness,
                left: `calc(${position}% - ${size}px / 2)`,
                animationDelay: `${delay}s`,
                animationDuration: `${speedPerFiveSeconds}s`
            })
        })
    }
}


export default Glasium


interface GBackground {
    shape?: GBackgroundShape,
    color?: GBackgroundColor,
    brightness?: [number, number],
    scale?: number,
    speed?: number,
    count?: number,
    rotate?: boolean
}


interface GBackgroundColor {
    background: string,
    shape: string,
    invertContrast: boolean
}


type GBackgroundShape = 'circle' | 'triangle' | 'square' | 'hexagon' | 'all'
