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
exports.DanishStemmer = void 0;
const BaseStemmer_js_1 = require("./BaseStemmer.js");
const Among_js_1 = require("../Among.js");
/**
 * Implements the Snowball stemming algorithm for the Danish language.
 */
class DanishStemmer extends BaseStemmer_js_1.BaseStemmer {
    /**
     * Initializes a new instance of the DanishStemmer class.
     */
    constructor() {
        super();
        /** String variable for character storage. */
        this.S_ch = "";
        this.a_0 = [new Among_js_1.Among("hed", -1, 1), new Among_js_1.Among("ethed", 0, 1),
            new Among_js_1.Among("ered", -1, 1), new Among_js_1.Among("e", -1, 1),
            new Among_js_1.Among("erede", 3, 1), new Among_js_1.Among("ende", 3, 1),
            new Among_js_1.Among("erende", 5, 1), new Among_js_1.Among("ene", 3, 1),
            new Among_js_1.Among("erne", 3, 1), new Among_js_1.Among("ere", 3, 1),
            new Among_js_1.Among("en", -1, 1), new Among_js_1.Among("heden", 10, 1),
            new Among_js_1.Among("eren", 10, 1), new Among_js_1.Among("er", -1, 1),
            new Among_js_1.Among("heder", 13, 1), new Among_js_1.Among("erer", 13, 1),
            new Among_js_1.Among("s", -1, 2), new Among_js_1.Among("heds", 16, 1),
            new Among_js_1.Among("es", 16, 1), new Among_js_1.Among("endes", 18, 1),
            new Among_js_1.Among("erendes", 19, 1), new Among_js_1.Among("enes", 18, 1),
            new Among_js_1.Among("ernes", 18, 1), new Among_js_1.Among("eres", 18, 1),
            new Among_js_1.Among("ens", 16, 1), new Among_js_1.Among("hedens", 24, 1),
            new Among_js_1.Among("erens", 24, 1), new Among_js_1.Among("ers", 16, 1),
            new Among_js_1.Among("ets", 16, 1), new Among_js_1.Among("erets", 28, 1),
            new Among_js_1.Among("et", -1, 1), new Among_js_1.Among("eret", 30, 1)];
        this.a_1 = [
            new Among_js_1.Among("gd", -1, -1), new Among_js_1.Among("dt", -1, -1),
            new Among_js_1.Among("gt", -1, -1), new Among_js_1.Among("kt", -1, -1)
        ];
        this.a_2 = [
            new Among_js_1.Among("ig", -1, 1), new Among_js_1.Among("lig", 0, 1),
            new Among_js_1.Among("elig", 1, 1), new Among_js_1.Among("els", -1, 1),
            new Among_js_1.Among("l\u00F8st", -1, 2)
        ];
        this.g_v = [17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 128];
        this.g_s_ending = [239, 254, 42, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16];
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
     * Marks regions in the word for the stemming process.
     */
    r_mark_regions() {
        var v_1, c = this.sbp.cursor + 3;
        this.I_p1 = this.sbp.limit;
        if (0 <= c && c <= this.sbp.limit) {
            this.I_x = c;
            while (true) {
                v_1 = this.sbp.cursor;
                if (this.sbp.in_grouping(this.g_v, 97, 248)) {
                    this.sbp.cursor = v_1;
                    break;
                }
                this.sbp.cursor = v_1;
                if (v_1 >= this.sbp.limit)
                    return;
                this.sbp.cursor++;
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
        var among_var, v_1;
        if (this.sbp.cursor >= this.I_p1) {
            v_1 = this.sbp.limit_backward;
            this.sbp.limit_backward = this.I_p1;
            this.sbp.ket = this.sbp.cursor;
            among_var = this.sbp.find_among_b(this.a_0, 32);
            this.sbp.limit_backward = v_1;
            if (among_var) {
                this.sbp.bra = this.sbp.cursor;
                switch (among_var) {
                    case 1:
                        this.sbp.slice_del();
                        break;
                    case 2:
                        if (this.sbp.in_grouping_b(this.g_s_ending, 97, 229))
                            this.sbp.slice_del();
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
            if (this.sbp.find_among_b(this.a_1, 4)) {
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
     * Handles other suffix removals.
     */
    r_other_suffix() {
        var among_var, v_1 = this.sbp.limit - this.sbp.cursor, v_2, v_3;
        this.sbp.ket = this.sbp.cursor;
        if (this.sbp.eq_s_b(2, "st")) {
            this.sbp.bra = this.sbp.cursor;
            if (this.sbp.eq_s_b(2, "ig"))
                this.sbp.slice_del();
        }
        this.sbp.cursor = this.sbp.limit - v_1;
        if (this.sbp.cursor >= this.I_p1) {
            v_2 = this.sbp.limit_backward;
            this.sbp.limit_backward = this.I_p1;
            this.sbp.ket = this.sbp.cursor;
            among_var = this.sbp.find_among_b(this.a_2, 5);
            this.sbp.limit_backward = v_2;
            if (among_var) {
                this.sbp.bra = this.sbp.cursor;
                switch (among_var) {
                    case 1:
                        this.sbp.slice_del();
                        v_3 = this.sbp.limit - this.sbp.cursor;
                        this.r_consonant_pair();
                        this.sbp.cursor = this.sbp.limit - v_3;
                        break;
                    case 2:
                        this.sbp.slice_from("l\u00F8s");
                        break;
                }
            }
        }
    }
    /**
     * Handles undoubling of characters.
     */
    r_undouble() {
        var v_1;
        if (this.sbp.cursor >= this.I_p1) {
            v_1 = this.sbp.limit_backward;
            this.sbp.limit_backward = this.I_p1;
            this.sbp.ket = this.sbp.cursor;
            if (this.sbp.out_grouping_b(this.g_v, 97, 248)) {
                this.sbp.bra = this.sbp.cursor;
                this.S_ch = this.sbp.slice_to();
                this.sbp.limit_backward = v_1;
                if (this.sbp.eq_v_b(this.S_ch))
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
        this.sbp.cursor = this.sbp.limit;
        this.r_undouble();
        return true;
    }
}
exports.DanishStemmer = DanishStemmer;
