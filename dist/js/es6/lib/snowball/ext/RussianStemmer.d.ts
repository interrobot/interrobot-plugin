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
 * Implements the Snowball stemming algorithm for the Russian language.
 */
declare class RussianStemmer extends BaseStemmer {
    /** Position marker for the beginning of the word's ending. */
    protected I_pV: number;
    /**
     * Initializes a new instance of the RussianStemmer class.
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
     * Helper method for r_mark_regions.
     * @returns A boolean indicating the result of the operation.
     */
    habr3(): boolean;
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
     * Checks if the cursor is within the R2 region.
     * @returns A boolean indicating if the cursor is in R2.
     */
    r_R2(): boolean;
    /**
     * Helper method for various stemming steps.
     * @param a - The array of Among objects to search.
     * @param n - The number of Among objects in the array.
     * @returns A boolean indicating the result of the operation.
     */
    habr2(a: any, n: any): boolean;
    /**
     * Handles perfective gerund suffixes.
     * @returns A boolean indicating if any changes were made.
     */
    r_perfective_gerund(): boolean;
    /**
     * Another helper method for various stemming steps.
     * @param a - The array of Among objects to search.
     * @param n - The number of Among objects in the array.
     * @returns A boolean indicating the result of the operation.
     */
    habr1(a: any, n: any): boolean;
    /**
     * Handles adjective suffixes.
     * @returns A boolean indicating if any changes were made.
     */
    r_adjective(): boolean;
    /**
     * Handles adjectival suffixes.
     * @returns A boolean indicating if any changes were made.
     */
    r_adjectival(): boolean;
    /**
     * Handles reflexive suffixes.
     * @returns A boolean indicating if any changes were made.
     */
    r_reflexive(): boolean;
    /**
     * Handles verb suffixes.
     * @returns A boolean indicating if any changes were made.
     */
    r_verb(): boolean;
    /**
     * Handles noun suffixes.
     */
    r_noun(): void;
    /**
     * Handles derivational suffixes.
     */
    r_derivational(): void;
    /**
     * Performs final cleanup steps on the stem.
     */
    r_tidy_up(): void;
    /**
     * Stems the current word.
     * @returns A boolean indicating if stemming was successful.
     */
    stem(): boolean;
}
export { RussianStemmer };
