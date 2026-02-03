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
exports.HungarianStemmer = void 0;
const BaseStemmer_js_1 = require("./BaseStemmer.js");
const Among_js_1 = require("../Among.js");
/**
 * Implements the Snowball stemming algorithm for the Hungarian language.
 */
class HungarianStemmer extends BaseStemmer_js_1.BaseStemmer {
    /**
     * Initializes a new instance of the HungarianStemmer class.
     */
    constructor() {
        super();
        this.a_0 = [new Among_js_1.Among("cs", -1, -1), new Among_js_1.Among("dzs", -1, -1),
            new Among_js_1.Among("gy", -1, -1), new Among_js_1.Among("ly", -1, -1),
            new Among_js_1.Among("ny", -1, -1), new Among_js_1.Among("sz", -1, -1),
            new Among_js_1.Among("ty", -1, -1), new Among_js_1.Among("zs", -1, -1)];
        this.a_1 = [
            new Among_js_1.Among("\u00E1", -1, 1), new Among_js_1.Among("\u00E9", -1, 2)
        ];
        this.a_2 = [
            new Among_js_1.Among("bb", -1, -1), new Among_js_1.Among("cc", -1, -1),
            new Among_js_1.Among("dd", -1, -1), new Among_js_1.Among("ff", -1, -1),
            new Among_js_1.Among("gg", -1, -1), new Among_js_1.Among("jj", -1, -1),
            new Among_js_1.Among("kk", -1, -1), new Among_js_1.Among("ll", -1, -1),
            new Among_js_1.Among("mm", -1, -1), new Among_js_1.Among("nn", -1, -1),
            new Among_js_1.Among("pp", -1, -1), new Among_js_1.Among("rr", -1, -1),
            new Among_js_1.Among("ccs", -1, -1), new Among_js_1.Among("ss", -1, -1),
            new Among_js_1.Among("zzs", -1, -1), new Among_js_1.Among("tt", -1, -1),
            new Among_js_1.Among("vv", -1, -1), new Among_js_1.Among("ggy", -1, -1),
            new Among_js_1.Among("lly", -1, -1), new Among_js_1.Among("nny", -1, -1),
            new Among_js_1.Among("tty", -1, -1), new Among_js_1.Among("ssz", -1, -1),
            new Among_js_1.Among("zz", -1, -1)
        ];
        this.a_3 = [new Among_js_1.Among("al", -1, 1),
            new Among_js_1.Among("el", -1, 2)];
        this.a_4 = [new Among_js_1.Among("ba", -1, -1),
            new Among_js_1.Among("ra", -1, -1), new Among_js_1.Among("be", -1, -1),
            new Among_js_1.Among("re", -1, -1), new Among_js_1.Among("ig", -1, -1),
            new Among_js_1.Among("nak", -1, -1), new Among_js_1.Among("nek", -1, -1),
            new Among_js_1.Among("val", -1, -1), new Among_js_1.Among("vel", -1, -1),
            new Among_js_1.Among("ul", -1, -1), new Among_js_1.Among("n\u00E1l", -1, -1),
            new Among_js_1.Among("n\u00E9l", -1, -1), new Among_js_1.Among("b\u00F3l", -1, -1),
            new Among_js_1.Among("r\u00F3l", -1, -1), new Among_js_1.Among("t\u00F3l", -1, -1),
            new Among_js_1.Among("b\u00F5l", -1, -1), new Among_js_1.Among("r\u00F5l", -1, -1),
            new Among_js_1.Among("t\u00F5l", -1, -1), new Among_js_1.Among("\u00FCl", -1, -1),
            new Among_js_1.Among("n", -1, -1), new Among_js_1.Among("an", 19, -1),
            new Among_js_1.Among("ban", 20, -1), new Among_js_1.Among("en", 19, -1),
            new Among_js_1.Among("ben", 22, -1), new Among_js_1.Among("k\u00E9ppen", 22, -1),
            new Among_js_1.Among("on", 19, -1), new Among_js_1.Among("\u00F6n", 19, -1),
            new Among_js_1.Among("k\u00E9pp", -1, -1), new Among_js_1.Among("kor", -1, -1),
            new Among_js_1.Among("t", -1, -1), new Among_js_1.Among("at", 29, -1),
            new Among_js_1.Among("et", 29, -1), new Among_js_1.Among("k\u00E9nt", 29, -1),
            new Among_js_1.Among("ank\u00E9nt", 32, -1), new Among_js_1.Among("enk\u00E9nt", 32, -1),
            new Among_js_1.Among("onk\u00E9nt", 32, -1), new Among_js_1.Among("ot", 29, -1),
            new Among_js_1.Among("\u00E9rt", 29, -1), new Among_js_1.Among("\u00F6t", 29, -1),
            new Among_js_1.Among("hez", -1, -1), new Among_js_1.Among("hoz", -1, -1),
            new Among_js_1.Among("h\u00F6z", -1, -1), new Among_js_1.Among("v\u00E1", -1, -1),
            new Among_js_1.Among("v\u00E9", -1, -1)];
        this.a_5 = [new Among_js_1.Among("\u00E1n", -1, 2),
            new Among_js_1.Among("\u00E9n", -1, 1), new Among_js_1.Among("\u00E1nk\u00E9nt", -1, 3)];
        this.a_6 = [
            new Among_js_1.Among("stul", -1, 2), new Among_js_1.Among("astul", 0, 1),
            new Among_js_1.Among("\u00E1stul", 0, 3), new Among_js_1.Among("st\u00FCl", -1, 2),
            new Among_js_1.Among("est\u00FCl", 3, 1), new Among_js_1.Among("\u00E9st\u00FCl", 3, 4)
        ];
        this.a_7 = [
            new Among_js_1.Among("\u00E1", -1, 1), new Among_js_1.Among("\u00E9", -1, 2)
        ];
        this.a_8 = [
            new Among_js_1.Among("k", -1, 7), new Among_js_1.Among("ak", 0, 4),
            new Among_js_1.Among("ek", 0, 6), new Among_js_1.Among("ok", 0, 5),
            new Among_js_1.Among("\u00E1k", 0, 1), new Among_js_1.Among("\u00E9k", 0, 2),
            new Among_js_1.Among("\u00F6k", 0, 3)
        ];
        this.a_9 = [new Among_js_1.Among("\u00E9i", -1, 7),
            new Among_js_1.Among("\u00E1\u00E9i", 0, 6), new Among_js_1.Among("\u00E9\u00E9i", 0, 5),
            new Among_js_1.Among("\u00E9", -1, 9), new Among_js_1.Among("k\u00E9", 3, 4),
            new Among_js_1.Among("ak\u00E9", 4, 1), new Among_js_1.Among("ek\u00E9", 4, 1),
            new Among_js_1.Among("ok\u00E9", 4, 1), new Among_js_1.Among("\u00E1k\u00E9", 4, 3),
            new Among_js_1.Among("\u00E9k\u00E9", 4, 2), new Among_js_1.Among("\u00F6k\u00E9", 4, 1),
            new Among_js_1.Among("\u00E9\u00E9", 3, 8)];
        this.a_10 = [new Among_js_1.Among("a", -1, 18),
            new Among_js_1.Among("ja", 0, 17), new Among_js_1.Among("d", -1, 16),
            new Among_js_1.Among("ad", 2, 13), new Among_js_1.Among("ed", 2, 13),
            new Among_js_1.Among("od", 2, 13), new Among_js_1.Among("\u00E1d", 2, 14),
            new Among_js_1.Among("\u00E9d", 2, 15), new Among_js_1.Among("\u00F6d", 2, 13),
            new Among_js_1.Among("e", -1, 18), new Among_js_1.Among("je", 9, 17),
            new Among_js_1.Among("nk", -1, 4), new Among_js_1.Among("unk", 11, 1),
            new Among_js_1.Among("\u00E1nk", 11, 2), new Among_js_1.Among("\u00E9nk", 11, 3),
            new Among_js_1.Among("\u00FCnk", 11, 1), new Among_js_1.Among("uk", -1, 8),
            new Among_js_1.Among("juk", 16, 7), new Among_js_1.Among("\u00E1juk", 17, 5),
            new Among_js_1.Among("\u00FCk", -1, 8), new Among_js_1.Among("j\u00FCk", 19, 7),
            new Among_js_1.Among("\u00E9j\u00FCk", 20, 6), new Among_js_1.Among("m", -1, 12),
            new Among_js_1.Among("am", 22, 9), new Among_js_1.Among("em", 22, 9),
            new Among_js_1.Among("om", 22, 9), new Among_js_1.Among("\u00E1m", 22, 10),
            new Among_js_1.Among("\u00E9m", 22, 11), new Among_js_1.Among("o", -1, 18),
            new Among_js_1.Among("\u00E1", -1, 19), new Among_js_1.Among("\u00E9", -1, 20)];
        this.a_11 = [
            new Among_js_1.Among("id", -1, 10), new Among_js_1.Among("aid", 0, 9),
            new Among_js_1.Among("jaid", 1, 6), new Among_js_1.Among("eid", 0, 9),
            new Among_js_1.Among("jeid", 3, 6), new Among_js_1.Among("\u00E1id", 0, 7),
            new Among_js_1.Among("\u00E9id", 0, 8), new Among_js_1.Among("i", -1, 15),
            new Among_js_1.Among("ai", 7, 14), new Among_js_1.Among("jai", 8, 11),
            new Among_js_1.Among("ei", 7, 14), new Among_js_1.Among("jei", 10, 11),
            new Among_js_1.Among("\u00E1i", 7, 12), new Among_js_1.Among("\u00E9i", 7, 13),
            new Among_js_1.Among("itek", -1, 24), new Among_js_1.Among("eitek", 14, 21),
            new Among_js_1.Among("jeitek", 15, 20), new Among_js_1.Among("\u00E9itek", 14, 23),
            new Among_js_1.Among("ik", -1, 29), new Among_js_1.Among("aik", 18, 26),
            new Among_js_1.Among("jaik", 19, 25), new Among_js_1.Among("eik", 18, 26),
            new Among_js_1.Among("jeik", 21, 25), new Among_js_1.Among("\u00E1ik", 18, 27),
            new Among_js_1.Among("\u00E9ik", 18, 28), new Among_js_1.Among("ink", -1, 20),
            new Among_js_1.Among("aink", 25, 17), new Among_js_1.Among("jaink", 26, 16),
            new Among_js_1.Among("eink", 25, 17), new Among_js_1.Among("jeink", 28, 16),
            new Among_js_1.Among("\u00E1ink", 25, 18), new Among_js_1.Among("\u00E9ink", 25, 19),
            new Among_js_1.Among("aitok", -1, 21), new Among_js_1.Among("jaitok", 32, 20),
            new Among_js_1.Among("\u00E1itok", -1, 22), new Among_js_1.Among("im", -1, 5),
            new Among_js_1.Among("aim", 35, 4), new Among_js_1.Among("jaim", 36, 1),
            new Among_js_1.Among("eim", 35, 4), new Among_js_1.Among("jeim", 38, 1),
            new Among_js_1.Among("\u00E1im", 35, 2), new Among_js_1.Among("\u00E9im", 35, 3)
        ];
        this.g_v = [17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 17, 52, 14];
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
        var v_1 = this.sbp.cursor, v_2;
        this.I_p1 = this.sbp.limit;
        if (this.sbp.in_grouping(this.g_v, 97, 252)) {
            while (true) {
                v_2 = this.sbp.cursor;
                if (this.sbp.out_grouping(this.g_v, 97, 252)) {
                    this.sbp.cursor = v_2;
                    if (!this.sbp.find_among(this.a_0, 8)) {
                        this.sbp.cursor = v_2;
                        if (v_2 < this.sbp.limit)
                            this.sbp.cursor++;
                    }
                    this.I_p1 = this.sbp.cursor;
                    return;
                }
                this.sbp.cursor = v_2;
                if (v_2 >= this.sbp.limit) {
                    this.I_p1 = v_2;
                    return;
                }
                this.sbp.cursor++;
            }
        }
        this.sbp.cursor = v_1;
        if (this.sbp.out_grouping(this.g_v, 97, 252)) {
            while (!this.sbp.in_grouping(this.g_v, 97, 252)) {
                if (this.sbp.cursor >= this.sbp.limit)
                    return;
                this.sbp.cursor++;
            }
            this.I_p1 = this.sbp.cursor;
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
     * Handles vowel ending transformations.
     */
    r_v_ending() {
        var among_var;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_1, 2);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R1()) {
                switch (among_var) {
                    case 1:
                        this.sbp.slice_from("a");
                        break;
                    case 2:
                        this.sbp.slice_from("e");
                        break;
                }
            }
        }
    }
    /**
     * Checks for double consonants.
     * @returns A boolean indicating if double consonants were found.
     */
    r_double() {
        var v_1 = this.sbp.limit - this.sbp.cursor;
        if (!this.sbp.find_among_b(this.a_2, 23))
            return false;
        this.sbp.cursor = this.sbp.limit - v_1;
        return true;
    }
    /**
     * Removes one character from a double consonant.
     */
    r_undouble() {
        if (this.sbp.cursor > this.sbp.limit_backward) {
            this.sbp.cursor--;
            this.sbp.ket = this.sbp.cursor;
            var c = this.sbp.cursor - 1;
            if (this.sbp.limit_backward <= c && c <= this.sbp.limit) {
                this.sbp.cursor = c;
                this.sbp.bra = c;
                this.sbp.slice_del();
            }
        }
    }
    /**
     * Handles instrumental case suffixes.
     */
    r_instrum() {
        var among_var;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_3, 2);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R1()) {
                if (among_var == 1 || among_var == 2)
                    if (!this.r_double())
                        return;
                this.sbp.slice_del();
                this.r_undouble();
            }
        }
    }
    /**
     * Handles case suffixes.
     */
    r_case() {
        this.sbp.ket = this.sbp.cursor;
        if (this.sbp.find_among_b(this.a_4, 44)) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R1()) {
                this.sbp.slice_del();
                this.r_v_ending();
            }
        }
    }
    /**
     * Handles special case suffixes.
     */
    r_case_special() {
        var among_var;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_5, 3);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R1()) {
                switch (among_var) {
                    case 1:
                        this.sbp.slice_from("e");
                        break;
                    case 2:
                    case 3:
                        this.sbp.slice_from("a");
                        break;
                }
            }
        }
    }
    /**
     * Handles other case suffixes.
     */
    r_case_other() {
        var among_var;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_6, 6);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R1()) {
                switch (among_var) {
                    case 1:
                    case 2:
                        this.sbp.slice_del();
                        break;
                    case 3:
                        this.sbp.slice_from("a");
                        break;
                    case 4:
                        this.sbp.slice_from("e");
                        break;
                }
            }
        }
    }
    /**
     * Handles factive suffixes.
     */
    r_factive() {
        var among_var;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_7, 2);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R1()) {
                if (among_var == 1 || among_var == 2)
                    if (!this.r_double())
                        return;
                this.sbp.slice_del();
                this.r_undouble();
            }
        }
    }
    /**
     * Handles plural suffixes.
     */
    r_plural() {
        var among_var;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_8, 7);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R1()) {
                switch (among_var) {
                    case 1:
                        this.sbp.slice_from("a");
                        break;
                    case 2:
                        this.sbp.slice_from("e");
                        break;
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                        this.sbp.slice_del();
                        break;
                }
            }
        }
    }
    /**
     * Handles owned suffixes.
     */
    r_owned() {
        var among_var;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_9, 12);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R1()) {
                switch (among_var) {
                    case 1:
                    case 4:
                    case 7:
                    case 9:
                        this.sbp.slice_del();
                        break;
                    case 2:
                    case 5:
                    case 8:
                        this.sbp.slice_from("e");
                        break;
                    case 3:
                    case 6:
                        this.sbp.slice_from("a");
                        break;
                }
            }
        }
    }
    /**
     * Handles singular owner suffixes.
     */
    r_sing_owner() {
        var among_var;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_10, 31);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R1()) {
                switch (among_var) {
                    case 1:
                    case 4:
                    case 7:
                    case 8:
                    case 9:
                    case 12:
                    case 13:
                    case 16:
                    case 17:
                    case 18:
                        this.sbp.slice_del();
                        break;
                    case 2:
                    case 5:
                    case 10:
                    case 14:
                    case 19:
                        this.sbp.slice_from("a");
                        break;
                    case 3:
                    case 6:
                    case 11:
                    case 15:
                    case 20:
                        this.sbp.slice_from("e");
                        break;
                }
            }
        }
    }
    /**
     * Handles plural owner suffixes.
     */
    r_plur_owner() {
        var among_var;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_11, 42);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R1()) {
                switch (among_var) {
                    case 1:
                    case 4:
                    case 5:
                    case 6:
                    case 9:
                    case 10:
                    case 11:
                    case 14:
                    case 15:
                    case 16:
                    case 17:
                    case 20:
                    case 21:
                    case 24:
                    case 25:
                    case 26:
                    case 29:
                        this.sbp.slice_del();
                        break;
                    case 2:
                    case 7:
                    case 12:
                    case 18:
                    case 22:
                    case 27:
                        this.sbp.slice_from("a");
                        break;
                    case 3:
                    case 8:
                    case 13:
                    case 19:
                    case 23:
                    case 28:
                        this.sbp.slice_from("e");
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
        this.r_mark_regions();
        this.sbp.limit_backward = v_1;
        this.sbp.cursor = this.sbp.limit;
        this.r_instrum();
        this.sbp.cursor = this.sbp.limit;
        this.r_case();
        this.sbp.cursor = this.sbp.limit;
        this.r_case_special();
        this.sbp.cursor = this.sbp.limit;
        this.r_case_other();
        this.sbp.cursor = this.sbp.limit;
        this.r_factive();
        this.sbp.cursor = this.sbp.limit;
        this.r_owned();
        this.sbp.cursor = this.sbp.limit;
        this.r_sing_owner();
        this.sbp.cursor = this.sbp.limit;
        this.r_plur_owner();
        this.sbp.cursor = this.sbp.limit;
        this.r_plural();
        return true;
    }
}
exports.HungarianStemmer = HungarianStemmer;
