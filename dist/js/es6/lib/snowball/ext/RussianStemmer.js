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
 * Implements the Snowball stemming algorithm for the Russian language.
 */
class RussianStemmer extends BaseStemmer {
    /**
     * Initializes a new instance of the RussianStemmer class.
     */
    constructor() {
        super();
        this.a_0 = [new Among("\u0432", -1, 1), new Among("\u0438\u0432", 0, 2),
            new Among("\u044B\u0432", 0, 2),
            new Among("\u0432\u0448\u0438", -1, 1),
            new Among("\u0438\u0432\u0448\u0438", 3, 2),
            new Among("\u044B\u0432\u0448\u0438", 3, 2),
            new Among("\u0432\u0448\u0438\u0441\u044C", -1, 1),
            new Among("\u0438\u0432\u0448\u0438\u0441\u044C", 6, 2),
            new Among("\u044B\u0432\u0448\u0438\u0441\u044C", 6, 2)];
        this.a_1 = [
            new Among("\u0435\u0435", -1, 1), new Among("\u0438\u0435", -1, 1),
            new Among("\u043E\u0435", -1, 1), new Among("\u044B\u0435", -1, 1),
            new Among("\u0438\u043C\u0438", -1, 1),
            new Among("\u044B\u043C\u0438", -1, 1),
            new Among("\u0435\u0439", -1, 1), new Among("\u0438\u0439", -1, 1),
            new Among("\u043E\u0439", -1, 1), new Among("\u044B\u0439", -1, 1),
            new Among("\u0435\u043C", -1, 1), new Among("\u0438\u043C", -1, 1),
            new Among("\u043E\u043C", -1, 1), new Among("\u044B\u043C", -1, 1),
            new Among("\u0435\u0433\u043E", -1, 1),
            new Among("\u043E\u0433\u043E", -1, 1),
            new Among("\u0435\u043C\u0443", -1, 1),
            new Among("\u043E\u043C\u0443", -1, 1),
            new Among("\u0438\u0445", -1, 1), new Among("\u044B\u0445", -1, 1),
            new Among("\u0435\u044E", -1, 1), new Among("\u043E\u044E", -1, 1),
            new Among("\u0443\u044E", -1, 1), new Among("\u044E\u044E", -1, 1),
            new Among("\u0430\u044F", -1, 1), new Among("\u044F\u044F", -1, 1)
        ];
        this.a_2 = [
            new Among("\u0435\u043C", -1, 1), new Among("\u043D\u043D", -1, 1),
            new Among("\u0432\u0448", -1, 1),
            new Among("\u0438\u0432\u0448", 2, 2),
            new Among("\u044B\u0432\u0448", 2, 2), new Among("\u0449", -1, 1),
            new Among("\u044E\u0449", 5, 1),
            new Among("\u0443\u044E\u0449", 6, 2)
        ];
        this.a_3 = [
            new Among("\u0441\u044C", -1, 1), new Among("\u0441\u044F", -1, 1)
        ];
        this.a_4 = [
            new Among("\u043B\u0430", -1, 1),
            new Among("\u0438\u043B\u0430", 0, 2),
            new Among("\u044B\u043B\u0430", 0, 2),
            new Among("\u043D\u0430", -1, 1),
            new Among("\u0435\u043D\u0430", 3, 2),
            new Among("\u0435\u0442\u0435", -1, 1),
            new Among("\u0438\u0442\u0435", -1, 2),
            new Among("\u0439\u0442\u0435", -1, 1),
            new Among("\u0435\u0439\u0442\u0435", 7, 2),
            new Among("\u0443\u0439\u0442\u0435", 7, 2),
            new Among("\u043B\u0438", -1, 1),
            new Among("\u0438\u043B\u0438", 10, 2),
            new Among("\u044B\u043B\u0438", 10, 2), new Among("\u0439", -1, 1),
            new Among("\u0435\u0439", 13, 2), new Among("\u0443\u0439", 13, 2),
            new Among("\u043B", -1, 1), new Among("\u0438\u043B", 16, 2),
            new Among("\u044B\u043B", 16, 2), new Among("\u0435\u043C", -1, 1),
            new Among("\u0438\u043C", -1, 2), new Among("\u044B\u043C", -1, 2),
            new Among("\u043D", -1, 1), new Among("\u0435\u043D", 22, 2),
            new Among("\u043B\u043E", -1, 1),
            new Among("\u0438\u043B\u043E", 24, 2),
            new Among("\u044B\u043B\u043E", 24, 2),
            new Among("\u043D\u043E", -1, 1),
            new Among("\u0435\u043D\u043E", 27, 2),
            new Among("\u043D\u043D\u043E", 27, 1),
            new Among("\u0435\u0442", -1, 1),
            new Among("\u0443\u0435\u0442", 30, 2),
            new Among("\u0438\u0442", -1, 2), new Among("\u044B\u0442", -1, 2),
            new Among("\u044E\u0442", -1, 1),
            new Among("\u0443\u044E\u0442", 34, 2),
            new Among("\u044F\u0442", -1, 2), new Among("\u043D\u044B", -1, 1),
            new Among("\u0435\u043D\u044B", 37, 2),
            new Among("\u0442\u044C", -1, 1),
            new Among("\u0438\u0442\u044C", 39, 2),
            new Among("\u044B\u0442\u044C", 39, 2),
            new Among("\u0435\u0448\u044C", -1, 1),
            new Among("\u0438\u0448\u044C", -1, 2), new Among("\u044E", -1, 2),
            new Among("\u0443\u044E", 44, 2)
        ];
        this.a_5 = [
            new Among("\u0430", -1, 1), new Among("\u0435\u0432", -1, 1),
            new Among("\u043E\u0432", -1, 1), new Among("\u0435", -1, 1),
            new Among("\u0438\u0435", 3, 1), new Among("\u044C\u0435", 3, 1),
            new Among("\u0438", -1, 1), new Among("\u0435\u0438", 6, 1),
            new Among("\u0438\u0438", 6, 1),
            new Among("\u0430\u043C\u0438", 6, 1),
            new Among("\u044F\u043C\u0438", 6, 1),
            new Among("\u0438\u044F\u043C\u0438", 10, 1),
            new Among("\u0439", -1, 1), new Among("\u0435\u0439", 12, 1),
            new Among("\u0438\u0435\u0439", 13, 1),
            new Among("\u0438\u0439", 12, 1), new Among("\u043E\u0439", 12, 1),
            new Among("\u0430\u043C", -1, 1), new Among("\u0435\u043C", -1, 1),
            new Among("\u0438\u0435\u043C", 18, 1),
            new Among("\u043E\u043C", -1, 1), new Among("\u044F\u043C", -1, 1),
            new Among("\u0438\u044F\u043C", 21, 1), new Among("\u043E", -1, 1),
            new Among("\u0443", -1, 1), new Among("\u0430\u0445", -1, 1),
            new Among("\u044F\u0445", -1, 1),
            new Among("\u0438\u044F\u0445", 26, 1), new Among("\u044B", -1, 1),
            new Among("\u044C", -1, 1), new Among("\u044E", -1, 1),
            new Among("\u0438\u044E", 30, 1), new Among("\u044C\u044E", 30, 1),
            new Among("\u044F", -1, 1), new Among("\u0438\u044F", 33, 1),
            new Among("\u044C\u044F", 33, 1)
        ];
        this.a_6 = [
            new Among("\u043E\u0441\u0442", -1, 1),
            new Among("\u043E\u0441\u0442\u044C", -1, 1)
        ];
        this.a_7 = [
            new Among("\u0435\u0439\u0448\u0435", -1, 1),
            new Among("\u043D", -1, 2), new Among("\u0435\u0439\u0448", -1, 1),
            new Among("\u044C", -1, 3)
        ];
        this.g_v = [33, 65, 8, 232];
        //, I_p2, I_pV,
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
     * Helper method for r_mark_regions.
     * @returns A boolean indicating the result of the operation.
     */
    habr3() {
        while (!this.sbp.in_grouping(this.g_v, 1072, 1103)) {
            if (this.sbp.cursor >= this.sbp.limit)
                return false;
            this.sbp.cursor++;
        }
        return true;
    }
    /**
     * Helper method for r_mark_regions.
     * @returns A boolean indicating the result of the operation.
     */
    habr4() {
        while (!this.sbp.out_grouping(this.g_v, 1072, 1103)) {
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
        this.I_pV = this.sbp.limit;
        this.I_p2 = this.I_pV;
        if (this.habr3()) {
            this.I_pV = this.sbp.cursor;
            if (this.habr4())
                if (this.habr3())
                    if (this.habr4())
                        this.I_p2 = this.sbp.cursor;
        }
    }
    /**
     * Checks if the cursor is within the R2 region.
     * @returns A boolean indicating if the cursor is in R2.
     */
    r_R2() {
        return this.I_p2 <= this.sbp.cursor;
    }
    /**
     * Helper method for various stemming steps.
     * @param a - The array of Among objects to search.
     * @param n - The number of Among objects in the array.
     * @returns A boolean indicating the result of the operation.
     */
    habr2(a, n) {
        var among_var, v_1;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(a, n);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            switch (among_var) {
                case 1:
                    v_1 = this.sbp.limit - this.sbp.cursor;
                    if (!this.sbp.eq_s_b(1, "\u0430")) {
                        this.sbp.cursor = this.sbp.limit - v_1;
                        if (!this.sbp.eq_s_b(1, "\u044F"))
                            return false;
                    }
                case 2:
                    this.sbp.slice_del();
                    break;
            }
            return true;
        }
        return false;
    }
    /**
     * Handles perfective gerund suffixes.
     * @returns A boolean indicating if any changes were made.
     */
    r_perfective_gerund() {
        return this.habr2(this.a_0, 9);
    }
    /**
     * Another helper method for various stemming steps.
     * @param a - The array of Among objects to search.
     * @param n - The number of Among objects in the array.
     * @returns A boolean indicating the result of the operation.
     */
    habr1(a, n) {
        var among_var;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(a, n);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (among_var == 1)
                this.sbp.slice_del();
            return true;
        }
        return false;
    }
    /**
     * Handles adjective suffixes.
     * @returns A boolean indicating if any changes were made.
     */
    r_adjective() {
        return this.habr1(this.a_1, 26);
    }
    /**
     * Handles adjectival suffixes.
     * @returns A boolean indicating if any changes were made.
     */
    r_adjectival() {
        var among_var;
        if (this.r_adjective()) {
            this.habr2(this.a_2, 8);
            return true;
        }
        return false;
    }
    /**
     * Handles reflexive suffixes.
     * @returns A boolean indicating if any changes were made.
     */
    r_reflexive() {
        return this.habr1(this.a_3, 2);
    }
    /**
     * Handles verb suffixes.
     * @returns A boolean indicating if any changes were made.
     */
    r_verb() {
        return this.habr2(this.a_4, 46);
    }
    // TODO is this right?, maybe return it instead?
    /**
     * Handles noun suffixes.
     */
    r_noun() {
        this.habr1(this.a_5, 36);
    }
    /**
     * Handles derivational suffixes.
     */
    r_derivational() {
        var among_var;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_6, 2);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            if (this.r_R2() && among_var == 1)
                this.sbp.slice_del();
        }
    }
    /**
     * Performs final cleanup steps on the stem.
     */
    r_tidy_up() {
        var among_var;
        this.sbp.ket = this.sbp.cursor;
        among_var = this.sbp.find_among_b(this.a_7, 4);
        if (among_var) {
            this.sbp.bra = this.sbp.cursor;
            switch (among_var) {
                case 1:
                    this.sbp.slice_del();
                    this.sbp.ket = this.sbp.cursor;
                    if (!this.sbp.eq_s_b(1, "\u043D"))
                        break;
                    this.sbp.bra = this.sbp.cursor;
                case 2:
                    if (!this.sbp.eq_s_b(1, "\u043D"))
                        break;
                case 3:
                    this.sbp.slice_del();
                    break;
            }
        }
    }
    /**
     * Stems the current word.
     * @returns A boolean indicating if stemming was successful.
     */
    stem() {
        this.r_mark_regions();
        this.sbp.cursor = this.sbp.limit;
        if (this.sbp.cursor < this.I_pV)
            return false;
        this.sbp.limit_backward = this.I_pV;
        if (!this.r_perfective_gerund()) {
            this.sbp.cursor = this.sbp.limit;
            if (!this.r_reflexive())
                this.sbp.cursor = this.sbp.limit;
            if (!this.r_adjectival()) {
                this.sbp.cursor = this.sbp.limit;
                if (!this.r_verb()) {
                    this.sbp.cursor = this.sbp.limit;
                    this.r_noun();
                }
            }
        }
        this.sbp.cursor = this.sbp.limit;
        this.sbp.ket = this.sbp.cursor;
        if (this.sbp.eq_s_b(1, "\u0438")) {
            this.sbp.bra = this.sbp.cursor;
            this.sbp.slice_del();
        }
        else
            this.sbp.cursor = this.sbp.limit;
        this.r_derivational();
        this.sbp.cursor = this.sbp.limit;
        this.r_tidy_up();
        return true;
    }
}
export { RussianStemmer };
