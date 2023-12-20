/*!
 * Snowball Typescript Port 0.1.5
 * Copyright 2023, Ben Caulfield
 * http://pragmar.com
 * http://www.mozilla.org/MPL/
 *
 * Snowball JavaScript Library v0.3
 * http://code.google.com/p/urim/
 * http://snowball.tartarus.org/
 *
 * Copyright 2010, Oleg Mazko
 * http://www.mozilla.org/MPL/
 */
class Among {
    // method was an additional arg in js, but could not find any reference of
    // a 4 arg constructor in any language. leaving for historical value in case
    // anything related blows up
    // private method: any;
    constructor(s, substring_i, result) {
        if ((!s && s != "") || (!substring_i && (substring_i != 0)) || !result)
            throw (`Failed 'Among' initialization: s: ${s},  substring_i: ${substring_i}, result: ${result}`);
        this.s = Among.toCharArray(s);
        this.s_size = s.length;
        this.substring_i = substring_i;
        this.result = result;
        // leave this, connects to a removed language feature. may make a comeback
        // this.method = method;
    }
    static toCharArray(s) {
        let sLength = s.length;
        const charArr = new Array(sLength);
        for (let i = 0; i < sLength; i++) {
            charArr[i] = s.charCodeAt(i);
        }
        return charArr;
    }
}
export { Among };
