"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnowballStemmer = void 0;
const BypassStemmer_js_1 = require("../lib/snowball/ext/BypassStemmer.js");
const DanishStemmer_js_1 = require("../lib/snowball/ext/DanishStemmer.js");
const DutchStemmer_js_1 = require("../lib/snowball/ext/DutchStemmer.js");
const EnglishStemmer_js_1 = require("../lib/snowball/ext/EnglishStemmer.js");
const FinnishStemmer_js_1 = require("../lib/snowball/ext/FinnishStemmer.js");
const FrenchStemmer_js_1 = require("../lib/snowball/ext/FrenchStemmer.js");
const GermanStemmer_js_1 = require("../lib/snowball/ext/GermanStemmer.js");
const HungarianStemmer_js_1 = require("../lib/snowball/ext/HungarianStemmer.js");
const ItalianStemmer_js_1 = require("../lib/snowball/ext/ItalianStemmer.js");
const NorwegianStemmer_js_1 = require("../lib/snowball/ext/NorwegianStemmer.js");
const PortugueseStemmer_js_1 = require("../lib/snowball/ext/PortugueseStemmer.js");
const RomanianStemmer_js_1 = require("../lib/snowball/ext/RomanianStemmer.js");
const RussianStemmer_js_1 = require("../lib/snowball/ext/RussianStemmer.js");
const SpanishStemmer_js_1 = require("../lib/snowball/ext/SpanishStemmer.js");
const SwedishStemmer_js_1 = require("../lib/snowball/ext/SwedishStemmer.js");
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
            case "da":
                this.snowball = new DanishStemmer_js_1.DanishStemmer();
                break;
            case "nl":
                this.snowball = new DutchStemmer_js_1.DutchStemmer();
                break;
            case "en":
                this.snowball = new EnglishStemmer_js_1.EnglishStemmer();
                break;
            case "fi":
                this.snowball = new FinnishStemmer_js_1.FinnishStemmer();
                break;
            case "fr":
                this.snowball = new FrenchStemmer_js_1.FrenchStemmer();
                break;
            case "de":
                this.snowball = new GermanStemmer_js_1.GermanStemmer();
                break;
            case "hu":
                this.snowball = new HungarianStemmer_js_1.HungarianStemmer();
                break;
            case "it":
                this.snowball = new ItalianStemmer_js_1.ItalianStemmer();
                break;
            case "no":
                this.snowball = new NorwegianStemmer_js_1.NorwegianStemmer();
                break;
            case "pt":
                this.snowball = new PortugueseStemmer_js_1.PortugueseStemmer();
                break;
            case "ro":
                this.snowball = new RomanianStemmer_js_1.RomanianStemmer();
                break;
            case "ru":
                this.snowball = new RussianStemmer_js_1.RussianStemmer();
                break;
            case "es":
                this.snowball = new SpanishStemmer_js_1.SpanishStemmer();
                break;
            case "sv":
                this.snowball = new SwedishStemmer_js_1.SwedishStemmer();
                break;
            case "":
            default:
                this.snowball = new BypassStemmer_js_1.BypassStemmer();
                break;
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
