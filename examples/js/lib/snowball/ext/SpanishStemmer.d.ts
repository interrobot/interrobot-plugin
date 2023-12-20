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
declare class SpanishStemmer extends BaseStemmer {
    protected I_pV: number;
    constructor();
    habr1(): boolean;
    habr2(): boolean;
    habr3(): void;
    habr4(): boolean;
    r_mark_regions(): void;
    r_postlude(): void;
    r_RV(): boolean;
    r_R1(): boolean;
    r_R2(): boolean;
    r_attached_pronoun(): void;
    habr5(a: any, n: any): boolean;
    habr6(c1: any): boolean;
    r_standard_suffix(): boolean;
    r_y_verb_suffix(): boolean;
    r_verb_suffix(): void;
    r_residual_suffix(): void;
    stem: () => boolean;
}
export { SpanishStemmer };
