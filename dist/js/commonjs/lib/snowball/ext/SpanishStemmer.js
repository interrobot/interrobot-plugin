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
exports.SpanishStemmer = void 0;
const BaseStemmer_js_1 = require("./BaseStemmer.js");
const Among_js_1 = require("../Among.js");
class SpanishStemmer extends BaseStemmer_js_1.BaseStemmer {
    constructor() {
        super();
        this.stem = function () {
            var v_1 = this.sbp.cursor;
            this.r_mark_regions();
            this.sbp.limit_backward = v_1;
            this.sbp.cursor = this.sbp.limit;
            this.r_attached_pronoun();
            this.sbp.cursor = this.sbp.limit;
            if (!this.r_standard_suffix()) {
                this.sbp.cursor = this.sbp.limit;
                if (!this.r_y_verb_suffix()) {
                    this.sbp.cursor = this.sbp.limit;
                    this.r_verb_suffix();
                }
            }
            this.sbp.cursor = this.sbp.limit;
            this.r_residual_suffix();
            this.sbp.cursor = this.sbp.limit_backward;
            this.r_postlude();
            return true;
        };
        this.a_0 = [
            new Among_js_1.Among("", -1, 6), new Among_js_1.Among("\u00E1", 0, 1),
            new Among_js_1.Among("\u00E9", 0, 2), new Among_js_1.Among("\u00ED", 0, 3),
            new Among_js_1.Among("\u00F3", 0, 4), new Among_js_1.Among("\u00FA", 0, 5)
        ];
        this.a_1 = [
            new Among_js_1.Among("la", -1, -1), new Among_js_1.Among("sela", 0, -1),
            new Among_js_1.Among("le", -1, -1), new Among_js_1.Among("me", -1, -1),
            new Among_js_1.Among("se", -1, -1), new Among_js_1.Among("lo", -1, -1),
            new Among_js_1.Among("selo", 5, -1), new Among_js_1.Among("las", -1, -1),
            new Among_js_1.Among("selas", 7, -1), new Among_js_1.Among("les", -1, -1),
            new Among_js_1.Among("los", -1, -1), new Among_js_1.Among("selos", 10, -1),
            new Among_js_1.Among("nos", -1, -1)
        ];
        this.a_2 = [new Among_js_1.Among("ando", -1, 6),
            new Among_js_1.Among("iendo", -1, 6), new Among_js_1.Among("yendo", -1, 7),
            new Among_js_1.Among("\u00E1ndo", -1, 2), new Among_js_1.Among("i\u00E9ndo", -1, 1),
            new Among_js_1.Among("ar", -1, 6), new Among_js_1.Among("er", -1, 6),
            new Among_js_1.Among("ir", -1, 6), new Among_js_1.Among("\u00E1r", -1, 3),
            new Among_js_1.Among("\u00E9r", -1, 4), new Among_js_1.Among("\u00EDr", -1, 5)];
        this.a_3 = [
            new Among_js_1.Among("ic", -1, -1), new Among_js_1.Among("ad", -1, -1),
            new Among_js_1.Among("os", -1, -1), new Among_js_1.Among("iv", -1, 1)
        ];
        this.a_4 = [
            new Among_js_1.Among("able", -1, 1), new Among_js_1.Among("ible", -1, 1),
            new Among_js_1.Among("ante", -1, 1)
        ];
        this.a_5 = [new Among_js_1.Among("ic", -1, 1),
            new Among_js_1.Among("abil", -1, 1), new Among_js_1.Among("iv", -1, 1)];
        this.a_6 = [
            new Among_js_1.Among("ica", -1, 1), new Among_js_1.Among("ancia", -1, 2),
            new Among_js_1.Among("encia", -1, 5), new Among_js_1.Among("adora", -1, 2),
            new Among_js_1.Among("osa", -1, 1), new Among_js_1.Among("ista", -1, 1),
            new Among_js_1.Among("iva", -1, 9), new Among_js_1.Among("anza", -1, 1),
            new Among_js_1.Among("log\u00EDa", -1, 3), new Among_js_1.Among("idad", -1, 8),
            new Among_js_1.Among("able", -1, 1), new Among_js_1.Among("ible", -1, 1),
            new Among_js_1.Among("ante", -1, 2), new Among_js_1.Among("mente", -1, 7),
            new Among_js_1.Among("amente", 13, 6), new Among_js_1.Among("aci\u00F3n", -1, 2),
            new Among_js_1.Among("uci\u00F3n", -1, 4), new Among_js_1.Among("ico", -1, 1),
            new Among_js_1.Among("ismo", -1, 1), new Among_js_1.Among("oso", -1, 1),
            new Among_js_1.Among("amiento", -1, 1), new Among_js_1.Among("imiento", -1, 1),
            new Among_js_1.Among("ivo", -1, 9), new Among_js_1.Among("ador", -1, 2),
            new Among_js_1.Among("icas", -1, 1), new Among_js_1.Among("ancias", -1, 2),
            new Among_js_1.Among("encias", -1, 5), new Among_js_1.Among("adoras", -1, 2),
            new Among_js_1.Among("osas", -1, 1), new Among_js_1.Among("istas", -1, 1),
            new Among_js_1.Among("ivas", -1, 9), new Among_js_1.Among("anzas", -1, 1),
            new Among_js_1.Among("log\u00EDas", -1, 3), new Among_js_1.Among("idades", -1, 8),
            new Among_js_1.Among("ables", -1, 1), new Among_js_1.Among("ibles", -1, 1),
            new Among_js_1.Among("aciones", -1, 2), new Among_js_1.Among("uciones", -1, 4),
            new Among_js_1.Among("adores", -1, 2), new Among_js_1.Among("antes", -1, 2),
            new Among_js_1.Among("icos", -1, 1), new Among_js_1.Among("ismos", -1, 1),
            new Among_js_1.Among("osos", -1, 1), new Among_js_1.Among("amientos", -1, 1),
            new Among_js_1.Among("imientos", -1, 1), new Among_js_1.Among("ivos", -1, 9)
        ];
        this.a_7 = [
            new Among_js_1.Among("ya", -1, 1), new Among_js_1.Among("ye", -1, 1),
            new Among_js_1.Among("yan", -1, 1), new Among_js_1.Among("yen", -1, 1),
            new Among_js_1.Among("yeron", -1, 1), new Among_js_1.Among("yendo", -1, 1),
            new Among_js_1.Among("yo", -1, 1), new Among_js_1.Among("yas", -1, 1),
            new Among_js_1.Among("yes", -1, 1), new Among_js_1.Among("yais", -1, 1),
            new Among_js_1.Among("yamos", -1, 1), new Among_js_1.Among("y\u00F3", -1, 1)
        ];
        this.a_8 = [
            new Among_js_1.Among("aba", -1, 2), new Among_js_1.Among("ada", -1, 2),
            new Among_js_1.Among("ida", -1, 2), new Among_js_1.Among("ara", -1, 2),
            new Among_js_1.Among("iera", -1, 2), new Among_js_1.Among("\u00EDa", -1, 2),
            new Among_js_1.Among("ar\u00EDa", 5, 2), new Among_js_1.Among("er\u00EDa", 5, 2),
            new Among_js_1.Among("ir\u00EDa", 5, 2), new Among_js_1.Among("ad", -1, 2),
            new Among_js_1.Among("ed", -1, 2), new Among_js_1.Among("id", -1, 2),
            new Among_js_1.Among("ase", -1, 2), new Among_js_1.Among("iese", -1, 2),
            new Among_js_1.Among("aste", -1, 2), new Among_js_1.Among("iste", -1, 2),
            new Among_js_1.Among("an", -1, 2), new Among_js_1.Among("aban", 16, 2),
            new Among_js_1.Among("aran", 16, 2), new Among_js_1.Among("ieran", 16, 2),
            new Among_js_1.Among("\u00EDan", 16, 2), new Among_js_1.Among("ar\u00EDan", 20, 2),
            new Among_js_1.Among("er\u00EDan", 20, 2), new Among_js_1.Among("ir\u00EDan", 20, 2),
            new Among_js_1.Among("en", -1, 1), new Among_js_1.Among("asen", 24, 2),
            new Among_js_1.Among("iesen", 24, 2), new Among_js_1.Among("aron", -1, 2),
            new Among_js_1.Among("ieron", -1, 2), new Among_js_1.Among("ar\u00E1n", -1, 2),
            new Among_js_1.Among("er\u00E1n", -1, 2), new Among_js_1.Among("ir\u00E1n", -1, 2),
            new Among_js_1.Among("ado", -1, 2), new Among_js_1.Among("ido", -1, 2),
            new Among_js_1.Among("ando", -1, 2), new Among_js_1.Among("iendo", -1, 2),
            new Among_js_1.Among("ar", -1, 2), new Among_js_1.Among("er", -1, 2),
            new Among_js_1.Among("ir", -1, 2), new Among_js_1.Among("as", -1, 2),
            new Among_js_1.Among("abas", 39, 2), new Among_js_1.Among("adas", 39, 2),
            new Among_js_1.Among("idas", 39, 2), new Among_js_1.Among("aras", 39, 2),
            new Among_js_1.Among("ieras", 39, 2), new Among_js_1.Among("\u00EDas", 39, 2),
            new Among_js_1.Among("ar\u00EDas", 45, 2), new Among_js_1.Among("er\u00EDas", 45, 2),
            new Among_js_1.Among("ir\u00EDas", 45, 2), new Among_js_1.Among("es", -1, 1),
            new Among_js_1.Among("ases", 49, 2), new Among_js_1.Among("ieses", 49, 2),
            new Among_js_1.Among("abais", -1, 2), new Among_js_1.Among("arais", -1, 2),
            new Among_js_1.Among("ierais", -1, 2), new Among_js_1.Among("\u00EDais", -1, 2),
            new Among_js_1.Among("ar\u00EDais", 55, 2), new Among_js_1.Among("er\u00EDais", 55, 2),
            new Among_js_1.Among("ir\u00EDais", 55, 2), new Among_js_1.Among("aseis", -1, 2),
            new Among_js_1.Among("ieseis", -1, 2), new Among_js_1.Among("asteis", -1, 2),
            new Among_js_1.Among("isteis", -1, 2), new Among_js_1.Among("\u00E1is", -1, 2),
            new Among_js_1.Among("\u00E9is", -1, 1), new Among_js_1.Among("ar\u00E9is", 64, 2),
            new Among_js_1.Among("er\u00E9is", 64, 2), new Among_js_1.Among("ir\u00E9is", 64, 2),
            new Among_js_1.Among("ados", -1, 2), new Among_js_1.Among("idos", -1, 2),
            new Among_js_1.Among("amos", -1, 2), new Among_js_1.Among("\u00E1bamos", 70, 2),
            new Among_js_1.Among("\u00E1ramos", 70, 2), new Among_js_1.Among("i\u00E9ramos", 70, 2),
            new Among_js_1.Among("\u00EDamos", 70, 2), new Among_js_1.Among("ar\u00EDamos", 74, 2),
            new Among_js_1.Among("er\u00EDamos", 74, 2), new Among_js_1.Among("ir\u00EDamos", 74, 2),
            new Among_js_1.Among("emos", -1, 1), new Among_js_1.Among("aremos", 78, 2),
            new Among_js_1.Among("eremos", 78, 2), new Among_js_1.Among("iremos", 78, 2),
            new Among_js_1.Among("\u00E1semos", 78, 2), new Among_js_1.Among("i\u00E9semos", 78, 2),
            new Among_js_1.Among("imos", -1, 2), new Among_js_1.Among("ar\u00E1s", -1, 2),
            new Among_js_1.Among("er\u00E1s", -1, 2), new Among_js_1.Among("ir\u00E1s", -1, 2),
            new Among_js_1.Among("\u00EDs", -1, 2), new Among_js_1.Among("ar\u00E1", -1, 2),
            new Among_js_1.Among("er\u00E1", -1, 2), new Among_js_1.Among("ir\u00E1", -1, 2),
            new Among_js_1.Among("ar\u00E9", -1, 2), new Among_js_1.Among("er\u00E9", -1, 2),
            new Among_js_1.Among("ir\u00E9", -1, 2), new Among_js_1.Among("i\u00F3", -1, 2)
        ];
        this.a_9 = [
            new Among_js_1.Among("a", -1, 1), new Among_js_1.Among("e", -1, 2),
            new Among_js_1.Among("o", -1, 1), new Among_js_1.Among("os", -1, 1),
            new Among_js_1.Among("\u00E1", -1, 1), new Among_js_1.Among("\u00E9", -1, 2),
            new Among_js_1.Among("\u00ED", -1, 1), new Among_js_1.Among("\u00F3", -1, 1)
        ];
        this.g_v = [17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 17, 4, 10];
        // this.I_p2;
        // this.I_p1;
        // this.I_pV;
        // this.sbp = new SnowballProgram();
    }
    habr1() {
        if (this.sbp.out_grouping(this.g_v, 97, 252)) {
            while (!this.sbp.in_grouping(this.g_v, 97, 252)) {
                if (this.sbp.cursor >= this.sbp.limit)
                    return true;
                this.sbp.cursor++;
            }
            return false;
        }
        return true;
    }
    habr2() {
        if (this.sbp.in_grouping(this.g_v, 97, 252)) {
            var v_1 = this.sbp.cursor;
            if (this.habr1()) {
                this.sbp.cursor = v_1;
                if (!this.sbp.in_grouping(this.g_v, 97, 252))
                    return true;
                while (!this.sbp.out_grouping(this.g_v, 97, 252)) {
                    if (this.sbp.cursor >= this.sbp.limit)
                        return true;
                    this.sbp.cursor++;
                }
            }
            return false;
        }
        return true;
    }
    habr3() {
        var v_1 = this.sbp.cursor, v_2;
        if (this.habr2()) {
            this.sbp.cursor = v_1;
            if (!this.sbp.out_grouping(this.g_v, 97, 252))
                return;
            v_2 = this.sbp.cursor;
            if (this.habr1()) {
                this.sbp.cursor = v_2;
                if (!this.sbp.in_grouping(this.g_v, 97, 252) || this.sbp.cursor >= this.sbp.limit)
                    return;
                this.sbp.cursor++;
            }
        }
        this.I_pV = this.sbp.cursor;
    }
    habr4() {
        while (!this.sbp.in_grouping(this.g_v, 97, 252)) {
            if (this.sbp.cursor >= this.sbp.limit)
                return false;
            this.sbp.cursor++;
        }
        while (!this.sbp.out_grouping(this.g_v, 97, 252)) {
            if (this.sbp.cursor >= this.sbp.limit)
                return false;
            this.sbp.cursor++;
        }
        return true;
    }
    r_mark_regions() {
        var v_1 = this.sbp.cursor;
        this.I_pV = this.sbp.limit;
        this.I_p1 = this.I_pV;
        this.I_p2 = this.I_pV;
        this.habr3();
        this.sbp.cursor = v_1;
        if (this.habr4()) {
            this.I_p1 = this.sbp.cursor;
            if (this.habr4()) {
                this.I_p2 = this.sbp.cursor;
            }
        }
    }
    r_postlude() {
        var g_var;
        while (true) {
            this.sbp.bra = this.sbp.cursor;
            g_var = this.sbp.find_among(this.a_0, 6);
            if (g_var) {
                this.sbp.ket = this.sbp.cursor;
                switch (g_var) {
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
    r_attached_pronoun() {
        var g_var;
        this.sbp.ket = this.sbp.cursor;
        if (this.sbp.find_among_b(this.a_1, 13)) {
            this.sbp.bra = this.sbp.cursor;
            g_var = this.sbp.find_among_b(this.a_2, 11);
            if (g_var && this.r_RV())
                switch (g_var) {
                    case 1:
                        this.sbp.bra = this.sbp.cursor;
                        this.sbp.slice_from("iendo");
                        break;
                    case 2:
                        this.sbp.bra = this.sbp.cursor;
                        this.sbp.slice_from("ando");
                        break;
                    case 3:
                        this.sbp.bra = this.sbp.cursor;
                        this.sbp.slice_from("ar");
                        break;
                    case 4:
                        this.sbp.bra = this.sbp.cursor;
                        this.sbp.slice_from("er");
                        break;
                    case 5:
                        this.sbp.bra = this.sbp.cursor;
                        this.sbp.slice_from("ir");
                        break;
                    case 6:
                        this.sbp.slice_del();
                        break;
                    case 7:
                        if (this.sbp.eq_s_b(1, "u"))
                            this.sbp.slice_del();
                        break;
                }
        }
    }
    habr5(a, n) {
        if (!this.r_R2())
            return true;
        this.sbp.slice_del();
        this.sbp.ket = this.sbp.cursor;
        var g_var = this.sbp.find_among_b(a, n);
        if (g_var) {
            this.sbp.bra = this.sbp.cursor;
            if (g_var == 1 && this.r_R2())
                this.sbp.slice_del();
        }
        return false;
    }
    habr6(c1) {
        if (!this.r_R2())
            return true;
        this.sbp.slice_del();
        this.sbp.ket = this.sbp.cursor;
        if (this.sbp.eq_s_b(2, c1)) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R2())
                this.sbp.slice_del();
        }
        return false;
    }
    r_standard_suffix() {
        var g_var;
        this.sbp.ket = this.sbp.cursor;
        g_var = this.sbp.find_among_b(this.a_6, 46);
        if (g_var) {
            this.sbp.bra = this.sbp.cursor;
            switch (g_var) {
                case 1:
                    if (!this.r_R2())
                        return false;
                    this.sbp.slice_del();
                    break;
                case 2:
                    if (this.habr6("ic"))
                        return false;
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
                    this.sbp.slice_from("ente");
                    break;
                case 6:
                    if (!this.r_R1())
                        return false;
                    this.sbp.slice_del();
                    this.sbp.ket = this.sbp.cursor;
                    g_var = this.sbp.find_among_b(this.a_3, 4);
                    if (g_var) {
                        this.sbp.bra = this.sbp.cursor;
                        if (this.r_R2()) {
                            this.sbp.slice_del();
                            if (g_var == 1) {
                                this.sbp.ket = this.sbp.cursor;
                                if (this.sbp.eq_s_b(2, "at")) {
                                    this.sbp.bra = this.sbp.cursor;
                                    if (this.r_R2())
                                        this.sbp.slice_del();
                                }
                            }
                        }
                    }
                    break;
                case 7:
                    if (this.habr5(this.a_4, 3))
                        return false;
                    break;
                case 8:
                    if (this.habr5(this.a_5, 3))
                        return false;
                    break;
                case 9:
                    if (this.habr6("at"))
                        return false;
                    break;
            }
            return true;
        }
        return false;
    }
    r_y_verb_suffix() {
        var g_var, v_1;
        if (this.sbp.cursor >= this.I_pV) {
            v_1 = this.sbp.limit_backward;
            this.sbp.limit_backward = this.I_pV;
            this.sbp.ket = this.sbp.cursor;
            g_var = this.sbp.find_among_b(this.a_7, 12);
            this.sbp.limit_backward = v_1;
            if (g_var) {
                this.sbp.bra = this.sbp.cursor;
                if (g_var == 1) {
                    if (!this.sbp.eq_s_b(1, "u"))
                        return false;
                    this.sbp.slice_del();
                }
                return true;
            }
        }
        return false;
    }
    r_verb_suffix() {
        var g_var, v_1, v_2, v_3;
        if (this.sbp.cursor >= this.I_pV) {
            v_1 = this.sbp.limit_backward;
            this.sbp.limit_backward = this.I_pV;
            this.sbp.ket = this.sbp.cursor;
            g_var = this.sbp.find_among_b(this.a_8, 96);
            this.sbp.limit_backward = v_1;
            if (g_var) {
                this.sbp.bra = this.sbp.cursor;
                switch (g_var) {
                    case 1:
                        v_2 = this.sbp.limit - this.sbp.cursor;
                        if (this.sbp.eq_s_b(1, "u")) {
                            v_3 = this.sbp.limit - this.sbp.cursor;
                            if (this.sbp.eq_s_b(1, "g"))
                                this.sbp.cursor = this.sbp.limit - v_3;
                            else
                                this.sbp.cursor = this.sbp.limit - v_2;
                        }
                        else
                            this.sbp.cursor = this.sbp.limit - v_2;
                        this.sbp.bra = this.sbp.cursor;
                    case 2:
                        this.sbp.slice_del();
                        break;
                }
            }
        }
    }
    r_residual_suffix() {
        var g_var, v_1;
        this.sbp.ket = this.sbp.cursor;
        g_var = this.sbp.find_among_b(this.a_9, 8);
        if (g_var) {
            this.sbp.bra = this.sbp.cursor;
            switch (g_var) {
                case 1:
                    if (this.r_RV())
                        this.sbp.slice_del();
                    break;
                case 2:
                    if (this.r_RV()) {
                        this.sbp.slice_del();
                        this.sbp.ket = this.sbp.cursor;
                        if (this.sbp.eq_s_b(1, "u")) {
                            this.sbp.bra = this.sbp.cursor;
                            v_1 = this.sbp.limit - this.sbp.cursor;
                            if (this.sbp.eq_s_b(1, "g")) {
                                this.sbp.cursor = this.sbp.limit - v_1;
                                if (this.r_RV())
                                    this.sbp.slice_del();
                            }
                        }
                    }
                    break;
            }
        }
    }
}
exports.SpanishStemmer = SpanishStemmer;
