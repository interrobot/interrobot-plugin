/**
 * Utility class for working with n-grams and word combinations.
 */
declare class Ngrams {
    /**
     * Joins an array of words into a single string.
     * @param words - An array of words to be joined.
     * @returns A string containing all words joined with spaces.
     */
    static expandWords(words: string[]): string;
    /**
     * Generates search variants including the original input, bigrams, and trigrams.
     * @param input - The input string to generate variants from.
     * @returns An array of strings containing the original input and its n-gram variants.
     */
    static searchVariants(input: string): string[];
    /**
     * Generates n-grams of a specified length from an array of words.
     * @param words - An array of words to generate n-grams from.
     * @param length - The length of the n-grams to generate.
     * @returns An array of strings representing the generated n-grams.
     */
    private static ngrams;
    /**
     * Generates bigrams (2-grams) from an array of words.
     * @param words - An array of words to generate bigrams from.
     * @returns An array of strings representing the generated bigrams.
     */
    private static bigrams;
    /**
     * Generates trigrams (3-grams) from an array of words.
     * @param words - An array of words to generate trigrams from.
     * @returns An array of strings representing the generated trigrams.
     */
    private static trigrams;
}
export { Ngrams };
