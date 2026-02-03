import { BypassStemmer } from "../lib/snowball/ext/BypassStemmer.js";
import { DanishStemmer } from "../lib/snowball/ext/DanishStemmer.js";
import { DutchStemmer } from "../lib/snowball/ext/DutchStemmer.js";
import { EnglishStemmer } from "../lib/snowball/ext/EnglishStemmer.js";
import { FinnishStemmer } from "../lib/snowball/ext/FinnishStemmer.js";
import { FrenchStemmer } from "../lib/snowball/ext/FrenchStemmer.js";
import { GermanStemmer } from "../lib/snowball/ext/GermanStemmer.js";
import { HungarianStemmer } from "../lib/snowball/ext/HungarianStemmer.js";
import { ItalianStemmer } from "../lib/snowball/ext/ItalianStemmer.js";
import { NorwegianStemmer } from "../lib/snowball/ext/NorwegianStemmer.js";
import { PortugueseStemmer } from "../lib/snowball/ext/PortugueseStemmer.js";
import { RomanianStemmer } from "../lib/snowball/ext/RomanianStemmer.js";
import { RussianStemmer } from "../lib/snowball/ext/RussianStemmer.js";
import { SpanishStemmer } from "../lib/snowball/ext/SpanishStemmer.js";
import { SwedishStemmer } from "../lib/snowball/ext/SwedishStemmer.js";

/**
 * A class that provides stemming functionality for multiple languages using the Snowball algorithm.
 */
class SnowballStemmer {

    /** Cache for storing stemmed words */
    private static cache: {} = {};

    /** The language code for the current stemmer */
    private language: string;

    /** The Snowball stemmer instance for the current language */
    private snowball: any;

    /**
     * Creates a new SnowballStemmer instance for the specified language.
     * @param language - The language code (e.g., "en" for English, "de" for German).
     */
    public constructor(language: string) {
        this.language = language;
        if (!(this.language in SnowballStemmer.cache)) {
            SnowballStemmer.cache[this.language] = {};
        }

        switch (language) {
            case "da":
                this.snowball = new DanishStemmer();
                break;
            case "nl":
                this.snowball = new DutchStemmer();
                break;
            case "en":
                this.snowball = new EnglishStemmer();
                break;
            case "fi":
                this.snowball = new FinnishStemmer();
                break;
            case "fr":
                this.snowball = new FrenchStemmer();
                break;
            case "de":
                this.snowball = new GermanStemmer();
                break;
            case "hu":
                this.snowball = new HungarianStemmer();
                break;
            case "it":
                this.snowball = new ItalianStemmer();
                break;
            case "no":
                this.snowball = new NorwegianStemmer();
                break;
            case "pt":
                this.snowball = new PortugueseStemmer();
                break;
            case "ro":
                this.snowball = new RomanianStemmer();
                break;
            case "ru":
                this.snowball = new RussianStemmer();
                break;
            case "es":
                this.snowball = new SpanishStemmer();
                break;
            case "sv":
                this.snowball = new SwedishStemmer();
                break;
            case "":
            default:
                this.snowball = new BypassStemmer();
                break;
        }
    }

    /**
     * Stems a given term using the Snowball algorithm for the current language.
     * @param term - The term to stem.
     * @returns The stemmed term.
     */
    public stem(term: string): string {
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
    public stemCache(term: string): string {
        if (!(term in SnowballStemmer.cache)) {
            SnowballStemmer.cache[this.language][term] = this.stem(term);
        }
        return SnowballStemmer.cache[this.language][term];
    }

    /**
     * Gets the current language code for the stemmer.
     * @returns The language code (e.g., "en" for English, "de" for German).
     */
    public getLanguage(): string {
        return this.language;
    }
}

export { SnowballStemmer };
