"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnowballStemmer = void 0;
const BypassStemmer_js_1 = require("../lib/snowball/ext/BypassStemmer.js");
const EnglishStemmer_js_1 = require("../lib/snowball/ext/EnglishStemmer.js");
const FrenchStemmer_js_1 = require("../lib/snowball/ext/FrenchStemmer.js");
const GermanStemmer_js_1 = require("../lib/snowball/ext/GermanStemmer.js");
const RussianStemmer_js_1 = require("../lib/snowball/ext/RussianStemmer.js");
const SpanishStemmer_js_1 = require("../lib/snowball/ext/SpanishStemmer.js");
class SnowballStemmer {
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
    stem(term) {
        this.snowball.setCurrent(term);
        this.snowball.stem();
        // getCurrent() will self nullify current
        return this.snowball.getCurrent();
    }
    stemCache(term) {
        if (!(term in SnowballStemmer.cache)) {
            SnowballStemmer.cache[this.language][term] = this.stem(term);
        }
        return SnowballStemmer.cache[this.language][term];
    }
    getLanguage() {
        return this.language;
    }
}
exports.SnowballStemmer = SnowballStemmer;
SnowballStemmer.cache = {};
