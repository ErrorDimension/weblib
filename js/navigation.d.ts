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
declare const navigation: {
    initialized: boolean;
    container?: HTMLElement & {
        left?: HTMLElement;
        right?: HTMLElement;
        indicator?: HTMLElement;
        tooltip?: HTMLElement & {
            t?: HTMLElement;
            d?: HTMLElement;
        };
        underlay?: HTMLElement;
    };
    block: {
        left?: HTMLElement & {
            logo?: HTMLElement;
            route?: HTMLElement;
        };
        right?: HTMLElement;
    };
    readonly havingContent: boolean;
    init(query: string): void;
    component: {
        logo({ title, src }: {
            title?: string;
            src?: string;
        }): void;
        route(record?: Record<string, {
            icon?: string;
            title?: string;
            description?: string;
        }>): void;
    };
    Tooltip: {
        new (target: HTMLElement): Tooltip;
        prototype: Tooltip;
    };
};
export default navigation;
//# sourceMappingURL=navigation.d.ts.map