declare const cursor: {
    windowIsDefined: boolean;
    positionX: number;
    positionY: number;
    deltaX: number;
    deltaY: number;
    isWatching: boolean;
    alwaysOn: boolean;
    watch(alwaysOn?: boolean): void;
    stop(): void;
    __update(event: MouseEvent): void;
};
export default cursor;
//# sourceMappingURL=cursor.d.ts.map