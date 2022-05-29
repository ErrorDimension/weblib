interface Component {
    container: HTMLElement;
    tooltip: Tooltip;
    clicker: Clicker;
    subWindow: SubWindow;
}
declare const navigation: {
    initialized: boolean;
    container?: HTMLElement;
    navbar?: HTMLElement;
    block: {
        left?: HTMLElement;
        right?: HTMLElement;
    };
    tooltip?: HTMLElement & {
        t?: HTMLElement;
        d?: HTMLElement;
    };
    underlay?: HTMLElement;
    subWindowList: SubWindow[];
    init(containerQuery: string, contentQuery: string): void;
    insert(component: {
        container: HTMLElement;
        [key: string]: any;
    }, location: 'left' | 'right', order?: number): void;
    setUnderlay(activate?: boolean): void;
    set loading(loading: boolean);
    account: {
        userToken?: string;
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
        button({ icon, image, colorName, alwaysActive, brightnessLevel, func, text }: {
            icon?: string;
            image?: string;
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
};
export declare class Tooltip {
    constructor(target: HTMLElement);
    private title?;
    private description?;
    private flip?;
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
    private container?;
    private clickHandlers;
    private __activated;
    get activated(): boolean;
    onClick(func: (...args: any[]) => any): number;
    offClick(index: number): void;
    toggle(isActive?: boolean): void;
    show(): void;
    hide(): void;
}
export declare class SubWindow {
    constructor(container: HTMLElement, content?: HTMLElement | string);
    update(): void;
    show(): void;
    hide(trusted?: boolean): void;
    toggle(): void;
    onToggle(func: (...args: any[]) => any): void;
    set loaded(loaded: boolean);
    set content(content: HTMLElement | string);
    get isShowing(): boolean;
    get id(): string;
    private __id;
    private __isShowing;
    private __hideTimeoutId;
    private __toggleHandlers;
    private __container?;
    private __contentNode?;
    private __windowNode?;
    private __overlayNode?;
}
export default navigation;
//# sourceMappingURL=navigation.d.ts.map