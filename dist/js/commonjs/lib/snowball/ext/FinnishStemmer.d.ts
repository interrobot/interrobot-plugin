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
 * Implements the Snowball stemming algorithm for the Finnish language.
 */
declare class FinnishStemmer extends BaseStemmer {
    /** Grouping of AEI characters. */
    protected g_AEI: number[];
    /** Grouping of vowels (variant 1). */
    protected g_V1: number[];
    /** Grouping of vowels (variant 2). */
    protected g_V2: number[];
    /** Grouping of particle ending characters. */
    protected g_particle_end: number[];
    /** Flag indicating if an ending was removed. */
    protected B_ending_removed: boolean;
    /** String storage for stemming operations. */
    protected S_x: string;
    /**
     * Initializes a new instance of the FinnishStemmer class.
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
     * Marks regions in the word for the stemming process.
     */
    r_mark_regions(): void;
    /**
     * Helper method for r_mark_regions.
     * @returns A boolean indicating the result of the operation.
     */
    habr1(): boolean;
    /**
     * Checks if the cursor is within the R2 region.
     * @returns A boolean indicating if the cursor is in R2.
     */
    r_R2(): boolean;
    /**
     * Handles particle suffixes.
     */
    r_particle_etc(): void;
    /**
     * Handles possessive suffixes.
     */
    r_possessive(): void;
    /**
     * Checks for long vowel patterns.
     * @returns A boolean indicating if a long vowel pattern was found.
     */
    r_LONG(): boolean;
    /**
     * Checks for 'i' followed by a vowel.
     * @returns A boolean indicating if the pattern was found.
     */
    r_VI(): boolean;
    /**
     * Handles case ending suffixes.
     */
    r_case_ending(): void;
    /**
     * Handles other ending suffixes.
     */
    r_other_endings(): void;
    /**
     * Handles plural 'i' suffix.
     */
    r_i_plural(): void;
    /**
     * Handles plural 't' suffix.
     */
    r_t_plural(): void;
    /**
     * Performs final cleanup steps on the stem.
     */
    r_tidy(): void;
    /**
     * Stems the current word.
     * @returns A boolean indicating if stemming was successful.
     */
    stem(): boolean;
}
export { FinnishStemmer };
