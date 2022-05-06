class StopClock {
    startPoint;
    get click() { return (performance.now() - this.startPoint) / 1000; }
    constructor(startPoint = performance.now()) {
        this.startPoint = startPoint;
    }
}
export default StopClock;
