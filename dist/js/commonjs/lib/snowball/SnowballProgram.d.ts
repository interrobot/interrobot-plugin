/*!
 * Snowball Typescript Port 0.1.5
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
import { Among } from "./Among.js";
declare class SnowballProgram {
    bra: number;
    ket: number;
    limit: number;
    cursor: number;
    limit_backward: number;
    current: string;
    constructor();
    setCurrent(word: any): void;
    getCurrent(): string;
    in_grouping(s: any, min: any, max: any): boolean;
    in_grouping_b(s: any, min: any, max: any): boolean;
    out_grouping(s: any, min: any, max: any): boolean;
    out_grouping_b(s: any, min: any, max: any): boolean;
    eq_s(s_size: number, s: string): boolean;
    eq_s_b(s_size: number, s: string): boolean;
    find_among(v: {}, v_size: number): number;
    find_among_b(v: Among[], v_size: number): number;
    private replace_s;
    private slice_check;
    slice_from(s: string): void;
    slice_del(): void;
    insert(c_bra: any, c_ket: any, s: any): void;
    private slice_t;
    private eq_v_b;
}
export { SnowballProgram };
