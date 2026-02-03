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
 * Implements the Snowball stemming algorithm for the Swedish language.
 */
declare class SwedishStemmer extends BaseStemmer {
    /** Position marker for a specific region in the word. */
    protected I_x: number;
    /** Grouping of s-ending characters. */
    protected g_s_ending: number[];
    /**
     * Initializes a new instance of the SwedishStemmer class.
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
     * Handles main suffix removal.
     */
    r_main_suffix(): void;
    /**
     * Handles consonant pair removal.
     */
    r_consonant_pair(): void;
    /**
     * Handles other suffix removals.
     */
    r_other_suffix(): void;
    /**
     * Stems the current word.
     * @returns A boolean indicating if stemming was successful.
     */
    stem(): boolean;
}
export { SwedishStemmer };
