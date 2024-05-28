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

class SnowballProgram {

	public bra: number;
	public ket: number;
	public limit: number;
	public cursor: number;
	public limit_backward: number;
	public current: string;

	public constructor() {
		this.bra = 0;
		this.ket = 0;
		this.limit = 0;
		this.cursor = 0;
		this.limit_backward = 0;

	}

	public setCurrent(word): void {
		this.current = word;
		this.cursor = 0;
		this.limit = word.length;
		this.limit_backward = 0;
		this.bra = this.cursor;
		this.ket = this.limit;
	}

	public getCurrent(): string {
		var result = this.current;
		this.current = null;
		return result;
	}

	public in_grouping(s, min, max): boolean {
		if (this.cursor < this.limit) {
			var ch = this.current.charCodeAt(this.cursor);
			if (ch <= max && ch >= min) {
				ch -= min;
				if (s[ch >> 3] & (0X1 << (ch & 0X7))) {
					this.cursor++;
					return true;
				}
			}
		}
		return false;
	}

	public in_grouping_b(s, min, max): boolean {
		if (this.cursor > this.limit_backward) {
			var ch = this.current.charCodeAt(this.cursor - 1);
			if (ch <= max && ch >= min) {
				ch -= min;
				if (s[ch >> 3] & (0X1 << (ch & 0X7))) {
					this.cursor--;
					return true;
				}
			}
		}
		return false;
	}

	public out_grouping(s, min, max): boolean {
		if (this.cursor < this.limit) {
			var ch = this.current.charCodeAt(this.cursor);
			if (ch > max || ch < min) {
				this.cursor++;
				return true;
			}
			ch -= min;
			if (!(s[ch >> 3] & (0X1 << (ch & 0X7)))) {
				this.cursor++;
				return true;
			}
		}
		return false;
	}

	public out_grouping_b(s, min, max): boolean {
		if (this.cursor > this.limit_backward) {
			var ch = this.current.charCodeAt(this.cursor - 1);
			if (ch > max || ch < min) {
				this.cursor--;
				return true;
			}
			ch -= min;
			if (!(s[ch >> 3] & (0X1 << (ch & 0X7)))) {
				this.cursor--;
				return true;
			}
		}
		return false;
	}

	public eq_s(s_size: number, s: string): boolean {
		if (this.limit - this.cursor < s_size) {
			return false;
		}
			
		for (let i: number = 0; i < s_size; i++) {
			if (this.current.charCodeAt(this.cursor + i) != s.charCodeAt(i)) {
				return false;
			}
		}	
		this.cursor += s_size;
		return true;
	}

	public eq_s_b(s_size: number, s: string): boolean {
		if (this.cursor === null || this.current === null) {
			console.error(`unhandled error: s: ${s} | size: ${s_size}`);
			return false;
		}
		if (this.cursor - this.limit_backward < s_size) {
			return false;
		}
		for (var i = 0; i < s_size; i++) {
			if (this.current.charCodeAt(this.cursor - s_size + i) != s.charCodeAt(i)) {
				return false;
			}	
		}
			
		this.cursor -= s_size;
		return true;
	}

	public find_among(v: {}, v_size: number): number {
		var i = 0, j = v_size, c = this.cursor, l = this.limit, common_i = 0, common_j = 0, first_key_inspected = false;
		while (true) {
			var k = i + ((j - i) >> 1), diff = 0, common = common_i < common_j
					? common_i
					: common_j, w = v[k];
			for (var i2 = common; i2 < w.s_size; i2++) {
				if (c + common == l) {
					diff = -1;
					break;
				}
				diff = this.current.charCodeAt(c + common) - w.s[i2];
				if (diff) {
					break;
				}	
				common++;
			}
			if (diff < 0) {
				j = k;
				common_j = common;
			} else {
				i = k;
				common_i = common;
			}
			if (j - i <= 1) {
				if (i > 0 || j == i || first_key_inspected)
					break;
				first_key_inspected = true;
			}
		}
		while (true) {
			var w = v[i];
			if (common_i >= w.s_size) {
				this.cursor = c + w.s_size;
				if (w.method) {
					// method() not referenced in any language files
					console.warn(`method is unsupported type`);
				}
				return w.result;
				
				// leaving method handling in for reference (if something breaks)
				// this.cursor = c + w.s_size;
				// if (!w.method)
				// 	return w.result;
				// var res = w.method();
				// this.cursor = c + w.s_size;
				// if (res)
				// 	return w.result;
			}
			i = w.substring_i;
			if (i < 0)
				return 0;
		}
	}

	public find_among_b(v: Among[], v_size: number): number {
		let i: number = 0;
		let j: number = v_size;
		const c: number = this.cursor;
		const lb: number = this.limit_backward;
		let common_i: number = 0;
		let common_j: number = 0;
		let first_key_inspected: boolean = false;

		while (true) {
			let k = i + ((j - i) >> 1);
			let diff = 0;
			let common: number = common_i < common_j ? common_i : common_j;

			let w: Among = v[k];
			
			for (let i2: number = w.s_size - 1 - common; i2 >= 0; i2--) {
				if (c - common == lb) {
					diff = -1;
					break;
				}
				// don't getCurrent(), it'll self nullify, that is the 
				// responsibility of the last-in-line function				
				const current: string = this.current;
				diff = current.charCodeAt(c - 1 - common) - w.s[i2];
				if (diff) {
					break;
				}
				common++;
			}
			if (diff < 0) {
				j = k;
				common_j = common;
			} else {
				i = k;
				common_i = common;
			}
			if (j - i <= 1) {
				if (i > 0 || j == i || first_key_inspected) {
					break;
				}	
				first_key_inspected = true;
			}
		}
		while (true) {
			var w = v[i];
			if (common_i >= w.s_size) {
				this.cursor = c - w.s_size;	
				return w.result;
				// method() not referenced in project languages
				// leaving for historical reference
				// this.cursor = c - w.s_size;				
				// if (!w.method)
				// 	return w.result;
				//  var res = w.method();
				// this.cursor = c - w.s_size;
				// if (res)
				// 	return w.result;
			}
			i = w.substring_i;
			if (i < 0)
				return 0;
		}
	}

	private replace_s(c_bra: number, c_ket: number, s: string): number {
		const adjustment: number = s.length - (c_ket - c_bra);
		const left = this.current.substring(0, c_bra);
		const right = this.current.substring(c_ket);
		this.current = left + s + right;
		this.limit += adjustment;
		if (this.cursor >= c_ket) {
			this.cursor += adjustment;
		} else if (this.cursor > c_bra) {
			this.cursor = c_bra;
		}			
		return adjustment;
	}

	private slice_check(): void {
		if (this.bra < 0 || this.bra > this.ket || this.ket > this.limit
			|| this.limit > this.current.length)
			throw ("faulty slice operation");
	}

	public slice_from(s: string): void {
		this.slice_check();
		this.replace_s(this.bra, this.ket, s);
	}

	public slice_del(): void {
		this.slice_from("");
	}

	public insert(c_bra, c_ket, s): void {
		var adjustment = this.replace_s(c_bra, c_ket, s);
		if (c_bra <= this.bra) {
			this.bra += adjustment;
		}			
		if (c_bra <= this.ket) {
			this.ket += adjustment;
		}			
	}

	private slice_t(): string {
		this.slice_check();
		return this.current.substring(this.bra, this.ket);
	}

	private eq_v_b(s: string): boolean {
		return this.eq_s_b(s.length, s);
	}

}

export { SnowballProgram };
