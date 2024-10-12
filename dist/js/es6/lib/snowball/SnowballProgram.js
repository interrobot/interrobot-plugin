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
 * Represents a Snowball stemming algorithm program.
 */
class SnowballProgram {
    /**
     * Initializes a new instance of the SnowballProgram class.
     */
    constructor() {
        this.bra = 0;
        this.ket = 0;
        this.limit = 0;
        this.cursor = 0;
        this.limit_backward = 0;
    }
    /**
     * Sets the current word to be processed.
     * @param word - The word to be processed.
     */
    setCurrent(word) {
        this.current = word;
        this.cursor = 0;
        this.limit = word.length;
        this.limit_backward = 0;
        this.bra = this.cursor;
        this.ket = this.limit;
    }
    /**
     * Gets the current word being processed.
     * @returns The current word.
     */
    getCurrent() {
        var result = this.current;
        this.current = null;
        return result;
    }
    /**
     * Checks if the current character is in a specified grouping.
     * @param s - The grouping to check against.
     * @param min - The minimum character code.
     * @param max - The maximum character code.
     * @returns True if the character is in the grouping, false otherwise.
     */
    in_grouping(s, min, max) {
        if (this.cursor < this.limit) {
            var ch = this.current.charCodeAt(this.cursor);
            if (ch <= max && ch >= min) {
                ch -= min;
                if (s[ch >> 3] & (0X1 << (ch & 0X7))) {
                    this.cursor++;
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Checks if the previous character is in a specified grouping.
     * @param s - The grouping to check against.
     * @param min - The minimum character code.
     * @param max - The maximum character code.
     * @returns True if the character is in the grouping, false otherwise.
     */
    in_grouping_b(s, min, max) {
        if (this.cursor > this.limit_backward) {
            var ch = this.current.charCodeAt(this.cursor - 1);
            if (ch <= max && ch >= min) {
                ch -= min;
                if (s[ch >> 3] & (0X1 << (ch & 0X7))) {
                    this.cursor--;
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Checks if the current character is outside a specified grouping.
     * @param s - The grouping to check against.
     * @param min - The minimum character code.
     * @param max - The maximum character code.
     * @returns True if the character is outside the grouping, false otherwise.
     */
    out_grouping(s, min, max) {
        if (this.cursor < this.limit) {
            var ch = this.current.charCodeAt(this.cursor);
            if (ch > max || ch < min) {
                this.cursor++;
                return true;
            }
            ch -= min;
            if (!(s[ch >> 3] & (0X1 << (ch & 0X7)))) {
                this.cursor++;
                return true;
            }
        }
        return false;
    }
    /**
     * Checks if the previous character is outside a specified grouping.
     * @param s - The grouping to check against.
     * @param min - The minimum character code.
     * @param max - The maximum character code.
     * @returns True if the character is outside the grouping, false otherwise.
     */
    out_grouping_b(s, min, max) {
        if (this.cursor > this.limit_backward) {
            var ch = this.current.charCodeAt(this.cursor - 1);
            if (ch > max || ch < min) {
                this.cursor--;
                return true;
            }
            ch -= min;
            if (!(s[ch >> 3] & (0X1 << (ch & 0X7)))) {
                this.cursor--;
                return true;
            }
        }
        return false;
    }
    /**
     * Checks if the substring at the current position equals the given string.
     * @param s_size - The size of the string to compare.
     * @param s - The string to compare.
     * @returns True if the substrings match, false otherwise.
     */
    eq_s(s_size, s) {
        if (this.limit - this.cursor < s_size) {
            return false;
        }
        for (let i = 0; i < s_size; i++) {
            if (this.current.charCodeAt(this.cursor + i) != s.charCodeAt(i)) {
                return false;
            }
        }
        this.cursor += s_size;
        return true;
    }
    /**
     * Checks if the substring before the current position equals the given string.
     * @param s_size - The size of the string to compare.
     * @param s - The string to compare.
     * @returns True if the substrings match, false otherwise.
     */
    eq_s_b(s_size, s) {
        if (this.cursor === null || this.current === null) {
            console.error(`unhandled error: s: ${s} | size: ${s_size}`);
            return false;
        }
        if (this.cursor - this.limit_backward < s_size) {
            return false;
        }
        for (var i = 0; i < s_size; i++) {
            if (this.current.charCodeAt(this.cursor - s_size + i) != s.charCodeAt(i)) {
                return false;
            }
        }
        this.cursor -= s_size;
        return true;
    }
    /**
     * Finds a matching Among object in the given array.
     * @param v - The array of Among objects to search.
     * @param v_size - The size of the array.
     * @returns The result of the matching Among object, or 0 if no match is found.
     */
    find_among(v, v_size) {
        var i = 0, j = v_size, c = this.cursor, l = this.limit, common_i = 0, common_j = 0, first_key_inspected = false;
        while (true) {
            var k = i + ((j - i) >> 1), diff = 0, common = common_i < common_j
                ? common_i
                : common_j, w = v[k];
            for (var i2 = common; i2 < w.s_size; i2++) {
                if (c + common == l) {
                    diff = -1;
                    break;
                }
                diff = this.current.charCodeAt(c + common) - w.s[i2];
                if (diff) {
                    break;
                }
                common++;
            }
            if (diff < 0) {
                j = k;
                common_j = common;
            }
            else {
                i = k;
                common_i = common;
            }
            if (j - i <= 1) {
                if (i > 0 || j == i || first_key_inspected)
                    break;
                first_key_inspected = true;
            }
        }
        while (true) {
            var w = v[i];
            if (common_i >= w.s_size) {
                this.cursor = c + w.s_size;
                if (w.method) {
                    // method() not referenced in any language files
                    console.warn(`method is unsupported type`);
                }
                return w.result;
                // leaving method handling in for reference (if something breaks)
                // this.cursor = c + w.s_size;
                // if (!w.method)
                // 	return w.result;
                // var res = w.method();
                // this.cursor = c + w.s_size;
                // if (res)
                // 	return w.result;
            }
            i = w.substring_i;
            if (i < 0)
                return 0;
        }
    }
    /**
     * Finds a matching Among object in the given array, searching backwards.
     * @param v - The array of Among objects to search.
     * @param v_size - The size of the array.
     * @returns The result of the matching Among object, or 0 if no match is found.
     */
    find_among_b(v, v_size) {
        let i = 0;
        let j = v_size;
        const c = this.cursor;
        const lb = this.limit_backward;
        let common_i = 0;
        let common_j = 0;
        let first_key_inspected = false;
        while (true) {
            let k = i + ((j - i) >> 1);
            let diff = 0;
            let common = common_i < common_j ? common_i : common_j;
            let w = v[k];
            for (let i2 = w.s_size - 1 - common; i2 >= 0; i2--) {
                if (c - common == lb) {
                    diff = -1;
                    break;
                }
                // don't getCurrent(), it'll self nullify, that is the 
                // responsibility of the last-in-line function				
                const current = this.current;
                diff = current.charCodeAt(c - 1 - common) - w.s[i2];
                if (diff) {
                    break;
                }
                common++;
            }
            if (diff < 0) {
                j = k;
                common_j = common;
            }
            else {
                i = k;
                common_i = common;
            }
            if (j - i <= 1) {
                if (i > 0 || j == i || first_key_inspected) {
                    break;
                }
                first_key_inspected = true;
            }
        }
        while (true) {
            var w = v[i];
            if (common_i >= w.s_size) {
                this.cursor = c - w.s_size;
                return w.result;
                // method() not referenced in project languages
                // leaving for historical reference
                // this.cursor = c - w.s_size;				
                // if (!w.method)
                // 	return w.result;
                //  var res = w.method();
                // this.cursor = c - w.s_size;
                // if (res)
                // 	return w.result;
            }
            i = w.substring_i;
            if (i < 0)
                return 0;
        }
    }
    /**
     * Replaces the current substring with the given string.
     * @param s - The string to replace with.
     */
    slice_from(s) {
        this.slice_check();
        this.replace_s(this.bra, this.ket, s);
    }
    /**
     * Inserts a string at a specified position.
     * @param c_bra - The position to insert at.
     * @param c_ket - The end position of any text to be replaced.
     * @param s - The string to insert.
     */
    insert(c_bra, c_ket, s) {
        var adjustment = this.replace_s(c_bra, c_ket, s);
        if (c_bra <= this.bra) {
            this.bra += adjustment;
        }
        if (c_bra <= this.ket) {
            this.ket += adjustment;
        }
    }
    /**
     * Deletes the current substring.
     */
    slice_del() {
        this.slice_from("");
    }
    /**
     * Replaces a substring of the current string.
     * @param c_bra - The start position of the substring to replace.
     * @param c_ket - The end position of the substring to replace.
     * @param s - The string to replace with.
     * @returns The adjustment in string length after the replacement.
     */
    replace_s(c_bra, c_ket, s) {
        const adjustment = s.length - (c_ket - c_bra);
        const left = this.current.substring(0, c_bra);
        const right = this.current.substring(c_ket);
        this.current = left + s + right;
        this.limit += adjustment;
        if (this.cursor >= c_ket) {
            this.cursor += adjustment;
        }
        else if (this.cursor > c_bra) {
            this.cursor = c_bra;
        }
        return adjustment;
    }
    /**
     * Checks if the current slice operation is valid.
     * @throws Will throw an error if the slice operation is faulty.
     */
    slice_check() {
        if (this.bra < 0 || this.bra > this.ket || this.ket > this.limit
            || this.limit > this.current.length)
            throw ("faulty slice operation");
    }
    /**
     * Gets the current substring.
     * @returns The current substring.
     */
    slice_t() {
        this.slice_check();
        return this.current.substring(this.bra, this.ket);
    }
    /**
     * Checks if the substring before the current position equals the given string.
     * @param s - The string to compare.
     * @returns True if the substrings match, false otherwise.
     */
    eq_v_b(s) {
        return this.eq_s_b(s.length, s);
    }
}
export { SnowballProgram };
