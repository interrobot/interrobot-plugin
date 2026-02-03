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
exports.SwedishStemmer = void 0;
const BaseStemmer_js_1 = require("./BaseStemmer.js");
const Among_js_1 = require("../Among.js");
/**
 * Implements the Snowball stemming algorithm for the Swedish language.
 */
class SwedishStemmer extends BaseStemmer_js_1.BaseStemmer {
    /**
     * Initializes a new instance of the SwedishStemmer class.
     */
    constructor() {
        super();
        this.a_0 = [new Among_js_1.Among("a", -1, 1), new Among_js_1.Among("arna", 0, 1),
            new Among_js_1.Among("erna", 0, 1), new Among_js_1.Among("heterna", 2, 1),
            new Among_js_1.Among("orna", 0, 1), new Among_js_1.Among("ad", -1, 1),
            new Among_js_1.Among("e", -1, 1), new Among_js_1.Among("ade", 6, 1),
            new Among_js_1.Among("ande", 6, 1), new Among_js_1.Among("arne", 6, 1),
            new Among_js_1.Among("are", 6, 1), new Among_js_1.Among("aste", 6, 1),
            new Among_js_1.Among("en", -1, 1), new Among_js_1.Among("anden", 12, 1),
            new Among_js_1.Among("aren", 12, 1), new Among_js_1.Among("heten", 12, 1),
            new Among_js_1.Among("ern", -1, 1), new Among_js_1.Among("ar", -1, 1),
            new Among_js_1.Among("er", -1, 1), new Among_js_1.Among("heter", 18, 1),
            new Among_js_1.Among("or", -1, 1), new Among_js_1.Among("s", -1, 2),
            new Among_js_1.Among("as", 21, 1), new Among_js_1.Among("arnas", 22, 1),
            new Among_js_1.Among("ernas", 22, 1), new Among_js_1.Among("ornas", 22, 1),
            new Among_js_1.Among("es", 21, 1), new Among_js_1.Among("ades", 26, 1),
            new Among_js_1.Among("andes", 26, 1), new Among_js_1.Among("ens", 21, 1),
            new Among_js_1.Among("arens", 29, 1), new Among_js_1.Among("hetens", 29, 1),
            new Among_js_1.Among("erns", 21, 1), new Among_js_1.Among("at", -1, 1),
            new Among_js_1.Among("andet", -1, 1), new Among_js_1.Among("het", -1, 1),
            new Among_js_1.Among("ast", -1, 1)];
        this.a_1 = [new Among_js_1.Among("dd", -1, -1),
            new Among_js_1.Among("gd", -1, -1), new Among_js_1.Among("nn", -1, -1),
            new Among_js_1.Among("dt", -1, -1), new Among_js_1.Among("gt", -1, -1),
            new Among_js_1.Among("kt", -1, -1), new Among_js_1.Among("tt", -1, -1)];
        this.a_2 = [
            new Among_js_1.Among("ig", -1, 1), new Among_js_1.Among("lig", 0, 1),
            new Among_js_1.Among("els", -1, 1), new Among_js_1.Among("fullt", -1, 3),
            new Among_js_1.Among("l\u00F6st", -1, 2)
        ];
        this.g_v = [17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 0, 32];
        this.g_s_ending = [119, 127, 149];
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
                if (this.sbp.in_grouping(this.g_v, 97, 246)) {
                    this.sbp.cursor = v_1;
                    break;
                }
                this.sbp.cursor = v_1;
                if (this.sbp.cursor >= this.sbp.limit)
                    return;
                this.sbp.cursor++;
            }
            while (!this.sbp.out_grouping(this.g_v, 97, 246)) {
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
        var among_var, v_2 = this.sbp.limit_backward;
        if (this.sbp.cursor >= this.I_p1) {
            this.sbp.limit_backward = this.I_p1;
            this.sbp.cursor = this.sbp.limit;
            this.sbp.ket = this.sbp.cursor;
            among_var = this.sbp.find_among_b(this.a_0, 37);
            this.sbp.limit_backward = v_2;
            if (among_var) {
                this.sbp.bra = this.sbp.cursor;
                switch (among_var) {
                    case 1:
                        this.sbp.slice_del();
                        break;
                    case 2:
                        if (this.sbp.in_grouping_b(this.g_s_ending, 98, 121))
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
        var v_1 = this.sbp.limit_backward;
        if (this.sbp.cursor >= this.I_p1) {
            this.sbp.limit_backward = this.I_p1;
            this.sbp.cursor = this.sbp.limit;
            if (this.sbp.find_among_b(this.a_1, 7)) {
                this.sbp.cursor = this.sbp.limit;
                this.sbp.ket = this.sbp.cursor;
                if (this.sbp.cursor > this.sbp.limit_backward) {
                    this.sbp.bra = --this.sbp.cursor;
                    this.sbp.slice_del();
                }
            }
            this.sbp.limit_backward = v_1;
        }
    }
    /**
     * Handles other suffix removals.
     */
    r_other_suffix() {
        var among_var, v_2;
        if (this.sbp.cursor >= this.I_p1) {
            v_2 = this.sbp.limit_backward;
            this.sbp.limit_backward = this.I_p1;
            this.sbp.cursor = this.sbp.limit;
            this.sbp.ket = this.sbp.cursor;
            among_var = this.sbp.find_among_b(this.a_2, 5);
            if (among_var) {
                this.sbp.bra = this.sbp.cursor;
                switch (among_var) {
                    case 1:
                        this.sbp.slice_del();
                        break;
                    case 2:
                        this.sbp.slice_from("l\u00F6s");
                        break;
                    case 3:
                        this.sbp.slice_from("full");
                        break;
                }
            }
            this.sbp.limit_backward = v_2;
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
exports.SwedishStemmer = SwedishStemmer;
