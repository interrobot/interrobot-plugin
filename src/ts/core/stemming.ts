import { BypassStemmer } from "../lib/snowball/ext/BypassStemmer.js";
import { EnglishStemmer } from "../lib/snowball/ext/EnglishStemmer.js";
import { FrenchStemmer } from "../lib/snowball/ext/FrenchStemmer.js";
import { GermanStemmer } from "../lib/snowball/ext/GermanStemmer.js";
import { RussianStemmer } from "../lib/snowball/ext/RussianStemmer.js";
import { SpanishStemmer } from "../lib/snowball/ext/SpanishStemmer.js";


class SnowballStemmer {

    private static cache: {} = {};
    private language: string;
    private snowball: any;

    public constructor(language: string) {
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

    public stem(term: string): string {
        this.snowball.setCurrent(term);
        this.snowball.stem();

        // getCurrent() will self nullify current
        return this.snowball.getCurrent();
    }

    public stemCache(term: string): string {
        if (!(term in SnowballStemmer.cache)) {
            SnowballStemmer.cache[this.language][term] = this.stem(term);            
        } 
        return SnowballStemmer.cache[this.language][term];
    }

    public getLanguage(): string {
        return this.language;
    }

}

export { SnowballStemmer };
