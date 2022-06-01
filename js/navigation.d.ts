interface Component {
    container: HTMLElement;
    tooltip: Tooltip;
    clicker: Clicker;
    subWindow: SubWindow;
}
interface Navigation {
    initialized: boolean;
    container: HTMLElement | undefined;
    navbar: HTMLElement | undefined;
    block: {
        left: HTMLElement | undefined;
        right: HTMLElement | undefined;
    };
    tooltip: (HTMLElement & {
        t?: HTMLElement;
        d?: HTMLElement;
    }) | undefined;
    underlay: HTMLElement | undefined;
    subWindowList: SubWindow[];
    init(containerQuery: string, contentQuery: string): void;
    insert(component: {
        container: HTMLElement;
        [key: string]: any;
    }, location: 'left' | 'right', order?: number): void;
    setUnderlay(activate?: boolean): void;
    set loading(loading: boolean);
    account: {
        userToken: string | undefined;
        [key: string]: any;
    };
    addComponent: {
        logo({ icon, title, onlyActive }: {
            icon?: string;
            title?: string;
            onlyActive?: boolean;
        }): Component;
        route(record: Record<string, {
            href: string;
            icon?: string;
            tooltip?: {
                title?: string;
                description?: string;
            };
        }>, spa?: boolean): void;
        hamburger(func?: () => void): Component;
        button({ icon, imageSrc, colorName, alwaysActive, brightnessLevel, func, text }: {
            icon?: string;
            imageSrc?: string;
            colorName?: string;
            alwaysActive?: boolean;
            brightnessLevel?: string;
            func?: (...args: any[]) => any;
            text?: string;
        }): Component & {
            set icon(icon: string);
            set image(src: string);
        };
        account(): Component & {
            set avatar(src: string);
            set userName(userName: string);
            set background(colorName: string);
        };
    };
}
/** {@linkcode Navigation} */
declare const navigation: Navigation;
export declare class Tooltip {
    constructor(target: HTMLElement);
    /** props */
    private title;
    private description;
    private flip;
    /** component */
    private container?;
    set({ title, description, flip }?: {
        title?: string;
        description?: string;
        flip?: boolean;
    }): void;
    show({ target }: MouseEvent): void;
    hide(): void;
}
export declare class Clicker {
    constructor(container: HTMLElement, onlyActive?: boolean);
    /** component */
    private container;
    /** handler collection */
    private clickHandlers;
    /** props */
    private __activated;
    /** prop getters */
    get activated(): boolean;
    /** public functions */
    onClick(func: (...args: any[]) => any): number;
    offClick(index: number): void;
    toggle(isActive?: boolean): void;
    show(): void;
    hide(): void;
}
export declare class SubWindow {
    constructor(container: HTMLElement, content?: HTMLElement | string);
    /** public functions */
    update(): void;
    show(): void;
    hide(trusted?: boolean): void;
    toggle(): void;
    onToggle(func: (...args: any[]) => any): void;
    /** setters */
    set loaded(loaded: boolean);
    set content(content: HTMLElement | string);
    /** props getters */
    get id(): string;
    get isShowing(): boolean;
    /** props */
    private __id;
    private __isShowing;
    private __hideTimeoutId;
    /** handlers collection */
    private toggleHandlers;
    /** component */
    private container;
    /** component nodes */
    private contentNode;
    private windowNode;
    private overlayNode;
}
export default navigation;
//# sourceMappingURL=navigation.d.ts.map