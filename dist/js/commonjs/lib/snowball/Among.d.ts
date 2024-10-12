/*!
 * Snowball Typescript Port 0.1.5
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
/**
 * Represents a string and its associated data in the Snowball stemming algorithm.
 */
declare class Among {
    /** The string represented as an array of character codes. */
    s: number[];
    /** The length of the string. */
    s_size: number;
    /** The index of the substring. */
    substring_i: number;
    /** The result associated with this Among object. */
    result: any;
    /**
     * Creates an instance of Among.
     * @param s - The string to be represented.
     * @param substring_i - The index of the substring.
     * @param result - The result associated with this Among object.
     * @throws Will throw an error if any of the required parameters are missing or invalid.
     */
    constructor(s: string, substring_i: number, result: any);
    /**
     * Converts a string to an array of character codes.
     * @param s - The string to convert.
     * @returns An array of character codes representing the input string.
     */
    static toCharArray(s: string): number[];
}
export { Among };
