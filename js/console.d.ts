declare class Console {
    #private;
    text: string;
    color?: string;
    background?: string;
    constructor(text: string, { color, background, opacity }?: {
        color?: string | undefined;
        background?: string | undefined;
        opacity?: number | undefined;
    });
    private static initialized;
    private static infoLog;
    private static debugLog;
    private static okayLog;
    private static warnLog;
    private static errorLog;
    private static critLog;
    /**
     * display the error and callback buttons to the selected
     * @param   { String | HTMLElement }    queryOrElement      selected query or element
     * @param   { Object | undefined }      detail              detail for the error as well as the callbacks
     */
    static display(queryOrElement: string | HTMLElement, { code, icon, title, message, description, button }?: {
        code?: number | string;
        icon?: string;
        description?: string;
        message?: string;
        title?: string;
        button?: {
            primary?: {
                text?: string;
                callback: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
            };
            secondary?: {
                text?: string;
                callback: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
            };
        };
    }): void;
    static info(...args: any[]): void;
    static debug(...args: any[]): void;
    static warn(...args: any[]): void;
    static crit(...args: any[]): void;
    static error(...args: any[]): void;
    static okay(...args: any[]): void;
    static init(): void;
}
export default Console;
//# sourceMappingURL=console.d.ts.map