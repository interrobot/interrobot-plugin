declare class Ngrams {
    static expandWords(words: string[]): string;
    static searchVariants(input: string): string[];
    private static ngrams;
    private static bigrams;
    private static trigrams;
}
export { Ngrams };
