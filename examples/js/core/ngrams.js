/* tslint:disable:no-console */
/* tslint:disable:max-line-length */
class Ngrams {
    static expandWords(words) {
        const monograms = words.join(" ");
        return monograms;
    }
    static searchVariants(input) {
        const words = input.split(" ");
        const variants = [input];
        variants.push.apply(variants, Ngrams.bigrams(words));
        variants.push.apply(variants, Ngrams.trigrams(words));
        return variants;
    }
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
    static bigrams(words) {
        return Ngrams.ngrams(words, 2);
    }
    static trigrams(words) {
        return Ngrams.ngrams(words, 3);
    }
}
export { Ngrams };
