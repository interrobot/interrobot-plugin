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
 * Implements the Snowball stemming algorithm for the Spanish language.
 */
declare class SpanishStemmer extends BaseStemmer {
    /** Position marker for the beginning of the word's ending. */
    protected I_pV: number;
    /**
     * Initializes a new instance of the SpanishStemmer class.
     */
    constructor();
    /**
     * Helper method for r_mark_regions.
     * @returns A boolean indicating the result of the operation.
     */
    habr1(): boolean;
    /**
     * Helper method for r_mark_regions.
     * @returns A boolean indicating the result of the operation.
     */
    habr2(): boolean;
    /**
     * Helper method for r_mark_regions.
     */
    habr3(): void;
    /**
     * Helper method for r_mark_regions.
     * @returns A boolean indicating the result of the operation.
     */
    habr4(): boolean;
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
     * Handles attached pronouns in the word.
     */
    r_attached_pronoun(): void;
    /**
     * Helper method for r_standard_suffix.
     * @param a - The array of Among objects to search.
     * @param n - The number of Among objects in the array.
     * @returns A boolean indicating the result of the operation.
     */
    habr5(a: any, n: any): boolean;
    /**
     * Helper method for r_standard_suffix.
     * @param c1 - The characters to check for.
     * @returns A boolean indicating the result of the operation.
     */
    habr6(c1: any): boolean;
    /**
     * Handles standard suffixes.
     * @returns A boolean indicating if any changes were made.
     */
    r_standard_suffix(): boolean;
    /**
     * Handles 'y' verb suffixes.
     * @returns A boolean indicating if any changes were made.
     */
    r_y_verb_suffix(): boolean;
    /**
     * Handles verb suffixes.
     */
    r_verb_suffix(): void;
    /**
     * Handles residual suffixes.
     */
    r_residual_suffix(): void;
    /**
     * Stems the current word.
     * @returns A boolean indicating if stemming was successful.
     */
    stem: () => boolean;
}
export { SpanishStemmer };
