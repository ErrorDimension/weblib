const windowIsDefined = typeof window !== 'undefined';
class StopClock {
    constructor(startPoint = windowIsDefined ? window.performance.now() : -1) {
        this.startPoint = startPoint;
    }
    get click() {
        return windowIsDefined
            ? (window.performance.now() - this.startPoint) / 1000
            : -1;
    }
}
export default StopClock;
