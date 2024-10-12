"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnowballStemmer = void 0;
const BypassStemmer_js_1 = require("../lib/snowball/ext/BypassStemmer.js");
const EnglishStemmer_js_1 = require("../lib/snowball/ext/EnglishStemmer.js");
const FrenchStemmer_js_1 = require("../lib/snowball/ext/FrenchStemmer.js");
const GermanStemmer_js_1 = require("../lib/snowball/ext/GermanStemmer.js");
const RussianStemmer_js_1 = require("../lib/snowball/ext/RussianStemmer.js");
const SpanishStemmer_js_1 = require("../lib/snowball/ext/SpanishStemmer.js");
/**
 * A class that provides stemming functionality for multiple languages using the Snowball algorithm.
 */
class SnowballStemmer {
    /**
     * Creates a new SnowballStemmer instance for the specified language.
     * @param language - The language code (e.g., "en" for English, "de" for German).
     */
    constructor(language) {
        this.language = language;
        if (!(this.language in SnowballStemmer.cache)) {
            SnowballStemmer.cache[this.language] = {};
        }
        switch (language) {
            case "de":
                this.snowball = new GermanStemmer_js_1.GermanStemmer();
                break;
            case "en":
                this.snowball = new EnglishStemmer_js_1.EnglishStemmer();
                break;
            case "fr":
                this.snowball = new FrenchStemmer_js_1.FrenchStemmer();
                break;
            case "ru":
                this.snowball = new RussianStemmer_js_1.RussianStemmer();
                break;
            case "sp":
                this.snowball = new SpanishStemmer_js_1.SpanishStemmer();
                break;
            case "":
            default:
                this.snowball = new BypassStemmer_js_1.BypassStemmer();
        }
    }
    /**
     * Stems a given term using the Snowball algorithm for the current language.
     * @param term - The term to stem.
     * @returns The stemmed term.
     */
    stem(term) {
        this.snowball.setCurrent(term);
        this.snowball.stem();
        // getCurrent() will self nullify current
        return this.snowball.getCurrent();
    }
    /**
     * Stems a given term using the cache if available, otherwise stems and caches the result.
     * @param term - The term to stem.
     * @returns The stemmed term.
     */
    stemCache(term) {
        if (!(term in SnowballStemmer.cache)) {
            SnowballStemmer.cache[this.language][term] = this.stem(term);
        }
        return SnowballStemmer.cache[this.language][term];
    }
    /**
     * Gets the current language code for the stemmer.
     * @returns The language code (e.g., "en" for English, "de" for German).
     */
    getLanguage() {
        return this.language;
    }
}
exports.SnowballStemmer = SnowballStemmer;
/** Cache for storing stemmed words */
SnowballStemmer.cache = {};
