declare const screenSwitcher: {
    current?: HTMLElement;
    container?: HTMLElement;
    header?: HTMLElement;
    content?: HTMLElement;
    icon?: HTMLElement;
    switcher?: HTMLElement;
    switcherBtn?: HTMLElement;
    switcherDes?: HTMLElement;
    buttons?: HTMLElement;
    firstInitialization?: boolean;
    init(query: string, collection: {
        name: string;
        icon: string;
        element: HTMLElement;
        description?: string;
    }[], width?: number): void;
    switch(btn: HTMLElement, { icon, element, description }: {
        icon: string;
        description?: string;
        element: HTMLElement;
    }): void;
};
export default screenSwitcher;
//# sourceMappingURL=screen-switcher.d.ts.map