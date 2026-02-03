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
 * Implements the Snowball stemming algorithm for the Italian language.
 */
class ItalianStemmer extends BaseStemmer {

	/** Grouping of AEIO vowels. */
	protected g_AEIO: number[];

	/** Grouping of CG characters. */
	protected g_CG: number[];

	/** Position marker for the beginning of the word's ending. */
	protected I_pV: number;

	/**
	 * Initializes a new instance of the ItalianStemmer class.
	 */
	public constructor() {
		super();

		this.a_0 = [new Among("", -1, 7), new Among("qu", 0, 6),
			new Among("\u00E1", 0, 1), new Among("\u00E9", 0, 2),
			new Among("\u00ED", 0, 3), new Among("\u00F3", 0, 4),
			new Among("\u00FA", 0, 5)];
		this.a_1 = [new Among("", -1, 3),
			new Among("I", 0, 1), new Among("U", 0, 2)];
		this.a_2 = [
			new Among("la", -1, -1), new Among("cela", 0, -1),
			new Among("gliela", 0, -1), new Among("mela", 0, -1),
			new Among("tela", 0, -1), new Among("vela", 0, -1),
			new Among("le", -1, -1), new Among("cele", 6, -1),
			new Among("gliele", 6, -1), new Among("mele", 6, -1),
			new Among("tele", 6, -1), new Among("vele", 6, -1),
			new Among("ne", -1, -1), new Among("cene", 12, -1),
			new Among("gliene", 12, -1), new Among("mene", 12, -1),
			new Among("sene", 12, -1), new Among("tene", 12, -1),
			new Among("vene", 12, -1), new Among("ci", -1, -1),
			new Among("li", -1, -1), new Among("celi", 20, -1),
			new Among("glieli", 20, -1), new Among("meli", 20, -1),
			new Among("teli", 20, -1), new Among("veli", 20, -1),
			new Among("gli", 20, -1), new Among("mi", -1, -1),
			new Among("si", -1, -1), new Among("ti", -1, -1),
			new Among("vi", -1, -1), new Among("lo", -1, -1),
			new Among("celo", 31, -1), new Among("glielo", 31, -1),
			new Among("melo", 31, -1), new Among("telo", 31, -1),
			new Among("velo", 31, -1)];
		this.a_3 = [new Among("ando", -1, 1),
			new Among("endo", -1, 1), new Among("ar", -1, 2),
			new Among("er", -1, 2), new Among("ir", -1, 2)];
		this.a_4 = [
			new Among("ic", -1, -1), new Among("abil", -1, -1),
			new Among("os", -1, -1), new Among("iv", -1, 1)];
		this.a_5 = [
			new Among("ic", -1, 1), new Among("abil", -1, 1),
			new Among("iv", -1, 1)];
		this.a_6 = [new Among("ica", -1, 1),
			new Among("logia", -1, 3), new Among("osa", -1, 1),
			new Among("ista", -1, 1), new Among("iva", -1, 9),
			new Among("anza", -1, 1), new Among("enza", -1, 5),
			new Among("ice", -1, 1), new Among("atrice", 7, 1),
			new Among("iche", -1, 1), new Among("logie", -1, 3),
			new Among("abile", -1, 1), new Among("ibile", -1, 1),
			new Among("usione", -1, 4), new Among("azione", -1, 2),
			new Among("uzione", -1, 4), new Among("atore", -1, 2),
			new Among("ose", -1, 1), new Among("ante", -1, 1),
			new Among("mente", -1, 1), new Among("amente", 19, 7),
			new Among("iste", -1, 1), new Among("ive", -1, 9),
			new Among("anze", -1, 1), new Among("enze", -1, 5),
			new Among("ici", -1, 1), new Among("atrici", 25, 1),
			new Among("ichi", -1, 1), new Among("abili", -1, 1),
			new Among("ibili", -1, 1), new Among("ismi", -1, 1),
			new Among("usioni", -1, 4), new Among("azioni", -1, 2),
			new Among("uzioni", -1, 4), new Among("atori", -1, 2),
			new Among("osi", -1, 1), new Among("anti", -1, 1),
			new Among("amenti", -1, 6), new Among("imenti", -1, 6),
			new Among("isti", -1, 1), new Among("ivi", -1, 9),
			new Among("ico", -1, 1), new Among("ismo", -1, 1),
			new Among("oso", -1, 1), new Among("amento", -1, 6),
			new Among("imento", -1, 6), new Among("ivo", -1, 9),
			new Among("it\u00E0", -1, 8), new Among("ist\u00E0", -1, 1),
			new Among("ist\u00E8", -1, 1), new Among("ist\u00EC", -1, 1)];
		this.a_7 = [
			new Among("isca", -1, 1), new Among("enda", -1, 1),
			new Among("ata", -1, 1), new Among("ita", -1, 1),
			new Among("uta", -1, 1), new Among("ava", -1, 1),
			new Among("eva", -1, 1), new Among("iva", -1, 1),
			new Among("erebbe", -1, 1), new Among("irebbe", -1, 1),
			new Among("isce", -1, 1), new Among("ende", -1, 1),
			new Among("are", -1, 1), new Among("ere", -1, 1),
			new Among("ire", -1, 1), new Among("asse", -1, 1),
			new Among("ate", -1, 1), new Among("avate", 16, 1),
			new Among("evate", 16, 1), new Among("ivate", 16, 1),
			new Among("ete", -1, 1), new Among("erete", 20, 1),
			new Among("irete", 20, 1), new Among("ite", -1, 1),
			new Among("ereste", -1, 1), new Among("ireste", -1, 1),
			new Among("ute", -1, 1), new Among("erai", -1, 1),
			new Among("irai", -1, 1), new Among("isci", -1, 1),
			new Among("endi", -1, 1), new Among("erei", -1, 1),
			new Among("irei", -1, 1), new Among("assi", -1, 1),
			new Among("ati", -1, 1), new Among("iti", -1, 1),
			new Among("eresti", -1, 1), new Among("iresti", -1, 1),
			new Among("uti", -1, 1), new Among("avi", -1, 1),
			new Among("evi", -1, 1), new Among("ivi", -1, 1),
			new Among("isco", -1, 1), new Among("ando", -1, 1),
			new Among("endo", -1, 1), new Among("Yamo", -1, 1),
			new Among("iamo", -1, 1), new Among("avamo", -1, 1),
			new Among("evamo", -1, 1), new Among("ivamo", -1, 1),
			new Among("eremo", -1, 1), new Among("iremo", -1, 1),
			new Among("assimo", -1, 1), new Among("ammo", -1, 1),
			new Among("emmo", -1, 1), new Among("eremmo", 54, 1),
			new Among("iremmo", 54, 1), new Among("immo", -1, 1),
			new Among("ano", -1, 1), new Among("iscano", 58, 1),
			new Among("avano", 58, 1), new Among("evano", 58, 1),
			new Among("ivano", 58, 1), new Among("eranno", -1, 1),
			new Among("iranno", -1, 1), new Among("ono", -1, 1),
			new Among("iscono", 65, 1), new Among("arono", 65, 1),
			new Among("erono", 65, 1), new Among("irono", 65, 1),
			new Among("erebbero", -1, 1), new Among("irebbero", -1, 1),
			new Among("assero", -1, 1), new Among("essero", -1, 1),
			new Among("issero", -1, 1), new Among("ato", -1, 1),
			new Among("ito", -1, 1), new Among("uto", -1, 1),
			new Among("avo", -1, 1), new Among("evo", -1, 1),
			new Among("ivo", -1, 1), new Among("ar", -1, 1),
			new Among("ir", -1, 1), new Among("er\u00E0", -1, 1),
			new Among("ir\u00E0", -1, 1), new Among("er\u00F2", -1, 1),
			new Among("ir\u00F2", -1, 1)];

		this.g_v = [17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128, 128, 8, 2, 1];
		this.g_AEIO = [17, 65, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128, 128, 8, 2];
		this.g_CG = [17];
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
	 * Helper method for handling specific character replacements.
	 * @param c1 - The character to be replaced.
	 * @param c2 - The replacement character.
	 * @param v_1 - The cursor position to reset to after replacement.
	 * @returns A boolean indicating if the replacement was made.
	 */
	public habr1(c1, c2, v_1): boolean {
		if (this.sbp.eq_s(1, c1)) {
			this.sbp.ket = this.sbp.cursor;
			if (this.sbp.in_grouping(this.g_v, 97, 249)) {
				this.sbp.slice_from(c2);
				this.sbp.cursor = v_1;
				return true;
			}
		}
		return false;
	}

	/**
	 * Performs the prelude step of the stemming algorithm.
	 */
	public r_prelude(): void {
		var among_var, v_1 = this.sbp.cursor, v_2, v_3, v_4;
		while (true) {
			this.sbp.bra = this.sbp.cursor;
			among_var = this.sbp.find_among(this.a_0, 7);
			if (among_var) {
				this.sbp.ket = this.sbp.cursor;
				switch (among_var) {
					case 1:
						this.sbp.slice_from("\u00E0");
						continue;
					case 2:
						this.sbp.slice_from("\u00E8");
						continue;
					case 3:
						this.sbp.slice_from("\u00EC");
						continue;
					case 4:
						this.sbp.slice_from("\u00F2");
						continue;
					case 5:
						this.sbp.slice_from("\u00F9");
						continue;
					case 6:
						this.sbp.slice_from("qU");
						continue;
					case 7:
						if (this.sbp.cursor >= this.sbp.limit)
							break;
						this.sbp.cursor++;
						continue;
				}
			}
			break;
		}
		this.sbp.cursor = v_1;
		while (true) {
			v_2 = this.sbp.cursor;
			while (true) {
				v_3 = this.sbp.cursor;
				if (this.sbp.in_grouping(this.g_v, 97, 249)) {
					this.sbp.bra = this.sbp.cursor;
					v_4 = this.sbp.cursor;
					if (this.habr1("u", "U", v_3))
						break;
					this.sbp.cursor = v_4;
					if (this.habr1("i", "I", v_3))
						break;
				}
				this.sbp.cursor = v_3;
				if (this.sbp.cursor >= this.sbp.limit) {
					this.sbp.cursor = v_2;
					return;
				}
				this.sbp.cursor++;
			}
		}
	}

	/**
	 * Helper method for r_mark_regions.
	 * @param v_1 - Cursor position.
	 * @returns A boolean indicating the result of the operation.
	 */
	public habr2(v_1): boolean {
		this.sbp.cursor = v_1;
		if (!this.sbp.in_grouping(this.g_v, 97, 249))
			return false;
		while (!this.sbp.out_grouping(this.g_v, 97, 249)) {
			if (this.sbp.cursor >= this.sbp.limit)
				return false;
			this.sbp.cursor++;
		}
		return true;
	}

	/**
	 * Helper method for r_mark_regions.
	 * @returns A boolean indicating the result of the operation.
	 */
	public habr3(): boolean {
		if (this.sbp.in_grouping(this.g_v, 97, 249)) {
			var v_1 = this.sbp.cursor;
			if (this.sbp.out_grouping(this.g_v, 97, 249)) {
				while (!this.sbp.in_grouping(this.g_v, 97, 249)) {
					if (this.sbp.cursor >= this.sbp.limit)
						return this.habr2(v_1);
					this.sbp.cursor++;
				}
				return true;
			}
			return this.habr2(v_1);
		}
		return false;
	}

	/**
	 * Helper method for r_mark_regions.
	 */
	public habr4(): void {
		var v_1 = this.sbp.cursor, v_2;
		if (!this.habr3()) {
			this.sbp.cursor = v_1;
			if (!this.sbp.out_grouping(this.g_v, 97, 249))
				return;
			v_2 = this.sbp.cursor;
			if (this.sbp.out_grouping(this.g_v, 97, 249)) {
				while (!this.sbp.in_grouping(this.g_v, 97, 249)) {
					if (this.sbp.cursor >= this.sbp.limit) {
						this.sbp.cursor = v_2;
						if (this.sbp.in_grouping(this.g_v, 97, 249)
							&& this.sbp.cursor < this.sbp.limit)
							this.sbp.cursor++;
						return;
					}
					this.sbp.cursor++;
				}
				this.I_pV = this.sbp.cursor;
				return;
			}
			this.sbp.cursor = v_2;
			if (!this.sbp.in_grouping(this.g_v, 97, 249) || this.sbp.cursor >= this.sbp.limit)
				return;
			this.sbp.cursor++;
		}
		this.I_pV = this.sbp.cursor;
	}

	/**
	 * Helper method for r_mark_regions.
	 * @returns A boolean indicating the result of the operation.
	 */
	public habr5(): boolean {
		while (!this.sbp.in_grouping(this.g_v, 97, 249)) {
			if (this.sbp.cursor >= this.sbp.limit)
				return false;
			this.sbp.cursor++;
		}
		while (!this.sbp.out_grouping(this.g_v, 97, 249)) {
			if (this.sbp.cursor >= this.sbp.limit)
				return false;
			this.sbp.cursor++;
		}
		return true;
	}

	/**
	 * Marks regions in the word for the stemming process.
	 */
	public r_mark_regions(): void {
		var v_1 = this.sbp.cursor;
		this.I_pV = this.sbp.limit;
		this.I_p1 = this.I_pV;
		this.I_p2 = this.I_pV;
		this.habr4();
		this.sbp.cursor = v_1;
		if (this.habr5()) {
			this.I_p1 = this.sbp.cursor;
			if (this.habr5())
				this.I_p2 = this.sbp.cursor;
		}
	}

	/**
	 * Performs the postlude step of the stemming algorithm.
	 */
	public r_postlude(): void {
		var among_var;
		while (true) {
			this.sbp.bra = this.sbp.cursor;
			among_var = this.sbp.find_among(this.a_1, 3);
			if (!among_var)
				break;
			this.sbp.ket = this.sbp.cursor;
			switch (among_var) {
				case 1:
					this.sbp.slice_from("i");
					break;
				case 2:
					this.sbp.slice_from("u");
					break;
				case 3:
					if (this.sbp.cursor >= this.sbp.limit)
						return;
					this.sbp.cursor++;
					break;
			}
		}
	}

	/**
	 * Checks if the cursor is within the RV region.
	 * @returns A boolean indicating if the cursor is in RV.
	 */
	public r_RV(): boolean {
		return this.I_pV <= this.sbp.cursor;
	}

	/**
	 * Checks if the cursor is within the R1 region.
	 * @returns A boolean indicating if the cursor is in R1.
	 */
	public r_R1(): boolean {
		return this.I_p1 <= this.sbp.cursor;
	}

	/**
	 * Checks if the cursor is within the R2 region.
	 * @returns A boolean indicating if the cursor is in R2.
	 */
	public r_R2(): boolean {
		return this.I_p2 <= this.sbp.cursor;
	}

	/**
	 * Handles attached pronoun suffixes.
	 */
	public r_attached_pronoun(): void {
		var among_var;
		this.sbp.ket = this.sbp.cursor;
		if (this.sbp.find_among_b(this.a_2, 37)) {
			this.sbp.bra = this.sbp.cursor;
			among_var = this.sbp.find_among_b(this.a_3, 5);
			if (among_var && this.r_RV()) {
				switch (among_var) {
					case 1:
						this.sbp.slice_del();
						break;
					case 2:
						this.sbp.slice_from("e");
						break;
				}
			}
		}
	}

	/**
	 * Handles standard suffix removal.
	 * @returns A boolean indicating if any changes were made.
	 */
	public r_standard_suffix(): boolean {
		var among_var;
		this.sbp.ket = this.sbp.cursor;
		among_var = this.sbp.find_among_b(this.a_6, 51);
		if (!among_var)
			return false;
		this.sbp.bra = this.sbp.cursor;
		switch (among_var) {
			case 1:
				if (!this.r_R2())
					return false;
				this.sbp.slice_del();
				break;
			case 2:
				if (!this.r_R2())
					return false;
				this.sbp.slice_del();
				this.sbp.ket = this.sbp.cursor;
				if (this.sbp.eq_s_b(2, "ic")) {
					this.sbp.bra = this.sbp.cursor;
					if (this.r_R2())
						this.sbp.slice_del();
				}
				break;
			case 3:
				if (!this.r_R2())
					return false;
				this.sbp.slice_from("log");
				break;
			case 4:
				if (!this.r_R2())
					return false;
				this.sbp.slice_from("u");
				break;
			case 5:
				if (!this.r_R2())
					return false;
				this.sbp.slice_from("ente");
				break;
			case 6:
				if (!this.r_RV())
					return false;
				this.sbp.slice_del();
				break;
			case 7:
				if (!this.r_R1())
					return false;
				this.sbp.slice_del();
				this.sbp.ket = this.sbp.cursor;
				among_var = this.sbp.find_among_b(this.a_4, 4);
				if (among_var) {
					this.sbp.bra = this.sbp.cursor;
					if (this.r_R2()) {
						this.sbp.slice_del();
						if (among_var == 1) {
							this.sbp.ket = this.sbp.cursor;
							if (this.sbp.eq_s_b(2, "at")) {
								this.sbp.bra = this.sbp.cursor;
								if (this.r_R2())
									this.sbp.slice_del();
							}
						}
					}
				}
				break;
			case 8:
				if (!this.r_R2())
					return false;
				this.sbp.slice_del();
				this.sbp.ket = this.sbp.cursor;
				among_var = this.sbp.find_among_b(this.a_5, 3);
				if (among_var) {
					this.sbp.bra = this.sbp.cursor;
					if (among_var == 1)
						if (this.r_R2())
							this.sbp.slice_del();
				}
				break;
			case 9:
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
						}
					}
				}
				break;
		}
		return true;
	}

	/**
	 * Handles verb suffix removal.
	 */
	public r_verb_suffix(): void {
		var among_var, v_1;
		if (this.sbp.cursor >= this.I_pV) {
			v_1 = this.sbp.limit_backward;
			this.sbp.limit_backward = this.I_pV;
			this.sbp.ket = this.sbp.cursor;
			among_var = this.sbp.find_among_b(this.a_7, 87);
			if (among_var) {
				this.sbp.bra = this.sbp.cursor;
				if (among_var == 1)
					this.sbp.slice_del();
			}
			this.sbp.limit_backward = v_1;
		}
	}

	/**
	 * Helper method for r_vowel_suffix.
	 */
	public habr6(): void {
		var v_1 = this.sbp.limit - this.sbp.cursor;
		this.sbp.ket = this.sbp.cursor;
		if (this.sbp.in_grouping_b(this.g_AEIO, 97, 242)) {
			this.sbp.bra = this.sbp.cursor;
			if (this.r_RV()) {
				this.sbp.slice_del();
				this.sbp.ket = this.sbp.cursor;
				if (this.sbp.eq_s_b(1, "i")) {
					this.sbp.bra = this.sbp.cursor;
					if (this.r_RV()) {
						this.sbp.slice_del();
						return;
					}
				}
			}
		}
		this.sbp.cursor = this.sbp.limit - v_1;
	}

	/**
	 * Handles vowel suffix removal.
	 */
	public r_vowel_suffix(): void {
		this.habr6();
		this.sbp.ket = this.sbp.cursor;
		if (this.sbp.eq_s_b(1, "h")) {
			this.sbp.bra = this.sbp.cursor;
			if (this.sbp.in_grouping_b(this.g_CG, 99, 103))
				if (this.r_RV())
					this.sbp.slice_del();
		}
	}

	/**
	 * Stems the current word.
	 * @returns A boolean indicating if stemming was successful.
	 */
	public stem(): boolean {
		var v_1 = this.sbp.cursor;
		this.r_prelude();
		this.sbp.cursor = v_1;
		this.r_mark_regions();
		this.sbp.limit_backward = v_1;
		this.sbp.cursor = this.sbp.limit;
		this.r_attached_pronoun();
		this.sbp.cursor = this.sbp.limit;
		if (!this.r_standard_suffix()) {
			this.sbp.cursor = this.sbp.limit;
			this.r_verb_suffix();
		}
		this.sbp.cursor = this.sbp.limit;
		this.r_vowel_suffix();
		this.sbp.cursor = this.sbp.limit_backward;
		this.r_postlude();
		return true;
	}
}

export { ItalianStemmer };