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
declare class Among {
    s: number[];
    s_size: number;
    substring_i: number;
    result: any;
    constructor(s: string, substring_i: number, result: any);
    static toCharArray(s: string): number[];
}
export { Among };
