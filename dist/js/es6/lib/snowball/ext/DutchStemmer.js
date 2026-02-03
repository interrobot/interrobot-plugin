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
import { Among } from "../Among.js";
/**
 * Implements the Snowball stemming algorithm for the Dutch language.
 */
class DutchStemmer extends BaseStemmer {
    /**
     * Initializes a new instance of the DutchStemmer class.
     */
    constructor() {
        super();
        this.a_0 = [new Among("", -1, 6), new Among("\u00E1", 0, 1),
            new Among("\u00E4", 0, 1), new Among("\u00E9", 0, 2),
            new Among("\u00EB", 0, 2), new Among("\u00ED", 0, 3),
            new Among("\u00EF", 0, 3), new Among("\u00F3", 0, 4),
            new Among("\u00F6", 0, 4), new Among("\u00FA", 0, 5),
            new Among("\u00FC", 0, 5)];
        this.a_1 = [new Among("", -1, 3),
            new Among("I", 0, 2), new Among("Y", 0, 1)];
        this.a_2 = [
            new Among("dd", -1, -1), new Among("kk", -1, -1),
            new Among("tt", -1, -1)
        ];
        this.a_3 = [new Among("ene", -1, 2),
            new Among("se", -1, 3), new Among("en", -1, 2),
            new Among("heden", 2, 1), new Among("s", -1, 3)];
        this.a_4 = [
            new Among("end", -1, 1), new Among("ig", -1, 2),
            new Among("ing", -1, 1), new Among("lijk", -1, 3),
            new Among("baar", -1, 4), new Among("bar", -1, 5)
        ];
        this.a_5 = [
            new Among("aa", -1, -1), new Among("ee", -1, -1),
            new Among("oo", -1, -1), new Among("uu", -1, -1)
        ];
        this.g_v = [17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128];
        this.g_v_I = [1, 0, 0, 17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128];
        this.g_v_j = [17, 67, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128];
        this.B_e_found = false;
    }
    /**
     * Sets the current word to be stemmed.
     * @param word - The word to be stemmed.
     */
    setCurrent(word) {
        this.sbp.setCurrent(word);
    }
    /**
     * Gets the current stemmed word.
     * @returns The current stemmed word.
     */
    getCurrent() {
        return this.sbp.getCurrent();
    }
    /**
     * Performs the prelude step of the stemming algorithm.
     */
    r_prelude() {
        var among_var, v_1 = this.sbp.cursor, v_2, v_3;
        while (true) {
            this.sbp.bra = this.sbp.cursor;
            among_var = this.sbp.find_among(this.a_0, 11);
            if (among_var) {
                this.sbp.ket = this.sbp.cursor;
                switch (among_var) {
                    case 1:
                        this.sbp.slice_from("a");
                        continue;
                    case 2:
                        this.sbp.slice_from("e");
                        continue;
                    case 3:
                        this.sbp.slice_from("i");
                        continue;
                    case 4:
                        this.sbp.slice_from("o");
                        continue;
                    case 5:
                        this.sbp.slice_from("u");
                        continue;
                    case 6:
                        if (this.sbp.cursor >= this.sbp.limit)
                            break;
                        this.sbp.cursor++;
                        continue;
                }
            }
            break;
        }
        this.sbp.cursor = v_1;
        this.sbp.bra = v_1;
        if (this.sbp.eq_s(1, "y")) {
            this.sbp.ket = this.sbp.cursor;
            this.sbp.slice_from("Y");
        }
        else
            this.sbp.cursor = v_1;
        while (true) {
            v_2 = this.sbp.cursor;
            if (this.sbp.in_grouping(this.g_v, 97, 232)) {
                v_3 = this.sbp.cursor;
                this.sbp.bra = v_3;
                if (this.sbp.eq_s(1, "i")) {
                    this.sbp.ket = this.sbp.cursor;
                    if (this.sbp.in_grouping(this.g_v, 97, 232)) {
                        this.sbp.slice_from("I");
                        this.sbp.cursor = v_2;
                    }
                }
                else {
                    this.sbp.cursor = v_3;
                    if (this.sbp.eq_s(1, "y")) {
                        this.sbp.ket = this.sbp.cursor;
                        this.sbp.slice_from("Y");
                        this.sbp.cursor = v_2;
                    }
                    else if (this.habr1(v_2))
                        break;
                }
            }
            else if (this.habr1(v_2))
                break;
        }
    }
    /**
     * Helper method for r_prelude.
     * @param v_1 - The cursor position.
     * @returns A boolean indicating the result of the operation.
     */
    habr1(v_1) {
        this.sbp.cursor = v_1;
        if (v_1 >= this.sbp.limit)
            return true;
        this.sbp.cursor++;
        return false;
    }
    /**
     * Marks regions in the word for the stemming process.
     */
    r_mark_regions() {
        this.I_p1 = this.sbp.limit;
        this.I_p2 = this.I_p1;
        if (!this.habr2()) {
            this.I_p1 = this.sbp.cursor;
            if (this.I_p1 < 3)
                this.I_p1 = 3;
            if (!this.habr2())
                this.I_p2 = this.sbp.cursor;
        }
    }
    /**
     * Helper method for r_mark_regions.
     * @returns A boolean indicating the result of the operation.
     */
    habr2() {
        while (!this.sbp.in_grouping(this.g_v, 97, 232)) {
            if (this.sbp.cursor >= this.sbp.limit)
                return true;
            this.sbp.cursor++;
        }
        while (!this.sbp.out_grouping(this.g_v, 97, 232)) {
            if (this.sbp.cursor >= this.sbp.limit)
                return true;
            this.sbp.cursor++;
        }
        return false;
    }
    /**
     * Performs the postlude step of the stemming algorithm.
     */
    r_postlude() {
        var among_var;
        while (true) {
            this.sbp.bra = this.sbp.cursor;
            among_var = this.sbp.find_among(this.a_1, 3);
            if (among_var) {
                this.sbp.ket = this.sbp.cursor;
                switch (among_var) {
                    case 1:
                        this.sbp.slice_from("y");
                        break;
                    case 2:
                        this.sbp.slice_from("i");
                        break;
                    case 3:
                        if (this.sbp.cursor >= this.sbp.limit)
                            return;
                        this.sbp.cursor++;
                        break;
                }
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
     * Handles undoubling of characters.
     */
    r_undouble() {
        var v_1 = this.sbp.limit - this.sbp.cursor;
        if (this.sbp.find_among_b(this.a_2, 3)) {
            this.sbp.cursor = this.sbp.limit - v_1;
            this.sbp.ket = this.sbp.cursor;
            if (this.sbp.cursor > this.sbp.limit_backward) {
                this.sbp.cursor--;
                this.sbp.bra = this.sbp.cursor;
                this.sbp.slice_del();
            }
        }
    }
    /**
     * Handles e-ending removal.
     */
    r_e_ending() {
        var v_1;
        this.B_e_found = false;
        this.sbp.ket = this.sbp.cursor;
        if (this.sbp.eq_s_b(1, "e")) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R1()) {
                v_1 = this.sbp.limit - this.sbp.cursor;
                if (this.sbp.out_grouping_b(this.g_v, 97, 232)) {
                    this.sbp.cursor = this.sbp.limit - v_1;
                    this.sbp.slice_del();
                    this.B_e_found = true;
                    this.r_undouble();
                }
            }
        }
    }
    /**
     * Handles en-ending removal.
     */
    r_en_ending() {
        var v_1;
        if (this.r_R1()) {
            v_1 = this.sbp.limit - this.sbp.cursor;
            if (this.sbp.out_grouping_b(this.g_v, 97, 232)) {
                this.sbp.cursor = this.sbp.limit - v_1;
                if (!this.sbp.eq_s_b(3, "gem")) {
                    this.sbp.cursor = this.sbp.limit - v_1;
                    this.sbp.slice_del();
                    this.r_undouble();
                }
            }
        }
    }
    /**
     * Performs the standard suffix removal step of the stemming algorithm.
     */
    r_standard_suffix() {
        var among_var, v_1 = this.sbp.limit - this.sbp.cursor, v_2, v_3, v_4, v_5, v_6;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_3, 5);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            switch (among_var) {
                case 1:
                    if (this.r_R1())
                        this.sbp.slice_from("heid");
                    break;
                case 2:
                    this.r_en_ending();
                    break;
                case 3:
                    if (this.r_R1() && this.sbp.out_grouping_b(this.g_v_j, 97, 232))
                        this.sbp.slice_del();
                    break;
            }
        }
        this.sbp.cursor = this.sbp.limit - v_1;
        this.r_e_ending();
        this.sbp.cursor = this.sbp.limit - v_1;
        this.sbp.ket = this.sbp.cursor;
        if (this.sbp.eq_s_b(4, "heid")) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R2()) {
                v_2 = this.sbp.limit - this.sbp.cursor;
                if (!this.sbp.eq_s_b(1, "c")) {
                    this.sbp.cursor = this.sbp.limit - v_2;
                    this.sbp.slice_del();
                    this.sbp.ket = this.sbp.cursor;
                    if (this.sbp.eq_s_b(2, "en")) {
                        this.sbp.bra = this.sbp.cursor;
                        this.r_en_ending();
                    }
                }
            }
        }
        this.sbp.cursor = this.sbp.limit - v_1;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_4, 6);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            switch (among_var) {
                case 1:
                    if (this.r_R2()) {
                        this.sbp.slice_del();
                        v_3 = this.sbp.limit - this.sbp.cursor;
                        this.sbp.ket = this.sbp.cursor;
                        if (this.sbp.eq_s_b(2, "ig")) {
                            this.sbp.bra = this.sbp.cursor;
                            if (this.r_R2()) {
                                v_4 = this.sbp.limit - this.sbp.cursor;
                                if (!this.sbp.eq_s_b(1, "e")) {
                                    this.sbp.cursor = this.sbp.limit - v_4;
                                    this.sbp.slice_del();
                                    break;
                                }
                            }
                        }
                        this.sbp.cursor = this.sbp.limit - v_3;
                        this.r_undouble();
                    }
                    break;
                case 2:
                    if (this.r_R2()) {
                        v_5 = this.sbp.limit - this.sbp.cursor;
                        if (!this.sbp.eq_s_b(1, "e")) {
                            this.sbp.cursor = this.sbp.limit - v_5;
                            this.sbp.slice_del();
                        }
                    }
                    break;
                case 3:
                    if (this.r_R2()) {
                        this.sbp.slice_del();
                        this.r_e_ending();
                    }
                    break;
                case 4:
                    if (this.r_R2())
                        this.sbp.slice_del();
                    break;
                case 5:
                    if (this.r_R2() && this.B_e_found)
                        this.sbp.slice_del();
                    break;
            }
        }
        this.sbp.cursor = this.sbp.limit - v_1;
        if (this.sbp.out_grouping_b(this.g_v_I, 73, 232)) {
            v_6 = this.sbp.limit - this.sbp.cursor;
            if (this.sbp.find_among_b(this.a_5, 4) && this.sbp.out_grouping_b(this.g_v, 97, 232)) {
                this.sbp.cursor = this.sbp.limit - v_6;
                this.sbp.ket = this.sbp.cursor;
                if (this.sbp.cursor > this.sbp.limit_backward) {
                    this.sbp.cursor--;
                    this.sbp.bra = this.sbp.cursor;
                    this.sbp.slice_del();
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
export { DutchStemmer };
