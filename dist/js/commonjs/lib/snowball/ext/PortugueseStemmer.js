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
exports.PortugueseStemmer = void 0;
const BaseStemmer_js_1 = require("./BaseStemmer.js");
const Among_js_1 = require("../Among.js");
/**
 * Implements the Snowball stemming algorithm for the Portuguese language.
 */
class PortugueseStemmer extends BaseStemmer_js_1.BaseStemmer {
    /**
     * Initializes a new instance of the PortugueseStemmer class.
     */
    constructor() {
        super();
        this.a_0 = [new Among_js_1.Among("", -1, 3), new Among_js_1.Among("\u00E3", 0, 1),
            new Among_js_1.Among("\u00F5", 0, 2)];
        this.a_1 = [new Among_js_1.Among("", -1, 3),
            new Among_js_1.Among("a~", 0, 1), new Among_js_1.Among("o~", 0, 2)];
        this.a_2 = [
            new Among_js_1.Among("ic", -1, -1), new Among_js_1.Among("ad", -1, -1),
            new Among_js_1.Among("os", -1, -1), new Among_js_1.Among("iv", -1, 1)
        ];
        this.a_3 = [
            new Among_js_1.Among("ante", -1, 1), new Among_js_1.Among("avel", -1, 1),
            new Among_js_1.Among("\u00EDvel", -1, 1)
        ];
        this.a_4 = [new Among_js_1.Among("ic", -1, 1),
            new Among_js_1.Among("abil", -1, 1), new Among_js_1.Among("iv", -1, 1)];
        this.a_5 = [
            new Among_js_1.Among("ica", -1, 1), new Among_js_1.Among("\u00E2ncia", -1, 1),
            new Among_js_1.Among("\u00EAncia", -1, 4), new Among_js_1.Among("ira", -1, 9),
            new Among_js_1.Among("adora", -1, 1), new Among_js_1.Among("osa", -1, 1),
            new Among_js_1.Among("ista", -1, 1), new Among_js_1.Among("iva", -1, 8),
            new Among_js_1.Among("eza", -1, 1), new Among_js_1.Among("log\u00EDa", -1, 2),
            new Among_js_1.Among("idade", -1, 7), new Among_js_1.Among("ante", -1, 1),
            new Among_js_1.Among("mente", -1, 6), new Among_js_1.Among("amente", 12, 5),
            new Among_js_1.Among("\u00E1vel", -1, 1), new Among_js_1.Among("\u00EDvel", -1, 1),
            new Among_js_1.Among("uci\u00F3n", -1, 3), new Among_js_1.Among("ico", -1, 1),
            new Among_js_1.Among("ismo", -1, 1), new Among_js_1.Among("oso", -1, 1),
            new Among_js_1.Among("amento", -1, 1), new Among_js_1.Among("imento", -1, 1),
            new Among_js_1.Among("ivo", -1, 8), new Among_js_1.Among("a\u00E7a~o", -1, 1),
            new Among_js_1.Among("ador", -1, 1), new Among_js_1.Among("icas", -1, 1),
            new Among_js_1.Among("\u00EAncias", -1, 4), new Among_js_1.Among("iras", -1, 9),
            new Among_js_1.Among("adoras", -1, 1), new Among_js_1.Among("osas", -1, 1),
            new Among_js_1.Among("istas", -1, 1), new Among_js_1.Among("ivas", -1, 8),
            new Among_js_1.Among("ezas", -1, 1), new Among_js_1.Among("log\u00EDas", -1, 2),
            new Among_js_1.Among("idades", -1, 7), new Among_js_1.Among("uciones", -1, 3),
            new Among_js_1.Among("adores", -1, 1), new Among_js_1.Among("antes", -1, 1),
            new Among_js_1.Among("a\u00E7o~es", -1, 1), new Among_js_1.Among("icos", -1, 1),
            new Among_js_1.Among("ismos", -1, 1), new Among_js_1.Among("osos", -1, 1),
            new Among_js_1.Among("amentos", -1, 1), new Among_js_1.Among("imentos", -1, 1),
            new Among_js_1.Among("ivos", -1, 8)
        ];
        this.a_6 = [new Among_js_1.Among("ada", -1, 1),
            new Among_js_1.Among("ida", -1, 1), new Among_js_1.Among("ia", -1, 1),
            new Among_js_1.Among("aria", 2, 1), new Among_js_1.Among("eria", 2, 1),
            new Among_js_1.Among("iria", 2, 1), new Among_js_1.Among("ara", -1, 1),
            new Among_js_1.Among("era", -1, 1), new Among_js_1.Among("ira", -1, 1),
            new Among_js_1.Among("ava", -1, 1), new Among_js_1.Among("asse", -1, 1),
            new Among_js_1.Among("esse", -1, 1), new Among_js_1.Among("isse", -1, 1),
            new Among_js_1.Among("aste", -1, 1), new Among_js_1.Among("este", -1, 1),
            new Among_js_1.Among("iste", -1, 1), new Among_js_1.Among("ei", -1, 1),
            new Among_js_1.Among("arei", 16, 1), new Among_js_1.Among("erei", 16, 1),
            new Among_js_1.Among("irei", 16, 1), new Among_js_1.Among("am", -1, 1),
            new Among_js_1.Among("iam", 20, 1), new Among_js_1.Among("ariam", 21, 1),
            new Among_js_1.Among("eriam", 21, 1), new Among_js_1.Among("iriam", 21, 1),
            new Among_js_1.Among("aram", 20, 1), new Among_js_1.Among("eram", 20, 1),
            new Among_js_1.Among("iram", 20, 1), new Among_js_1.Among("avam", 20, 1),
            new Among_js_1.Among("em", -1, 1), new Among_js_1.Among("arem", 29, 1),
            new Among_js_1.Among("erem", 29, 1), new Among_js_1.Among("irem", 29, 1),
            new Among_js_1.Among("assem", 29, 1), new Among_js_1.Among("essem", 29, 1),
            new Among_js_1.Among("issem", 29, 1), new Among_js_1.Among("ado", -1, 1),
            new Among_js_1.Among("ido", -1, 1), new Among_js_1.Among("ando", -1, 1),
            new Among_js_1.Among("endo", -1, 1), new Among_js_1.Among("indo", -1, 1),
            new Among_js_1.Among("ara~o", -1, 1), new Among_js_1.Among("era~o", -1, 1),
            new Among_js_1.Among("ira~o", -1, 1), new Among_js_1.Among("ar", -1, 1),
            new Among_js_1.Among("er", -1, 1), new Among_js_1.Among("ir", -1, 1),
            new Among_js_1.Among("as", -1, 1), new Among_js_1.Among("adas", 47, 1),
            new Among_js_1.Among("idas", 47, 1), new Among_js_1.Among("ias", 47, 1),
            new Among_js_1.Among("arias", 50, 1), new Among_js_1.Among("erias", 50, 1),
            new Among_js_1.Among("irias", 50, 1), new Among_js_1.Among("aras", 47, 1),
            new Among_js_1.Among("eras", 47, 1), new Among_js_1.Among("iras", 47, 1),
            new Among_js_1.Among("avas", 47, 1), new Among_js_1.Among("es", -1, 1),
            new Among_js_1.Among("ardes", 58, 1), new Among_js_1.Among("erdes", 58, 1),
            new Among_js_1.Among("irdes", 58, 1), new Among_js_1.Among("ares", 58, 1),
            new Among_js_1.Among("eres", 58, 1), new Among_js_1.Among("ires", 58, 1),
            new Among_js_1.Among("asses", 58, 1), new Among_js_1.Among("esses", 58, 1),
            new Among_js_1.Among("isses", 58, 1), new Among_js_1.Among("astes", 58, 1),
            new Among_js_1.Among("estes", 58, 1), new Among_js_1.Among("istes", 58, 1),
            new Among_js_1.Among("is", -1, 1), new Among_js_1.Among("ais", 71, 1),
            new Among_js_1.Among("eis", 71, 1), new Among_js_1.Among("areis", 73, 1),
            new Among_js_1.Among("ereis", 73, 1), new Among_js_1.Among("ireis", 73, 1),
            new Among_js_1.Among("\u00E1reis", 73, 1), new Among_js_1.Among("\u00E9reis", 73, 1),
            new Among_js_1.Among("\u00EDreis", 73, 1), new Among_js_1.Among("\u00E1sseis", 73, 1),
            new Among_js_1.Among("\u00E9sseis", 73, 1), new Among_js_1.Among("\u00EDsseis", 73, 1),
            new Among_js_1.Among("\u00E1veis", 73, 1), new Among_js_1.Among("\u00EDeis", 73, 1),
            new Among_js_1.Among("ar\u00EDeis", 84, 1), new Among_js_1.Among("er\u00EDeis", 84, 1),
            new Among_js_1.Among("ir\u00EDeis", 84, 1), new Among_js_1.Among("ados", -1, 1),
            new Among_js_1.Among("idos", -1, 1), new Among_js_1.Among("amos", -1, 1),
            new Among_js_1.Among("\u00E1ramos", 90, 1), new Among_js_1.Among("\u00E9ramos", 90, 1),
            new Among_js_1.Among("\u00EDramos", 90, 1), new Among_js_1.Among("\u00E1vamos", 90, 1),
            new Among_js_1.Among("\u00EDamos", 90, 1), new Among_js_1.Among("ar\u00EDamos", 95, 1),
            new Among_js_1.Among("er\u00EDamos", 95, 1), new Among_js_1.Among("ir\u00EDamos", 95, 1),
            new Among_js_1.Among("emos", -1, 1), new Among_js_1.Among("aremos", 99, 1),
            new Among_js_1.Among("eremos", 99, 1), new Among_js_1.Among("iremos", 99, 1),
            new Among_js_1.Among("\u00E1ssemos", 99, 1), new Among_js_1.Among("\u00EAssemos", 99, 1),
            new Among_js_1.Among("\u00EDssemos", 99, 1), new Among_js_1.Among("imos", -1, 1),
            new Among_js_1.Among("armos", -1, 1), new Among_js_1.Among("ermos", -1, 1),
            new Among_js_1.Among("irmos", -1, 1), new Among_js_1.Among("\u00E1mos", -1, 1),
            new Among_js_1.Among("ar\u00E1s", -1, 1), new Among_js_1.Among("er\u00E1s", -1, 1),
            new Among_js_1.Among("ir\u00E1s", -1, 1), new Among_js_1.Among("eu", -1, 1),
            new Among_js_1.Among("iu", -1, 1), new Among_js_1.Among("ou", -1, 1),
            new Among_js_1.Among("ar\u00E1", -1, 1), new Among_js_1.Among("er\u00E1", -1, 1),
            new Among_js_1.Among("ir\u00E1", -1, 1)];
        this.a_7 = [new Among_js_1.Among("a", -1, 1),
            new Among_js_1.Among("i", -1, 1), new Among_js_1.Among("o", -1, 1),
            new Among_js_1.Among("os", -1, 1), new Among_js_1.Among("\u00E1", -1, 1),
            new Among_js_1.Among("\u00ED", -1, 1), new Among_js_1.Among("\u00F3", -1, 1)];
        this.a_8 = [
            new Among_js_1.Among("e", -1, 1), new Among_js_1.Among("\u00E7", -1, 2),
            new Among_js_1.Among("\u00E9", -1, 1), new Among_js_1.Among("\u00EA", -1, 1)
        ];
        this.g_v = [17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 19, 12, 2];
        // , I_p2, I_p1, this.I_pV
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
     * Performs the prelude step of the stemming algorithm.
     */
    r_prelude() {
        var among_var;
        while (true) {
            this.sbp.bra = this.sbp.cursor;
            among_var = this.sbp.find_among(this.a_0, 3);
            if (among_var) {
                this.sbp.ket = this.sbp.cursor;
                switch (among_var) {
                    case 1:
                        this.sbp.slice_from("a~");
                        continue;
                    case 2:
                        this.sbp.slice_from("o~");
                        continue;
                    case 3:
                        if (this.sbp.cursor >= this.sbp.limit)
                            break;
                        this.sbp.cursor++;
                        continue;
                }
            }
            break;
        }
    }
    /**
     * Helper method for r_mark_regions.
     * @returns A boolean indicating the result of the operation.
     */
    habr2() {
        if (this.sbp.out_grouping(this.g_v, 97, 250)) {
            while (!this.sbp.in_grouping(this.g_v, 97, 250)) {
                if (this.sbp.cursor >= this.sbp.limit)
                    return true;
                this.sbp.cursor++;
            }
            return false;
        }
        return true;
    }
    /**
    * Another helper method for r_mark_regions.
    * @returns A boolean indicating the result of the operation.
    */
    habr3() {
        if (this.sbp.in_grouping(this.g_v, 97, 250)) {
            while (!this.sbp.out_grouping(this.g_v, 97, 250)) {
                if (this.sbp.cursor >= this.sbp.limit)
                    return false;
                this.sbp.cursor++;
            }
        }
        this.I_pV = this.sbp.cursor;
        return true;
    }
    /**
    * Helper method for r_mark_regions.
    * @returns A boolean indicating the result of the operation.
    */
    habr4() {
        var v_1 = this.sbp.cursor, v_2, v_3;
        if (this.sbp.in_grouping(this.g_v, 97, 250)) {
            v_2 = this.sbp.cursor;
            if (this.habr2()) {
                this.sbp.cursor = v_2;
                if (this.habr3())
                    return;
            }
            else
                this.I_pV = this.sbp.cursor;
        }
        this.sbp.cursor = v_1;
        if (this.sbp.out_grouping(this.g_v, 97, 250)) {
            v_3 = this.sbp.cursor;
            if (this.habr2()) {
                this.sbp.cursor = v_3;
                if (!this.sbp.in_grouping(this.g_v, 97, 250) || this.sbp.cursor >= this.sbp.limit)
                    return;
                this.sbp.cursor++;
            }
            this.I_pV = this.sbp.cursor;
        }
    }
    /**
     * Helper method for r_mark_regions.
     * @returns A boolean indicating the result of the operation.
     */
    habr5() {
        while (!this.sbp.in_grouping(this.g_v, 97, 250)) {
            if (this.sbp.cursor >= this.sbp.limit)
                return false;
            this.sbp.cursor++;
        }
        while (!this.sbp.out_grouping(this.g_v, 97, 250)) {
            if (this.sbp.cursor >= this.sbp.limit)
                return false;
            this.sbp.cursor++;
        }
        return true;
    }
    /**
     * Marks regions in the word for the stemming process.
     */
    r_mark_regions() {
        var v_1 = this.sbp.cursor;
        this.I_pV = this.sbp.limit;
        this.I_p1 = this.I_pV;
        this.I_p2 = this.I_pV;
        this.habr4();
        this.sbp.cursor = v_1;
        if (this.habr5()) {
            this.I_p1 = this.sbp.cursor;
            if (this.habr5())
                this.I_p2 = this.sbp.cursor;
        }
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
                        this.sbp.slice_from("\u00E3");
                        continue;
                    case 2:
                        this.sbp.slice_from("\u00F5");
                        continue;
                    case 3:
                        if (this.sbp.cursor >= this.sbp.limit)
                            break;
                        this.sbp.cursor++;
                        continue;
                }
            }
            break;
        }
    }
    /**
     * Checks if the cursor is within the RV region.
     * @returns A boolean indicating if the cursor is in RV.
     */
    r_RV() {
        return this.I_pV <= this.sbp.cursor;
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
     * @returns A boolean indicating if any changes were made.
     */
    r_standard_suffix() {
        var among_var;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_5, 45);
        if (!among_var)
            return false;
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
                this.sbp.slice_from("log");
                break;
            case 3:
                if (!this.r_R2())
                    return false;
                this.sbp.slice_from("u");
                break;
            case 4:
                if (!this.r_R2())
                    return false;
                this.sbp.slice_from("ente");
                break;
            case 5:
                if (!this.r_R1())
                    return false;
                this.sbp.slice_del();
                this.sbp.ket = this.sbp.cursor;
                among_var = this.sbp.find_among_b(this.a_2, 4);
                if (among_var) {
                    this.sbp.bra = this.sbp.cursor;
                    if (this.r_R2()) {
                        this.sbp.slice_del();
                        if (among_var == 1) {
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
            case 6:
                if (!this.r_R2())
                    return false;
                this.sbp.slice_del();
                this.sbp.ket = this.sbp.cursor;
                among_var = this.sbp.find_among_b(this.a_3, 3);
                if (among_var) {
                    this.sbp.bra = this.sbp.cursor;
                    if (among_var == 1)
                        if (this.r_R2())
                            this.sbp.slice_del();
                }
                break;
            case 7:
                if (!this.r_R2())
                    return false;
                this.sbp.slice_del();
                this.sbp.ket = this.sbp.cursor;
                among_var = this.sbp.find_among_b(this.a_4, 3);
                if (among_var) {
                    this.sbp.bra = this.sbp.cursor;
                    if (among_var == 1)
                        if (this.r_R2())
                            this.sbp.slice_del();
                }
                break;
            case 8:
                if (!this.r_R2())
                    return false;
                this.sbp.slice_del();
                this.sbp.ket = this.sbp.cursor;
                if (this.sbp.eq_s_b(2, "at")) {
                    this.sbp.bra = this.sbp.cursor;
                    if (this.r_R2())
                        this.sbp.slice_del();
                }
                break;
            case 9:
                if (!this.r_RV() || !this.sbp.eq_s_b(1, "e"))
                    return false;
                this.sbp.slice_from("ir");
                break;
        }
        return true;
    }
    /**
     * Removes verb suffixes.
     * @returns A boolean indicating if any changes were made.
     */
    r_verb_suffix() {
        var among_var, v_1;
        if (this.sbp.cursor >= this.I_pV) {
            v_1 = this.sbp.limit_backward;
            this.sbp.limit_backward = this.I_pV;
            this.sbp.ket = this.sbp.cursor;
            among_var = this.sbp.find_among_b(this.a_6, 120);
            if (among_var) {
                this.sbp.bra = this.sbp.cursor;
                if (among_var == 1)
                    this.sbp.slice_del();
                this.sbp.limit_backward = v_1;
                return true;
            }
            this.sbp.limit_backward = v_1;
        }
        return false;
    }
    /**
     * Removes residual suffixes.
     */
    r_residual_suffix() {
        var among_var;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_7, 7);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (among_var == 1)
                if (this.r_RV())
                    this.sbp.slice_del();
        }
    }
    /**
     * Helper method for handling specific character replacements.
     * @param c1 - The first character to check.
     * @param c2 - The second character to check.
     * @returns A boolean indicating the result of the operation.
     */
    habr6(c1, c2) {
        if (this.sbp.eq_s_b(1, c1)) {
            this.sbp.bra = this.sbp.cursor;
            var v_1 = this.sbp.limit - this.sbp.cursor;
            if (this.sbp.eq_s_b(1, c2)) {
                this.sbp.cursor = this.sbp.limit - v_1;
                if (this.r_RV())
                    this.sbp.slice_del();
                return false;
            }
        }
        return true;
    }
    /**
     * Handles residual word forms.
     */
    r_residual_form() {
        var among_var, v_1, v_2, v_3;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_8, 4);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            switch (among_var) {
                case 1:
                    if (this.r_RV()) {
                        this.sbp.slice_del();
                        this.sbp.ket = this.sbp.cursor;
                        v_1 = this.sbp.limit - this.sbp.cursor;
                        if (this.habr6("u", "g"))
                            this.habr6("i", "c");
                    }
                    break;
                case 2:
                    this.sbp.slice_from("c");
                    break;
            }
        }
    }
    /**
     * Main helper method for the stemming process.
     */
    habr1() {
        if (!this.r_standard_suffix()) {
            this.sbp.cursor = this.sbp.limit;
            if (!this.r_verb_suffix()) {
                this.sbp.cursor = this.sbp.limit;
                this.r_residual_suffix();
                return;
            }
        }
        this.sbp.cursor = this.sbp.limit;
        this.sbp.ket = this.sbp.cursor;
        if (this.sbp.eq_s_b(1, "i")) {
            this.sbp.bra = this.sbp.cursor;
            if (this.sbp.eq_s_b(1, "c")) {
                this.sbp.cursor = this.sbp.limit;
                if (this.r_RV())
                    this.sbp.slice_del();
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
        this.habr1();
        this.sbp.cursor = this.sbp.limit;
        this.r_residual_form();
        this.sbp.cursor = this.sbp.limit_backward;
        this.r_postlude();
        return true;
    }
}
exports.PortugueseStemmer = PortugueseStemmer;
