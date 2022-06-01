interface DOMTreeNode {
    tag?: keyof HTMLElementTagNameMap;
    classList?: string | string[];
    attribute?: Record<string, string | number>;
    children?: Record<string, DOMTreeNode> | string | HTMLElement | HTMLElement[];
}
declare const magicDOM: {
    /**
     * Create a HTMLElement the easy way
     * @param       tagName             HTMLElement type
     * @param       prop                HTMLElement prop
     * @param       prop.id             HTMLElement id
     * @param       prop.classList      HTMLElement class list
     * @param       prop.attribute      HTMLElement attribute
     * @param       prop.child          HTMLElement child
     */
    createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, { id, classList, attribute, children }?: {
        id?: string;
        classList?: string | string[];
        attribute?: Record<string, string | number>;
        children?: string | HTMLElement | HTMLElement[];
    }): HTMLElementTagNameMap[K];
    createTree<K_1 extends keyof HTMLElementTagNameMap>(tag: K_1, classList?: string | string[], attribute?: Record<string, string | number>, children?: string | HTMLElement | HTMLElement[] | Record<string, DOMTreeNode | HTMLElement>): HTMLElementTagNameMap[K_1] & {
        [key: string]: HTMLElement;
    };
    /**
    * empty node
    * @param { HTMLElement } node node to empty
    */
    emptyNode(node: HTMLElement): void;
    /** this function only return the first child */
    toHTMLElement<T extends HTMLElement>(htmlString: string): T;
};
export default magicDOM;
export declare class Slider {
    /**
    * @param           option                               option for the slider
    * @param           option.color                         slider color ('pink' | 'blue')
    * @param           option.startValue                    slider's start value
    * @param           option.min                           slider's minimum value
    * @param           option.max                           slider's maximum value
    * @param           option.step                          slider's step
    * @param           option.comfortablePercentage         percentage
    */
    constructor({ color, startValue, min, max, step, comfortablePct }?: {
        color?: 'pink' | 'blue';
        startValue?: number;
        min?: number;
        max?: number;
        step?: number;
        comfortablePct?: number;
    });
    /** component */
    component: HTMLDivElement & {
        input?: HTMLInputElement;
        left?: HTMLDivElement;
        thumb?: HTMLDivElement;
        right?: HTMLDivElement;
    };
    input: HTMLInputElement;
    /** component assets */
    private left;
    private thumb;
    private right;
    /** handler collection */
    private inputHandlers;
    private changeHandlers;
    /** public functions */
    onInput(func: (value: string, event: Event) => void): void;
    onChange(func: (value: string, event: Event) => void): void;
    private removeDragState;
    private handleInputEvent;
    private handleChangeEvent;
    /** properties */
    private min;
    private max;
    private comfortablePct;
    /** render utilities */
    private slideTick;
    private render;
    /** tooltip events */
    private __usingTooltip;
    get usingTooltip(): boolean;
    tooltip({ handler }?: {
        handler?: (value: string) => string;
    }): this;
}
export declare class Select {
    constructor();
    /** component */
    component: HTMLElement;
    selectBox: HTMLElement;
}
//# sourceMappingURL=magic-dom.d.ts.map