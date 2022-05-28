declare class Console {
    text: string;
    color?: string;
    background?: string;
    constructor(text: string, { color, background, opacity }?: {
        color?: string | undefined;
        background?: string | undefined;
        opacity?: number | undefined;
    });
    private static initialized;
    private static get padding();
    private static get space();
    /**
     * @param { object[] } args datas
     */
    private static dataChanneling;
    private static log;
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
    static display(queryOrElement: string | HTMLElement, { code, icon, title, message, description, buttons }?: {
        code?: number | string;
        icon?: string;
        description?: string;
        message?: string;
        title?: string;
        buttons?: {
            text: string;
            colorName?: string;
            iconName?: string;
            callback?: (this: GlobalEventHandlers, ev: MouseEvent) => any;
        }[];
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