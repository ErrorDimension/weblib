interface Component {
    container: HTMLElement;
    tooltip: Tooltip;
    clicker: Clicker;
    subWindow?: SubWindow;
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
        }>): void;
        hamburger(func?: () => void): Component;
        button({ icon, colorName, alwaysActive, brightnessLevel, func }: {
            icon?: string;
            colorName?: string;
            alwaysActive?: boolean;
            brightnessLevel?: string;
            func?: (...args: any[]) => any;
        }): Component & {
            set icon(icon: string);
        };
    };
    Tooltip: {
        new (target: HTMLElement): Tooltip;
        prototype: Tooltip;
    };
    Clicker: {
        new (container: HTMLElement, onlyActive?: boolean): Clicker;
        prototype: Clicker;
    };
    SubWindow: {
        new (container: HTMLElement, content?: HTMLElement | string, color?: string): SubWindow;
        prototype: SubWindow;
    };
};
export default navigation;
interface Tooltip {
    title?: string;
    description?: string;
    flip?: boolean;
    container?: HTMLElement & {
        t?: HTMLElement;
        d?: HTMLElement;
    };
    set({ title, description, flip }: {
        title?: string;
        description?: string;
        flip?: boolean;
    }): void;
    show(event: MouseEvent): void;
    hide(): void;
}
interface Clicker {
    container?: HTMLElement;
    clickHandlers: ((...args: any[]) => any)[];
    activated: boolean;
    onClick(func: (...args: any[]) => any): number;
    offClick(index: number): void;
    toggle(isActive?: boolean): void;
    show(): void;
    hide(): void;
}
interface SubWindow {
    readonly id: string;
    readonly isShowing: boolean;
    set loaded(loaded: boolean);
    set content(content: HTMLElement | string);
    show(): void;
    hide(trusted?: boolean): void;
    update(): void;
    toggle(): void;
    onToggle(func: (...args: any[]) => any): void;
}
//# sourceMappingURL=navigation.d.ts.map