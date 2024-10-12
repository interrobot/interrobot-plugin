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
 * Implements the Snowball stemming algorithm for the Portuguese language.
 */
declare class PortugueseStemmer extends BaseStemmer {
    /** Position marker for the beginning of the word's ending. */
    protected I_pV: number;
    /**
     * Initializes a new instance of the PortugueseStemmer class.
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
     * Performs the prelude step of the stemming algorithm.
     */
    r_prelude(): void;
    /**
     * Helper method for r_mark_regions.
     * @returns A boolean indicating the result of the operation.
     */
    habr2(): boolean;
    /**
    * Another helper method for r_mark_regions.
    * @returns A boolean indicating the result of the operation.
    */
    habr3(): boolean;
    /**
    * Helper method for r_mark_regions.
    * @returns A boolean indicating the result of the operation.
    */
    habr4(): boolean;
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
     * Performs the standard suffix removal step of the stemming algorithm.
     * @returns A boolean indicating if any changes were made.
     */
    r_standard_suffix(): boolean;
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
     * Helper method for handling specific character replacements.
     * @param c1 - The first character to check.
     * @param c2 - The second character to check.
     * @returns A boolean indicating the result of the operation.
     */
    habr6(c1: any, c2: any): boolean;
    /**
     * Handles residual word forms.
     */
    r_residual_form(): void;
    /**
     * Main helper method for the stemming process.
     */
    habr1(): void;
    /**
     * Stems the current word.
     * @returns A boolean indicating if stemming was successful.
     */
    stem(): boolean;
}
export { PortugueseStemmer };
