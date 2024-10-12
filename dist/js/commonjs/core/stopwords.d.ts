/*!
 * Stopwords themselves (c)?2023:
 * Source: NLTK (python natural language toolkit)
 * Apache License 2.0
 * from nltk.corpus import stopwords
 * print(json.dumps(stopwords.words('english'), ensure_ascii=False))
 */
/**
 * A class that provides stopwords for various languages.
 */
declare class Stopwords {
    /**
     * Returns an object where keys are stopwords and values are true for quick lookup.
     * @param lang - The language code (e.g., "en" for English, "de" for German).
     * @returns An object with stopwords as keys and true as values.
     */
    static getStopwordsTruth(lang: string): {};
    /**
     * Returns an array of stopwords for the specified language.
     * @param lang - The language code (e.g., "en" for English, "de" for German).
     * @returns An array of stopwords for the specified language.
     */
    static getStopwords(lang: string): string[];
}
export { Stopwords };
