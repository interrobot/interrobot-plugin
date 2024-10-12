/*!
 * Snowball Typescript Port 0.1.x
 * Copyright 2023, Ben Caulfield
 * http://pragmar.com
 * http://www.mozilla.org/MPL/
 *
 * Snowball JavaScript Library v0.3
 * http://code.google.com/p/urim/
 * http://snowball.tartarus.org/
 *
 * Copyright 2010, Oleg Mazko
 * http://www.mozilla.org/MPL/
 */
import { BaseStemmer } from "./BaseStemmer.js";
/**
 * Implements the Snowball stemming algorithm for the French language.
 */
declare class FrenchStemmer extends BaseStemmer {
    /** Position marker for the beginning of the word's ending. */
    protected I_pV: number;
    /** Grouping of characters to keep with 's'. */
    protected g_keep_with_s: number[];
    /**
     * Initializes a new instance of the FrenchStemmer class.
     */
    constructor();
    /**
     * Sets the current word to be stemmed.
     * @param word - The word to be stemmed.
     */
    setCurrent(word: any): void;
    /**
     * Gets the current stemmed word.
     * @returns The current stemmed word.
     */
    getCurrent(): string;
    /**
     * Helper method for handling specific character replacements.
     * @param c1 - The character to be replaced.
     * @param c2 - The replacement character.
     * @param v_1 - The cursor position to reset to after replacement.
     * @returns A boolean indicating if the replacement was made.
     */
    habr1(c1: any, c2: any, v_1: any): boolean;
    /**
     * Another helper method for handling specific character replacements.
     * @param c1 - The character to be replaced.
     * @param c2 - The replacement character.
     * @param v_1 - The cursor position to reset to after replacement.
     * @returns A boolean indicating if the replacement was made.
     */
    habr2(c1: any, c2: any, v_1: any): boolean;
    /**
     * Performs the prelude step of the stemming algorithm.
     */
    r_prelude(): void;
    /**
     * Helper method for r_mark_regions.
     * @returns A boolean indicating the result of the operation.
     */
    habr3(): boolean;
    /**
     * Marks regions in the word for the stemming process.
     */
    r_mark_regions(): void;
    /**
     * Performs the postlude step of the stemming algorithm.
     */
    r_postlude(): void;
    /**
     * Checks if the cursor is within the RV region.
     * @returns A boolean indicating if the cursor is in RV.
     */
    r_RV(): boolean;
    /**
     * Checks if the cursor is within the R1 region.
     * @returns A boolean indicating if the cursor is in R1.
     */
    r_R1(): boolean;
    /**
     * Checks if the cursor is within the R2 region.
     * @returns A boolean indicating if the cursor is in R2.
     */
    r_R2(): boolean;
    /**
     * Performs the standard suffix removal step of the stemming algorithm.
     * @returns A boolean indicating if any changes were made.
     */
    r_standard_suffix(): boolean;
    /**
     * Removes 'i' verb suffixes.
     * @returns A boolean indicating if any changes were made.
     */
    r_i_verb_suffix(): boolean;
    /**
     * Removes verb suffixes.
     * @returns A boolean indicating if any changes were made.
     */
    r_verb_suffix(): boolean;
    /**
     * Removes residual suffixes.
     */
    r_residual_suffix(): void;
    /**
     * Removes double consonants.
     */
    r_un_double(): void;
    /**
     * Removes accents from the word.
     */
    r_un_accent(): void;
    /**
     * Performs multiple stemming steps.
     */
    habr5(): void;
    /**
     * Stems the current word.
     * @returns A boolean indicating if stemming was successful.
     */
    stem(): boolean;
}
export { FrenchStemmer };
