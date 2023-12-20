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
