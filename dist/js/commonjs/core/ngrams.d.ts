declare class Ngrams {
    private static ngrams;
    static expandWords(words: string[]): string;
    static searchVariants(input: string): string[];
    private static bigrams;
    private static trigrams;
}
export { Ngrams };
