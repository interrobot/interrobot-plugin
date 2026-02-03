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
 * Implements the Snowball stemming algorithm for the Dutch language.
 */
declare class DutchStemmer extends BaseStemmer {
    /** Grouping of vowels including I. */
    protected g_v_I: number[];
    /** Grouping of vowels including j. */
    protected g_v_j: number[];
    /** Flag indicating if e was found. */
    protected B_e_found: boolean;
    /**
     * Initializes a new instance of the DutchStemmer class.
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
     * Helper method for r_prelude.
     * @param v_1 - The cursor position.
     * @returns A boolean indicating the result of the operation.
     */
    habr1(v_1: any): boolean;
    /**
     * Marks regions in the word for the stemming process.
     */
    r_mark_regions(): void;
    /**
     * Helper method for r_mark_regions.
     * @returns A boolean indicating the result of the operation.
     */
    habr2(): boolean;
    /**
     * Performs the postlude step of the stemming algorithm.
     */
    r_postlude(): void;
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
     * Handles undoubling of characters.
     */
    r_undouble(): void;
    /**
     * Handles e-ending removal.
     */
    r_e_ending(): void;
    /**
     * Handles en-ending removal.
     */
    r_en_ending(): void;
    /**
     * Performs the standard suffix removal step of the stemming algorithm.
     */
    r_standard_suffix(): void;
    /**
     * Stems the current word.
     * @returns A boolean indicating if stemming was successful.
     */
    stem(): boolean;
}
export { DutchStemmer };
