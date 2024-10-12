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
/**
 * Base class for implementing stemming algorithms using the Snowball framework.
 */
class BaseStemmer {
    /**
     * Initializes a new instance of the BaseStemmer class.
     */
    constructor() {
        this.sbp = new SnowballProgram_js_1.SnowballProgram();
    }
    /**
     * Sets the current word to be stemmed.
     * @param word - The word to be stemmed.
     */
    setCurrent(word) {
        this.sbp.setCurrent(word);
    }
    /**
     * Gets the current stemmed word.
     * @returns The current stemmed word.
     */
    getCurrent() {
        return this.sbp.getCurrent();
    }
}
exports.BaseStemmer = BaseStemmer;
