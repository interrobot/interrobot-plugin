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
declare class GermanStemmer extends BaseStemmer {
    protected g_s_ending: number[];
    protected g_st_ending: number[];
    protected I_x: number;
    constructor();
    setCurrent(word: any): void;
    getCurrent(): string;
    habr1(c1: any, c2: any, v_1: any): boolean;
    r_prelude(): void;
    habr2(): boolean;
    r_mark_regions(): void;
    r_postlude(): void;
    r_R1(): boolean;
    r_R2(): boolean;
    r_standard_suffix(): void;
    stem(): boolean;
}
export { GermanStemmer };
