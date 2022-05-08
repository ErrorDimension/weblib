class StopClock {
    private startPoint: number

    public get click(): number { return (performance.now() - this.startPoint) / 1000 }

    constructor(startPoint: number = performance.now()) {
        this.startPoint = startPoint
    }
}


export default StopClock
