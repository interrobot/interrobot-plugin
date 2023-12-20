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

class FrenchStemmer extends BaseStemmer {
	protected I_pV: number;
	protected g_keep_with_s: number[];

	public constructor() {
		super();

		this.a_0 = [new Among("col", -1, -1), new Among("par", -1, -1),
			new Among("tap", -1, -1)];
		this.a_1 = [new Among("", -1, 4),
			new Among("I", 0, 1), new Among("U", 0, 2), new Among("Y", 0, 3)];
		this.a_2 = [
			new Among("iqU", -1, 3), new Among("abl", -1, 3),
			new Among("I\u00E8r", -1, 4), new Among("i\u00E8r", -1, 4),
			new Among("eus", -1, 2), new Among("iv", -1, 1)];
		this.a_3 = [
			new Among("ic", -1, 2), new Among("abil", -1, 1),
			new Among("iv", -1, 3)];
		this.a_4 = [new Among("iqUe", -1, 1),
			new Among("atrice", -1, 2), new Among("ance", -1, 1),
			new Among("ence", -1, 5), new Among("logie", -1, 3),
			new Among("able", -1, 1), new Among("isme", -1, 1),
			new Among("euse", -1, 11), new Among("iste", -1, 1),
			new Among("ive", -1, 8), new Among("if", -1, 8),
			new Among("usion", -1, 4), new Among("ation", -1, 2),
			new Among("ution", -1, 4), new Among("ateur", -1, 2),
			new Among("iqUes", -1, 1), new Among("atrices", -1, 2),
			new Among("ances", -1, 1), new Among("ences", -1, 5),
			new Among("logies", -1, 3), new Among("ables", -1, 1),
			new Among("ismes", -1, 1), new Among("euses", -1, 11),
			new Among("istes", -1, 1), new Among("ives", -1, 8),
			new Among("ifs", -1, 8), new Among("usions", -1, 4),
			new Among("ations", -1, 2), new Among("utions", -1, 4),
			new Among("ateurs", -1, 2), new Among("ments", -1, 15),
			new Among("ements", 30, 6), new Among("issements", 31, 12),
			new Among("it\u00E9s", -1, 7), new Among("ment", -1, 15),
			new Among("ement", 34, 6), new Among("issement", 35, 12),
			new Among("amment", 34, 13), new Among("emment", 34, 14),
			new Among("aux", -1, 10), new Among("eaux", 39, 9),
			new Among("eux", -1, 1), new Among("it\u00E9", -1, 7)];
		this.a_5 = [
			new Among("ira", -1, 1), new Among("ie", -1, 1),
			new Among("isse", -1, 1), new Among("issante", -1, 1),
			new Among("i", -1, 1), new Among("irai", 4, 1),
			new Among("ir", -1, 1), new Among("iras", -1, 1),
			new Among("ies", -1, 1), new Among("\u00EEmes", -1, 1),
			new Among("isses", -1, 1), new Among("issantes", -1, 1),
			new Among("\u00EEtes", -1, 1), new Among("is", -1, 1),
			new Among("irais", 13, 1), new Among("issais", 13, 1),
			new Among("irions", -1, 1), new Among("issions", -1, 1),
			new Among("irons", -1, 1), new Among("issons", -1, 1),
			new Among("issants", -1, 1), new Among("it", -1, 1),
			new Among("irait", 21, 1), new Among("issait", 21, 1),
			new Among("issant", -1, 1), new Among("iraIent", -1, 1),
			new Among("issaIent", -1, 1), new Among("irent", -1, 1),
			new Among("issent", -1, 1), new Among("iront", -1, 1),
			new Among("\u00EEt", -1, 1), new Among("iriez", -1, 1),
			new Among("issiez", -1, 1), new Among("irez", -1, 1),
			new Among("issez", -1, 1)];
		this.a_6 = [new Among("a", -1, 3),
			new Among("era", 0, 2), new Among("asse", -1, 3),
			new Among("ante", -1, 3), new Among("\u00E9e", -1, 2),
			new Among("ai", -1, 3), new Among("erai", 5, 2),
			new Among("er", -1, 2), new Among("as", -1, 3),
			new Among("eras", 8, 2), new Among("\u00E2mes", -1, 3),
			new Among("asses", -1, 3), new Among("antes", -1, 3),
			new Among("\u00E2tes", -1, 3), new Among("\u00E9es", -1, 2),
			new Among("ais", -1, 3), new Among("erais", 15, 2),
			new Among("ions", -1, 1), new Among("erions", 17, 2),
			new Among("assions", 17, 3), new Among("erons", -1, 2),
			new Among("ants", -1, 3), new Among("\u00E9s", -1, 2),
			new Among("ait", -1, 3), new Among("erait", 23, 2),
			new Among("ant", -1, 3), new Among("aIent", -1, 3),
			new Among("eraIent", 26, 2), new Among("\u00E8rent", -1, 2),
			new Among("assent", -1, 3), new Among("eront", -1, 2),
			new Among("\u00E2t", -1, 3), new Among("ez", -1, 2),
			new Among("iez", 32, 2), new Among("eriez", 33, 2),
			new Among("assiez", 33, 3), new Among("erez", 32, 2),
			new Among("\u00E9", -1, 2)];
		this.a_7 = [new Among("e", -1, 3),
			new Among("I\u00E8re", 0, 2), new Among("i\u00E8re", 0, 2),
			new Among("ion", -1, 1), new Among("Ier", -1, 2),
			new Among("ier", -1, 2), new Among("\u00EB", -1, 4)]; this.a_8 = [
			new Among("ell", -1, -1), new Among("eill", -1, -1),
			new Among("enn", -1, -1), new Among("onn", -1, -1),
			new Among("ett", -1, -1)];
		this.g_v = [17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128, 130, 103, 8, 5];
		this.g_keep_with_s = [1, 65, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128];
	}

	public setCurrent(word): void {
		this.sbp.setCurrent(word);
	};
	public getCurrent() : string{
		return this.sbp.getCurrent();
	};
	public habr1(c1, c2, v_1): boolean {
		if (this.sbp.eq_s(1, c1)) {
			this.sbp.ket = this.sbp.cursor;
			if (this.sbp.in_grouping(this.g_v, 97, 251)) {
				this.sbp.slice_from(c2);
				this.sbp.cursor = v_1;
				return true;
			}
		}
		return false;
	}
	public habr2(c1, c2, v_1): boolean {
		if (this.sbp.eq_s(1, c1)) {
			this.sbp.ket = this.sbp.cursor;
			this.sbp.slice_from(c2);
			this.sbp.cursor = v_1;
			return true;
		}
		return false;
	}
	public r_prelude(): void {
		let v_1, v_2;
		while (true) {
			v_1 = this.sbp.cursor;
			if (this.sbp.in_grouping(this.g_v, 97, 251)) {
				this.sbp.bra = this.sbp.cursor;
				v_2 = this.sbp.cursor;
				if (this.habr1("u", "U", v_1))
					continue;
				this.sbp.cursor = v_2;
				if (this.habr1("i", "I", v_1))
					continue;
				this.sbp.cursor = v_2;
				if (this.habr2("y", "Y", v_1))
					continue;
			}
			this.sbp.cursor = v_1;
			this.sbp.bra = v_1;
			if (!this.habr1("y", "Y", v_1)) {
				this.sbp.cursor = v_1;
				if (this.sbp.eq_s(1, "q")) {
					this.sbp.bra = this.sbp.cursor;
					if (this.habr2("u", "U", v_1))
						continue;
				}
				this.sbp.cursor = v_1;
				if (v_1 >= this.sbp.limit)
					return;
				this.sbp.cursor++;
			}
		}
	}
	public habr3(): boolean {
		while (!this.sbp.in_grouping(this.g_v, 97, 251)) {
			if (this.sbp.cursor >= this.sbp.limit)
				return true;
			this.sbp.cursor++;
		}
		while (!this.sbp.out_grouping(this.g_v, 97, 251)) {
			if (this.sbp.cursor >= this.sbp.limit)
				return true;
			this.sbp.cursor++;
		}
		return false;
	}
	public r_mark_regions(): void {
		var v_1 = this.sbp.cursor;
		this.I_pV = this.sbp.limit;
		this.I_p1 = this.I_pV;
		this.I_p2 = this.I_pV;
		if (this.sbp.in_grouping(this.g_v, 97, 251) && this.sbp.in_grouping(this.g_v, 97, 251)
				&& this.sbp.cursor < this.sbp.limit)
			this.sbp.cursor++;
		else {
			this.sbp.cursor = v_1;
			if (!this.sbp.find_among(this.a_0, 3)) {
				this.sbp.cursor = v_1;
				do {
					if (this.sbp.cursor >= this.sbp.limit) {
						this.sbp.cursor = this.I_pV;
						break;
					}
					this.sbp.cursor++;
				} while (!this.sbp.in_grouping(this.g_v, 97, 251));
			}
		}
		this.I_pV = this.sbp.cursor;
		this.sbp.cursor = v_1;
		if (!this.habr3()) {
			this.I_p1 = this.sbp.cursor;
			if (!this.habr3())
				this.I_p2 = this.sbp.cursor;
		}
	}
	public r_postlude(): void {
		var among_var, v_1;
		while (true) {
			v_1 = this.sbp.cursor;
			this.sbp.bra = v_1;
			among_var = this.sbp.find_among(this.a_1, 4);
			if (!among_var)
				break;
			this.sbp.ket = this.sbp.cursor;
			switch (among_var) {
				case 1 :
					this.sbp.slice_from("i");
					break;
				case 2 :
					this.sbp.slice_from("u");
					break;
				case 3 :
					this.sbp.slice_from("y");
					break;
				case 4 :
					if (this.sbp.cursor >= this.sbp.limit)
						return;
					this.sbp.cursor++;
					break;
			}
		}
	}
	public r_RV() {
		return this.I_pV <= this.sbp.cursor;
	}
	public r_R1() {
		return this.I_p1 <= this.sbp.cursor;
	}
	public r_R2() {
		return this.I_p2 <= this.sbp.cursor;
	}
	public r_standard_suffix() {
		let among_var: number;
		let v_1: number;
		this.sbp.ket = this.sbp.cursor;
		among_var = this.sbp.find_among_b(this.a_4, 43);
		if (among_var) {
			this.sbp.bra = this.sbp.cursor;
			switch (among_var) {
				case 1 :
					if (!this.r_R2())
						return false;
					this.sbp.slice_del();
					break;
				case 2 :
					if (!this.r_R2())
						return false;
					this.sbp.slice_del();
					this.sbp.ket = this.sbp.cursor;
					if (this.sbp.eq_s_b(2, "ic")) {
						this.sbp.bra = this.sbp.cursor;
						if (!this.r_R2())
							this.sbp.slice_from("iqU");
						else
							this.sbp.slice_del();
					}
					break;
				case 3 :
					if (!this.r_R2())
						return false;
					this.sbp.slice_from("log");
					break;
				case 4 :
					if (!this.r_R2())
						return false;
					this.sbp.slice_from("u");
					break;
				case 5 :
					if (!this.r_R2())
						return false;
					this.sbp.slice_from("ent");
					break;
				case 6 :
					if (!this.r_RV())
						return false;
					this.sbp.slice_del();
					this.sbp.ket = this.sbp.cursor;
					among_var = this.sbp.find_among_b(this.a_2, 6);
					if (among_var) {
						this.sbp.bra = this.sbp.cursor;
						switch (among_var) {
							case 1 :
								if (this.r_R2()) {
									this.sbp.slice_del();
									this.sbp.ket = this.sbp.cursor;
									if (this.sbp.eq_s_b(2, "at")) {
										this.sbp.bra = this.sbp.cursor;
										if (this.r_R2())
											this.sbp.slice_del();
									}
								}
								break;
							case 2 :
								if (this.r_R2())
									this.sbp.slice_del();
								else if (this.r_R1())
									this.sbp.slice_from("eux");
								break;
							case 3 :
								if (this.r_R2())
									this.sbp.slice_del();
								break;
							case 4 :
								if (this.r_RV())
									this.sbp.slice_from("i");
								break;
						}
					}
					break;
				case 7 :
					if (!this.r_R2())
						return false;
					this.sbp.slice_del();
					this.sbp.ket = this.sbp.cursor;
					among_var = this.sbp.find_among_b(this.a_3, 3);
					if (among_var) {
						this.sbp.bra = this.sbp.cursor;
						switch (among_var) {
							case 1 :
								if (this.r_R2())
									this.sbp.slice_del();
								else
									this.sbp.slice_from("abl");
								break;
							case 2 :
								if (this.r_R2())
									this.sbp.slice_del();
								else
									this.sbp.slice_from("iqU");
								break;
							case 3 :
								if (this.r_R2())
									this.sbp.slice_del();
								break;
						}
					}
					break;
				case 8 :
					if (!this.r_R2())
						return false;
					this.sbp.slice_del();
					this.sbp.ket = this.sbp.cursor;
					if (this.sbp.eq_s_b(2, "at")) {
						this.sbp.bra = this.sbp.cursor;
						if (this.r_R2()) {
							this.sbp.slice_del();
							this.sbp.ket = this.sbp.cursor;
							if (this.sbp.eq_s_b(2, "ic")) {
								this.sbp.bra = this.sbp.cursor;
								if (this.r_R2())
									this.sbp.slice_del();
								else
									this.sbp.slice_from("iqU");
								break;
							}
						}
					}
					break;
				case 9 :
					this.sbp.slice_from("eau");
					break;
				case 10 :
					if (!this.r_R1())
						return false;
					this.sbp.slice_from("al");
					break;
				case 11 :
					if (this.r_R2())
						this.sbp.slice_del();
					else if (!this.r_R1())
						return false;
					else
						this.sbp.slice_from("eux");
					break;
				case 12 :
					if (!this.r_R1() || !this.sbp.out_grouping_b(this.g_v, 97, 251))
						return false;
					this.sbp.slice_del();
					break;
				case 13 :
					if (this.r_RV())
						this.sbp.slice_from("ant");
					return false;
				case 14 :
					if (this.r_RV())
						this.sbp.slice_from("ent");
					return false;
				case 15 :
					v_1 = this.sbp.limit - this.sbp.cursor;
					if (this.sbp.in_grouping_b(this.g_v, 97, 251) && this.r_RV()) {
						this.sbp.cursor = this.sbp.limit - v_1;
						this.sbp.slice_del();
					}
					return false;
			}
			return true;
		}
		return false;
	}

	public r_i_verb_suffix() {
		var among_var, v_1;
		if (this.sbp.cursor < this.I_pV)
			return false;
		v_1 = this.sbp.limit_backward;
		this.sbp.limit_backward = this.I_pV;
		this.sbp.ket = this.sbp.cursor;
		among_var = this.sbp.find_among_b(this.a_5, 35);
		if (!among_var) {
			this.sbp.limit_backward = v_1;
			return false;
		}
		this.sbp.bra = this.sbp.cursor;
		if (among_var == 1) {
			if (!this.sbp.out_grouping_b(this.g_v, 97, 251)) {
				this.sbp.limit_backward = v_1;
				return false;
			}
			this.sbp.slice_del();
		}
		this.sbp.limit_backward = v_1;
		return true;
	}

	public r_verb_suffix() {
		var among_var, v_2, v_3;
		if (this.sbp.cursor < this.I_pV)
			return false;
		v_2 = this.sbp.limit_backward;
		this.sbp.limit_backward = this.I_pV;
		this.sbp.ket = this.sbp.cursor;
		among_var = this.sbp.find_among_b(this.a_6, 38);
		if (!among_var) {
			this.sbp.limit_backward = v_2;
			return false;
		}
		this.sbp.bra = this.sbp.cursor;
		switch (among_var) {
			case 1 :
				if (!this.r_R2()) {
					this.sbp.limit_backward = v_2;
					return false;
				}
				this.sbp.slice_del();
				break;
			case 2 :
				this.sbp.slice_del();
				break;
			case 3 :
				this.sbp.slice_del();
				v_3 = this.sbp.limit - this.sbp.cursor;
				this.sbp.ket = this.sbp.cursor;
				if (this.sbp.eq_s_b(1, "e")) {
					this.sbp.bra = this.sbp.cursor;
					this.sbp.slice_del();
				} else
					this.sbp.cursor = this.sbp.limit - v_3;
				break;
		}
		this.sbp.limit_backward = v_2;
		return true;
	}

	public r_residual_suffix() {
		var among_var, v_1 = this.sbp.limit - this.sbp.cursor, v_2, v_4, v_5;
		this.sbp.ket = this.sbp.cursor;
		if (this.sbp.eq_s_b(1, "s")) {
			this.sbp.bra = this.sbp.cursor;
			v_2 = this.sbp.limit - this.sbp.cursor;
			if (this.sbp.out_grouping_b(this.g_keep_with_s, 97, 232)) {
				this.sbp.cursor = this.sbp.limit - v_2;
				this.sbp.slice_del();
			} else
				this.sbp.cursor = this.sbp.limit - v_1;
		} else
			this.sbp.cursor = this.sbp.limit - v_1;
		if (this.sbp.cursor >= this.I_pV) {
			v_4 = this.sbp.limit_backward;
			this.sbp.limit_backward = this.I_pV;
			this.sbp.ket = this.sbp.cursor;
			among_var = this.sbp.find_among_b(this.a_7, 7);
			if (among_var) {
				this.sbp.bra = this.sbp.cursor;
				switch (among_var) {
					case 1 :
						if (this.r_R2()) {
							v_5 = this.sbp.limit - this.sbp.cursor;
							if (!this.sbp.eq_s_b(1, "s")) {
								this.sbp.cursor = this.sbp.limit - v_5;
								if (!this.sbp.eq_s_b(1, "t"))
									break;
							}
							this.sbp.slice_del();
						}
						break;
					case 2 :
						this.sbp.slice_from("i");
						break;
					case 3 :
						this.sbp.slice_del();
						break;
					case 4 :
						if (this.sbp.eq_s_b(2, "gu"))
							this.sbp.slice_del();
						break;
				}
			}
			this.sbp.limit_backward = v_4;
		}
	}

	public r_un_double() {
		var v_1 = this.sbp.limit - this.sbp.cursor;
		if (this.sbp.find_among_b(this.a_8, 5)) {
			this.sbp.cursor = this.sbp.limit - v_1;
			this.sbp.ket = this.sbp.cursor;
			if (this.sbp.cursor > this.sbp.limit_backward) {
				this.sbp.cursor--;
				this.sbp.bra = this.sbp.cursor;
				this.sbp.slice_del();
			}
		}
	}

	public r_un_accent() {
		var v_1, v_2 = 1;
		while (this.sbp.out_grouping_b(this.g_v, 97, 251))
			v_2--;
		if (v_2 <= 0) {
			this.sbp.ket = this.sbp.cursor;
			v_1 = this.sbp.limit - this.sbp.cursor;
			if (!this.sbp.eq_s_b(1, "\u00E9")) {
				this.sbp.cursor = this.sbp.limit - v_1;
				if (!this.sbp.eq_s_b(1, "\u00E8"))
					return;
			}
			this.sbp.bra = this.sbp.cursor;
			this.sbp.slice_from("e");
		}
	}

	public habr5() {
		if (!this.r_standard_suffix()) {
			this.sbp.cursor = this.sbp.limit;
			if (!this.r_i_verb_suffix()) {
				this.sbp.cursor = this.sbp.limit;
				if (!this.r_verb_suffix()) {
					this.sbp.cursor = this.sbp.limit;
					this.r_residual_suffix();
					return;
				}
			}
		}
		this.sbp.cursor = this.sbp.limit;
		this.sbp.ket = this.sbp.cursor;
		if (this.sbp.eq_s_b(1, "Y")) {
			this.sbp.bra = this.sbp.cursor;
			this.sbp.slice_from("i");
		} else {
			this.sbp.cursor = this.sbp.limit;
			if (this.sbp.eq_s_b(1, "\u00E7")) {
				this.sbp.bra = this.sbp.cursor;
				this.sbp.slice_from("c");
			}
		}
	}

	public stem() {
		var v_1 = this.sbp.cursor;
		this.r_prelude();
		this.sbp.cursor = v_1;
		this.r_mark_regions();
		this.sbp.limit_backward = v_1;
		this.sbp.cursor = this.sbp.limit;
		this.habr5();
		this.sbp.cursor = this.sbp.limit;
		this.r_un_double();
		this.sbp.cursor = this.sbp.limit;
		this.r_un_accent();
		this.sbp.cursor = this.sbp.limit_backward;
		this.r_postlude();
		return true;
	}
}

export { FrenchStemmer };
