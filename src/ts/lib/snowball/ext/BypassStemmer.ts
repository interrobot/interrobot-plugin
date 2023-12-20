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

class BypassStemmer extends BaseStemmer {

	public constructor() {
		super();
	}

	public stem(): boolean {
		return true;
	}
}

export { BypassStemmer };
