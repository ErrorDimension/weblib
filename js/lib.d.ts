declare const lib: {
    /**
    * formatted time
    *
    * `ap` - `am`
    * `AP` - `AM`
    * `hh` - `05`
    * `HH` - `17`
    * `MM` - `59`
    * `mm` - `59`
    * `ss` - `59`
    * `SS` - `59`
    * `dd` - `31`
    * `dth` - `st`
    * `Dth` - `St`
    * `DTH` - `ST`
    * `mo` - `12`
    * `Mo` - `jan`
    * `MO` - `Jan`
    * `Month` - `January`
    * `month` - `january`
    * `year` - `2022`
    * `YEAR` - `2022`
    * `YE` - `22`
    * `ye` - `22`
    * `We` - `Fri`
    * `we` - `fri`
    * `Wd` - `Friday`
    * `wd` - `friday`
    * @param        { object }      data            time prop
    * @param        { Date }        data.time       input time
    * @param        { string }      data.format     format for the return
    */
    prettyTime({ time, format }?: {
        time?: Date;
        format?: string;
    }): string;
    urlExists(url: string): boolean;
    readonly isMobile: boolean;
    /**
     * Return a rounded number with a specified number of decimal places
     *
     * @param       { Number }      number      value to be rounded
     * @param       { Number }      to          the decimal place
     * @returns     { Number }                  rounded number
     */
    round(number: number, to?: number): number;
    delayAsync(time: number): Promise<void>;
    nextFrameAsync(): Promise<void>;
    cssFrame(fn: FrameRequestCallback): Promise<void>;
    /**
     * Belibrary and ZaWorst 's color template
     *
     * @param       color
     * @returns     Returns hex code of color you want
     */
    hexCodeColor(color: string): string;
    hexToRgb(hex: string): {
        red: number;
        green: number;
        blue: number;
    };
    /**
     * Return random number between min and max
     *
     * @param	{ Number }		    min		        Minimum Random Number
     * @param	{ Number }		    max		        Maximum Random Number
     * @param   { object }	        opt             options
     * @param   { boolean }         opt.toInt       by default is true
     * @param   { Number[2] }       opt.outRange
     */
    randomBetween(min: number, max: number, toInt?: boolean, outRange?: number[]): number;
    truncate(str: string, length?: number, { suffix }?: {
        suffix?: string;
    }): string;
    randomStringList: string[];
    randomString(len?: number, CHAR_SET?: string): string;
    randomItem<T extends unknown>(array: T[]): T;
    /** this function returns the smallest number */
    min: (...args: number[]) => number;
    /** this function returns the biggest number */
    max: (...args: number[]) => number;
    /** this function returns the absolute value of the number */
    abs: (num: number) => number;
    /** this function returns the clamped number */
    clamp(min: number, dynamic: number, max: number): number;
    /** this function parses cookie */
    parseCookie(name: string): string | undefined;
    preferDarkColorScheme: () => boolean;
    preferLightColorScheme: () => boolean;
};
/**
 * throttle a function
 * @param       { Function }          fn                    function
 * @param       { Number }            throttleTime          throttler delay in milliseconds
 * @returns     { Function }                                func(...args)
 */
export declare function throttle(this: any, fn: (...args: any[]) => void, throttleTime: number): (...args: any[]) => any;
/**
 * throttle a function and always run the last call
 * @param       { Function }          fn                    function
 * @param       { Number }            throttleTime          throttler delay in milliseconds
 * @returns     { Function }                                func(...args)
 */
export declare function throttled(this: any, fn: (...args: any[]) => void, throttleTime: number): (...args: any[]) => any;
/**
 * debounce a function
 * @param       { Function }          fn            function
 * @param       { Number }            timeout       debounce limit in milliseconds
 * @param       { Boolean }           firstCall     debounce limit in milliseconds
 * @returns     { Function }                        func(...args)
 */
export declare function debounce(this: any, fn: (...args: any[]) => void, timeout: number, firstCall?: boolean): (...args: any[]) => any;
export default lib;
//# sourceMappingURL=lib.d.ts.map