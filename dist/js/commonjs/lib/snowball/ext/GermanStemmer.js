"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GermanStemmer = void 0;
const BaseStemmer_js_1 = require("./BaseStemmer.js");
const Among_js_1 = require("../Among.js");
/**
 * Implements the Snowball stemming algorithm for the German language.
 */
class GermanStemmer extends BaseStemmer_js_1.BaseStemmer {
    /**
     * Initializes a new instance of the GermanStemmer class.
     */
    constructor() {
        super();
        this.a_0 = [new Among_js_1.Among("", -1, 6), new Among_js_1.Among("U", 0, 2),
            new Among_js_1.Among("Y", 0, 1), new Among_js_1.Among("\u00E4", 0, 3),
            new Among_js_1.Among("\u00F6", 0, 4), new Among_js_1.Among("\u00FC", 0, 5)];
        this.a_1 = [
            new Among_js_1.Among("e", -1, 2), new Among_js_1.Among("em", -1, 1),
            new Among_js_1.Among("en", -1, 2), new Among_js_1.Among("ern", -1, 1),
            new Among_js_1.Among("er", -1, 1), new Among_js_1.Among("s", -1, 3),
            new Among_js_1.Among("es", 5, 2)
        ];
        this.a_2 = [new Among_js_1.Among("en", -1, 1),
            new Among_js_1.Among("er", -1, 1), new Among_js_1.Among("st", -1, 2),
            new Among_js_1.Among("est", 2, 1)];
        this.a_3 = [new Among_js_1.Among("ig", -1, 1),
            new Among_js_1.Among("lich", -1, 1)];
        this.a_4 = [new Among_js_1.Among("end", -1, 1),
            new Among_js_1.Among("ig", -1, 2), new Among_js_1.Among("ung", -1, 1),
            new Among_js_1.Among("lich", -1, 3), new Among_js_1.Among("isch", -1, 2),
            new Among_js_1.Among("ik", -1, 2), new Among_js_1.Among("heit", -1, 3),
            new Among_js_1.Among("keit", -1, 4)];
        this.g_v = [17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 32, 8];
        this.g_s_ending = [117, 30, 5];
        this.g_st_ending = [117, 30, 4];
    }
    /**
     * Sets the current word to be stemmed.
     * @param word - The word to be stemmed.
     */
    setCurrent(word) {
        this.sbp.setCurrent(word);
    }
    ;
    /**
     * Gets the current stemmed word.
     * @returns The current stemmed word.
     */
    getCurrent() {
        return this.sbp.getCurrent();
    }
    ;
    /**
     * Helper method for handling specific character replacements.
     * @param c1 - The character to be replaced.
     * @param c2 - The replacement character.
     * @param v_1 - The cursor position to reset to after replacement.
     * @returns A boolean indicating if the replacement was made.
     */
    habr1(c1, c2, v_1) {
        if (this.sbp.eq_s(1, c1)) {
            this.sbp.ket = this.sbp.cursor;
            if (this.sbp.in_grouping(this.g_v, 97, 252)) {
                this.sbp.slice_from(c2);
                this.sbp.cursor = v_1;
                return true;
            }
        }
        return false;
    }
    /**
     * Performs the prelude step of the stemming algorithm.
     */
    r_prelude() {
        var v_1 = this.sbp.cursor, v_2, v_3, v_4, v_5;
        while (true) {
            v_2 = this.sbp.cursor;
            this.sbp.bra = v_2;
            if (this.sbp.eq_s(1, "\u00DF")) {
                this.sbp.ket = this.sbp.cursor;
                this.sbp.slice_from("ss");
            }
            else {
                if (v_2 >= this.sbp.limit)
                    break;
                this.sbp.cursor = v_2 + 1;
            }
        }
        this.sbp.cursor = v_1;
        while (true) {
            v_3 = this.sbp.cursor;
            while (true) {
                v_4 = this.sbp.cursor;
                if (this.sbp.in_grouping(this.g_v, 97, 252)) {
                    v_5 = this.sbp.cursor;
                    this.sbp.bra = v_5;
                    if (this.habr1("u", "U", v_4))
                        break;
                    this.sbp.cursor = v_5;
                    if (this.habr1("y", "Y", v_4))
                        break;
                }
                if (v_4 >= this.sbp.limit) {
                    this.sbp.cursor = v_3;
                    return;
                }
                this.sbp.cursor = v_4 + 1;
            }
        }
    }
    /**
     * Helper method for r_mark_regions.
     * @returns A boolean indicating the result of the operation.
     */
    habr2() {
        while (!this.sbp.in_grouping(this.g_v, 97, 252)) {
            if (this.sbp.cursor >= this.sbp.limit)
                return true;
            this.sbp.cursor++;
        }
        while (!this.sbp.out_grouping(this.g_v, 97, 252)) {
            if (this.sbp.cursor >= this.sbp.limit)
                return true;
            this.sbp.cursor++;
        }
        return false;
    }
    /**
     * Marks regions in the word for the stemming process.
     */
    r_mark_regions() {
        this.I_p1 = this.sbp.limit;
        this.I_p2 = this.I_p1;
        var c = this.sbp.cursor + 3;
        if (0 <= c && c <= this.sbp.limit) {
            this.I_x = c;
            if (!this.habr2()) {
                this.I_p1 = this.sbp.cursor;
                if (this.I_p1 < this.I_x)
                    this.I_p1 = this.I_x;
                if (!this.habr2())
                    this.I_p2 = this.sbp.cursor;
            }
        }
    }
    /**
     * Performs the postlude step of the stemming algorithm.
     */
    r_postlude() {
        var among_var, v_1;
        while (true) {
            v_1 = this.sbp.cursor;
            this.sbp.bra = v_1;
            among_var = this.sbp.find_among(this.a_0, 6);
            if (!among_var)
                return;
            this.sbp.ket = this.sbp.cursor;
            switch (among_var) {
                case 1:
                    this.sbp.slice_from("y");
                    break;
                case 2:
                case 5:
                    this.sbp.slice_from("u");
                    break;
                case 3:
                    this.sbp.slice_from("a");
                    break;
                case 4:
                    this.sbp.slice_from("o");
                    break;
                case 6:
                    if (this.sbp.cursor >= this.sbp.limit)
                        return;
                    this.sbp.cursor++;
                    break;
            }
        }
    }
    /**
     * Checks if the cursor is within the R1 region.
     * @returns A boolean indicating if the cursor is in R1.
     */
    r_R1() {
        return this.I_p1 <= this.sbp.cursor;
    }
    /**
     * Checks if the cursor is within the R2 region.
     * @returns A boolean indicating if the cursor is in R2.
     */
    r_R2() {
        return this.I_p2 <= this.sbp.cursor;
    }
    /**
     * Performs the standard suffix removal step of the stemming algorithm.
     */
    r_standard_suffix() {
        var among_var, v_1 = this.sbp.limit - this.sbp.cursor, v_2, v_3, v_4;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_1, 7);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R1()) {
                switch (among_var) {
                    case 1:
                        this.sbp.slice_del();
                        break;
                    case 2:
                        this.sbp.slice_del();
                        this.sbp.ket = this.sbp.cursor;
                        if (this.sbp.eq_s_b(1, "s")) {
                            this.sbp.bra = this.sbp.cursor;
                            if (this.sbp.eq_s_b(3, "nis"))
                                this.sbp.slice_del();
                        }
                        break;
                    case 3:
                        if (this.sbp.in_grouping_b(this.g_s_ending, 98, 116))
                            this.sbp.slice_del();
                        break;
                }
            }
        }
        this.sbp.cursor = this.sbp.limit - v_1;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_2, 4);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R1()) {
                switch (among_var) {
                    case 1:
                        this.sbp.slice_del();
                        break;
                    case 2:
                        if (this.sbp.in_grouping_b(this.g_st_ending, 98, 116)) {
                            var c = this.sbp.cursor - 3;
                            if (this.sbp.limit_backward <= c && c <= this.sbp.limit) {
                                this.sbp.cursor = c;
                                this.sbp.slice_del();
                            }
                        }
                        break;
                }
            }
        }
        this.sbp.cursor = this.sbp.limit - v_1;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_4, 8);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R2()) {
                switch (among_var) {
                    case 1:
                        this.sbp.slice_del();
                        this.sbp.ket = this.sbp.cursor;
                        if (this.sbp.eq_s_b(2, "ig")) {
                            this.sbp.bra = this.sbp.cursor;
                            v_2 = this.sbp.limit - this.sbp.cursor;
                            if (!this.sbp.eq_s_b(1, "e")) {
                                this.sbp.cursor = this.sbp.limit - v_2;
                                if (this.r_R2())
                                    this.sbp.slice_del();
                            }
                        }
                        break;
                    case 2:
                        v_3 = this.sbp.limit - this.sbp.cursor;
                        if (!this.sbp.eq_s_b(1, "e")) {
                            this.sbp.cursor = this.sbp.limit - v_3;
                            this.sbp.slice_del();
                        }
                        break;
                    case 3:
                        this.sbp.slice_del();
                        this.sbp.ket = this.sbp.cursor;
                        v_4 = this.sbp.limit - this.sbp.cursor;
                        if (!this.sbp.eq_s_b(2, "er")) {
                            this.sbp.cursor = this.sbp.limit - v_4;
                            if (!this.sbp.eq_s_b(2, "en"))
                                break;
                        }
                        this.sbp.bra = this.sbp.cursor;
                        if (this.r_R1())
                            this.sbp.slice_del();
                        break;
                    case 4:
                        this.sbp.slice_del();
                        this.sbp.ket = this.sbp.cursor;
                        among_var = this.sbp.find_among_b(this.a_3, 2);
                        if (among_var) {
                            this.sbp.bra = this.sbp.cursor;
                            if (this.r_R2() && among_var == 1)
                                this.sbp.slice_del();
                        }
                        break;
                }
            }
        }
    }
    /**
     * Stems the current word.
     * @returns A boolean indicating if stemming was successful.
     */
    stem() {
        var v_1 = this.sbp.cursor;
        this.r_prelude();
        this.sbp.cursor = v_1;
        this.r_mark_regions();
        this.sbp.limit_backward = v_1;
        this.sbp.cursor = this.sbp.limit;
        this.r_standard_suffix();
        this.sbp.cursor = this.sbp.limit_backward;
        this.r_postlude();
        return true;
    }
}
exports.GermanStemmer = GermanStemmer;
