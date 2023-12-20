declare class SnowballStemmer {
    private static cache;
    private language;
    private snowball;
    constructor(language: string);
    stem(term: string): string;
    stemCache(term: string): string;
    getLanguage(): string;
}
export { SnowballStemmer };
