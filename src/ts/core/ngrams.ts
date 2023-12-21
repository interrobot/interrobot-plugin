/* tslint:disable:no-console */
/* tslint:disable:max-line-length */

class Ngrams {

    public static expandWords(words: string[]): string {
        const monograms = words.join(" ");
        return monograms;
    }

    public static searchVariants(input: string): string[] {
        const words: string[] = input.split(" ");
        const variants: string[] = [input];
        variants.push.apply(variants, Ngrams.bigrams(words));
        variants.push.apply(variants, Ngrams.trigrams(words));
        return variants;
    }

    private static ngrams(words: string[], length: number): string[] {
        const numWords = words.length;
        const lastIndex = numWords - 1;
        const out: string[] = [];
        for (let i = 0; i < numWords; i++) {
            const ngramEnd: number = Math.min(i + length, lastIndex);
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

    private static bigrams(words: string[]): string[] {
        return Ngrams.ngrams(words, 2);
    }

    private static trigrams(words: string[]): string[]  {
        return Ngrams.ngrams(words, 3);
    }
}

export { Ngrams };
