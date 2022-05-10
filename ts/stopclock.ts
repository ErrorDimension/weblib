const windowIsDefined = typeof window !== 'undefined'


class StopClock {
    private startPoint: number

    public get click(): number {
        return windowIsDefined
            ? (window.performance.now() - this.startPoint) / 1000
            : -1
    }

    constructor(startPoint: number = windowIsDefined ? window.performance.now() : -1) {
        this.startPoint = startPoint
    }
}


export default StopClock
