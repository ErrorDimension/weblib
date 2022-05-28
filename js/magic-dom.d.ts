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
        id?: string | undefined;
        classList?: string | string[] | undefined;
        attribute?: Record<string, string | number> | undefined;
        children?: string | HTMLElement | HTMLElement[] | undefined;
    }): HTMLElementTagNameMap[K];
    createTree<K_1 extends keyof HTMLElementTagNameMap>(tag: K_1, classList?: string | string[] | undefined, attribute?: Record<string, string | number> | undefined, children?: string | HTMLElement | HTMLElement[] | Record<string, HTMLElement | DOMTreeNode> | undefined): HTMLElementTagNameMap[K_1] & {
        [key: string]: HTMLElement;
    };
    /**
    * empty node
    * @param { HTMLElement } node node to empty
    */
    emptyNode(node: HTMLElement): void;
    Slider: {
        new ({ color, startValue, min, max, step, comfortablePct }?: {
            color: 'pink' | 'blue';
            startValue: number;
            min: number;
            max: number;
            step: number;
            comfortablePct: number;
        }): {
            container: HTMLDivElement & {
                input?: HTMLInputElement;
                left?: HTMLDivElement;
                thumb?: HTMLDivElement;
                right?: HTMLDivElement;
            };
            input: HTMLInputElement;
            "__#2@#left": HTMLDivElement;
            "__#2@#thumb": HTMLDivElement;
            "__#2@#right": HTMLDivElement;
            "__#2@#inputHandlers": ((value: string, event: Event) => void)[];
            "__#2@#changeHandlers": ((value: string, event: Event) => void)[];
            "__#2@#removeDragState"(): void;
            "__#2@#handleInputEvent"(event: Event): void;
            "__#2@#handleChangeEvent"(event: Event): void;
            "__#2@#min": number;
            "__#2@#max": number;
            "__#2@#comfortablePct": number;
            "__#2@#slideTick": number;
            "__#2@#reRender"(): void;
            "__#2@#__usingTooltip": boolean;
            readonly usingTooltip: boolean;
            tooltip(decorationCallback?: (value: string) => string): this;
        };
    };
    /** this function only return the first child */
    toHTMLElement<T extends HTMLElement>(htmlString: string): T;
    scrollable(container: HTMLElement & {
        scrollBox: HTMLDivElement;
        scrollable?: boolean;
    }, maxPath?: number): {
        container: HTMLElement & {
            scrollBox: HTMLDivElement;
            scrollable?: boolean | undefined;
        };
        scrollBox: HTMLDivElement;
        append(...children: string[] | HTMLElement[]): {
            container: HTMLElement & {
                scrollBox: HTMLDivElement;
                scrollable?: boolean | undefined;
            };
            scrollBox: HTMLDivElement;
            append(...children: string[] | HTMLElement[]): any;
        };
    } | undefined;
};
export default magicDOM;
//# sourceMappingURL=magic-dom.d.ts.map