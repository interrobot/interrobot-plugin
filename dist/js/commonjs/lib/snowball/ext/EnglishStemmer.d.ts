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
 * Implements the Snowball stemming algorithm for the English language.
 */
declare class EnglishStemmer extends BaseStemmer {
    /**
     * Initializes a new instance of the EnglishStemmer class.
     */
    constructor();
    /**
     * Performs the prelude step of the stemming algorithm.
     */
    r_prelude(): void;
    /**
     * Marks regions in the word for the stemming process.
     */
    r_mark_regions(): void;
    /**
     * Helper method for r_mark_regions.
     * @returns A boolean indicating the result of the operation.
     */
    habr1(): boolean;
    /**
     * Checks if the current suffix is a short vowel.
     * @returns A boolean indicating if a short vowel was found.
     */
    r_shortv(): boolean;
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
     * Performs step 1a of the stemming algorithm.
     */
    r_Step_1a(): void;
    /**
     * Performs step 1b of the stemming algorithm.
     */
    r_Step_1b(): void;
    /**
     * Performs step 1c of the stemming algorithm.
     */
    r_Step_1c(): void;
    /**
     * Performs step 2 of the stemming algorithm.
     */
    r_Step_2(): void;
    /**
     * Performs step 3 of the stemming algorithm.
     */
    r_Step_3(): void;
    /**
     * Performs step 4 of the stemming algorithm.
     */
    r_Step_4(): void;
    /**
     * Performs step 5 of the stemming algorithm.
     */
    r_Step_5(): void;
    /**
     * Handles exceptions for the stemming process (part 2).
     * @returns A boolean indicating if an exception was handled.
     */
    r_exception2(): boolean;
    /**
     * Handles exceptions for the stemming process (part 1).
     * @returns A boolean indicating if an exception was handled.
     */
    r_exception1(): boolean;
    /**
     * Performs the postlude step of the stemming algorithm.
     */
    r_postlude(): void;
    /**
     * Stems the current word.
     * @returns A boolean indicating if stemming was successful.
     */
    stem(): boolean;
}
export { EnglishStemmer };
