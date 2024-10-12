/**
 * @license
 * This code may be useful for anyone trying to escape the
 * JS packaging vortex (0 dependency, pure ts, single source file).
 * For anyone else, you're better off using your favorite package
 * manager and type definitions to the original Typo.js. Beware,
 * browser extension and node 'fs' support have been removed.
 * There are not many contact points if you want to add them back,
 * yourself. Look to Typo.js for pre-baked solutions.
 *
 * Typescript/in-browser port, (c) 2023, Ben Caulfield
 * Released under same license as original Typo.js implementation.
 *
 * Copyright (c) 2011, Christopher Finke
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * The name of the author may not be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE AUTHOR FINKE BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * Represents a rule in the dictionary.
 */
class Rule {
    /**
     * Parses flag codes from a string representation.
     * @param textCodes - The string containing flag codes.
     * @param flags - An object containing flag definitions.
     * @returns An array of parsed flag codes.
     */
    static parseCodes(textCodes, flags) {
        let result = [];
        if (!textCodes) {
            result = [];
        }
        else if (!("FLAG" in flags)) {
            // The flag symbols are single characters
            result = textCodes.split("");
        }
        else if (flags.FLAG === "long") {
            // The flag symbols are two characters long.
            const newFlags = [];
            for (var i = 0, _len = textCodes.length; i < _len; i += 2) {
                newFlags.push(textCodes.substring(i, i + 2));
            }
            result = newFlags;
        }
        else if (flags.FLAG === "num") {
            // The flag symbols are a CSV list of numbers.
            result = textCodes.split(",");
        }
        else if (flags.FLAG === "UTF-8") {
            // The flags are single UTF-8 characters.
            // @see https://github.com/cfinke/Typo.js/issues/57
            result = Array.from(textCodes);
        }
        else {
            // It's possible that this fallback case will not work for all FLAG values,
            // but I think it's more likely to work than not returning anything at all.
            result = textCodes.split("");
        }
        return result;
    }
    /**
     * Creates a new Rule instance.
     * @param code - The rule code.
     * @param type - The rule type.
     * @param combinable - Whether the rule is combinable.
     * @param entries - An array of entries for the rule.
     */
    constructor(code, type, combinable, entries) {
        this.code = code;
        this.type = type;
        this.combinable = combinable;
        this.entries = entries;
    }
    /**
     * Applies the rule to a word and generates new words.
     * @param word - The base word to apply the rule to.
     * @param rules - An object containing all available rules.
     * @param resultWords - An array to store the generated words.
     */
    applyRule(word, rules, resultWords) {
        for (let i = 0, entriesLength = this.entries.length; i < entriesLength; i++) {
            let entry = this.entries[i];
            if (!entry.match || entry.match.test(word)) {
                let newWord = word;
                if (entry.remove) {
                    newWord = newWord.replace(entry.remove, "");
                }
                if (this.type === "SFX") {
                    newWord = newWord + entry.add;
                }
                else {
                    newWord = entry.add + newWord;
                }
                resultWords.push(newWord);
                const continuationLength = entry.continuationClasses.length;
                if (continuationLength > 0) {
                    for (let j = 0; j < continuationLength; j++) {
                        const continuationClass = entry.continuationClasses[j];
                        const continuationRule = rules[continuationClass];
                        if (continuationRule) {
                            continuationRule.applyRule(newWord, rules, resultWords);
                        }
                        /*
                        else {
                            // This shouldn't happen, but it does, at least in the de_DE dictionary.
                            // I think the author mistakenly supplied lower-case rule codes instead
                            // of upper-case.
                        }
                        */
                    }
                }
            }
        }
    }
}
/**
 * Represents an entry in a rule.
 */
class Entry {
    /**
     * Creates a new Entry instance.
     * @param add - The string to add.
     * @param matchStr - The match string.
     * @param removeStr - The remove string.
     * @param cont - An array of continuation classes.
     */
    constructor(add, matchStr, removeStr, cont) {
        this.add = add ? add : null;
        this.match = this.getMemoRegex(matchStr);
        this.remove = this.getMemoRegex(removeStr);
        this.continuationClasses = cont ? cont : [];
    }
    /**
     * Creates an Entry instance from a line in the affix file.
     * @param line - The line from the affix file.
     * @param ruleType - The type of the rule.
     * @param flags - An object containing flag definitions.
     * @returns A new Entry instance.
     */
    static fromLine(line, ruleType, flags) {
        const lineParts = line.split(/\s+/);
        const charactersToRemove = lineParts[2];
        const additionParts = lineParts[3] ? lineParts[3].split("/") : [];
        const regexToMatch = lineParts[4];
        let charactersToAdd = additionParts[0];
        let continuations = additionParts[1];
        if (charactersToAdd === "0") {
            charactersToAdd = "";
        }
        let add = charactersToAdd;
        let matchString = null;
        if (regexToMatch && regexToMatch !== ".") {
            if (ruleType === "SFX") {
                matchString = `${regexToMatch}$`;
            }
            else {
                matchString = `^${regexToMatch}`;
            }
        }
        let removeString = null;
        if (charactersToRemove != "0") {
            if (ruleType === "SFX") {
                removeString = `${charactersToRemove}$`;
            }
            else {
                removeString = `${charactersToRemove}`;
            }
        }
        var continuationClasses = Rule.parseCodes(continuations, flags);
        return new Entry(add, matchString, removeString, continuationClasses);
    }
    getMemoRegex(reString) {
        if (reString) {
            if (Entry.regex[reString] === undefined) {
                Entry.regex[reString] = this.getRegex(reString);
            }
        }
        else {
            Entry.regex[reString] = null;
        }
        return Entry.regex[reString];
    }
    getRegex(reString) {
        try {
            return new RegExp(reString);
        }
        catch {
            // ^ães) in pt_BR is unbalanced, try and ignore it
            return null;
        }
    }
}
Entry.regex = Object.create(null);
/**
 * Main class for spell checking and suggestion generation.
 */
class Typo {
    /**
     * Creates a new Typo instance.
     * @param dictionary - The locale code of the dictionary.
     * @param affData - The data from the dictionary's .aff file.
     * @param wordsData - The data from the dictionary's .dic file.
     * @param settings - Optional settings for the Typo instance.
     */
    constructor(dictionary, affData, wordsData, settings) {
        if (!(dictionary && affData && wordsData)) {
            const msg = `dictionary (${dictionary}) || affData (${affData}) || wordsData (${wordsData}) 
				not provided.unlike Typo.js, all are required by the constructor.`;
            throw new Error(msg);
        }
        this.dictionary = dictionary;
        this.affData = affData;
        this.wordsData = wordsData;
        this.settings = settings !== null && settings !== void 0 ? settings : Object.create(null);
        this.rules = {};
        this.combinableRules = {};
        this.dictionaryMap = new Map();
        this.compoundRules = [];
        this.compoundRuleCodes = {};
        this.replacementTable = [];
        this.flags = "flags" in this.settings ? this.settings["flags"] : Object.create(null);
        this.memoized = {};
        this.loaded = false;
        this.alphabet = "";
        this.setup();
    }
    /**
     * Checks whether a word exists exactly as given in the dictionary.
     * @param word - The word to check.
     * @returns True if the word is found, false otherwise.
     */
    checkExact(word) {
        if (!this.loaded) {
            throw "Dictionary not loaded.";
        }
        // const ruleCodes = this.dictionaryTable[word];
        const ruleCodes = this.dictionaryMap.get(word);
        let i, _len;
        if (typeof ruleCodes === 'undefined') {
            // Check if this might be a compound word.
            if ("COMPOUNDMIN" in this.flags && word.length >= this.flags.COMPOUNDMIN) {
                for (i = 0, _len = this.compoundRules.length; i < _len; i++) {
                    if (word.match(this.compoundRules[i])) {
                        return true;
                    }
                }
            }
        }
        else if (ruleCodes === null) {
            // a null (but not undefined) value for an entry in the dictionary table
            // means that the word is in the dictionary but has no flags.
            return true;
        }
        else if (typeof ruleCodes === 'object') { // this.dictionary['hasOwnProperty'] will be a function.
            for (i = 0, _len = ruleCodes.length; i < _len; i++) {
                // TODO not sure how this ever worked
                // if (!this.hasFlag(word, "ONLYINCOMPOUND", ruleCodes[i])) {
                // console.log(`${word} ${ruleCodes[i]}`);
                if (!this.hasFlag(word, "ONLYINCOMPOUND", [ruleCodes[i]])) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Returns a list of suggestions for a misspelled word.
     * @see http://www.norvig.com/spell-correct.html for the basis of this suggestor.
     * This suggestor is primitive, but it works.
     * @param word - The misspelled word.
     * @param limit - The maximum number of suggestions to return (default is 5).
     * @returns An array of suggested corrections.
     */
    suggest(word, limit) {
        if (!this.loaded) {
            throw "Dictionary not loaded.";
        }
        let alphabet = "";
        limit = limit || 5;
        if (this.memoized.hasOwnProperty(word)) {
            var memoizedLimit = this.memoized[word]['limit'];
            // Only return the cached list if it's big enough or if there weren't enough suggestions
            // to fill a smaller limit.
            if (limit <= memoizedLimit || this.memoized[word]['suggestions'].length < memoizedLimit) {
                return this.memoized[word]['suggestions'].slice(0, limit);
            }
        }
        if (this.check(word))
            return [];
        // Check the replacement table.
        for (var i = 0, _len = this.replacementTable.length; i < _len; i++) {
            var replacementEntry = this.replacementTable[i];
            if (word.indexOf(replacementEntry[0]) !== -1) {
                var correctedWord = word.replace(replacementEntry[0], replacementEntry[1]);
                if (this.check(correctedWord)) {
                    return [correctedWord];
                }
            }
        }
        if (!this.alphabet) {
            // Use the English alphabet as the default. Problematic, but backwards-compatible.
            this.alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            // Any characters defined in the affix file as substitutions can go in the alphabet too.
            // Note that dictionaries do not include the entire alphabet in the TRY flag when it's there.
            // For example, Q is not in the default English TRY list; that's why having the default
            // alphabet above is useful.
            if ('TRY' in this.flags) {
                this.alphabet += this.flags['TRY'];
            }
            // Plus any additional characters specifically defined as being allowed in words.
            if ('WORDCHARS' in this.flags) {
                this.alphabet += this.flags['WORDCHARS'];
            }
            // Remove any duplicates.
            var alphaArray = this.alphabet.split("");
            alphaArray.sort();
            var alphaHash = {};
            for (var i = 0; i < alphaArray.length; i++) {
                alphaHash[alphaArray[i]] = true;
            }
            this.alphabet = '';
            for (var k in alphaHash) {
                this.alphabet += k;
            }
        }
        /**
         * Returns a hash keyed by all of the strings that can be made by making a single edit to the word (or words in) `words`
         * The value of each entry is the number of unique ways that the resulting word can be made.
         *
         * @arg mixed words Either a hash keyed by words or a string word to operate on.
         * @arg bool known_only Whether this function should ignore strings that are not in the dictionary.
         */
        function edits1(words, known_only) {
            var rv = {};
            var i, j, _iilen, _len, _jlen, _edit;
            var alphabetLength = this.alphabet.length;
            if (typeof words == 'string') {
                var word = words;
                words = {};
                words[word] = true;
            }
            for (var word in words) {
                for (i = 0, _len = word.length + 1; i < _len; i++) {
                    var s = [word.substring(0, i), word.substring(i)];
                    // Remove a letter.
                    if (s[1]) {
                        _edit = s[0] + s[1].substring(1);
                        if (!known_only || this.check(_edit)) {
                            if (!(_edit in rv)) {
                                rv[_edit] = 1;
                            }
                            else {
                                rv[_edit] += 1;
                            }
                        }
                    }
                    // Transpose letters
                    // Eliminate transpositions of identical letters
                    if (s[1].length > 1 && s[1][1] !== s[1][0]) {
                        _edit = s[0] + s[1][1] + s[1][0] + s[1].substring(2);
                        if (!known_only || this.check(_edit)) {
                            if (!(_edit in rv)) {
                                rv[_edit] = 1;
                            }
                            else {
                                rv[_edit] += 1;
                            }
                        }
                    }
                    if (s[1]) {
                        // Replace a letter with another letter.
                        var lettercase = (s[1].substring(0, 1).toUpperCase() === s[1].substring(0, 1)) ? 'uppercase' : 'lowercase';
                        for (j = 0; j < alphabetLength; j++) {
                            var replacementLetter = this.alphabet[j];
                            // Set the case of the replacement letter to the same as the letter being replaced.
                            if ('uppercase' === lettercase) {
                                replacementLetter = replacementLetter.toUpperCase();
                            }
                            // Eliminate replacement of a letter by itself
                            if (replacementLetter != s[1].substring(0, 1)) {
                                _edit = s[0] + replacementLetter + s[1].substring(1);
                                if (!known_only || this.check(_edit)) {
                                    if (!(_edit in rv)) {
                                        rv[_edit] = 1;
                                    }
                                    else {
                                        rv[_edit] += 1;
                                    }
                                }
                            }
                        }
                    }
                    if (s[1]) {
                        // Add a letter between each letter.
                        for (j = 0; j < alphabetLength; j++) {
                            // If the letters on each side are capitalized, capitalize the replacement.
                            var lettercase = (s[0].substring(-1).toUpperCase() === s[0].substring(-1) && s[1].substring(0, 1).toUpperCase() === s[1].substring(0, 1)) ? 'uppercase' : 'lowercase';
                            var replacementLetter = this.alphabet[j];
                            if ('uppercase' === lettercase) {
                                replacementLetter = replacementLetter.toUpperCase();
                            }
                            _edit = s[0] + replacementLetter + s[1];
                            if (!known_only || this.check(_edit)) {
                                if (!(_edit in rv)) {
                                    rv[_edit] = 1;
                                }
                                else {
                                    rv[_edit] += 1;
                                }
                            }
                        }
                    }
                }
            }
            return rv;
        }
        function correct(word) {
            // Get the edit-distance-1 and edit-distance-2 forms of this word.
            const ed1 = edits1(word, false);
            const ed2 = edits1(ed1, true);
            // Sort the edits based on how many different ways they were created.
            const weighted_corrections = ed2;
            for (var ed1word in ed1) {
                if (!this.check(ed1word)) {
                    continue;
                }
                if (ed1word in weighted_corrections) {
                    weighted_corrections[ed1word] += ed1[ed1word];
                }
                else {
                    weighted_corrections[ed1word] = ed1[ed1word];
                }
            }
            let i, _len;
            const sorted_corrections = [];
            for (i in weighted_corrections) {
                if (weighted_corrections.hasOwnProperty(i)) {
                    sorted_corrections.push([i, weighted_corrections[i]]);
                }
            }
            function sorter(a, b) {
                let a_val = a[1];
                let b_val = b[1];
                if (a_val < b_val) {
                    return -1;
                }
                else if (a_val > b_val) {
                    return 1;
                }
                // @todo If a and b are equally weighted, add our own weight based on something like the key locations on this language's default keyboard.
                return b[0].localeCompare(a[0]);
            }
            sorted_corrections.sort(sorter).reverse();
            const rv = [];
            let capitalization_scheme = "lowercase";
            if (word.toUpperCase() === word) {
                capitalization_scheme = "uppercase";
            }
            else if (word.substr(0, 1).toUpperCase() + word.substr(1).toLowerCase() === word) {
                capitalization_scheme = "capitalized";
            }
            let working_limit = limit;
            for (i = 0; i < Math.min(working_limit, sorted_corrections.length); i++) {
                if ("uppercase" === capitalization_scheme) {
                    sorted_corrections[i][0] = sorted_corrections[i][0].toUpperCase();
                }
                else if ("capitalized" === capitalization_scheme) {
                    sorted_corrections[i][0] = sorted_corrections[i][0].substr(0, 1).toUpperCase() + sorted_corrections[i][0].substr(1);
                }
                if (!this.hasFlag(sorted_corrections[i][0], "NOSUGGEST", null) && rv.indexOf(sorted_corrections[i][0]) == -1) {
                    rv.push(sorted_corrections[i][0]);
                }
                else {
                    // If one of the corrections is not eligible as a suggestion , make sure we still return the right number of suggestions.
                    working_limit++;
                }
            }
            return rv;
        }
        this.memoized[word] = {
            'suggestions': correct(word),
            'limit': limit
        };
        return this.memoized[word]['suggestions'];
    }
    setup() {
        let i = 0;
        let j = 0;
        let _len = 0;
        let _jlen = 0;
        this.rules = this._parseAFF(this.affData);
        this.combinableRules = Object.assign({}, ...Object.entries(this.rules).filter(([k, v]) => v.combinable).map(([k, v]) => ({ [k]: v })));
        this.compoundRuleCodes = Object.create(null);
        for (i = 0, _len = this.compoundRules.length; i < _len; i++) {
            var rule = this.compoundRules[i];
            for (j = 0, _jlen = rule.length; j < _jlen; j++) {
                this.compoundRuleCodes[rule[j]] = [];
            }
        }
        // If we add this ONLYINCOMPOUND flag to self.compoundRuleCodes, then _parseDIC
        // will do the work of saving the list of words that are compound-only.
        if ("ONLYINCOMPOUND" in this.flags) {
            this.compoundRuleCodes[this.flags.ONLYINCOMPOUND] = [];
        }
        console.time("load dictionary");
        this.parseDIC(this.wordsData);
        console.timeEnd("load dictionary");
        // Get rid of any codes from the compound rule codes that are never used 
        // (or that were special regex characters).  Not especially necessary... 
        for (let k in this.compoundRuleCodes) {
            if (this.compoundRuleCodes[k].length === 0) {
                delete this.compoundRuleCodes[k];
            }
        }
        // Build the full regular expressions for each compound rule.
        // I have a feeling (but no confirmation yet) that this method of 
        // testing for compound words is probably slow.
        for (i = 0; i < this.compoundRules.length; i++) {
            const ruleText = this.compoundRules[i];
            let expressionText = "";
            for (j = 0, _jlen = ruleText.length; j < _jlen; j++) {
                var character = ruleText[j];
                if (character in this.compoundRuleCodes) {
                    expressionText += "(" + this.compoundRuleCodes[character].join("|") + ")";
                }
                else {
                    expressionText += character;
                }
            }
            this.compoundRules[i] = new RegExp(expressionText, "i");
        }
        this.loaded = true;
    }
    /**
     * Parse the rules out from a .aff file.
     *
     * @param {String} data The contents of the affix file.
     * @returns object The rules from the file.
     */
    _parseAFF(data) {
        const lineSplitRe = /\r?\n/;
        const definitionSplitRe = /\s+/;
        const rules = Object.create(null);
        let line, subline, numEntries, lineParts;
        let i, j, _len, _jlen;
        const lines = data.split(lineSplitRe);
        for (i = 0, _len = lines.length; i < _len; i++) {
            // Remove comment lines
            line = this._removeAffixComments(lines[i]);
            line = line.trim();
            if (!line) {
                continue;
            }
            const definitionParts = line.split(definitionSplitRe);
            const ruleType = definitionParts[0];
            const entries = [];
            if (ruleType == "PFX" || ruleType == "SFX") {
                var ruleCode = definitionParts[1];
                var combinable = definitionParts[2];
                let numEntries = parseInt(definitionParts[3], 10);
                for (j = i + 1, _jlen = i + 1 + numEntries; j < _jlen; j++) {
                    subline = lines[j];
                    entries.push(Entry.fromLine(subline, ruleType, this.flags));
                }
                rules[ruleCode] = new Rule(ruleCode, ruleType, (combinable === "Y"), entries);
                i += numEntries;
            }
            else if (ruleType === "COMPOUNDRULE") {
                numEntries = parseInt(definitionParts[1], 10);
                for (j = i + 1, _jlen = i + 1 + numEntries; j < _jlen; j++) {
                    line = lines[j];
                    lineParts = line.split(/\s+/);
                    this.compoundRules.push(lineParts[1]);
                }
                i += numEntries;
            }
            else if (ruleType === "REP") {
                lineParts = line.split(/\s+/);
                if (lineParts.length === 3) {
                    this.replacementTable.push([lineParts[1], lineParts[2]]);
                }
            }
            else {
                // ONLYINCOMPOUND
                // COMPOUNDMIN
                // FLAG
                // KEEPCASE
                // NEEDAFFIX
                this.flags[ruleType] = definitionParts[1];
            }
        }
        return rules;
    }
    /**
     * Removes comments.
     *
     * @param {String} data A line from an affix file.
     * @return {String} The cleaned-up line.
     */
    _removeAffixComments(line) {
        // This used to remove any string starting with '#' up to the end of the line,
        // but some COMPOUNDRULE definitions include '#' as part of the rule.
        // So, only remove lines that begin with a comment, optionally preceded by whitespace.
        if (line.match(/^\s*#/)) {
            return "";
        }
        return line;
    }
    addWord(word, rules) {
        // Some dictionaries will list the same word multiple times with different rule sets.
        const result = this.dictionaryMap.get(word);
        const hasRules = rules.length > 0;
        if (result === undefined) {
            // undefined is first contact
            if (hasRules) {
                this.dictionaryMap.set(word, rules);
            }
            else {
                this.dictionaryMap.set(word, null);
            }
        }
        else if (result === null) {
            // null we've set null before, anything to add?
            if (hasRules) {
                this.dictionaryMap.set(word, rules);
            }
        }
        else if (hasRules) {
            // doesn't occur in en, see es_MX
            result.push.apply(result, rules);
        }
    }
    /**
     * Parses the words out from the .dic file.
     *
     * @param {String} data The data from the dictionary file.
     * @returns object The lookup table containing all of the words and
     *                 word forms from the dictionary.
     */
    parseDIC(data) {
        data = this.removeDicComments(data);
        const lines = data.split(/\r?\n/);
        this.dictionaryMap.clear();
        const ruleCodeWords = [];
        const ruleCodeOtherWords = [];
        let ruleCodesArrayLength = 0;
        let ruleCodesArray;
        for (let i = 0, lineLength = lines.length; i < lineLength; i++) {
            const [word, ruleCodesRaw] = lines[i].split("/", 2);
            // Now for each affix rule, generate that form of the word.
            if (ruleCodesRaw) {
                ruleCodesArray = Rule.parseCodes(ruleCodesRaw, this.flags);
                ruleCodesArrayLength = ruleCodesArray.length;
                ruleCodeWords.length = 0;
                ruleCodeOtherWords.length = 0;
                // Save the ruleCodes for compound word situations.
                if (!("NEEDAFFIX" in this.flags) || ruleCodesArray.indexOf(this.flags.NEEDAFFIX) == -1) {
                    this.addWord(word, ruleCodesArray);
                }
                for (let j = 0; j < ruleCodesArrayLength; j++) {
                    const code = ruleCodesArray[j];
                    const rule = this.rules[code];
                    // applyRule will populate these
                    ruleCodeWords.length = 0;
                    ruleCodeOtherWords.length = 0;
                    // if (word === "administer") {
                    // 	console.log(`${code}`);
                    // 	console.log(ruleCodeWords);
                    // }
                    if (rule) {
                        rule.applyRule(word, this.rules, ruleCodeWords);
                        if (rule.combinable) {
                            const ruleCodeWordsLength = ruleCodeWords.length;
                            for (let k = 0; k < ruleCodeWordsLength; k++) {
                                const ruleCodeWord = ruleCodeWords[k];
                                // yikes! already did ruleCodesArray at j
                                for (let l = 0; l < ruleCodesArrayLength; l++) {
                                    var combineRule = this.combinableRules[ruleCodesArray[l]];
                                    if (combineRule && rule.type !== combineRule.type) {
                                        // applyRule will populate ruleCodeOtherWords
                                        combineRule.applyRule(ruleCodeWord, this.rules, ruleCodeOtherWords);
                                    }
                                }
                            }
                        }
                    }
                    // combine after finished loop
                    ruleCodeWords.push.apply(ruleCodeWords, ruleCodeOtherWords);
                    // dupes not present in en, but apparent in ru
                    const uniques = new Set(ruleCodeWords);
                    let uniquesLength = uniques.size;
                    for (let unique of uniques) {
                        this.addWord(unique, []);
                    }
                    if (code in this.compoundRuleCodes) {
                        this.compoundRuleCodes[code].push(word);
                    }
                }
                ;
            }
            else {
                this.addWord(word.trim(), []);
            }
        }
        ;
    }
    /**
     * Removes comment lines and then cleans up blank lines and trailing whitespace.
     *
     * @param {String} data The data from a .dic file.
     * @return {String} The cleaned-up data.
     */
    removeDicComments(data) {
        // I can't find any official documentation on it, but at least the de_DE
        // dictionary uses tab-indented lines as comments.
        // Remove comments
        data = data.replace(/^\t.*$/mg, "");
        return data;
    }
    /**
     * Checks whether a word or its capitalization variant exists in the dictionary.
     * The word is trimmed and several variations of capitalizations are checked.
     * If you want to check a word without any changes made to it, call checkExact()
     *
     * @see http://blog.stevenlevithan.com/archives/faster-trim-javascript re:trimming function
     * @param aWord - The word to check.
     * @returns True if the word is found, false otherwise.
     */
    check(aWord) {
        if (!this.loaded) {
            throw "Dictionary not loaded.";
        }
        // Remove leading and trailing whitespace
        var trimmedWord = aWord.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        if (trimmedWord === "") {
            return true;
        }
        if (this.checkExact(trimmedWord)) {
            return true;
        }
        // The exact word is not in the dictionary.
        if (trimmedWord.toUpperCase() === trimmedWord) {
            // The word was supplied in all uppercase.
            // Check for a capitalized form of the word.
            var capitalizedWord = trimmedWord[0] + trimmedWord.substring(1).toLowerCase();
            if (this.hasFlag(capitalizedWord, "KEEPCASE", null)) {
                // Capitalization variants are not allowed for this word.
                return false;
            }
            if (this.checkExact(capitalizedWord)) {
                // The all-caps word is a capitalized word spelled correctly.
                return true;
            }
            if (this.checkExact(trimmedWord.toLowerCase())) {
                // The all-caps is a lowercase word spelled correctly.
                return true;
            }
        }
        var uncapitalizedWord = trimmedWord[0].toLowerCase() + trimmedWord.substring(1);
        if (uncapitalizedWord !== trimmedWord) {
            if (this.hasFlag(uncapitalizedWord, "KEEPCASE", null)) {
                // Capitalization variants are not allowed for this word.
                return false;
            }
            // Check for an uncapitalized form
            if (this.checkExact(uncapitalizedWord)) {
                // The word is spelled correctly but with the first letter capitalized.
                return true;
            }
        }
        return false;
    }
    /**
     * Looks up whether a given word is flagged with a given flag.
     *
     * @param {String} word The word in question.
     * @param {String} flag The flag in question.
     * @return {Boolean}
     */
    hasFlag(word, flag, wordFlags) {
        if (!this.loaded) {
            throw "Dictionary not loaded.";
        }
        if (flag in this.flags) {
            if (typeof wordFlags === 'undefined') {
                const result = this.dictionaryMap.get(word);
                wordFlags = Array.prototype.concat.apply([], result);
            }
            if (wordFlags && wordFlags.indexOf(this.flags[flag]) !== -1) {
                return true;
            }
        }
        return false;
    }
}
export { Typo };
