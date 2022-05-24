export default class RecordAnimationFrame {
    constructor(callback: (...args: any[]) => any) {
        this.#callback = callback
    }


    #raf: number = -1
    #__running: boolean = false

    get running(): boolean { return this.#__running }

    #callback?: (...args: any[]) => any


    /** start the callback */
    start(timeout?: number): any {
        if (this.#__running) return
        this.#__running = true

        this.#run()

        if (timeout)
            window.setTimeout((): void => this.stop(), timeout)
    }


    #run(): any {
        this.#raf = window.requestAnimationFrame((): void => {
            if (!this.#callback) return

            this.#callback()

            if (this.#__running) this.#run()
        })
    }


    /** stop the callback */
    stop(): any {
        if (!this.#__running) return
        this.#__running = false

        window.cancelAnimationFrame(this.#raf)
    }
}
