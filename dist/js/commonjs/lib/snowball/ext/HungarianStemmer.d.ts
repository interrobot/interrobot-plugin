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
 * Implements the Snowball stemming algorithm for the Hungarian language.
 */
declare class HungarianStemmer extends BaseStemmer {
    /**
     * Initializes a new instance of the HungarianStemmer class.
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
     * Checks if the cursor is within the R1 region.
     * @returns A boolean indicating if the cursor is in R1.
     */
    r_R1(): boolean;
    /**
     * Handles vowel ending transformations.
     */
    r_v_ending(): void;
    /**
     * Checks for double consonants.
     * @returns A boolean indicating if double consonants were found.
     */
    r_double(): boolean;
    /**
     * Removes one character from a double consonant.
     */
    r_undouble(): void;
    /**
     * Handles instrumental case suffixes.
     */
    r_instrum(): void;
    /**
     * Handles case suffixes.
     */
    r_case(): void;
    /**
     * Handles special case suffixes.
     */
    r_case_special(): void;
    /**
     * Handles other case suffixes.
     */
    r_case_other(): void;
    /**
     * Handles factive suffixes.
     */
    r_factive(): void;
    /**
     * Handles plural suffixes.
     */
    r_plural(): void;
    /**
     * Handles owned suffixes.
     */
    r_owned(): void;
    /**
     * Handles singular owner suffixes.
     */
    r_sing_owner(): void;
    /**
     * Handles plural owner suffixes.
     */
    r_plur_owner(): void;
    /**
     * Stems the current word.
     * @returns A boolean indicating if stemming was successful.
     */
    stem(): boolean;
}
export { HungarianStemmer };
