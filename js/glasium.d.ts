declare class Glasium {
    static SHAPES: GBackgroundShape[];
    static BRIGHTNESS: Record<string, [number, number]>;
    static COLOR: Record<string, GBackgroundColor>;
    private static shape;
    private static background;
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
    static init(element: HTMLElement, { shape, color, brightness, scale, speed, count, rotate, onMutation }?: GBackground): void;
    static change(element: HTMLElement, { shape, color, brightness, scale, speed, rotate }?: GBackground): void;
}
export default Glasium;
interface GBackground {
    shape?: GBackgroundShape;
    color?: GBackgroundColor;
    brightness?: [number, number];
    scale?: number;
    speed?: number;
    count?: number;
    rotate?: boolean;
    onMutation?: {
        true: {
            shape?: GBackgroundShape;
            color?: GBackgroundColor;
            brightness?: [number, number];
            scale?: number;
            speed?: number;
            rotate?: boolean;
        };
        false: {
            shape?: GBackgroundShape;
            color?: GBackgroundColor;
            brightness?: [number, number];
            scale?: number;
            speed?: number;
            rotate?: boolean;
        };
        callback(): boolean;
        observing: HTMLElement;
        options?: MutationObserverInit;
    };
}
interface GBackgroundColor {
    background: string;
    shape: string;
    invertContrast: boolean;
}
declare type GBackgroundShape = 'circle' | 'triangle' | 'square' | 'hexagon' | 'all';
//# sourceMappingURL=glasium.d.ts.map