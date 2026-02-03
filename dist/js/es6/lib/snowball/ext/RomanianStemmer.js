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
 * Implements the Snowball stemming algorithm for the Romanian language.
 */
class RomanianStemmer extends BaseStemmer {
    /**
     * Initializes a new instance of the RomanianStemmer class.
     */
    constructor() {
        super();
        this.a_0 = [new Among("", -1, 3), new Among("I", 0, 1), new Among("U", 0, 2)];
        this.a_1 = [
            new Among("ea", -1, 3), new Among("a\u0163ia", -1, 7),
            new Among("aua", -1, 2), new Among("iua", -1, 4),
            new Among("a\u0163ie", -1, 7), new Among("ele", -1, 3),
            new Among("ile", -1, 5), new Among("iile", 6, 4),
            new Among("iei", -1, 4), new Among("atei", -1, 6),
            new Among("ii", -1, 4), new Among("ului", -1, 1),
            new Among("ul", -1, 1), new Among("elor", -1, 3),
            new Among("ilor", -1, 4), new Among("iilor", 14, 4)
        ];
        this.a_2 = [
            new Among("icala", -1, 4), new Among("iciva", -1, 4),
            new Among("ativa", -1, 5), new Among("itiva", -1, 6),
            new Among("icale", -1, 4), new Among("a\u0163iune", -1, 5),
            new Among("i\u0163iune", -1, 6), new Among("atoare", -1, 5),
            new Among("itoare", -1, 6), new Among("\u0103toare", -1, 5),
            new Among("icitate", -1, 4), new Among("abilitate", -1, 1),
            new Among("ibilitate", -1, 2), new Among("ivitate", -1, 3),
            new Among("icive", -1, 4), new Among("ative", -1, 5),
            new Among("itive", -1, 6), new Among("icali", -1, 4),
            new Among("atori", -1, 5), new Among("icatori", 18, 4),
            new Among("itori", -1, 6), new Among("\u0103tori", -1, 5),
            new Among("icitati", -1, 4), new Among("abilitati", -1, 1),
            new Among("ivitati", -1, 3), new Among("icivi", -1, 4),
            new Among("ativi", -1, 5), new Among("itivi", -1, 6),
            new Among("icit\u0103i", -1, 4), new Among("abilit\u0103i", -1, 1),
            new Among("ivit\u0103i", -1, 3),
            new Among("icit\u0103\u0163i", -1, 4),
            new Among("abilit\u0103\u0163i", -1, 1),
            new Among("ivit\u0103\u0163i", -1, 3), new Among("ical", -1, 4),
            new Among("ator", -1, 5), new Among("icator", 35, 4),
            new Among("itor", -1, 6), new Among("\u0103tor", -1, 5),
            new Among("iciv", -1, 4), new Among("ativ", -1, 5),
            new Among("itiv", -1, 6), new Among("ical\u0103", -1, 4),
            new Among("iciv\u0103", -1, 4), new Among("ativ\u0103", -1, 5),
            new Among("itiv\u0103", -1, 6)
        ];
        this.a_3 = [new Among("ica", -1, 1),
            new Among("abila", -1, 1), new Among("ibila", -1, 1),
            new Among("oasa", -1, 1), new Among("ata", -1, 1),
            new Among("ita", -1, 1), new Among("anta", -1, 1),
            new Among("ista", -1, 3), new Among("uta", -1, 1),
            new Among("iva", -1, 1), new Among("ic", -1, 1),
            new Among("ice", -1, 1), new Among("abile", -1, 1),
            new Among("ibile", -1, 1), new Among("isme", -1, 3),
            new Among("iune", -1, 2), new Among("oase", -1, 1),
            new Among("ate", -1, 1), new Among("itate", 17, 1),
            new Among("ite", -1, 1), new Among("ante", -1, 1),
            new Among("iste", -1, 3), new Among("ute", -1, 1),
            new Among("ive", -1, 1), new Among("ici", -1, 1),
            new Among("abili", -1, 1), new Among("ibili", -1, 1),
            new Among("iuni", -1, 2), new Among("atori", -1, 1),
            new Among("osi", -1, 1), new Among("ati", -1, 1),
            new Among("itati", 30, 1), new Among("iti", -1, 1),
            new Among("anti", -1, 1), new Among("isti", -1, 3),
            new Among("uti", -1, 1), new Among("i\u015Fti", -1, 3),
            new Among("ivi", -1, 1), new Among("it\u0103i", -1, 1),
            new Among("o\u015Fi", -1, 1), new Among("it\u0103\u0163i", -1, 1),
            new Among("abil", -1, 1), new Among("ibil", -1, 1),
            new Among("ism", -1, 3), new Among("ator", -1, 1),
            new Among("os", -1, 1), new Among("at", -1, 1),
            new Among("it", -1, 1), new Among("ant", -1, 1),
            new Among("ist", -1, 3), new Among("ut", -1, 1),
            new Among("iv", -1, 1), new Among("ic\u0103", -1, 1),
            new Among("abil\u0103", -1, 1), new Among("ibil\u0103", -1, 1),
            new Among("oas\u0103", -1, 1), new Among("at\u0103", -1, 1),
            new Among("it\u0103", -1, 1), new Among("ant\u0103", -1, 1),
            new Among("ist\u0103", -1, 3), new Among("ut\u0103", -1, 1),
            new Among("iv\u0103", -1, 1)];
        this.a_4 = [new Among("ea", -1, 1),
            new Among("ia", -1, 1), new Among("esc", -1, 1),
            new Among("\u0103sc", -1, 1), new Among("ind", -1, 1),
            new Among("\u00E2nd", -1, 1), new Among("are", -1, 1),
            new Among("ere", -1, 1), new Among("ire", -1, 1),
            new Among("\u00E2re", -1, 1), new Among("se", -1, 2),
            new Among("ase", 10, 1), new Among("sese", 10, 2),
            new Among("ise", 10, 1), new Among("use", 10, 1),
            new Among("\u00E2se", 10, 1), new Among("e\u015Fte", -1, 1),
            new Among("\u0103\u015Fte", -1, 1), new Among("eze", -1, 1),
            new Among("ai", -1, 1), new Among("eai", 19, 1),
            new Among("iai", 19, 1), new Among("sei", -1, 2),
            new Among("e\u015Fti", -1, 1), new Among("\u0103\u015Fti", -1, 1),
            new Among("ui", -1, 1), new Among("ezi", -1, 1),
            new Among("\u00E2i", -1, 1), new Among("a\u015Fi", -1, 1),
            new Among("se\u015Fi", -1, 2), new Among("ase\u015Fi", 29, 1),
            new Among("sese\u015Fi", 29, 2), new Among("ise\u015Fi", 29, 1),
            new Among("use\u015Fi", 29, 1),
            new Among("\u00E2se\u015Fi", 29, 1), new Among("i\u015Fi", -1, 1),
            new Among("u\u015Fi", -1, 1), new Among("\u00E2\u015Fi", -1, 1),
            new Among("a\u0163i", -1, 2), new Among("ea\u0163i", 38, 1),
            new Among("ia\u0163i", 38, 1), new Among("e\u0163i", -1, 2),
            new Among("i\u0163i", -1, 2), new Among("\u00E2\u0163i", -1, 2),
            new Among("ar\u0103\u0163i", -1, 1),
            new Among("ser\u0103\u0163i", -1, 2),
            new Among("aser\u0103\u0163i", 45, 1),
            new Among("seser\u0103\u0163i", 45, 2),
            new Among("iser\u0103\u0163i", 45, 1),
            new Among("user\u0103\u0163i", 45, 1),
            new Among("\u00E2ser\u0103\u0163i", 45, 1),
            new Among("ir\u0103\u0163i", -1, 1),
            new Among("ur\u0103\u0163i", -1, 1),
            new Among("\u00E2r\u0103\u0163i", -1, 1), new Among("am", -1, 1),
            new Among("eam", 54, 1), new Among("iam", 54, 1),
            new Among("em", -1, 2), new Among("asem", 57, 1),
            new Among("sesem", 57, 2), new Among("isem", 57, 1),
            new Among("usem", 57, 1), new Among("\u00E2sem", 57, 1),
            new Among("im", -1, 2), new Among("\u00E2m", -1, 2),
            new Among("\u0103m", -1, 2), new Among("ar\u0103m", 65, 1),
            new Among("ser\u0103m", 65, 2), new Among("aser\u0103m", 67, 1),
            new Among("seser\u0103m", 67, 2), new Among("iser\u0103m", 67, 1),
            new Among("user\u0103m", 67, 1),
            new Among("\u00E2ser\u0103m", 67, 1),
            new Among("ir\u0103m", 65, 1), new Among("ur\u0103m", 65, 1),
            new Among("\u00E2r\u0103m", 65, 1), new Among("au", -1, 1),
            new Among("eau", 76, 1), new Among("iau", 76, 1),
            new Among("indu", -1, 1), new Among("\u00E2ndu", -1, 1),
            new Among("ez", -1, 1), new Among("easc\u0103", -1, 1),
            new Among("ar\u0103", -1, 1), new Among("ser\u0103", -1, 2),
            new Among("aser\u0103", 84, 1), new Among("seser\u0103", 84, 2),
            new Among("iser\u0103", 84, 1), new Among("user\u0103", 84, 1),
            new Among("\u00E2ser\u0103", 84, 1), new Among("ir\u0103", -1, 1),
            new Among("ur\u0103", -1, 1), new Among("\u00E2r\u0103", -1, 1),
            new Among("eaz\u0103", -1, 1)];
        this.a_5 = [new Among("a", -1, 1),
            new Among("e", -1, 1), new Among("ie", 1, 1),
            new Among("i", -1, 1), new Among("\u0103", -1, 1)];
        this.g_v = [17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 32, 0, 0, 4];
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
     * Helper method for r_prelude.
     * @param c1 - The character to check.
     * @param c2 - The replacement character.
     */
    habr1(c1, c2) {
        if (this.sbp.eq_s(1, c1)) {
            this.sbp.ket = this.sbp.cursor;
            if (this.sbp.in_grouping(this.g_v, 97, 259))
                this.sbp.slice_from(c2);
        }
    }
    /**
     * Performs the prelude step of the stemming algorithm.
     */
    r_prelude() {
        var v_1, v_2;
        while (true) {
            v_1 = this.sbp.cursor;
            if (this.sbp.in_grouping(this.g_v, 97, 259)) {
                v_2 = this.sbp.cursor;
                this.sbp.bra = v_2;
                this.habr1("u", "U");
                this.sbp.cursor = v_2;
                this.habr1("i", "I");
            }
            this.sbp.cursor = v_1;
            if (this.sbp.cursor >= this.sbp.limit) {
                break;
            }
            this.sbp.cursor++;
        }
    }
    /**
     * Helper method for r_mark_regions.
     * @returns A boolean indicating the result of the operation.
     */
    habr2() {
        if (this.sbp.out_grouping(this.g_v, 97, 259)) {
            while (!this.sbp.in_grouping(this.g_v, 97, 259)) {
                if (this.sbp.cursor >= this.sbp.limit)
                    return true;
                this.sbp.cursor++;
            }
            return false;
        }
        return true;
    }
    /**
     * Helper method for r_mark_regions.
     * @returns A boolean indicating the result of the operation.
     */
    habr3() {
        if (this.sbp.in_grouping(this.g_v, 97, 259)) {
            while (!this.sbp.out_grouping(this.g_v, 97, 259)) {
                if (this.sbp.cursor >= this.sbp.limit)
                    return true;
                this.sbp.cursor++;
            }
        }
        return false;
    }
    /**
     * Helper method for r_mark_regions.
     */
    habr4() {
        var v_1 = this.sbp.cursor, v_2, v_3;
        if (this.sbp.in_grouping(this.g_v, 97, 259)) {
            v_2 = this.sbp.cursor;
            if (this.habr2()) {
                this.sbp.cursor = v_2;
                if (!this.habr3()) {
                    this.I_pV = this.sbp.cursor;
                    return;
                }
            }
            else {
                this.I_pV = this.sbp.cursor;
                return;
            }
        }
        this.sbp.cursor = v_1;
        if (this.sbp.out_grouping(this.g_v, 97, 259)) {
            v_3 = this.sbp.cursor;
            if (this.habr2()) {
                this.sbp.cursor = v_3;
                if (this.sbp.in_grouping(this.g_v, 97, 259) && this.sbp.cursor < this.sbp.limit)
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
        while (!this.sbp.in_grouping(this.g_v, 97, 259)) {
            if (this.sbp.cursor >= this.sbp.limit)
                return false;
            this.sbp.cursor++;
        }
        while (!this.sbp.out_grouping(this.g_v, 97, 259)) {
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
            among_var = this.sbp.find_among(this.a_0, 3);
            if (among_var) {
                this.sbp.ket = this.sbp.cursor;
                switch (among_var) {
                    case 1:
                        this.sbp.slice_from("i");
                        continue;
                    case 2:
                        this.sbp.slice_from("u");
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
     * Performs step 0 of the stemming algorithm.
     */
    r_step_0() {
        var among_var, v_1;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_1, 16);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R1()) {
                switch (among_var) {
                    case 1:
                        this.sbp.slice_del();
                        break;
                    case 2:
                        this.sbp.slice_from("a");
                        break;
                    case 3:
                        this.sbp.slice_from("e");
                        break;
                    case 4:
                        this.sbp.slice_from("i");
                        break;
                    case 5:
                        v_1 = this.sbp.limit - this.sbp.cursor;
                        if (!this.sbp.eq_s_b(2, "ab")) {
                            this.sbp.cursor = this.sbp.limit - v_1;
                            this.sbp.slice_from("i");
                        }
                        break;
                    case 6:
                        this.sbp.slice_from("at");
                        break;
                    case 7:
                        this.sbp.slice_from("a\u0163i");
                        break;
                }
            }
        }
    }
    /**
     * Handles combination suffixes.
     * @returns A boolean indicating if any changes were made.
     */
    r_combo_suffix() {
        var among_var, v_1 = this.sbp.limit - this.sbp.cursor;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_2, 46);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R1()) {
                switch (among_var) {
                    case 1:
                        this.sbp.slice_from("abil");
                        break;
                    case 2:
                        this.sbp.slice_from("ibil");
                        break;
                    case 3:
                        this.sbp.slice_from("iv");
                        break;
                    case 4:
                        this.sbp.slice_from("ic");
                        break;
                    case 5:
                        this.sbp.slice_from("at");
                        break;
                    case 6:
                        this.sbp.slice_from("it");
                        break;
                }
                this.B_standard_suffix_removed = true;
                this.sbp.cursor = this.sbp.limit - v_1;
                return true;
            }
        }
        return false;
    }
    /**
     * Handles standard suffix removal.
     */
    r_standard_suffix() {
        var among_var, v_1;
        this.B_standard_suffix_removed = false;
        while (true) {
            v_1 = this.sbp.limit - this.sbp.cursor;
            if (!this.r_combo_suffix()) {
                this.sbp.cursor = this.sbp.limit - v_1;
                break;
            }
        }
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_3, 62);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R2()) {
                switch (among_var) {
                    case 1:
                        this.sbp.slice_del();
                        break;
                    case 2:
                        if (this.sbp.eq_s_b(1, "\u0163")) {
                            this.sbp.bra = this.sbp.cursor;
                            this.sbp.slice_from("t");
                        }
                        break;
                    case 3:
                        this.sbp.slice_from("ist");
                        break;
                }
                this.B_standard_suffix_removed = true;
            }
        }
    }
    /**
     * Handles verb suffix removal.
     */
    r_verb_suffix() {
        var among_var, v_1, v_2;
        if (this.sbp.cursor >= this.I_pV) {
            v_1 = this.sbp.limit_backward;
            this.sbp.limit_backward = this.I_pV;
            this.sbp.ket = this.sbp.cursor;
            among_var = this.sbp.find_among_b(this.a_4, 94);
            if (among_var) {
                this.sbp.bra = this.sbp.cursor;
                switch (among_var) {
                    case 1:
                        v_2 = this.sbp.limit - this.sbp.cursor;
                        if (!this.sbp.out_grouping_b(this.g_v, 97, 259)) {
                            this.sbp.cursor = this.sbp.limit - v_2;
                            if (!this.sbp.eq_s_b(1, "u"))
                                break;
                        }
                    case 2:
                        this.sbp.slice_del();
                        break;
                }
            }
            this.sbp.limit_backward = v_1;
        }
    }
    /**
     * Handles vowel suffix removal.
     */
    r_vowel_suffix() {
        var among_var;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_5, 5);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_RV() && among_var == 1)
                this.sbp.slice_del();
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
        this.r_step_0();
        this.sbp.cursor = this.sbp.limit;
        this.r_standard_suffix();
        this.sbp.cursor = this.sbp.limit;
        if (!this.B_standard_suffix_removed) {
            this.sbp.cursor = this.sbp.limit;
            this.r_verb_suffix();
            this.sbp.cursor = this.sbp.limit;
        }
        this.r_vowel_suffix();
        this.sbp.cursor = this.sbp.limit_backward;
        this.r_postlude();
        return true;
    }
}
export { RomanianStemmer };
