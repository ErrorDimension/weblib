interface Tooltip {
    title?: string;
    description?: string;
    flip?: boolean;
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
    container?: HTMLElement;
    block: {
        left?: HTMLElement & {
            logo?: HTMLElement;
            route?: HTMLElement;
        };
        right?: HTMLElement;
    };
    readonly havingContent: boolean;
    init(query: string): void;
    route(record?: Record<string, {
        icon?: string;
        title?: string;
        description?: string;
    }>): void;
    logo({ title, src }: {
        title?: string;
        src?: string;
    }): void;
    Tooltip: {
        new (target: HTMLElement): Tooltip;
        prototype: Tooltip;
    };
};
export default navigation;
//# sourceMappingURL=navigation.d.ts.map