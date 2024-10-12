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
 * Implements the Snowball stemming algorithm for the German language.
 */
declare class GermanStemmer extends BaseStemmer {
    /** Grouping of s-ending characters. */
    protected g_s_ending: number[];
    /** Grouping of st-ending characters. */
    protected g_st_ending: number[];
    /** Position marker for a specific region in the word. */
    protected I_x: number;
    /**
     * Initializes a new instance of the GermanStemmer class.
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
     * Performs the prelude step of the stemming algorithm.
     */
    r_prelude(): void;
    /**
     * Helper method for r_mark_regions.
     * @returns A boolean indicating the result of the operation.
     */
    habr2(): boolean;
    /**
     * Marks regions in the word for the stemming process.
     */
    r_mark_regions(): void;
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
     * Performs the standard suffix removal step of the stemming algorithm.
     */
    r_standard_suffix(): void;
    /**
     * Stems the current word.
     * @returns A boolean indicating if stemming was successful.
     */
    stem(): boolean;
}
export { GermanStemmer };
