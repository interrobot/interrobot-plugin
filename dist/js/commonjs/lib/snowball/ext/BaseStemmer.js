"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseStemmer = void 0;
const SnowballProgram_js_1 = require("../SnowballProgram.js");
class BaseStemmer {
    constructor() {
        this.sbp = new SnowballProgram_js_1.SnowballProgram();
    }
    setCurrent(word) {
        this.sbp.setCurrent(word);
    }
    getCurrent() {
        return this.sbp.getCurrent();
    }
}
exports.BaseStemmer = BaseStemmer;
