declare type Shape = 'triangle' | 'square' | 'hexagon' | 'all' | 'circle';
interface Properties {
    shape?: Shape;
    color?: {
        background: string;
        shape: string;
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
    }>;
    static init(container: HTMLElement & {
        glasiumBackground?: HTMLDivElement;
    }, { shape, color, brightness, scale, speed, count, rotate }?: Properties): void;
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