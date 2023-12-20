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
declare class PortugueseStemmer extends BaseStemmer {
    protected I_pV: number;
    constructor();
    setCurrent(word: any): void;
    getCurrent(): string;
    r_prelude(): void;
    habr2(): boolean;
    habr3(): boolean;
    habr4(): boolean;
    habr5(): boolean;
    r_mark_regions(): void;
    r_postlude(): void;
    r_RV(): boolean;
    r_R1(): boolean;
    r_R2(): boolean;
    r_standard_suffix(): boolean;
    r_verb_suffix(): boolean;
    r_residual_suffix(): void;
    habr6(c1: any, c2: any): boolean;
    r_residual_form(): void;
    habr1(): void;
    stem(): boolean;
}
export { PortugueseStemmer };
