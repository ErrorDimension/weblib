const windowIsDefined = typeof window !== 'undefined';
const cursor = {
    windowIsDefined: typeof window !== 'undefined',
    positionX: windowIsDefined ? window.innerWidth / 2 : 500,
    positionY: windowIsDefined ? window.innerHeight / 2 : 500,
    deltaX: 0,
    deltaY: 0,
    isWatching: false,
    alwaysOn: false,
    watch(alwaysOn = false) {
        if (this.isWatching)
            return;
        this.isWatching = true;
        this.alwaysOn = alwaysOn;
        window.addEventListener('mousemove', this.__update);
    },
    stop() {
        if (this.alwaysOn)
            return;
        if (!this.isWatching)
            return;
        window.removeEventListener('mousemove', this.__update);
    },
    __update(event) {
        cursor.positionX = event.clientX;
        cursor.positionY = event.clientY;
        cursor.deltaX = event.movementX;
        cursor.deltaY = event.movementY;
    }
};
export default cursor;
