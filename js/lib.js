const lib = {
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
    prettyTime({ time = new Date(), format = 'HH:mm:ss dd/mo/year' } = {}) {
        let hours = time.getHours();
        let minutes = time.getMinutes();
        let seconds = time.getSeconds();
        let date = time.getDate();
        let month = time.getMonth();
        let year = time.getFullYear();
        let weekday = time.getDay();
        function zero(timeKind) { return (timeKind < 10 ? '0' + timeKind : timeKind).toString(); }
        function postFix(lastIdx) {
            return ['St', 'Nd', 'Rd', 'Th'][(lastIdx - 1 >= 3 || lastIdx === 0) ? 3 : lastIdx - 1];
        }
        function shortMonth() {
            return [
                'Jan', 'Feb', 'Mar',
                'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep',
                'Oct', 'Nov', 'Dec'
            ][month];
        }
        function fullMonth() {
            return [
                'January', 'February', 'March',
                'April', 'May', 'June',
                'July', 'August', 'September',
                'October', 'November', 'December'
            ][month];
        }
        function shortWeekday() {
            return [
                'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
            ][weekday];
        }
        function fullWeekday() {
            return [
                'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
            ][weekday];
        }
        format = format.replace('ap', hours < 12 ? 'am' : 'pm');
        format = format.replace('AP', hours < 12 ? 'AM' : 'PM');
        format = format.replace('hh', zero(hours > 12 ? hours % 12 : hours));
        format = format.replace('HH', zero(hours));
        format = format.replace('mm', zero(minutes));
        format = format.replace('MM', zero(minutes));
        format = format.replace('ss', zero(seconds));
        format = format.replace('SS', zero(seconds));
        format = format.replace('dd', zero(date));
        format = format.replace('dth', postFix(date % 10).toLowerCase());
        format = format.replace('Dth', postFix(date % 10).toLowerCase());
        format = format.replace('DTH', postFix(date % 10).toUpperCase());
        format = format.replace('mo', zero(month));
        format = format.replace('MO', shortMonth());
        format = format.replace('Mo', shortMonth().toLowerCase);
        format = format.replace('Month', fullMonth());
        format = format.replace('month', fullMonth().toLowerCase());
        format = format.replace('year', (year).toString());
        format = format.replace('YEAR', (year).toString());
        format = format.replace('ye', (year % 2000).toString());
        format = format.replace('YE', (year % 2000).toString());
        format = format.replace('We', shortWeekday());
        format = format.replace('we', shortWeekday().toLowerCase());
        format = format.replace('Wd', fullWeekday());
        format = format.replace('wd', fullWeekday().toLowerCase());
        return format;
    },
    isOnMobile() {
        const toMatch = [
            /Android/i,
            /webOS/i,
            /iPhone/i,
            /iPad/i,
            /iPod/i,
            /BlackBerry/i,
            /Windows Phone/i
        ];
        return toMatch.some((toMatchItem) => {
            return navigator.userAgent.match(toMatchItem);
        });
    },
    /**
     * Return a rounded number with a specified number of decimal places
     *
     * @param       { Number }      number      value to be rounded
     * @param       { Number }      to          the decimal place
     * @returns     { Number }                  rounded number
     */
    round(number, to = 0) {
        const d = Math.pow(10, to);
        return Math.round(number * d) / d;
    },
    delayAsync(time) {
        return new Promise(function (resolve) { setTimeout(() => resolve(), time); });
    },
    nextFrameAsync() {
        return new Promise((resolve) => { requestAnimationFrame(() => resolve()); });
    },
    async cssFrame(fn) {
        await this.nextFrameAsync();
        requestAnimationFrame(fn);
    },
    /**
     * Belibrary and ZaWorst 's color template
     *
     * @param       color
     * @returns     Returns hex code of color you want
     */
    hexCodeColor(color) {
        const CLIST = {
            green: "#A8CC8C",
            red: "#E88388",
            blue: "#71BEF2",
            aqua: "#66C2CD",
            yellow: "#DBAB79",
            orange: "#e67e22",
            gray: "#6B737E",
            magenta: "#D290E4",
            black: "#282D35",
            pink: "#f368e0",
            white: '#d4d4d4',
            darkandlight: '#78909c'
        };
        return (CLIST[color]) ? CLIST[color] : CLIST.black;
    },
    hexToRgb(hex) {
        if (hex.charAt(0) === '#')
            hex = hex.substring(1);
        if (hex.length !== 3 && hex.length !== 6)
            throw new Error("'lib.hexToRgb()' : 'hex' is not valid");
        if (hex.length === 3)
            hex = hex.split('').map(c => c.repeat(2)).join('');
        let red = parseInt(hex.substring(0, 2), 16);
        let blue = parseInt(hex.substring(4, 6), 16);
        let green = parseInt(hex.substring(2, 4), 16);
        return { red, green, blue };
    },
    /**
     * Return random number between min and max
     *
     * @param	{ Number }		    min		        Minimum Random Number
     * @param	{ Number }		    max		        Maximum Random Number
     * @param   { Object }	        opt             options
     * @param   { boolean }         opt.toInt
     * @param   { Number[2] }       opt.outRange
     * @returns	{ Number }
     */
    randomBetween(min, max, { toInt = true, outRange = [] } = {}) {
        let res = toInt
            ? Math.floor(Math.random() * (max - min + 1) + min)
            : Math.random() * (max - min) + min;
        if (!outRange.length)
            return res;
        let [minEdge, maxEdge] = outRange;
        if (res > minEdge && res < maxEdge)
            return this.randomBetween(min, max, { toInt, outRange });
        return res;
    },
    truncate(str, length = 20, { suffix = '...' } = {}) {
        return (str.length > length)
            ? str.substring(0, length - suffix.length - 1) + suffix
            : str;
    },
    randomStringList: [],
    randomString(len = 16, CHAR_SET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") {
        let str = "";
        for (let i = 0; i < len; i++) {
            let p = Math.floor(Math.random() * CHAR_SET.length);
            str += CHAR_SET.substring(p, p + 1);
        }
        if (this.randomStringList.includes(str))
            return this.randomString(len, CHAR_SET);
        this.randomStringList.push(str);
        return str;
    },
    randomItem(array) {
        if (typeof array.length !== "number")
            console.warn('`randomItem()` : not a valid array'); // todo Console
        return array[this.randomBetween(0, array.length - 1)];
    },
    /** this function returns the smallest number */
    min: (...args) => Math.min(...args),
    /** this function returns the biggest number */
    max: (...args) => Math.max(...args),
    /** this function returns the clamped number */
    clamp(min, dynamic, max) { return this.min(this.max(min, dynamic), max); },
};
/**
 * throttle a function
 * @param       { Function }          fn            function
 * @param       { Number }            t             throttler delay in milliseconds
 * @returns     { Function }                        func(...args)
 */
export function throttle(fn, t) {
    let throttler = false;
    const context = this;
    return function () {
        if (throttler)
            return;
        throttler = true;
        setTimeout(() => throttler = false, t);
        return fn.call(context, ...arguments);
    };
}
/**
 * throttle a function and always run the last call
 * @param       { Function }          fn            function
 * @param       { Number }            t             throttler delay in milliseconds
 * @returns     { Function }                        func(...args)
 */
export function throttled(fn, t) {
    let lastFunc = undefined;
    let lastRan = 0;
    const context = this;
    return function () {
        if (!lastRan) {
            fn.call(context, ...arguments);
            lastRan = Date.now();
            return;
        }
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function () {
            if ((Date.now() - lastRan) >= t) {
                fn.call(context, ...arguments);
                lastRan = Date.now();
            }
        }, t - (Date.now() - lastRan));
    };
}
/**
 * debounce a function
 * @param       { Function }          fn            function
 * @param       { Number }            t             debounce limit in milliseconds
 * @param       { Boolean }           firstCall     debounce limit in milliseconds
 * @returns     { Function }                        func(...args)
 */
export function debounce(fn, t, firstCall = false) {
    let timer = -1;
    let toCall = false;
    if (firstCall)
        toCall = true;
    const context = this;
    return function () {
        if (toCall) {
            toCall = false;
            fn.call(context, ...arguments);
        }
        clearTimeout(timer);
        timer = setTimeout(() => fn.call(context, ...arguments), t);
    };
}
export default lib;