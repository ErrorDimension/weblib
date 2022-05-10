const windowIsDefined = typeof window !== 'undefined';
class StopClock {
    startPoint;
    get click() {
        return windowIsDefined
            ? (window.performance.now() - this.startPoint) / 1000
            : -1;
    }
    constructor(startPoint = windowIsDefined ? window.performance.now() : -1) {
        this.startPoint = startPoint;
    }
}
export default StopClock;
