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
exports.BypassStemmer = void 0;
const BaseStemmer_js_1 = require("./BaseStemmer.js");
/**
 * A stemmer that bypasses the stemming process, leaving words unchanged.
 * This can be useful for languages or scenarios where stemming is not desired.
 */
class BypassStemmer extends BaseStemmer_js_1.BaseStemmer {
    /**
     * Initializes a new instance of the BypassStemmer class.
     */
    constructor() {
        super();
    }
    /**
     * Performs the stemming operation, which in this case does nothing.
     * @returns Always returns true, indicating that the "stemming" process is complete.
     */
    stem() {
        return true;
    }
}
exports.BypassStemmer = BypassStemmer;
