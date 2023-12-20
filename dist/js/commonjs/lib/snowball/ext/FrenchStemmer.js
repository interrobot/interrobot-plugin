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
exports.FrenchStemmer = void 0;
const BaseStemmer_js_1 = require("./BaseStemmer.js");
const Among_js_1 = require("../Among.js");
class FrenchStemmer extends BaseStemmer_js_1.BaseStemmer {
    constructor() {
        super();
        this.a_0 = [new Among_js_1.Among("col", -1, -1), new Among_js_1.Among("par", -1, -1),
            new Among_js_1.Among("tap", -1, -1)];
        this.a_1 = [new Among_js_1.Among("", -1, 4),
            new Among_js_1.Among("I", 0, 1), new Among_js_1.Among("U", 0, 2), new Among_js_1.Among("Y", 0, 3)];
        this.a_2 = [
            new Among_js_1.Among("iqU", -1, 3), new Among_js_1.Among("abl", -1, 3),
            new Among_js_1.Among("I\u00E8r", -1, 4), new Among_js_1.Among("i\u00E8r", -1, 4),
            new Among_js_1.Among("eus", -1, 2), new Among_js_1.Among("iv", -1, 1)
        ];
        this.a_3 = [
            new Among_js_1.Among("ic", -1, 2), new Among_js_1.Among("abil", -1, 1),
            new Among_js_1.Among("iv", -1, 3)
        ];
        this.a_4 = [new Among_js_1.Among("iqUe", -1, 1),
            new Among_js_1.Among("atrice", -1, 2), new Among_js_1.Among("ance", -1, 1),
            new Among_js_1.Among("ence", -1, 5), new Among_js_1.Among("logie", -1, 3),
            new Among_js_1.Among("able", -1, 1), new Among_js_1.Among("isme", -1, 1),
            new Among_js_1.Among("euse", -1, 11), new Among_js_1.Among("iste", -1, 1),
            new Among_js_1.Among("ive", -1, 8), new Among_js_1.Among("if", -1, 8),
            new Among_js_1.Among("usion", -1, 4), new Among_js_1.Among("ation", -1, 2),
            new Among_js_1.Among("ution", -1, 4), new Among_js_1.Among("ateur", -1, 2),
            new Among_js_1.Among("iqUes", -1, 1), new Among_js_1.Among("atrices", -1, 2),
            new Among_js_1.Among("ances", -1, 1), new Among_js_1.Among("ences", -1, 5),
            new Among_js_1.Among("logies", -1, 3), new Among_js_1.Among("ables", -1, 1),
            new Among_js_1.Among("ismes", -1, 1), new Among_js_1.Among("euses", -1, 11),
            new Among_js_1.Among("istes", -1, 1), new Among_js_1.Among("ives", -1, 8),
            new Among_js_1.Among("ifs", -1, 8), new Among_js_1.Among("usions", -1, 4),
            new Among_js_1.Among("ations", -1, 2), new Among_js_1.Among("utions", -1, 4),
            new Among_js_1.Among("ateurs", -1, 2), new Among_js_1.Among("ments", -1, 15),
            new Among_js_1.Among("ements", 30, 6), new Among_js_1.Among("issements", 31, 12),
            new Among_js_1.Among("it\u00E9s", -1, 7), new Among_js_1.Among("ment", -1, 15),
            new Among_js_1.Among("ement", 34, 6), new Among_js_1.Among("issement", 35, 12),
            new Among_js_1.Among("amment", 34, 13), new Among_js_1.Among("emment", 34, 14),
            new Among_js_1.Among("aux", -1, 10), new Among_js_1.Among("eaux", 39, 9),
            new Among_js_1.Among("eux", -1, 1), new Among_js_1.Among("it\u00E9", -1, 7)];
        this.a_5 = [
            new Among_js_1.Among("ira", -1, 1), new Among_js_1.Among("ie", -1, 1),
            new Among_js_1.Among("isse", -1, 1), new Among_js_1.Among("issante", -1, 1),
            new Among_js_1.Among("i", -1, 1), new Among_js_1.Among("irai", 4, 1),
            new Among_js_1.Among("ir", -1, 1), new Among_js_1.Among("iras", -1, 1),
            new Among_js_1.Among("ies", -1, 1), new Among_js_1.Among("\u00EEmes", -1, 1),
            new Among_js_1.Among("isses", -1, 1), new Among_js_1.Among("issantes", -1, 1),
            new Among_js_1.Among("\u00EEtes", -1, 1), new Among_js_1.Among("is", -1, 1),
            new Among_js_1.Among("irais", 13, 1), new Among_js_1.Among("issais", 13, 1),
            new Among_js_1.Among("irions", -1, 1), new Among_js_1.Among("issions", -1, 1),
            new Among_js_1.Among("irons", -1, 1), new Among_js_1.Among("issons", -1, 1),
            new Among_js_1.Among("issants", -1, 1), new Among_js_1.Among("it", -1, 1),
            new Among_js_1.Among("irait", 21, 1), new Among_js_1.Among("issait", 21, 1),
            new Among_js_1.Among("issant", -1, 1), new Among_js_1.Among("iraIent", -1, 1),
            new Among_js_1.Among("issaIent", -1, 1), new Among_js_1.Among("irent", -1, 1),
            new Among_js_1.Among("issent", -1, 1), new Among_js_1.Among("iront", -1, 1),
            new Among_js_1.Among("\u00EEt", -1, 1), new Among_js_1.Among("iriez", -1, 1),
            new Among_js_1.Among("issiez", -1, 1), new Among_js_1.Among("irez", -1, 1),
            new Among_js_1.Among("issez", -1, 1)
        ];
        this.a_6 = [new Among_js_1.Among("a", -1, 3),
            new Among_js_1.Among("era", 0, 2), new Among_js_1.Among("asse", -1, 3),
            new Among_js_1.Among("ante", -1, 3), new Among_js_1.Among("\u00E9e", -1, 2),
            new Among_js_1.Among("ai", -1, 3), new Among_js_1.Among("erai", 5, 2),
            new Among_js_1.Among("er", -1, 2), new Among_js_1.Among("as", -1, 3),
            new Among_js_1.Among("eras", 8, 2), new Among_js_1.Among("\u00E2mes", -1, 3),
            new Among_js_1.Among("asses", -1, 3), new Among_js_1.Among("antes", -1, 3),
            new Among_js_1.Among("\u00E2tes", -1, 3), new Among_js_1.Among("\u00E9es", -1, 2),
            new Among_js_1.Among("ais", -1, 3), new Among_js_1.Among("erais", 15, 2),
            new Among_js_1.Among("ions", -1, 1), new Among_js_1.Among("erions", 17, 2),
            new Among_js_1.Among("assions", 17, 3), new Among_js_1.Among("erons", -1, 2),
            new Among_js_1.Among("ants", -1, 3), new Among_js_1.Among("\u00E9s", -1, 2),
            new Among_js_1.Among("ait", -1, 3), new Among_js_1.Among("erait", 23, 2),
            new Among_js_1.Among("ant", -1, 3), new Among_js_1.Among("aIent", -1, 3),
            new Among_js_1.Among("eraIent", 26, 2), new Among_js_1.Among("\u00E8rent", -1, 2),
            new Among_js_1.Among("assent", -1, 3), new Among_js_1.Among("eront", -1, 2),
            new Among_js_1.Among("\u00E2t", -1, 3), new Among_js_1.Among("ez", -1, 2),
            new Among_js_1.Among("iez", 32, 2), new Among_js_1.Among("eriez", 33, 2),
            new Among_js_1.Among("assiez", 33, 3), new Among_js_1.Among("erez", 32, 2),
            new Among_js_1.Among("\u00E9", -1, 2)];
        this.a_7 = [new Among_js_1.Among("e", -1, 3),
            new Among_js_1.Among("I\u00E8re", 0, 2), new Among_js_1.Among("i\u00E8re", 0, 2),
            new Among_js_1.Among("ion", -1, 1), new Among_js_1.Among("Ier", -1, 2),
            new Among_js_1.Among("ier", -1, 2), new Among_js_1.Among("\u00EB", -1, 4)];
        this.a_8 = [
            new Among_js_1.Among("ell", -1, -1), new Among_js_1.Among("eill", -1, -1),
            new Among_js_1.Among("enn", -1, -1), new Among_js_1.Among("onn", -1, -1),
            new Among_js_1.Among("ett", -1, -1)
        ];
        this.g_v = [17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128, 130, 103, 8, 5];
        this.g_keep_with_s = [1, 65, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128];
    }
    setCurrent(word) {
        this.sbp.setCurrent(word);
    }
    ;
    getCurrent() {
        return this.sbp.getCurrent();
    }
    ;
    habr1(c1, c2, v_1) {
        if (this.sbp.eq_s(1, c1)) {
            this.sbp.ket = this.sbp.cursor;
            if (this.sbp.in_grouping(this.g_v, 97, 251)) {
                this.sbp.slice_from(c2);
                this.sbp.cursor = v_1;
                return true;
            }
        }
        return false;
    }
    habr2(c1, c2, v_1) {
        if (this.sbp.eq_s(1, c1)) {
            this.sbp.ket = this.sbp.cursor;
            this.sbp.slice_from(c2);
            this.sbp.cursor = v_1;
            return true;
        }
        return false;
    }
    r_prelude() {
        let v_1, v_2;
        while (true) {
            v_1 = this.sbp.cursor;
            if (this.sbp.in_grouping(this.g_v, 97, 251)) {
                this.sbp.bra = this.sbp.cursor;
                v_2 = this.sbp.cursor;
                if (this.habr1("u", "U", v_1))
                    continue;
                this.sbp.cursor = v_2;
                if (this.habr1("i", "I", v_1))
                    continue;
                this.sbp.cursor = v_2;
                if (this.habr2("y", "Y", v_1))
                    continue;
            }
            this.sbp.cursor = v_1;
            this.sbp.bra = v_1;
            if (!this.habr1("y", "Y", v_1)) {
                this.sbp.cursor = v_1;
                if (this.sbp.eq_s(1, "q")) {
                    this.sbp.bra = this.sbp.cursor;
                    if (this.habr2("u", "U", v_1))
                        continue;
                }
                this.sbp.cursor = v_1;
                if (v_1 >= this.sbp.limit)
                    return;
                this.sbp.cursor++;
            }
        }
    }
    habr3() {
        while (!this.sbp.in_grouping(this.g_v, 97, 251)) {
            if (this.sbp.cursor >= this.sbp.limit)
                return true;
            this.sbp.cursor++;
        }
        while (!this.sbp.out_grouping(this.g_v, 97, 251)) {
            if (this.sbp.cursor >= this.sbp.limit)
                return true;
            this.sbp.cursor++;
        }
        return false;
    }
    r_mark_regions() {
        var v_1 = this.sbp.cursor;
        this.I_pV = this.sbp.limit;
        this.I_p1 = this.I_pV;
        this.I_p2 = this.I_pV;
        if (this.sbp.in_grouping(this.g_v, 97, 251) && this.sbp.in_grouping(this.g_v, 97, 251)
            && this.sbp.cursor < this.sbp.limit)
            this.sbp.cursor++;
        else {
            this.sbp.cursor = v_1;
            if (!this.sbp.find_among(this.a_0, 3)) {
                this.sbp.cursor = v_1;
                do {
                    if (this.sbp.cursor >= this.sbp.limit) {
                        this.sbp.cursor = this.I_pV;
                        break;
                    }
                    this.sbp.cursor++;
                } while (!this.sbp.in_grouping(this.g_v, 97, 251));
            }
        }
        this.I_pV = this.sbp.cursor;
        this.sbp.cursor = v_1;
        if (!this.habr3()) {
            this.I_p1 = this.sbp.cursor;
            if (!this.habr3())
                this.I_p2 = this.sbp.cursor;
        }
    }
    r_postlude() {
        var among_var, v_1;
        while (true) {
            v_1 = this.sbp.cursor;
            this.sbp.bra = v_1;
            among_var = this.sbp.find_among(this.a_1, 4);
            if (!among_var)
                break;
            this.sbp.ket = this.sbp.cursor;
            switch (among_var) {
                case 1:
                    this.sbp.slice_from("i");
                    break;
                case 2:
                    this.sbp.slice_from("u");
                    break;
                case 3:
                    this.sbp.slice_from("y");
                    break;
                case 4:
                    if (this.sbp.cursor >= this.sbp.limit)
                        return;
                    this.sbp.cursor++;
                    break;
            }
        }
    }
    r_RV() {
        return this.I_pV <= this.sbp.cursor;
    }
    r_R1() {
        return this.I_p1 <= this.sbp.cursor;
    }
    r_R2() {
        return this.I_p2 <= this.sbp.cursor;
    }
    r_standard_suffix() {
        let among_var;
        let v_1;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_4, 43);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            switch (among_var) {
                case 1:
                    if (!this.r_R2())
                        return false;
                    this.sbp.slice_del();
                    break;
                case 2:
                    if (!this.r_R2())
                        return false;
                    this.sbp.slice_del();
                    this.sbp.ket = this.sbp.cursor;
                    if (this.sbp.eq_s_b(2, "ic")) {
                        this.sbp.bra = this.sbp.cursor;
                        if (!this.r_R2())
                            this.sbp.slice_from("iqU");
                        else
                            this.sbp.slice_del();
                    }
                    break;
                case 3:
                    if (!this.r_R2())
                        return false;
                    this.sbp.slice_from("log");
                    break;
                case 4:
                    if (!this.r_R2())
                        return false;
                    this.sbp.slice_from("u");
                    break;
                case 5:
                    if (!this.r_R2())
                        return false;
                    this.sbp.slice_from("ent");
                    break;
                case 6:
                    if (!this.r_RV())
                        return false;
                    this.sbp.slice_del();
                    this.sbp.ket = this.sbp.cursor;
                    among_var = this.sbp.find_among_b(this.a_2, 6);
                    if (among_var) {
                        this.sbp.bra = this.sbp.cursor;
                        switch (among_var) {
                            case 1:
                                if (this.r_R2()) {
                                    this.sbp.slice_del();
                                    this.sbp.ket = this.sbp.cursor;
                                    if (this.sbp.eq_s_b(2, "at")) {
                                        this.sbp.bra = this.sbp.cursor;
                                        if (this.r_R2())
                                            this.sbp.slice_del();
                                    }
                                }
                                break;
                            case 2:
                                if (this.r_R2())
                                    this.sbp.slice_del();
                                else if (this.r_R1())
                                    this.sbp.slice_from("eux");
                                break;
                            case 3:
                                if (this.r_R2())
                                    this.sbp.slice_del();
                                break;
                            case 4:
                                if (this.r_RV())
                                    this.sbp.slice_from("i");
                                break;
                        }
                    }
                    break;
                case 7:
                    if (!this.r_R2())
                        return false;
                    this.sbp.slice_del();
                    this.sbp.ket = this.sbp.cursor;
                    among_var = this.sbp.find_among_b(this.a_3, 3);
                    if (among_var) {
                        this.sbp.bra = this.sbp.cursor;
                        switch (among_var) {
                            case 1:
                                if (this.r_R2())
                                    this.sbp.slice_del();
                                else
                                    this.sbp.slice_from("abl");
                                break;
                            case 2:
                                if (this.r_R2())
                                    this.sbp.slice_del();
                                else
                                    this.sbp.slice_from("iqU");
                                break;
                            case 3:
                                if (this.r_R2())
                                    this.sbp.slice_del();
                                break;
                        }
                    }
                    break;
                case 8:
                    if (!this.r_R2())
                        return false;
                    this.sbp.slice_del();
                    this.sbp.ket = this.sbp.cursor;
                    if (this.sbp.eq_s_b(2, "at")) {
                        this.sbp.bra = this.sbp.cursor;
                        if (this.r_R2()) {
                            this.sbp.slice_del();
                            this.sbp.ket = this.sbp.cursor;
                            if (this.sbp.eq_s_b(2, "ic")) {
                                this.sbp.bra = this.sbp.cursor;
                                if (this.r_R2())
                                    this.sbp.slice_del();
                                else
                                    this.sbp.slice_from("iqU");
                                break;
                            }
                        }
                    }
                    break;
                case 9:
                    this.sbp.slice_from("eau");
                    break;
                case 10:
                    if (!this.r_R1())
                        return false;
                    this.sbp.slice_from("al");
                    break;
                case 11:
                    if (this.r_R2())
                        this.sbp.slice_del();
                    else if (!this.r_R1())
                        return false;
                    else
                        this.sbp.slice_from("eux");
                    break;
                case 12:
                    if (!this.r_R1() || !this.sbp.out_grouping_b(this.g_v, 97, 251))
                        return false;
                    this.sbp.slice_del();
                    break;
                case 13:
                    if (this.r_RV())
                        this.sbp.slice_from("ant");
                    return false;
                case 14:
                    if (this.r_RV())
                        this.sbp.slice_from("ent");
                    return false;
                case 15:
                    v_1 = this.sbp.limit - this.sbp.cursor;
                    if (this.sbp.in_grouping_b(this.g_v, 97, 251) && this.r_RV()) {
                        this.sbp.cursor = this.sbp.limit - v_1;
                        this.sbp.slice_del();
                    }
                    return false;
            }
            return true;
        }
        return false;
    }
    r_i_verb_suffix() {
        var among_var, v_1;
        if (this.sbp.cursor < this.I_pV)
            return false;
        v_1 = this.sbp.limit_backward;
        this.sbp.limit_backward = this.I_pV;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_5, 35);
        if (!among_var) {
            this.sbp.limit_backward = v_1;
            return false;
        }
        this.sbp.bra = this.sbp.cursor;
        if (among_var == 1) {
            if (!this.sbp.out_grouping_b(this.g_v, 97, 251)) {
                this.sbp.limit_backward = v_1;
                return false;
            }
            this.sbp.slice_del();
        }
        this.sbp.limit_backward = v_1;
        return true;
    }
    r_verb_suffix() {
        var among_var, v_2, v_3;
        if (this.sbp.cursor < this.I_pV)
            return false;
        v_2 = this.sbp.limit_backward;
        this.sbp.limit_backward = this.I_pV;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_6, 38);
        if (!among_var) {
            this.sbp.limit_backward = v_2;
            return false;
        }
        this.sbp.bra = this.sbp.cursor;
        switch (among_var) {
            case 1:
                if (!this.r_R2()) {
                    this.sbp.limit_backward = v_2;
                    return false;
                }
                this.sbp.slice_del();
                break;
            case 2:
                this.sbp.slice_del();
                break;
            case 3:
                this.sbp.slice_del();
                v_3 = this.sbp.limit - this.sbp.cursor;
                this.sbp.ket = this.sbp.cursor;
                if (this.sbp.eq_s_b(1, "e")) {
                    this.sbp.bra = this.sbp.cursor;
                    this.sbp.slice_del();
                }
                else
                    this.sbp.cursor = this.sbp.limit - v_3;
                break;
        }
        this.sbp.limit_backward = v_2;
        return true;
    }
    r_residual_suffix() {
        var among_var, v_1 = this.sbp.limit - this.sbp.cursor, v_2, v_4, v_5;
        this.sbp.ket = this.sbp.cursor;
        if (this.sbp.eq_s_b(1, "s")) {
            this.sbp.bra = this.sbp.cursor;
            v_2 = this.sbp.limit - this.sbp.cursor;
            if (this.sbp.out_grouping_b(this.g_keep_with_s, 97, 232)) {
                this.sbp.cursor = this.sbp.limit - v_2;
                this.sbp.slice_del();
            }
            else
                this.sbp.cursor = this.sbp.limit - v_1;
        }
        else
            this.sbp.cursor = this.sbp.limit - v_1;
        if (this.sbp.cursor >= this.I_pV) {
            v_4 = this.sbp.limit_backward;
            this.sbp.limit_backward = this.I_pV;
            this.sbp.ket = this.sbp.cursor;
            among_var = this.sbp.find_among_b(this.a_7, 7);
            if (among_var) {
                this.sbp.bra = this.sbp.cursor;
                switch (among_var) {
                    case 1:
                        if (this.r_R2()) {
                            v_5 = this.sbp.limit - this.sbp.cursor;
                            if (!this.sbp.eq_s_b(1, "s")) {
                                this.sbp.cursor = this.sbp.limit - v_5;
                                if (!this.sbp.eq_s_b(1, "t"))
                                    break;
                            }
                            this.sbp.slice_del();
                        }
                        break;
                    case 2:
                        this.sbp.slice_from("i");
                        break;
                    case 3:
                        this.sbp.slice_del();
                        break;
                    case 4:
                        if (this.sbp.eq_s_b(2, "gu"))
                            this.sbp.slice_del();
                        break;
                }
            }
            this.sbp.limit_backward = v_4;
        }
    }
    r_un_double() {
        var v_1 = this.sbp.limit - this.sbp.cursor;
        if (this.sbp.find_among_b(this.a_8, 5)) {
            this.sbp.cursor = this.sbp.limit - v_1;
            this.sbp.ket = this.sbp.cursor;
            if (this.sbp.cursor > this.sbp.limit_backward) {
                this.sbp.cursor--;
                this.sbp.bra = this.sbp.cursor;
                this.sbp.slice_del();
            }
        }
    }
    r_un_accent() {
        var v_1, v_2 = 1;
        while (this.sbp.out_grouping_b(this.g_v, 97, 251))
            v_2--;
        if (v_2 <= 0) {
            this.sbp.ket = this.sbp.cursor;
            v_1 = this.sbp.limit - this.sbp.cursor;
            if (!this.sbp.eq_s_b(1, "\u00E9")) {
                this.sbp.cursor = this.sbp.limit - v_1;
                if (!this.sbp.eq_s_b(1, "\u00E8"))
                    return;
            }
            this.sbp.bra = this.sbp.cursor;
            this.sbp.slice_from("e");
        }
    }
    habr5() {
        if (!this.r_standard_suffix()) {
            this.sbp.cursor = this.sbp.limit;
            if (!this.r_i_verb_suffix()) {
                this.sbp.cursor = this.sbp.limit;
                if (!this.r_verb_suffix()) {
                    this.sbp.cursor = this.sbp.limit;
                    this.r_residual_suffix();
                    return;
                }
            }
        }
        this.sbp.cursor = this.sbp.limit;
        this.sbp.ket = this.sbp.cursor;
        if (this.sbp.eq_s_b(1, "Y")) {
            this.sbp.bra = this.sbp.cursor;
            this.sbp.slice_from("i");
        }
        else {
            this.sbp.cursor = this.sbp.limit;
            if (this.sbp.eq_s_b(1, "\u00E7")) {
                this.sbp.bra = this.sbp.cursor;
                this.sbp.slice_from("c");
            }
        }
    }
    stem() {
        var v_1 = this.sbp.cursor;
        this.r_prelude();
        this.sbp.cursor = v_1;
        this.r_mark_regions();
        this.sbp.limit_backward = v_1;
        this.sbp.cursor = this.sbp.limit;
        this.habr5();
        this.sbp.cursor = this.sbp.limit;
        this.r_un_double();
        this.sbp.cursor = this.sbp.limit;
        this.r_un_accent();
        this.sbp.cursor = this.sbp.limit_backward;
        this.r_postlude();
        return true;
    }
}
exports.FrenchStemmer = FrenchStemmer;
