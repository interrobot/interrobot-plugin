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
 * Implements the Snowball stemming algorithm for the Norwegian language.
 */
class NorwegianStemmer extends BaseStemmer {
    /**
     * Initializes a new instance of the NorwegianStemmer class.
     */
    constructor() {
        super();
        this.a_0 = [new Among("a", -1, 1), new Among("e", -1, 1),
            new Among("ede", 1, 1), new Among("ande", 1, 1),
            new Among("ende", 1, 1), new Among("ane", 1, 1),
            new Among("ene", 1, 1), new Among("hetene", 6, 1),
            new Among("erte", 1, 3), new Among("en", -1, 1),
            new Among("heten", 9, 1), new Among("ar", -1, 1),
            new Among("er", -1, 1), new Among("heter", 12, 1),
            new Among("s", -1, 2), new Among("as", 14, 1),
            new Among("es", 14, 1), new Among("edes", 16, 1),
            new Among("endes", 16, 1), new Among("enes", 16, 1),
            new Among("hetenes", 19, 1), new Among("ens", 14, 1),
            new Among("hetens", 21, 1), new Among("ers", 14, 1),
            new Among("ets", 14, 1), new Among("et", -1, 1),
            new Among("het", 25, 1), new Among("ert", -1, 3),
            new Among("ast", -1, 1)];
        this.a_1 = [new Among("dt", -1, -1),
            new Among("vt", -1, -1)];
        this.a_2 = [new Among("leg", -1, 1),
            new Among("eleg", 0, 1), new Among("ig", -1, 1),
            new Among("eig", 2, 1), new Among("lig", 2, 1),
            new Among("elig", 4, 1), new Among("els", -1, 1),
            new Among("lov", -1, 1), new Among("elov", 7, 1),
            new Among("slov", 7, 1), new Among("hetslov", 9, 1)];
        this.g_v = [17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 128];
        this.g_s_ending = [119, 125, 149, 1];
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
     * Marks regions in the word for the stemming process.
     */
    r_mark_regions() {
        var v_1, c = this.sbp.cursor + 3;
        this.I_p1 = this.sbp.limit;
        if (0 <= c || c <= this.sbp.limit) {
            this.I_x = c;
            while (true) {
                v_1 = this.sbp.cursor;
                if (this.sbp.in_grouping(this.g_v, 97, 248)) {
                    this.sbp.cursor = v_1;
                    break;
                }
                if (v_1 >= this.sbp.limit)
                    return;
                this.sbp.cursor = v_1 + 1;
            }
            while (!this.sbp.out_grouping(this.g_v, 97, 248)) {
                if (this.sbp.cursor >= this.sbp.limit)
                    return;
                this.sbp.cursor++;
            }
            this.I_p1 = this.sbp.cursor;
            if (this.I_p1 < this.I_x)
                this.I_p1 = this.I_x;
        }
    }
    /**
     * Handles main suffix removal.
     */
    r_main_suffix() {
        var among_var, v_1, v_2;
        if (this.sbp.cursor >= this.I_p1) {
            v_1 = this.sbp.limit_backward;
            this.sbp.limit_backward = this.I_p1;
            this.sbp.ket = this.sbp.cursor;
            among_var = this.sbp.find_among_b(this.a_0, 29);
            this.sbp.limit_backward = v_1;
            if (among_var) {
                this.sbp.bra = this.sbp.cursor;
                switch (among_var) {
                    case 1:
                        this.sbp.slice_del();
                        break;
                    case 2:
                        v_2 = this.sbp.limit - this.sbp.cursor;
                        if (this.sbp.in_grouping_b(this.g_s_ending, 98, 122))
                            this.sbp.slice_del();
                        else {
                            this.sbp.cursor = this.sbp.limit - v_2;
                            if (this.sbp.eq_s_b(1, "k")
                                && this.sbp.out_grouping_b(this.g_v, 97, 248))
                                this.sbp.slice_del();
                        }
                        break;
                    case 3:
                        this.sbp.slice_from("er");
                        break;
                }
            }
        }
    }
    /**
     * Handles consonant pair removal.
     */
    r_consonant_pair() {
        var v_1 = this.sbp.limit - this.sbp.cursor, v_2;
        if (this.sbp.cursor >= this.I_p1) {
            v_2 = this.sbp.limit_backward;
            this.sbp.limit_backward = this.I_p1;
            this.sbp.ket = this.sbp.cursor;
            if (this.sbp.find_among_b(this.a_1, 2)) {
                this.sbp.bra = this.sbp.cursor;
                this.sbp.limit_backward = v_2;
                this.sbp.cursor = this.sbp.limit - v_1;
                if (this.sbp.cursor > this.sbp.limit_backward) {
                    this.sbp.cursor--;
                    this.sbp.bra = this.sbp.cursor;
                    this.sbp.slice_del();
                }
            }
            else
                this.sbp.limit_backward = v_2;
        }
    }
    /**
     * Handles other suffix removal.
     */
    r_other_suffix() {
        var among_var, v_1;
        if (this.sbp.cursor >= this.I_p1) {
            v_1 = this.sbp.limit_backward;
            this.sbp.limit_backward = this.I_p1;
            this.sbp.ket = this.sbp.cursor;
            among_var = this.sbp.find_among_b(this.a_2, 11);
            if (among_var) {
                this.sbp.bra = this.sbp.cursor;
                this.sbp.limit_backward = v_1;
                if (among_var == 1)
                    this.sbp.slice_del();
            }
            else
                this.sbp.limit_backward = v_1;
        }
    }
    /**
     * Stems the current word.
     * @returns A boolean indicating if stemming was successful.
     */
    stem() {
        var v_1 = this.sbp.cursor;
        this.r_mark_regions();
        this.sbp.limit_backward = v_1;
        this.sbp.cursor = this.sbp.limit;
        this.r_main_suffix();
        this.sbp.cursor = this.sbp.limit;
        this.r_consonant_pair();
        this.sbp.cursor = this.sbp.limit;
        this.r_other_suffix();
        return true;
    }
}
export { NorwegianStemmer };
