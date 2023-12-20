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
import { SnowballProgram } from "../SnowballProgram.js";
class BaseStemmer {
    a_0;
    a_1;
    a_2;
    a_3;
    a_4;
    a_5;
    a_6;
    a_7;
    a_8;
    a_9;
    a_10;
    g_v;
    g_v_WXY;
    g_valid_LI;
    B_Y_found;
    I_p2;
    I_p1;
    habr;
    habrs;
    sbp;
    constructor() {
        this.sbp = new SnowballProgram();
    }
    setCurrent(word) {
        this.sbp.setCurrent(word);
    }
    getCurrent() {
        return this.sbp.getCurrent();
    }
}
export { BaseStemmer };
