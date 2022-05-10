const windowIsDefined = typeof window !== 'undefined'


const cursor = {
    windowIsDefined: typeof window !== 'undefined',

    positionX: windowIsDefined ? window.innerWidth / 2 : 500,
    positionY: windowIsDefined ? window.innerHeight / 2 : 500,
    deltaX: 0 as number,
    deltaY: 0 as number,
    isWatching: false as boolean,
    alwaysOn: false as boolean,

    watch(alwaysOn: boolean = false): void {
        if (this.isWatching) return
        this.isWatching = true

        this.alwaysOn = alwaysOn

        window.addEventListener('mousemove', this.__update)
    },

    stop(): void {
        if (this.alwaysOn) return
        if (!this.isWatching) return

        window.removeEventListener('mousemove', this.__update)
    },

    __update(event: MouseEvent): void {
        cursor.positionX = event.clientX
        cursor.positionY = event.clientY
        cursor.deltaX = event.movementX
        cursor.deltaY = event.movementY
    }
}


export default cursor
