/* tslint:disable:no-console */
/* tslint:disable:max-line-length */
/**
 * Utility class for working with n-grams and word combinations.
 */
class Ngrams {
    /**
     * Joins an array of words into a single string.
     * @param words - An array of words to be joined.
     * @returns A string containing all words joined with spaces.
     */
    static expandWords(words) {
        const monograms = words.join(" ");
        return monograms;
    }
    /**
     * Generates search variants including the original input, bigrams, and trigrams.
     * @param input - The input string to generate variants from.
     * @returns An array of strings containing the original input and its n-gram variants.
     */
    static searchVariants(input) {
        const words = input.split(" ");
        const variants = [input];
        variants.push.apply(variants, Ngrams.bigrams(words));
        variants.push.apply(variants, Ngrams.trigrams(words));
        return variants;
    }
    /**
     * Generates n-grams of a specified length from an array of words.
     * @param words - An array of words to generate n-grams from.
     * @param length - The length of the n-grams to generate.
     * @returns An array of strings representing the generated n-grams.
     */
    static ngrams(words, length) {
        const numWords = words.length;
        const lastIndex = numWords - 1;
        const out = [];
        for (let i = 0; i < numWords; i++) {
            const ngramEnd = Math.min(i + length, lastIndex);
            const wordSlice = words.slice(i, ngramEnd);
            if (wordSlice.length === length) {
                out.push.apply(out, wordSlice);
            }
            else {
                break; // not enough words to complete ngram, end of the line
            }
        }
        return out;
    }
    /**
     * Generates bigrams (2-grams) from an array of words.
     * @param words - An array of words to generate bigrams from.
     * @returns An array of strings representing the generated bigrams.
     */
    static bigrams(words) {
        return Ngrams.ngrams(words, 2);
    }
    /**
     * Generates trigrams (3-grams) from an array of words.
     * @param words - An array of words to generate trigrams from.
     * @returns An array of strings representing the generated trigrams.
     */
    static trigrams(words) {
        return Ngrams.ngrams(words, 3);
    }
}
export { Ngrams };
