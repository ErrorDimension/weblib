declare type ELoELO = EventListenerOrEventListenerObject;
declare type E<Type> = Type extends Window ? WindowEventMap : Type extends Document ? DocumentEventMap : Type extends HTMLElement ? HTMLElementEventMap : never;
declare type K<Type> = keyof E<Type>;
declare class JHTMLElement<Type extends Window | Document | HTMLElement | Node> extends Array<Type> {
    css(property: string, value: string | number | null): JHTMLElement<Type>;
    css(record: Record<string, string | number | null>): JHTMLElement<Type>;
    attr(name: string, value: string): JHTMLElement<Type>;
    attr(record: Record<string, string | null>): JHTMLElement<Type>;
    dataset(name: string, value: string | null): JHTMLElement<Type>;
    dataset(record: Record<string, string | null>): JHTMLElement<Type>;
    each(func: (this: Type, index: number) => any): JHTMLElement<Type>;
    remove(): JHTMLElement<Type>;
    append(...nodes: (string | Node)[]): JHTMLElement<Type>;
    /**
     * @param       event               event type
     * @param       listener            listener function
     * @param       options             options
     */
    on<Key extends K<Type>>(event: Key, listener: (this: Type, ev: E<Type>[Key]) => any, options?: boolean | AddEventListenerOptions): JHTMLElement<Type>;
    /**
     * @param       event               event type
     * @param       listener            listener function
     * @param       options             options
     */
    on(event: string, listener: ELoELO, options?: boolean | AddEventListenerOptions): JHTMLElement<Type>;
    /**
     * @param       event               event type
     * @param       listener            listener function
     * @param       options             options
     */
    off<Key extends K<Type>>(event: Key, listener: (this: Type, ev: E<Type>[Key]) => any, options?: boolean | AddEventListenerOptions): JHTMLElement<Type>;
    /**
     * @param       event               event type
     * @param       listener            listener function
     * @param       options             options
     */
    off(event: string, listener: ELoELO, options?: boolean | AddEventListenerOptions): JHTMLElement<Type>;
    addClass(...className: string[]): JHTMLElement<Type>;
    removeClass(...className: string[]): JHTMLElement<Type>;
    toggleClass(className: string): JHTMLElement<Type>;
}
export declare function $$<T extends HTMLElement>(query: string): T;
export declare function $$<T extends HTMLElement>(query: string, element?: HTMLElement): T;
export declare function $$<T extends HTMLElement>(query: string, fromQuery?: string): T;
export declare function $(doc: Document): JHTMLElement<Document>;
export declare function $(win: Window): JHTMLElement<Window>;
export declare function $<T extends HTMLElement>(query: string, fromQuery: string): JHTMLElement<T>;
export declare function $<T extends HTMLElement>(query: string, element: HTMLElement): JHTMLElement<T>;
export declare function $<T extends HTMLElement>(query: string): JHTMLElement<T>;
export declare function $<T extends HTMLElement>(elements: NodeList): JHTMLElement<T>;
export declare function $<T extends HTMLElement>(element: T): JHTMLElement<T>;
declare const jquery: {
    $$: typeof $$;
    $: typeof $;
};
export default jquery;
//# sourceMappingURL=jquery.d.ts.map