import { BypassStemmer } from "../lib/snowball/ext/BypassStemmer.js";
import { EnglishStemmer } from "../lib/snowball/ext/EnglishStemmer.js";
import { FrenchStemmer } from "../lib/snowball/ext/FrenchStemmer.js";
import { GermanStemmer } from "../lib/snowball/ext/GermanStemmer.js";
import { RussianStemmer } from "../lib/snowball/ext/RussianStemmer.js";
import { SpanishStemmer } from "../lib/snowball/ext/SpanishStemmer.js";
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
                this.snowball = new GermanStemmer();
                break;
            case "en":
                this.snowball = new EnglishStemmer();
                break;
            case "fr":
                this.snowball = new FrenchStemmer();
                break;
            case "ru":
                this.snowball = new RussianStemmer();
                break;
            case "sp":
                this.snowball = new SpanishStemmer();
                break;
            case "":
            default:
                this.snowball = new BypassStemmer();
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
/** Cache for storing stemmed words */
SnowballStemmer.cache = {};
export { SnowballStemmer };
