export default class RecordAnimationFrame {
    constructor(callback: (...args: any[]) => any);
    private raf;
    private __running;
    get running(): boolean;
    private callback?;
    /** start the callback */
    start(timeout?: number): any;
    private run;
    /** stop the callback */
    stop(): any;
}
//# sourceMappingURL=record-animation-frame.d.ts.map