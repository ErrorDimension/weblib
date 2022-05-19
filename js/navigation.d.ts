interface Component {
    container: HTMLElement;
    tooltip: Tooltip;
    clicker: Clicker;
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
    init(containerQuery: string, contentQuery: string): void;
    insert(component: {
        container: HTMLElement;
        [key: string]: any;
    }, location: 'left' | 'right', order?: number): void;
    setUnderlay(activate?: boolean): void;
    component: {
        logo({ icon, title }: {
            icon?: string;
            title?: string;
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
    };
    Tooltip: {
        new (target: HTMLElement): Tooltip;
        prototype: Tooltip;
    };
    Clicker: {
        new (container: HTMLElement, onlyActive?: boolean): Clicker;
        prototype: Clicker;
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
//# sourceMappingURL=navigation.d.ts.map