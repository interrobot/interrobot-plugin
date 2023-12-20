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
class BypassStemmer extends BaseStemmer_js_1.BaseStemmer {
    constructor() {
        super();
    }
    stem() {
        return true;
    }
}
exports.BypassStemmer = BypassStemmer;
