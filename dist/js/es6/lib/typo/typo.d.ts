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
 * Main class for spell checking and suggestion generation.
 */
declare class Typo {
    private dictionary;
    private affData;
    private wordsData;
    private settings;
    private rules;
    private combinableRules;
    private dictionaryMap;
    private compoundRules;
    private compoundRuleCodes;
    private replacementTable;
    private flags;
    private memoized;
    private loaded;
    private alphabet;
    /**
     * Creates a new Typo instance.
     * @param dictionary - The locale code of the dictionary.
     * @param affData - The data from the dictionary's .aff file.
     * @param wordsData - The data from the dictionary's .dic file.
     * @param settings - Optional settings for the Typo instance.
     */
    constructor(dictionary: string, affData: string, wordsData: string, settings?: {});
    /**
     * Checks whether a word exists exactly as given in the dictionary.
     * @param word - The word to check.
     * @returns True if the word is found, false otherwise.
     */
    checkExact(word: string): boolean;
    /**
     * Returns a list of suggestions for a misspelled word.
     * @see http://www.norvig.com/spell-correct.html for the basis of this suggestor.
     * This suggestor is primitive, but it works.
     * @param word - The misspelled word.
     * @param limit - The maximum number of suggestions to return (default is 5).
     * @returns An array of suggested corrections.
     */
    suggest(word: string, limit: number): any;
    private setup;
    /**
     * Parse the rules out from a .aff file.
     *
     * @param {String} data The contents of the affix file.
     * @returns object The rules from the file.
     */
    private _parseAFF;
    /**
     * Removes comments.
     *
     * @param {String} data A line from an affix file.
     * @return {String} The cleaned-up line.
     */
    private _removeAffixComments;
    private addWord;
    /**
     * Parses the words out from the .dic file.
     *
     * @param {String} data The data from the dictionary file.
     * @returns object The lookup table containing all of the words and
     *                 word forms from the dictionary.
     */
    private parseDIC;
    /**
     * Removes comment lines and then cleans up blank lines and trailing whitespace.
     *
     * @param {String} data The data from a .dic file.
     * @return {String} The cleaned-up data.
     */
    private removeDicComments;
    /**
     * Checks whether a word or its capitalization variant exists in the dictionary.
     * The word is trimmed and several variations of capitalizations are checked.
     * If you want to check a word without any changes made to it, call checkExact()
     *
     * @see http://blog.stevenlevithan.com/archives/faster-trim-javascript re:trimming function
     * @param aWord - The word to check.
     * @returns True if the word is found, false otherwise.
     */
    check(aWord: any): boolean;
    /**
     * Looks up whether a given word is flagged with a given flag.
     *
     * @param {String} word The word in question.
     * @param {String} flag The flag in question.
     * @return {Boolean}
     */
    private hasFlag;
}
export { Typo };
