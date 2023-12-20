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
declare class EnglishStemmer extends BaseStemmer {
    constructor();
    r_prelude(): void;
    r_mark_regions(): void;
    habr1(): boolean;
    r_shortv(): boolean;
    r_R1(): boolean;
    r_R2(): boolean;
    r_Step_1a(): void;
    r_Step_1b(): void;
    r_Step_1c(): void;
    r_Step_2(): void;
    r_Step_3(): void;
    r_Step_4(): void;
    r_Step_5(): void;
    r_exception2(): boolean;
    r_exception1(): boolean;
    r_postlude(): void;
    stem(): boolean;
}
export { EnglishStemmer };
