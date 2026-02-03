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

import { Among } from "../Among.js";
import { SnowballProgram } from "../SnowballProgram.js";

/**
 * Base class for implementing stemming algorithms using the Snowball framework.
 */
class BaseStemmer {
    /** Array of Among objects for stemming rules. */
    protected a_0: Among[];
    /** Array of Among objects for stemming rules. */
    protected a_1: Among[];
    /** Array of Among objects for stemming rules. */
    protected a_2: Among[];
    /** Array of Among objects for stemming rules. */
    protected a_3: Among[];
    /** Array of Among objects for stemming rules. */
    protected a_4: Among[];
    /** Array of Among objects for stemming rules. */
    protected a_5: Among[];
    /** Array of Among objects for stemming rules. */
    protected a_6: Among[];
    /** Array of Among objects for stemming rules. */
    protected a_7: Among[];
    /** Array of Among objects for stemming rules. */
    protected a_8: Among[];
    /** Array of Among objects for stemming rules. */
    protected a_9: Among[];
    /** Array of Among objects for stemming rules. */
    protected a_10: Among[];
    /** Array of Among objects for stemming rules. */
    protected a_11: Among[];

    /** Grouping of vowels. */
    protected g_v: number[];
    /** Grouping of vowels including W, X, and Y. */
    protected g_v_WXY: number[];
    /** Grouping of valid LI endings. */
    protected g_valid_LI: number[];

    /** Flag indicating if Y was found. */
    protected B_Y_found: boolean;
    /** Position marker for region p2. */
    protected I_p2: number;
    /** Position marker for region p1. */
    protected I_p1: number;

    /** Array for habr (purpose unclear, possibly related to stemming rules). */
    protected habr: any[];
    /** Array of strings for habrs (purpose unclear, possibly related to stemming rules). */
    protected habrs: string[];

    /** The SnowballProgram instance used for stemming operations. */
    protected sbp: SnowballProgram;

    /**
     * Initializes a new instance of the BaseStemmer class.
     */
    public constructor() {
        this.sbp = new SnowballProgram();
    }

    /**
     * Sets the current word to be stemmed.
     * @param word - The word to be stemmed.
     */
    public setCurrent(word: string): void {
        this.sbp.setCurrent(word);
    }

    /**
     * Gets the current stemmed word.
     * @returns The current stemmed word.
     */
    public getCurrent(): string {
        return this.sbp.getCurrent();
    }
}

export { BaseStemmer };
