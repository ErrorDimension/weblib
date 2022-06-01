export default class RecordAnimationFrame {
    constructor(callback) {
        this.raf = -1;
        this.__running = false;
        this.callback = callback;
    }
    get running() { return this.__running; }
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
