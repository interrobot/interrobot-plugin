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
import { Among } from "./Among.js";
/**
 * Represents a Snowball stemming algorithm program.
 */
declare class SnowballProgram {
    /** The start position of the current substring. */
    bra: number;
    /** The end position of the current substring. */
    ket: number;
    /** The limit of the string to be processed. */
    limit: number;
    /** The current position in the string. */
    cursor: number;
    /** The backward limit of the string to be processed. */
    limit_backward: number;
    /** The current string being processed. */
    current: string;
    /**
     * Initializes a new instance of the SnowballProgram class.
     */
    constructor();
    /**
     * Sets the current word to be processed.
     * @param word - The word to be processed.
     */
    setCurrent(word: any): void;
    /**
     * Gets the current word being processed.
     * @returns The current word.
     */
    getCurrent(): string;
    /**
     * Checks if the current character is in a specified grouping.
     * @param s - The grouping to check against.
     * @param min - The minimum character code.
     * @param max - The maximum character code.
     * @returns True if the character is in the grouping, false otherwise.
     */
    in_grouping(s: any, min: any, max: any): boolean;
    /**
     * Checks if the previous character is in a specified grouping.
     * @param s - The grouping to check against.
     * @param min - The minimum character code.
     * @param max - The maximum character code.
     * @returns True if the character is in the grouping, false otherwise.
     */
    in_grouping_b(s: any, min: any, max: any): boolean;
    /**
     * Checks if the current character is outside a specified grouping.
     * @param s - The grouping to check against.
     * @param min - The minimum character code.
     * @param max - The maximum character code.
     * @returns True if the character is outside the grouping, false otherwise.
     */
    out_grouping(s: any, min: any, max: any): boolean;
    /**
     * Checks if the previous character is outside a specified grouping.
     * @param s - The grouping to check against.
     * @param min - The minimum character code.
     * @param max - The maximum character code.
     * @returns True if the character is outside the grouping, false otherwise.
     */
    out_grouping_b(s: any, min: any, max: any): boolean;
    /**
     * Checks if the substring at the current position equals the given string.
     * @param s_size - The size of the string to compare.
     * @param s - The string to compare.
     * @returns True if the substrings match, false otherwise.
     */
    eq_s(s_size: number, s: string): boolean;
    /**
     * Checks if the substring before the current position equals the given string.
     * @param s_size - The size of the string to compare.
     * @param s - The string to compare.
     * @returns True if the substrings match, false otherwise.
     */
    eq_s_b(s_size: number, s: string): boolean;
    /**
     * Finds a matching Among object in the given array.
     * @param v - The array of Among objects to search.
     * @param v_size - The size of the array.
     * @returns The result of the matching Among object, or 0 if no match is found.
     */
    find_among(v: {}, v_size: number): number;
    /**
     * Finds a matching Among object in the given array, searching backwards.
     * @param v - The array of Among objects to search.
     * @param v_size - The size of the array.
     * @returns The result of the matching Among object, or 0 if no match is found.
     */
    find_among_b(v: Among[], v_size: number): number;
    /**
     * Replaces the current substring with the given string.
     * @param s - The string to replace with.
     */
    slice_from(s: string): void;
    /**
     * Inserts a string at a specified position.
     * @param c_bra - The position to insert at.
     * @param c_ket - The end position of any text to be replaced.
     * @param s - The string to insert.
     */
    insert(c_bra: any, c_ket: any, s: any): void;
    /**
     * Deletes the current substring.
     */
    slice_del(): void;
    /**
     * Replaces a substring of the current string.
     * @param c_bra - The start position of the substring to replace.
     * @param c_ket - The end position of the substring to replace.
     * @param s - The string to replace with.
     * @returns The adjustment in string length after the replacement.
     */
    private replace_s;
    /**
     * Checks if the current slice operation is valid.
     * @throws Will throw an error if the slice operation is faulty.
     */
    private slice_check;
    /**
     * Gets the current substring.
     * @returns The current substring.
     */
    private slice_t;
    /**
     * Checks if the substring before the current position equals the given string.
     * @param s - The string to compare.
     * @returns True if the substrings match, false otherwise.
     */
    private eq_v_b;
}
export { SnowballProgram };
