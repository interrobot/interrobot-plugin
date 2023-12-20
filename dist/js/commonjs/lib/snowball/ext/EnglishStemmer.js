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
exports.EnglishStemmer = void 0;
const BaseStemmer_js_1 = require("./BaseStemmer.js");
const Among_js_1 = require("../Among.js");
class EnglishStemmer extends BaseStemmer_js_1.BaseStemmer {
    constructor() {
        // super creates sbp
        super();
        this.a_0 = [new Among_js_1.Among("arsen", -1, -1),
            new Among_js_1.Among("commun", -1, -1), new Among_js_1.Among("gener", -1, -1)];
        this.a_1 = [new Among_js_1.Among("'", -1, 1), new Among_js_1.Among("'s'", 0, 1),
            new Among_js_1.Among("'s", -1, 1)];
        this.a_2 = [
            new Among_js_1.Among("ied", -1, 2), new Among_js_1.Among("s", -1, 3),
            new Among_js_1.Among("ies", 1, 2), new Among_js_1.Among("sses", 1, 1),
            new Among_js_1.Among("ss", 1, -1), new Among_js_1.Among("us", 1, -1)
        ];
        this.a_3 = [new Among_js_1.Among("", -1, 3),
            new Among_js_1.Among("bb", 0, 2), new Among_js_1.Among("dd", 0, 2),
            new Among_js_1.Among("ff", 0, 2), new Among_js_1.Among("gg", 0, 2),
            new Among_js_1.Among("bl", 0, 1), new Among_js_1.Among("mm", 0, 2),
            new Among_js_1.Among("nn", 0, 2), new Among_js_1.Among("pp", 0, 2),
            new Among_js_1.Among("rr", 0, 2), new Among_js_1.Among("at", 0, 1),
            new Among_js_1.Among("tt", 0, 2), new Among_js_1.Among("iz", 0, 1)];
        this.a_4 = [
            new Among_js_1.Among("ed", -1, 2), new Among_js_1.Among("eed", 0, 1),
            new Among_js_1.Among("ing", -1, 2), new Among_js_1.Among("edly", -1, 2),
            new Among_js_1.Among("eedly", 3, 1), new Among_js_1.Among("ingly", -1, 2)
        ];
        this.a_5 = [
            new Among_js_1.Among("anci", -1, 3), new Among_js_1.Among("enci", -1, 2),
            new Among_js_1.Among("ogi", -1, 13), new Among_js_1.Among("li", -1, 16),
            new Among_js_1.Among("bli", 3, 12), new Among_js_1.Among("abli", 4, 4),
            new Among_js_1.Among("alli", 3, 8), new Among_js_1.Among("fulli", 3, 14),
            new Among_js_1.Among("lessli", 3, 15), new Among_js_1.Among("ousli", 3, 10),
            new Among_js_1.Among("entli", 3, 5), new Among_js_1.Among("aliti", -1, 8),
            new Among_js_1.Among("biliti", -1, 12), new Among_js_1.Among("iviti", -1, 11),
            new Among_js_1.Among("tional", -1, 1), new Among_js_1.Among("ational", 14, 7),
            new Among_js_1.Among("alism", -1, 8), new Among_js_1.Among("ation", -1, 7),
            new Among_js_1.Among("ization", 17, 6), new Among_js_1.Among("izer", -1, 6),
            new Among_js_1.Among("ator", -1, 7), new Among_js_1.Among("iveness", -1, 11),
            new Among_js_1.Among("fulness", -1, 9), new Among_js_1.Among("ousness", -1, 10)
        ];
        this.a_6 = [
            new Among_js_1.Among("icate", -1, 4), new Among_js_1.Among("ative", -1, 6),
            new Among_js_1.Among("alize", -1, 3), new Among_js_1.Among("iciti", -1, 4),
            new Among_js_1.Among("ical", -1, 4), new Among_js_1.Among("tional", -1, 1),
            new Among_js_1.Among("ational", 5, 2), new Among_js_1.Among("ful", -1, 5),
            new Among_js_1.Among("ness", -1, 5)
        ];
        this.a_7 = [new Among_js_1.Among("ic", -1, 1),
            new Among_js_1.Among("ance", -1, 1), new Among_js_1.Among("ence", -1, 1),
            new Among_js_1.Among("able", -1, 1), new Among_js_1.Among("ible", -1, 1),
            new Among_js_1.Among("ate", -1, 1), new Among_js_1.Among("ive", -1, 1),
            new Among_js_1.Among("ize", -1, 1), new Among_js_1.Among("iti", -1, 1),
            new Among_js_1.Among("al", -1, 1), new Among_js_1.Among("ism", -1, 1),
            new Among_js_1.Among("ion", -1, 2), new Among_js_1.Among("er", -1, 1),
            new Among_js_1.Among("ous", -1, 1), new Among_js_1.Among("ant", -1, 1),
            new Among_js_1.Among("ent", -1, 1), new Among_js_1.Among("ment", 15, 1),
            new Among_js_1.Among("ement", 16, 1)];
        this.a_8 = [new Among_js_1.Among("e", -1, 1),
            new Among_js_1.Among("l", -1, 2)];
        this.a_9 = [new Among_js_1.Among("succeed", -1, -1),
            new Among_js_1.Among("proceed", -1, -1), new Among_js_1.Among("exceed", -1, -1),
            new Among_js_1.Among("canning", -1, -1), new Among_js_1.Among("inning", -1, -1),
            new Among_js_1.Among("earring", -1, -1), new Among_js_1.Among("herring", -1, -1),
            new Among_js_1.Among("outing", -1, -1)];
        this.a_10 = [new Among_js_1.Among("andes", -1, -1),
            new Among_js_1.Among("atlas", -1, -1), new Among_js_1.Among("bias", -1, -1),
            new Among_js_1.Among("cosmos", -1, -1), new Among_js_1.Among("dying", -1, 3),
            new Among_js_1.Among("early", -1, 9), new Among_js_1.Among("gently", -1, 7),
            new Among_js_1.Among("howe", -1, -1), new Among_js_1.Among("idly", -1, 6),
            new Among_js_1.Among("lying", -1, 4), new Among_js_1.Among("news", -1, -1),
            new Among_js_1.Among("only", -1, 10), new Among_js_1.Among("singly", -1, 11),
            new Among_js_1.Among("skies", -1, 2), new Among_js_1.Among("skis", -1, 1),
            new Among_js_1.Among("sky", -1, -1), new Among_js_1.Among("tying", -1, 5),
            new Among_js_1.Among("ugly", -1, 8)];
        this.g_v = [17, 65, 16, 1];
        this.g_v_WXY = [1, 17, 65, 208, 1];
        this.g_valid_LI = [55, 141, 2];
        this.I_p1 = 0;
        this.I_p2 = 0;
        this.B_Y_found = false;
        // this.habr = [this.r_Step_1b, this.r_Step_1c, this.r_Step_2, this.r_Step_3, this.r_Step_4, this.r_Step_5];
        this.habr = ["r_Step_1b", "r_Step_1c", "r_Step_2", "r_Step_3", "r_Step_4", "r_Step_5"];
        // this.sbp = new SnowballProgram();
    }
    r_prelude() {
        let v_1 = this.sbp.cursor;
        let v_2;
        this.B_Y_found = false;
        this.sbp.bra = this.sbp.cursor;
        if (this.sbp.eq_s(1, "'")) {
            this.sbp.ket = this.sbp.cursor;
            this.sbp.slice_del();
        }
        this.sbp.cursor = v_1;
        this.sbp.bra = v_1;
        if (this.sbp.eq_s(1, "y")) {
            this.sbp.ket = this.sbp.cursor;
            this.sbp.slice_from("Y");
            this.B_Y_found = true;
        }
        this.sbp.cursor = v_1;
        while (true) {
            v_2 = this.sbp.cursor;
            if (this.sbp.in_grouping(this.g_v, 97, 121)) {
                this.sbp.bra = this.sbp.cursor;
                if (this.sbp.eq_s(1, "y")) {
                    this.sbp.ket = this.sbp.cursor;
                    this.sbp.cursor = v_2;
                    this.sbp.slice_from("Y");
                    this.B_Y_found = true;
                    continue;
                }
            }
            if (v_2 >= this.sbp.limit) {
                this.sbp.cursor = v_1;
                return;
            }
            this.sbp.cursor = v_2 + 1;
        }
    }
    r_mark_regions() {
        var v_1 = this.sbp.cursor;
        this.I_p1 = this.sbp.limit;
        this.I_p2 = this.I_p1;
        if (!this.sbp.find_among(this.a_0, 3)) {
            this.sbp.cursor = v_1;
            if (this.habr1()) {
                this.sbp.cursor = v_1;
                return;
            }
        }
        this.I_p1 = this.sbp.cursor;
        if (!this.habr1())
            this.I_p2 = this.sbp.cursor;
    }
    habr1() {
        while (!this.sbp.in_grouping(this.g_v, 97, 121)) {
            if (this.sbp.cursor >= this.sbp.limit)
                return true;
            this.sbp.cursor++;
        }
        while (!this.sbp.out_grouping(this.g_v, 97, 121)) {
            if (this.sbp.cursor >= this.sbp.limit)
                return true;
            this.sbp.cursor++;
        }
        return false;
    }
    r_shortv() {
        var v_1 = this.sbp.limit - this.sbp.cursor;
        if (!(this.sbp.out_grouping_b(this.g_v_WXY, 89, 121)
            && this.sbp.in_grouping_b(this.g_v, 97, 121) && this.sbp.out_grouping_b(this.g_v, 97, 121))) {
            this.sbp.cursor = this.sbp.limit - v_1;
            if (!this.sbp.out_grouping_b(this.g_v, 97, 121)
                || !this.sbp.in_grouping_b(this.g_v, 97, 121)
                || this.sbp.cursor > this.sbp.limit_backward)
                return false;
        }
        return true;
    }
    r_R1() {
        return this.I_p1 <= this.sbp.cursor;
    }
    r_R2() {
        return this.I_p2 <= this.sbp.cursor;
    }
    r_Step_1a() {
        let among_var;
        let v_1 = this.sbp.limit - this.sbp.cursor;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_1, 3);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (among_var == 1) {
                this.sbp.slice_del();
            }
        }
        else {
            this.sbp.cursor = this.sbp.limit - v_1;
        }
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_2, 6);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            switch (among_var) {
                case 1:
                    this.sbp.slice_from("ss");
                    break;
                case 2:
                    var c = this.sbp.cursor - 2;
                    if (this.sbp.limit_backward > c || c > this.sbp.limit) {
                        this.sbp.slice_from("ie");
                        break;
                    }
                    this.sbp.cursor = c;
                    this.sbp.slice_from("i");
                    break;
                case 3:
                    do {
                        if (this.sbp.cursor <= this.sbp.limit_backward)
                            return;
                        this.sbp.cursor--;
                    } while (!this.sbp.in_grouping_b(this.g_v, 97, 121));
                    this.sbp.slice_del();
                    break;
            }
        }
    }
    r_Step_1b() {
        let among_var;
        let v_1;
        let v_3;
        let v_4;
        this.sbp.ket = this.sbp.cursor;
        // console.log(`preamong ${this.a_4} ${}`);
        among_var = this.sbp.find_among_b(this.a_4, 6);
        // console.log(`among_var ${among_var}`);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            switch (among_var) {
                case 1:
                    if (this.r_R1())
                        this.sbp.slice_from("ee");
                    break;
                case 2:
                    v_1 = this.sbp.limit - this.sbp.cursor;
                    while (!this.sbp.in_grouping_b(this.g_v, 97, 121)) {
                        if (this.sbp.cursor <= this.sbp.limit_backward)
                            return;
                        this.sbp.cursor--;
                    }
                    this.sbp.cursor = this.sbp.limit - v_1;
                    this.sbp.slice_del();
                    v_3 = this.sbp.limit - this.sbp.cursor;
                    among_var = this.sbp.find_among_b(this.a_3, 13);
                    if (among_var) {
                        this.sbp.cursor = this.sbp.limit - v_3;
                        switch (among_var) {
                            case 1:
                                var c = this.sbp.cursor;
                                this.sbp.insert(this.sbp.cursor, this.sbp.cursor, "e");
                                this.sbp.cursor = c;
                                break;
                            case 2:
                                this.sbp.ket = this.sbp.cursor;
                                if (this.sbp.cursor > this.sbp.limit_backward) {
                                    this.sbp.cursor--;
                                    this.sbp.bra = this.sbp.cursor;
                                    this.sbp.slice_del();
                                }
                                break;
                            case 3:
                                if (this.sbp.cursor == this.I_p1) {
                                    v_4 = this.sbp.limit - this.sbp.cursor;
                                    if (this.r_shortv()) {
                                        this.sbp.cursor = this.sbp.limit - v_4;
                                        var c = this.sbp.cursor;
                                        this.sbp.insert(this.sbp.cursor, this.sbp.cursor, "e");
                                        this.sbp.cursor = c;
                                    }
                                }
                                break;
                        }
                    }
                    break;
            }
        }
    }
    r_Step_1c() {
        var v_1 = this.sbp.limit - this.sbp.cursor;
        this.sbp.ket = this.sbp.cursor;
        if (!this.sbp.eq_s_b(1, "y")) {
            this.sbp.cursor = this.sbp.limit - v_1;
            if (!this.sbp.eq_s_b(1, "Y"))
                return;
        }
        this.sbp.bra = this.sbp.cursor;
        if (this.sbp.out_grouping_b(this.g_v, 97, 121) && this.sbp.cursor > this.sbp.limit_backward)
            this.sbp.slice_from("i");
    }
    r_Step_2() {
        var among_var;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_5, 24);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R1()) {
                switch (among_var) {
                    case 1:
                        this.sbp.slice_from("tion");
                        break;
                    case 2:
                        this.sbp.slice_from("ence");
                        break;
                    case 3:
                        this.sbp.slice_from("ance");
                        break;
                    case 4:
                        this.sbp.slice_from("able");
                        break;
                    case 5:
                        this.sbp.slice_from("ent");
                        break;
                    case 6:
                        this.sbp.slice_from("ize");
                        break;
                    case 7:
                        this.sbp.slice_from("ate");
                        break;
                    case 8:
                        this.sbp.slice_from("al");
                        break;
                    case 9:
                        this.sbp.slice_from("ful");
                        break;
                    case 10:
                        this.sbp.slice_from("ous");
                        break;
                    case 11:
                        this.sbp.slice_from("ive");
                        break;
                    case 12:
                        this.sbp.slice_from("ble");
                        break;
                    case 13:
                        if (this.sbp.eq_s_b(1, "l"))
                            this.sbp.slice_from("og");
                        break;
                    case 14:
                        this.sbp.slice_from("ful");
                        break;
                    case 15:
                        this.sbp.slice_from("less");
                        break;
                    case 16:
                        if (this.sbp.in_grouping_b(this.g_valid_LI, 99, 116))
                            this.sbp.slice_del();
                        break;
                }
            }
        }
    }
    r_Step_3() {
        var among_var;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_6, 9);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R1()) {
                switch (among_var) {
                    case 1:
                        this.sbp.slice_from("tion");
                        break;
                    case 2:
                        this.sbp.slice_from("ate");
                        break;
                    case 3:
                        this.sbp.slice_from("al");
                        break;
                    case 4:
                        this.sbp.slice_from("ic");
                        break;
                    case 5:
                        this.sbp.slice_del();
                        break;
                    case 6:
                        if (this.r_R2())
                            this.sbp.slice_del();
                        break;
                }
            }
        }
    }
    r_Step_4() {
        var among_var, v_1;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_7, 18);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R2()) {
                switch (among_var) {
                    case 1:
                        this.sbp.slice_del();
                        break;
                    case 2:
                        v_1 = this.sbp.limit - this.sbp.cursor;
                        if (!this.sbp.eq_s_b(1, "s")) {
                            this.sbp.cursor = this.sbp.limit - v_1;
                            if (!this.sbp.eq_s_b(1, "t"))
                                return;
                        }
                        this.sbp.slice_del();
                        break;
                }
            }
        }
    }
    r_Step_5() {
        var among_var, v_1;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_8, 2);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            switch (among_var) {
                case 1:
                    v_1 = this.sbp.limit - this.sbp.cursor;
                    if (!this.r_R2()) {
                        this.sbp.cursor = this.sbp.limit - v_1;
                        if (!this.r_R1() || this.r_shortv())
                            return;
                        this.sbp.cursor = this.sbp.limit - v_1;
                    }
                    this.sbp.slice_del();
                    break;
                case 2:
                    if (!this.r_R2() || !this.sbp.eq_s_b(1, "l"))
                        return;
                    this.sbp.slice_del();
                    break;
            }
        }
    }
    r_exception2() {
        this.sbp.ket = this.sbp.cursor;
        if (this.sbp.find_among_b(this.a_9, 8)) {
            this.sbp.bra = this.sbp.cursor;
            return this.sbp.cursor <= this.sbp.limit_backward;
        }
        return false;
    }
    r_exception1() {
        var among_var;
        this.sbp.bra = this.sbp.cursor;
        among_var = this.sbp.find_among(this.a_10, 18);
        if (among_var) {
            this.sbp.ket = this.sbp.cursor;
            if (this.sbp.cursor >= this.sbp.limit) {
                switch (among_var) {
                    case 1:
                        this.sbp.slice_from("ski");
                        break;
                    case 2:
                        this.sbp.slice_from("sky");
                        break;
                    case 3:
                        this.sbp.slice_from("die");
                        break;
                    case 4:
                        this.sbp.slice_from("lie");
                        break;
                    case 5:
                        this.sbp.slice_from("tie");
                        break;
                    case 6:
                        this.sbp.slice_from("idl");
                        break;
                    case 7:
                        this.sbp.slice_from("gentl");
                        break;
                    case 8:
                        this.sbp.slice_from("ugli");
                        break;
                    case 9:
                        this.sbp.slice_from("earli");
                        break;
                    case 10:
                        this.sbp.slice_from("onli");
                        break;
                    case 11:
                        this.sbp.slice_from("singl");
                        break;
                }
                return true;
            }
        }
        return false;
    }
    r_postlude() {
        let v_1;
        if (this.B_Y_found) {
            while (true) {
                v_1 = this.sbp.cursor;
                this.sbp.bra = v_1;
                if (this.sbp.eq_s(1, "Y")) {
                    this.sbp.ket = this.sbp.cursor;
                    this.sbp.cursor = v_1;
                    this.sbp.slice_from("y");
                    continue;
                }
                this.sbp.cursor = v_1;
                if (this.sbp.cursor >= this.sbp.limit)
                    return;
                this.sbp.cursor++;
            }
        }
    }
    stem() {
        var v_1 = this.sbp.cursor;
        if (!this.r_exception1()) {
            this.sbp.cursor = v_1;
            var c = this.sbp.cursor + 3;
            if (0 <= c && c <= this.sbp.limit) {
                this.sbp.cursor = v_1;
                this.r_prelude();
                this.sbp.cursor = v_1;
                this.r_mark_regions();
                this.sbp.limit_backward = v_1;
                this.sbp.cursor = this.sbp.limit;
                this.r_Step_1a();
                this.sbp.cursor = this.sbp.limit;
                if (!this.r_exception2()) {
                    for (var i = 0; i < this.habr.length; i++) {
                        this.sbp.cursor = this.sbp.limit;
                        const currentBefore = this.sbp.current;
                        const funcname = this.habr[i];
                        this[funcname]();
                    }
                }
                this.sbp.cursor = this.sbp.limit_backward;
                this.r_postlude();
            }
        }
        return true;
    }
}
exports.EnglishStemmer = EnglishStemmer;
