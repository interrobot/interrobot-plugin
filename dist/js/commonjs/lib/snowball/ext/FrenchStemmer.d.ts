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
declare class FrenchStemmer extends BaseStemmer {
    protected I_pV: number;
    protected g_keep_with_s: number[];
    constructor();
    setCurrent(word: any): void;
    getCurrent(): string;
    habr1(c1: any, c2: any, v_1: any): boolean;
    habr2(c1: any, c2: any, v_1: any): boolean;
    r_prelude(): void;
    habr3(): boolean;
    r_mark_regions(): void;
    r_postlude(): void;
    r_RV(): boolean;
    r_R1(): boolean;
    r_R2(): boolean;
    r_standard_suffix(): boolean;
    r_i_verb_suffix(): boolean;
    r_verb_suffix(): boolean;
    r_residual_suffix(): void;
    r_un_double(): void;
    r_un_accent(): void;
    habr5(): void;
    stem(): boolean;
}
export { FrenchStemmer };
