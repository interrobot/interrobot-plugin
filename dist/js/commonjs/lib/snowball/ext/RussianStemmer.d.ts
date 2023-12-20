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
declare class RussianStemmer extends BaseStemmer {
    protected I_pV: number;
    constructor();
    setCurrent(word: any): void;
    getCurrent(): string;
    habr3(): boolean;
    habr4(): boolean;
    r_mark_regions(): void;
    r_R2(): boolean;
    habr2(a: any, n: any): boolean;
    r_perfective_gerund(): boolean;
    habr1(a: any, n: any): boolean;
    r_adjective(): boolean;
    r_adjectival(): boolean;
    r_reflexive(): boolean;
    r_verb(): boolean;
    r_noun(): void;
    r_derivational(): void;
    r_tidy_up(): void;
    stem(): boolean;
}
export { RussianStemmer };
