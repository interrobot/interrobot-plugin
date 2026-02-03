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
 * Implements the Snowball stemming algorithm for the Romanian language.
 */
declare class RomanianStemmer extends BaseStemmer {
    /** Flag indicating if a standard suffix was removed. */
    protected B_standard_suffix_removed: boolean;
    /** Position marker for the beginning of the word's ending. */
    protected I_pV: number;
    /**
     * Initializes a new instance of the RomanianStemmer class.
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
     * Helper method for r_prelude.
     * @param c1 - The character to check.
     * @param c2 - The replacement character.
     */
    habr1(c1: any, c2: any): void;
    /**
     * Performs the prelude step of the stemming algorithm.
     */
    r_prelude(): void;
    /**
     * Helper method for r_mark_regions.
     * @returns A boolean indicating the result of the operation.
     */
    habr2(): boolean;
    /**
     * Helper method for r_mark_regions.
     * @returns A boolean indicating the result of the operation.
     */
    habr3(): boolean;
    /**
     * Helper method for r_mark_regions.
     */
    habr4(): void;
    /**
     * Helper method for r_mark_regions.
     * @returns A boolean indicating the result of the operation.
     */
    habr5(): boolean;
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
     * Performs step 0 of the stemming algorithm.
     */
    r_step_0(): void;
    /**
     * Handles combination suffixes.
     * @returns A boolean indicating if any changes were made.
     */
    r_combo_suffix(): boolean;
    /**
     * Handles standard suffix removal.
     */
    r_standard_suffix(): void;
    /**
     * Handles verb suffix removal.
     */
    r_verb_suffix(): void;
    /**
     * Handles vowel suffix removal.
     */
    r_vowel_suffix(): void;
    /**
     * Stems the current word.
     * @returns A boolean indicating if stemming was successful.
     */
    stem(): boolean;
}
export { RomanianStemmer };
