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

class Among {

	public s: number[];
	public s_size: number;
	public substring_i: number;
	public result: any;
	// method was an additional arg in js, but could not find any reference of
	// a 4 arg constructor in any language. leaving for historical value in case
	// anything related blows up
	// private method: any;

	public constructor(s: string, substring_i: number, result) {
		if ((!s && s != "") || (!substring_i && (substring_i != 0)) || !result)
			throw (`Failed 'Among' initialization: s: ${s},  substring_i: ${substring_i}, result: ${result}`);
		this.s = Among.toCharArray(s);
		this.s_size = s.length;
		this.substring_i = substring_i;
		this.result = result;
		// leave this, connects to a removed language feature. may make a comeback
		// this.method = method;
	}

	public static toCharArray(s: string): number[] {
		let sLength: number = s.length;
		const charArr: number[] = new Array(sLength);
		for (let i = 0; i < sLength; i++) {
			charArr[i] = s.charCodeAt(i);
		}
			
		return charArr;
	}
}

export { Among };
