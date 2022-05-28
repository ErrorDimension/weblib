export default class RecordAnimationFrame {
    constructor(callback) {
        this.callback = callback;
    }
    raf = -1;
    __running = false;
    get running() { return this.__running; }
    callback;
    /** start the callback */
    start(timeout) {
        if (this.__running)
            return;
        this.__running = true;
        this.run();
        if (timeout)
            window.setTimeout(() => this.stop(), timeout);
    }
    run() {
        this.raf = window.requestAnimationFrame(() => {
            if (!this.callback)
                return;
            this.callback();
            if (this.__running)
                this.run();
        });
    }
    /** stop the callback */
    stop() {
        if (!this.__running)
            return;
        this.__running = false;
        window.cancelAnimationFrame(this.raf);
    }
}
