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
class PortugueseStemmer extends BaseStemmer {
    I_pV;
    constructor() {
        super();
        this.a_0 = [new Among("", -1, 3), new Among("\u00E3", 0, 1),
            new Among("\u00F5", 0, 2)];
        this.a_1 = [new Among("", -1, 3),
            new Among("a~", 0, 1), new Among("o~", 0, 2)];
        this.a_2 = [
            new Among("ic", -1, -1), new Among("ad", -1, -1),
            new Among("os", -1, -1), new Among("iv", -1, 1)
        ];
        this.a_3 = [
            new Among("ante", -1, 1), new Among("avel", -1, 1),
            new Among("\u00EDvel", -1, 1)
        ];
        this.a_4 = [new Among("ic", -1, 1),
            new Among("abil", -1, 1), new Among("iv", -1, 1)];
        this.a_5 = [
            new Among("ica", -1, 1), new Among("\u00E2ncia", -1, 1),
            new Among("\u00EAncia", -1, 4), new Among("ira", -1, 9),
            new Among("adora", -1, 1), new Among("osa", -1, 1),
            new Among("ista", -1, 1), new Among("iva", -1, 8),
            new Among("eza", -1, 1), new Among("log\u00EDa", -1, 2),
            new Among("idade", -1, 7), new Among("ante", -1, 1),
            new Among("mente", -1, 6), new Among("amente", 12, 5),
            new Among("\u00E1vel", -1, 1), new Among("\u00EDvel", -1, 1),
            new Among("uci\u00F3n", -1, 3), new Among("ico", -1, 1),
            new Among("ismo", -1, 1), new Among("oso", -1, 1),
            new Among("amento", -1, 1), new Among("imento", -1, 1),
            new Among("ivo", -1, 8), new Among("a\u00E7a~o", -1, 1),
            new Among("ador", -1, 1), new Among("icas", -1, 1),
            new Among("\u00EAncias", -1, 4), new Among("iras", -1, 9),
            new Among("adoras", -1, 1), new Among("osas", -1, 1),
            new Among("istas", -1, 1), new Among("ivas", -1, 8),
            new Among("ezas", -1, 1), new Among("log\u00EDas", -1, 2),
            new Among("idades", -1, 7), new Among("uciones", -1, 3),
            new Among("adores", -1, 1), new Among("antes", -1, 1),
            new Among("a\u00E7o~es", -1, 1), new Among("icos", -1, 1),
            new Among("ismos", -1, 1), new Among("osos", -1, 1),
            new Among("amentos", -1, 1), new Among("imentos", -1, 1),
            new Among("ivos", -1, 8)
        ];
        this.a_6 = [new Among("ada", -1, 1),
            new Among("ida", -1, 1), new Among("ia", -1, 1),
            new Among("aria", 2, 1), new Among("eria", 2, 1),
            new Among("iria", 2, 1), new Among("ara", -1, 1),
            new Among("era", -1, 1), new Among("ira", -1, 1),
            new Among("ava", -1, 1), new Among("asse", -1, 1),
            new Among("esse", -1, 1), new Among("isse", -1, 1),
            new Among("aste", -1, 1), new Among("este", -1, 1),
            new Among("iste", -1, 1), new Among("ei", -1, 1),
            new Among("arei", 16, 1), new Among("erei", 16, 1),
            new Among("irei", 16, 1), new Among("am", -1, 1),
            new Among("iam", 20, 1), new Among("ariam", 21, 1),
            new Among("eriam", 21, 1), new Among("iriam", 21, 1),
            new Among("aram", 20, 1), new Among("eram", 20, 1),
            new Among("iram", 20, 1), new Among("avam", 20, 1),
            new Among("em", -1, 1), new Among("arem", 29, 1),
            new Among("erem", 29, 1), new Among("irem", 29, 1),
            new Among("assem", 29, 1), new Among("essem", 29, 1),
            new Among("issem", 29, 1), new Among("ado", -1, 1),
            new Among("ido", -1, 1), new Among("ando", -1, 1),
            new Among("endo", -1, 1), new Among("indo", -1, 1),
            new Among("ara~o", -1, 1), new Among("era~o", -1, 1),
            new Among("ira~o", -1, 1), new Among("ar", -1, 1),
            new Among("er", -1, 1), new Among("ir", -1, 1),
            new Among("as", -1, 1), new Among("adas", 47, 1),
            new Among("idas", 47, 1), new Among("ias", 47, 1),
            new Among("arias", 50, 1), new Among("erias", 50, 1),
            new Among("irias", 50, 1), new Among("aras", 47, 1),
            new Among("eras", 47, 1), new Among("iras", 47, 1),
            new Among("avas", 47, 1), new Among("es", -1, 1),
            new Among("ardes", 58, 1), new Among("erdes", 58, 1),
            new Among("irdes", 58, 1), new Among("ares", 58, 1),
            new Among("eres", 58, 1), new Among("ires", 58, 1),
            new Among("asses", 58, 1), new Among("esses", 58, 1),
            new Among("isses", 58, 1), new Among("astes", 58, 1),
            new Among("estes", 58, 1), new Among("istes", 58, 1),
            new Among("is", -1, 1), new Among("ais", 71, 1),
            new Among("eis", 71, 1), new Among("areis", 73, 1),
            new Among("ereis", 73, 1), new Among("ireis", 73, 1),
            new Among("\u00E1reis", 73, 1), new Among("\u00E9reis", 73, 1),
            new Among("\u00EDreis", 73, 1), new Among("\u00E1sseis", 73, 1),
            new Among("\u00E9sseis", 73, 1), new Among("\u00EDsseis", 73, 1),
            new Among("\u00E1veis", 73, 1), new Among("\u00EDeis", 73, 1),
            new Among("ar\u00EDeis", 84, 1), new Among("er\u00EDeis", 84, 1),
            new Among("ir\u00EDeis", 84, 1), new Among("ados", -1, 1),
            new Among("idos", -1, 1), new Among("amos", -1, 1),
            new Among("\u00E1ramos", 90, 1), new Among("\u00E9ramos", 90, 1),
            new Among("\u00EDramos", 90, 1), new Among("\u00E1vamos", 90, 1),
            new Among("\u00EDamos", 90, 1), new Among("ar\u00EDamos", 95, 1),
            new Among("er\u00EDamos", 95, 1), new Among("ir\u00EDamos", 95, 1),
            new Among("emos", -1, 1), new Among("aremos", 99, 1),
            new Among("eremos", 99, 1), new Among("iremos", 99, 1),
            new Among("\u00E1ssemos", 99, 1), new Among("\u00EAssemos", 99, 1),
            new Among("\u00EDssemos", 99, 1), new Among("imos", -1, 1),
            new Among("armos", -1, 1), new Among("ermos", -1, 1),
            new Among("irmos", -1, 1), new Among("\u00E1mos", -1, 1),
            new Among("ar\u00E1s", -1, 1), new Among("er\u00E1s", -1, 1),
            new Among("ir\u00E1s", -1, 1), new Among("eu", -1, 1),
            new Among("iu", -1, 1), new Among("ou", -1, 1),
            new Among("ar\u00E1", -1, 1), new Among("er\u00E1", -1, 1),
            new Among("ir\u00E1", -1, 1)];
        this.a_7 = [new Among("a", -1, 1),
            new Among("i", -1, 1), new Among("o", -1, 1),
            new Among("os", -1, 1), new Among("\u00E1", -1, 1),
            new Among("\u00ED", -1, 1), new Among("\u00F3", -1, 1)];
        this.a_8 = [
            new Among("e", -1, 1), new Among("\u00E7", -1, 2),
            new Among("\u00E9", -1, 1), new Among("\u00EA", -1, 1)
        ];
        this.g_v = [17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 19, 12, 2];
        // , I_p2, I_p1, this.I_pV
    }
    setCurrent(word) {
        this.sbp.setCurrent(word);
    }
    ;
    getCurrent() {
        return this.sbp.getCurrent();
    }
    ;
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
export { PortugueseStemmer };
