declare type Shape = 'triangle' | 'square' | 'hexagon' | 'all' | 'circle';
interface Properties {
    shape?: Shape;
    color?: {
        background: string;
        shape: string;
        invertContrast: boolean;
    };
    brightness?: [number, number];
    scale?: number;
    speed?: number;
    count?: number;
    rotate?: boolean;
}
declare class Glasium {
    #private;
    static __isWatching: boolean;
    static get isWatching(): boolean;
    static watch(): void;
    static change(container: HTMLElement & {
        glasiumBackground?: HTMLDivElement;
    }, { color, brightness, rotate }?: {
        color?: {
            background: string;
            shape: string;
        };
        brightness?: [number, number];
        rotate?: boolean;
    }): void;
    static SHAPES: Shape[];
    static BRIGHTNESS: [number, number][];
    static COLOR: Record<string, {
        background: string;
        shape: string;
        invertContrast: boolean;
    }>;
    /**
     * glasium initialization
     * @param       container
     * @param       options
     * @param       options.shape               shape inside the background
     * @param       options.color               color for the background
     * @param       options.brightness          brightness
     * @param       options.scale               scale size (bigger number is bigger size)
     * @param       options.speed               speed (bigger number is smaller speed)
     * @param       options.count               shape count
     * @param       options.rotate              rotation
     */
    static init(container: HTMLElement & {
        glasiumBackground?: HTMLDivElement;
    }, { shape, color, brightness, scale, speed, count, rotate }?: Properties): void;
    /**
     *
     * @param       queryOrContainer            select container
     * @param       options.shape               shape inside the background
     * @param       options.color               color for the background
     * @param       options.brightness          brightness
     * @param       options.scale               scale size (bigger number is bigger size)
     * @param       options.speed               speed (bigger number is smaller speed)
     * @param       options.count               shape count
     * @param       options.rotate              rotation
     */
    constructor(queryOrContainer: string | HTMLElement, { shape, color, brightness, scale, speed, count, rotate }?: Properties);
    container: HTMLElement & {
        glasiumBackground?: HTMLDivElement;
    };
    change({ color, brightness, rotate }?: {
        color?: {
            background: string;
            shape: string;
        };
        brightness?: [number, number];
        rotate?: boolean;
    }): void;
}
export default Glasium;
//# sourceMappingURL=glasium.d.ts.map