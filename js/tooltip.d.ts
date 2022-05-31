interface Hook {
    on: 'attribute' | 'dataset';
    key: string;
    handler?({ target, value, update }: {
        target: HTMLElement;
        value?: string;
        update(content: string | HTMLElement): void;
    }): undefined | string | HTMLElement;
    follower?(): void;
    priority?: number;
    fit?: boolean;
}
declare const tooltip: {
    readonly initialized: boolean;
    container?: HTMLElement;
    content?: HTMLElement;
    hideTimeoutId: number;
    glowing: boolean;
    hooks: Hook[];
    processor: {
        attribute: {
            process(target: HTMLElement, key: string): string | undefined;
            attach(hook: Hook): void;
        };
        dataset: {
            process(target: HTMLElement, key: string): string | undefined;
            attach(hook: Hook): void;
        };
    };
    init(): void;
    scan(_?: any): void;
    /**
     * {@linkcode       Hook}
     *
     * @param           hook
     * @param           hook.on             'attribute' or 'dataset'
     * @param           hook.key            hook's key
     * @param           hook.handler        return content for the tooltip
     * @param           hook.follower       event to fired after mouseleave
     * @param           hook.priority       ensure hook's priority
     * @param           hook.padding        decide to render padding or not
     *
     * @example
     * ```typescript
     * tooltip.addHook({
     *  on: 'attribute',
     *  key: 'title'
     * })
     * ```
     */
    addHook({ on, key, handler, follower, priority, fit }: Hook): void;
    process(target: HTMLElement, { on, key }: Hook): string | undefined;
    attach(target: HTMLElement & {
        tooltipAttached?: boolean;
    }, hook: Hook): void;
    pointerenter(target: HTMLElement, { on, key, handler, fit }: Hook): void;
    pointerleave({ follower, fit }: Hook): void;
    show(content: string | HTMLElement): void;
    hide(): void;
    move(_?: any): void;
    updateSize(): void;
    update(content: string | HTMLElement): void;
    glow(): void;
};
export default tooltip;
//# sourceMappingURL=tooltip.d.ts.map