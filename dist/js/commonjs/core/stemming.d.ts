/**
 * A class that provides stemming functionality for multiple languages using the Snowball algorithm.
 */
declare class SnowballStemmer {
    /** Cache for storing stemmed words */
    private static cache;
    /** The language code for the current stemmer */
    private language;
    /** The Snowball stemmer instance for the current language */
    private snowball;
    /**
     * Creates a new SnowballStemmer instance for the specified language.
     * @param language - The language code (e.g., "en" for English, "de" for German).
     */
    constructor(language: string);
    /**
     * Stems a given term using the Snowball algorithm for the current language.
     * @param term - The term to stem.
     * @returns The stemmed term.
     */
    stem(term: string): string;
    /**
     * Stems a given term using the cache if available, otherwise stems and caches the result.
     * @param term - The term to stem.
     * @returns The stemmed term.
     */
    stemCache(term: string): string;
    /**
     * Gets the current language code for the stemmer.
     * @returns The language code (e.g., "en" for English, "de" for German).
     */
    getLanguage(): string;
}
export { SnowballStemmer };
