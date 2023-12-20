/*!
 * Snowball Typescript Port 0.1.x
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
import { Among } from "../Among.js";
import { SnowballProgram } from "../SnowballProgram.js";
declare class BaseStemmer {
    protected a_0: Among[];
    protected a_1: Among[];
    protected a_2: Among[];
    protected a_3: Among[];
    protected a_4: Among[];
    protected a_5: Among[];
    protected a_6: Among[];
    protected a_7: Among[];
    protected a_8: Among[];
    protected a_9: Among[];
    protected a_10: Among[];
    protected g_v: number[];
    protected g_v_WXY: number[];
    protected g_valid_LI: number[];
    protected B_Y_found: boolean;
    protected I_p2: number;
    protected I_p1: number;
    protected habr: any[];
    protected habrs: string[];
    protected sbp: SnowballProgram;
    constructor();
    setCurrent(word: any): void;
    getCurrent(): string;
}
export { BaseStemmer };
