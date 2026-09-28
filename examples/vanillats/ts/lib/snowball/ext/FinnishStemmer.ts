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
import { Among } from "../Among.js";

/**
 * Implements the Snowball stemming algorithm for the Finnish language.
 */
class FinnishStemmer extends BaseStemmer {

	/** Grouping of AEI characters. */
	protected g_AEI: number[];

	/** Grouping of vowels (variant 1). */
	protected g_V1: number[];

	/** Grouping of vowels (variant 2). */
	protected g_V2: number[];

	/** Grouping of particle ending characters. */
	protected g_particle_end: number[];

	/** Flag indicating if an ending was removed. */
	protected B_ending_removed: boolean;

	/** String storage for stemming operations. */
	protected S_x: string;

	/**
	 * Initializes a new instance of the FinnishStemmer class.
	 */
	public constructor() {
		super();

		this.a_0 = [new Among("pa", -1, 1), new Among("sti", -1, 2),
			new Among("kaan", -1, 1), new Among("han", -1, 1),
			new Among("kin", -1, 1), new Among("h\u00E4n", -1, 1),
			new Among("k\u00E4\u00E4n", -1, 1), new Among("ko", -1, 1),
			new Among("p\u00E4", -1, 1), new Among("k\u00F6", -1, 1)];
		this.a_1 = [
			new Among("lla", -1, -1), new Among("na", -1, -1),
			new Among("ssa", -1, -1), new Among("ta", -1, -1),
			new Among("lta", 3, -1), new Among("sta", 3, -1)];
		this.a_2 = [
			new Among("ll\u00E4", -1, -1), new Among("n\u00E4", -1, -1),
			new Among("ss\u00E4", -1, -1), new Among("t\u00E4", -1, -1),
			new Among("lt\u00E4", 3, -1), new Among("st\u00E4", 3, -1)];
		this.a_3 = [
			new Among("lle", -1, -1), new Among("ine", -1, -1)];
		this.a_4 = [
			new Among("nsa", -1, 3), new Among("mme", -1, 3),
			new Among("nne", -1, 3), new Among("ni", -1, 2),
			new Among("si", -1, 1), new Among("an", -1, 4),
			new Among("en", -1, 6), new Among("\u00E4n", -1, 5),
			new Among("ns\u00E4", -1, 3)];
		this.a_5 = [new Among("aa", -1, -1),
			new Among("ee", -1, -1), new Among("ii", -1, -1),
			new Among("oo", -1, -1), new Among("uu", -1, -1),
			new Among("\u00E4\u00E4", -1, -1),
			new Among("\u00F6\u00F6", -1, -1)];
		this.a_6 = [new Among("a", -1, 8),
			new Among("lla", 0, -1), new Among("na", 0, -1),
			new Among("ssa", 0, -1), new Among("ta", 0, -1),
			new Among("lta", 4, -1), new Among("sta", 4, -1),
			new Among("tta", 4, 9), new Among("lle", -1, -1),
			new Among("ine", -1, -1), new Among("ksi", -1, -1),
			new Among("n", -1, 7), new Among("han", 11, 1),
			new Among("den", 11, -1, this.r_VI), new Among("seen", 11, -1, this.r_LONG),
			new Among("hen", 11, 2), new Among("tten", 11, -1, this.r_VI),
			new Among("hin", 11, 3), new Among("siin", 11, -1, this.r_VI),
			new Among("hon", 11, 4), new Among("h\u00E4n", 11, 5),
			new Among("h\u00F6n", 11, 6), new Among("\u00E4", -1, 8),
			new Among("ll\u00E4", 22, -1), new Among("n\u00E4", 22, -1),
			new Among("ss\u00E4", 22, -1), new Among("t\u00E4", 22, -1),
			new Among("lt\u00E4", 26, -1), new Among("st\u00E4", 26, -1),
			new Among("tt\u00E4", 26, 9)];
		this.a_7 = [new Among("eja", -1, -1),
			new Among("mma", -1, 1), new Among("imma", 1, -1),
			new Among("mpa", -1, 1), new Among("impa", 3, -1),
			new Among("mmi", -1, 1), new Among("immi", 5, -1),
			new Among("mpi", -1, 1), new Among("impi", 7, -1),
			new Among("ej\u00E4", -1, -1), new Among("mm\u00E4", -1, 1),
			new Among("imm\u00E4", 10, -1), new Among("mp\u00E4", -1, 1),
			new Among("imp\u00E4", 12, -1)];
		this.a_8 = [new Among("i", -1, -1),
			new Among("j", -1, -1)];
		this.a_9 = [new Among("mma", -1, 1),
			new Among("imma", 0, -1)];

		this.g_AEI = [17, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8];
		this.g_V1 = [17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 32];
		this.g_V2 = [17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 32];
		this.g_particle_end = [17, 97, 24, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 32];
	}

	/**
	 * Sets the current word to be stemmed.
	 * @param word - The word to be stemmed.
	 */
	public setCurrent(word): void {
		this.sbp.setCurrent(word);
	};

	/**
	 * Gets the current stemmed word.
	 * @returns The current stemmed word.
	 */
	public getCurrent(): string {
		return this.sbp.getCurrent();
	};

	/**
	 * Marks regions in the word for the stemming process.
	 */
	public r_mark_regions(): void {
		this.I_p1 = this.sbp.limit;
		this.I_p2 = this.I_p1;
		if (!this.habr1()) {
			this.I_p1 = this.sbp.cursor;
			if (!this.habr1())
				this.I_p2 = this.sbp.cursor;
		}
	}

	/**
	 * Helper method for r_mark_regions.
	 * @returns A boolean indicating the result of the operation.
	 */
	public habr1(): boolean {
		var v_1;
		while (true) {
			v_1 = this.sbp.cursor;
			if (this.sbp.in_grouping(this.g_V1, 97, 246))
				break;
			this.sbp.cursor = v_1;
			if (v_1 >= this.sbp.limit)
				return true;
			this.sbp.cursor++;
		}
		this.sbp.cursor = v_1;
		while (!this.sbp.out_grouping(this.g_V1, 97, 246)) {
			if (this.sbp.cursor >= this.sbp.limit)
				return true;
			this.sbp.cursor++;
		}
		return false;
	}

	/**
	 * Checks if the cursor is within the R2 region.
	 * @returns A boolean indicating if the cursor is in R2.
	 */
	public r_R2(): boolean {
		return this.I_p2 <= this.sbp.cursor;
	}

	/**
	 * Handles particle suffixes.
	 */
	public r_particle_etc(): void {
		var among_var, v_1;
		if (this.sbp.cursor >= this.I_p1) {
			v_1 = this.sbp.limit_backward;
			this.sbp.limit_backward = this.I_p1;
			this.sbp.ket = this.sbp.cursor;
			among_var = this.sbp.find_among_b(this.a_0, 10);
			if (among_var) {
				this.sbp.bra = this.sbp.cursor;
				this.sbp.limit_backward = v_1;
				switch (among_var) {
					case 1:
						if (!this.sbp.in_grouping_b(this.g_particle_end, 97, 246))
							return;
						break;
					case 2:
						if (!this.r_R2())
							return;
						break;
				}
				this.sbp.slice_del();
			} else
				this.sbp.limit_backward = v_1;
		}
	}

	/**
	 * Handles possessive suffixes.
	 */
	public r_possessive(): void {
		var among_var, v_1, v_2;
		if (this.sbp.cursor >= this.I_p1) {
			v_1 = this.sbp.limit_backward;
			this.sbp.limit_backward = this.I_p1;
			this.sbp.ket = this.sbp.cursor;
			among_var = this.sbp.find_among_b(this.a_4, 9);
			if (among_var) {
				this.sbp.bra = this.sbp.cursor;
				this.sbp.limit_backward = v_1;
				switch (among_var) {
					case 1:
						v_2 = this.sbp.limit - this.sbp.cursor;
						if (!this.sbp.eq_s_b(1, "k")) {
							this.sbp.cursor = this.sbp.limit - v_2;
							this.sbp.slice_del();
						}
						break;
					case 2:
						this.sbp.slice_del();
						this.sbp.ket = this.sbp.cursor;
						if (this.sbp.eq_s_b(3, "kse")) {
							this.sbp.bra = this.sbp.cursor;
							this.sbp.slice_from("ksi");
						}
						break;
					case 3:
						this.sbp.slice_del();
						break;
					case 4:
						if (this.sbp.find_among_b(this.a_1, 6))
							this.sbp.slice_del();
						break;
					case 5:
						if (this.sbp.find_among_b(this.a_2, 6))
							this.sbp.slice_del();
						break;
					case 6:
						if (this.sbp.find_among_b(this.a_3, 2))
							this.sbp.slice_del();
						break;
				}
			} else
				this.sbp.limit_backward = v_1;
		}
	}

	/**
	 * Checks for long vowel patterns.
	 * @returns A boolean indicating if a long vowel pattern was found.
	 */
	public r_LONG(): boolean {
		return this.sbp.find_among_b(this.a_5, 7) > 0;
	}

	/**
	 * Checks for 'i' followed by a vowel.
	 * @returns A boolean indicating if the pattern was found.
	 */
	public r_VI(): boolean {
		return this.sbp.eq_s_b(1, "i") && this.sbp.in_grouping_b(this.g_V2, 97, 246);
	}

	/**
	 * Handles case ending suffixes.
	 */
	public r_case_ending(): void {
		var among_var, v_1, v_2;
		if (this.sbp.cursor >= this.I_p1) {
			v_1 = this.sbp.limit_backward;
			this.sbp.limit_backward = this.I_p1;
			this.sbp.ket = this.sbp.cursor;
			among_var = this.sbp.find_among_b(this.a_6, 30);
			if (among_var) {
				this.sbp.bra = this.sbp.cursor;
				this.sbp.limit_backward = v_1;
				switch (among_var) {
					case 1:
						if (!this.sbp.eq_s_b(1, "a"))
							return;
						break;
					case 2:
					case 9:
						if (!this.sbp.eq_s_b(1, "e"))
							return;
						break;
					case 3:
						if (!this.sbp.eq_s_b(1, "i"))
							return;
						break;
					case 4:
						if (!this.sbp.eq_s_b(1, "o"))
							return;
						break;
					case 5:
						if (!this.sbp.eq_s_b(1, "\u00E4"))
							return;
						break;
					case 6:
						if (!this.sbp.eq_s_b(1, "\u00F6"))
							return;
						break;
					case 7:
						v_2 = this.sbp.limit - this.sbp.cursor;
						if (!this.r_LONG()) {
							this.sbp.cursor = this.sbp.limit - v_2;
							if (!this.sbp.eq_s_b(2, "ie")) {
								this.sbp.cursor = this.sbp.limit - v_2;
								break;
							}
						}
						this.sbp.cursor = this.sbp.limit - v_2;
						if (this.sbp.cursor <= this.sbp.limit_backward) {
							this.sbp.cursor = this.sbp.limit - v_2;
							break;
						}
						this.sbp.cursor--;
						this.sbp.bra = this.sbp.cursor;
						break;
					case 8:
						if (!this.sbp.in_grouping_b(this.g_V1, 97, 246)
							|| !this.sbp.out_grouping_b(this.g_V1, 97, 246))
							return;
						break;
				}
				this.sbp.slice_del();
				this.B_ending_removed = true;
			} else
				this.sbp.limit_backward = v_1;
		}
	}

	/**
	 * Handles other ending suffixes.
	 */
	public r_other_endings(): void {
		var among_var, v_1, v_2;
		if (this.sbp.cursor >= this.I_p2) {
			v_1 = this.sbp.limit_backward;
			this.sbp.limit_backward = this.I_p2;
			this.sbp.ket = this.sbp.cursor;
			among_var = this.sbp.find_among_b(this.a_7, 14);
			if (among_var) {
				this.sbp.bra = this.sbp.cursor;
				this.sbp.limit_backward = v_1;
				if (among_var == 1) {
					v_2 = this.sbp.limit - this.sbp.cursor;
					if (this.sbp.eq_s_b(2, "po"))
						return;
					this.sbp.cursor = this.sbp.limit - v_2;
				}
				this.sbp.slice_del();
			} else
				this.sbp.limit_backward = v_1;
		}
	}

	/**
	 * Handles plural 'i' suffix.
	 */
	public r_i_plural(): void {
		var v_1;
		if (this.sbp.cursor >= this.I_p1) {
			v_1 = this.sbp.limit_backward;
			this.sbp.limit_backward = this.I_p1;
			this.sbp.ket = this.sbp.cursor;
			if (this.sbp.find_among_b(this.a_8, 2)) {
				this.sbp.bra = this.sbp.cursor;
				this.sbp.limit_backward = v_1;
				this.sbp.slice_del();
			} else
				this.sbp.limit_backward = v_1;
		}
	}

	/**
	 * Handles plural 't' suffix.
	 */
	public r_t_plural(): void {
		var among_var, v_1, v_2, v_3, v_4, v_5;
		if (this.sbp.cursor >= this.I_p1) {
			v_1 = this.sbp.limit_backward;
			this.sbp.limit_backward = this.I_p1;
			this.sbp.ket = this.sbp.cursor;
			if (this.sbp.eq_s_b(1, "t")) {
				this.sbp.bra = this.sbp.cursor;
				v_2 = this.sbp.limit - this.sbp.cursor;
				if (this.sbp.in_grouping_b(this.g_V1, 97, 246)) {
					this.sbp.cursor = this.sbp.limit - v_2;
					this.sbp.slice_del();
					this.sbp.limit_backward = v_1;
					v_3 = this.sbp.limit - this.sbp.cursor;
					if (this.sbp.cursor >= this.I_p2) {
						this.sbp.cursor = this.I_p2;
						v_4 = this.sbp.limit_backward;
						this.sbp.limit_backward = this.sbp.cursor;
						this.sbp.cursor = this.sbp.limit - v_3;
						this.sbp.ket = this.sbp.cursor;
						among_var = this.sbp.find_among_b(this.a_9, 2);
						if (among_var) {
							this.sbp.bra = this.sbp.cursor;
							this.sbp.limit_backward = v_4;
							if (among_var == 1) {
								v_5 = this.sbp.limit - this.sbp.cursor;
								if (this.sbp.eq_s_b(2, "po"))
									return;
								this.sbp.cursor = this.sbp.limit - v_5;
							}
							this.sbp.slice_del();
							return;
						}
					}
				}
			}
			this.sbp.limit_backward = v_1;
		}
	}

	/**
	 * Performs final cleanup steps on the stem.
	 */
	public r_tidy(): void {
		var v_1, v_2, v_3, v_4;
		if (this.sbp.cursor >= this.I_p1) {
			v_1 = this.sbp.limit_backward;
			this.sbp.limit_backward = this.I_p1;
			v_2 = this.sbp.limit - this.sbp.cursor;
			if (this.r_LONG()) {
				this.sbp.cursor = this.sbp.limit - v_2;
				this.sbp.ket = this.sbp.cursor;
				if (this.sbp.cursor > this.sbp.limit_backward) {
					this.sbp.cursor--;
					this.sbp.bra = this.sbp.cursor;
					this.sbp.slice_del();
				}
			}
			this.sbp.cursor = this.sbp.limit - v_2;
			this.sbp.ket = this.sbp.cursor;
			if (this.sbp.in_grouping_b(this.g_AEI, 97, 228)) {
				this.sbp.bra = this.sbp.cursor;
				if (this.sbp.out_grouping_b(this.g_V1, 97, 246))
					this.sbp.slice_del();
			}
			this.sbp.cursor = this.sbp.limit - v_2;
			this.sbp.ket = this.sbp.cursor;
			if (this.sbp.eq_s_b(1, "j")) {
				this.sbp.bra = this.sbp.cursor;
				v_3 = this.sbp.limit - this.sbp.cursor;
				if (!this.sbp.eq_s_b(1, "o")) {
					this.sbp.cursor = this.sbp.limit - v_3;
					if (this.sbp.eq_s_b(1, "u"))
						this.sbp.slice_del();
				} else
					this.sbp.slice_del();
			}
			this.sbp.cursor = this.sbp.limit - v_2;
			this.sbp.ket = this.sbp.cursor;
			if (this.sbp.eq_s_b(1, "o")) {
				this.sbp.bra = this.sbp.cursor;
				if (this.sbp.eq_s_b(1, "j"))
					this.sbp.slice_del();
			}
			this.sbp.cursor = this.sbp.limit - v_2;
			this.sbp.limit_backward = v_1;
			while (true) {
				v_4 = this.sbp.limit - this.sbp.cursor;
				if (this.sbp.out_grouping_b(this.g_V1, 97, 246)) {
					this.sbp.cursor = this.sbp.limit - v_4;
					break;
				}
				this.sbp.cursor = this.sbp.limit - v_4;
				if (this.sbp.cursor <= this.sbp.limit_backward)
					return;
				this.sbp.cursor--;
			}
			this.sbp.ket = this.sbp.cursor;
			if (this.sbp.cursor > this.sbp.limit_backward) {
				this.sbp.cursor--;
				this.sbp.bra = this.sbp.cursor;
				this.S_x = this.sbp.slice_to();
				if (this.sbp.eq_v_b(this.S_x))
					this.sbp.slice_del();
			}
		}
	}

	/**
	 * Stems the current word.
	 * @returns A boolean indicating if stemming was successful.
	 */
	public stem(): boolean {
		var v_1 = this.sbp.cursor;
		this.r_mark_regions();
		this.B_ending_removed = false;
		this.sbp.limit_backward = v_1;
		this.sbp.cursor = this.sbp.limit;
		this.r_particle_etc();
		this.sbp.cursor = this.sbp.limit;
		this.r_possessive();
		this.sbp.cursor = this.sbp.limit;
		this.r_case_ending();
		this.sbp.cursor = this.sbp.limit;
		this.r_other_endings();
		this.sbp.cursor = this.sbp.limit;
		if (this.B_ending_removed) {
			this.r_i_plural();
			this.sbp.cursor = this.sbp.limit;
		} else {
			this.sbp.cursor = this.sbp.limit;
			this.r_t_plural();
			this.sbp.cursor = this.sbp.limit;
		}
		this.r_tidy();
		return true;
	}
}

export { FinnishStemmer };