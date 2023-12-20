/*!
 * Stopwords themselves (c)?2023:
 * Source: NLTK (python natural language toolkit)
 * Apache License 2.0
 * from nltk.corpus import stopwords
 * print(json.dumps(stopwords.words('english'), ensure_ascii=False))
 */
declare class Stopwords {
    static getStopwordsTruth(lang: string): {};
    static getStopwords(lang: string): string[];
}
export { Stopwords };
