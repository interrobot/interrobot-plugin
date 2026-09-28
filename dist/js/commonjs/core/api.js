"use strict";
/* tslint:disable:no-console */
/* tslint:disable:max-line-length */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginData = exports.SearchResult = exports.Search = exports.SearchQuery = exports.SearchQueryType = exports.Crawl = exports.Project = void 0;
const html_js_1 = require("./html.js");
const host_js_1 = require("./host.js");
/**
 * Enumeration for different types of search queries.
 */
var SearchQueryType;
(function (SearchQueryType) {
    SearchQueryType["Page"] = "page";
    SearchQueryType["Asset"] = "asset";
    SearchQueryType["Any"] = "any";
})(SearchQueryType || (exports.SearchQueryType = SearchQueryType = {}));
/**
 * Container for plugin settings
 */
class PluginData {
    /**
     * Creates an instance of PluginData.
     * @param params - Configuration object containing projectId, meta, defaultData, and autoformInputs
     */
    constructor(params) {
        var _a;
        this.dataLoaded = null;
        this.meta = params.meta;
        this.defaultData = params.defaultData;
        this.autoformInputs = (_a = params.autoformInputs) !== null && _a !== void 0 ? _a : [];
        this.project = params.projectId;
        // init and copy in default data
        // autoform { [projectId: number]: {[inputName: string]: any } }
        this.data = {
            apiVersion: "1.1",
            autoform: {},
        };
        this.data.autoform[this.project] = {};
        if (this.autoformInputs.length > 0) {
            const changeHandler = async (el) => {
                const name = el.getAttribute("name");
                let value;
                if (el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
                    value = el.value;
                }
                else {
                    const hasValue = el.hasAttribute("value");
                    if (!hasValue) {
                        value = el.checked === undefined || el.checked === false ? false : true;
                    }
                    else {
                        value = el.value;
                    }
                }
                await this.setAutoformField(name, value);
            };
            const radioHandler = async (el) => {
                let name = el.getAttribute("name");
                const elInput = el;
                const checkedRadios = document.querySelectorAll(`input[type=radio][name=${CSS.escape(elInput.name)}]:checked`);
                if (checkedRadios.length !== 1) {
                    console.error("radio control failure");
                    return;
                }
                const value = checkedRadios[0].value;
                await this.setAutoformField(name, value);
            };
            const pipedHandler = async (el) => {
                let name = el.getAttribute("name");
                const elInput = el;
                const checkedCheckboxes = document.querySelectorAll(`input[type=checkbox][name=${CSS.escape(elInput.name)}]:checked`);
                const piperList = [];
                for (let i = 0; i < checkedCheckboxes.length; i++) {
                    piperList.push(checkedCheckboxes[i].value);
                }
                const value = piperList.join("|");
                await this.setAutoformField(name, value);
            };
            for (let el of this.autoformInputs) {
                // happens with 0 inputs
                if (el === null) {
                    continue;
                }
                const tag = el.tagName.toLowerCase();
                switch (tag) {
                    case "input":
                        const input = el;
                        // handle reasonable accomodations/variations in checkbox intent
                        // looks more complicated than it is
                        if (input.type == "checkbox") {
                            // this can go a couple ways
                            // either it is a single true/false or a multiple,
                            // in which it is piped|values|like|this, dig it?
                            const elInput = el;
                            const allCheckboxes = document.querySelectorAll(`input[type=checkbox][name=${CSS.escape(elInput.name)}]`);
                            if (allCheckboxes.length === 1) {
                                // true/false branch start
                                input.addEventListener("change", async () => {
                                    await changeHandler(input);
                                });
                            }
                            else if (allCheckboxes.length > 1) {
                                // piped branch
                                input.addEventListener("change", async () => {
                                    await pipedHandler(input);
                                });
                            }
                        }
                        else if (input.type == "radio") {
                            // just a text input
                            input.addEventListener("change", async () => {
                                await radioHandler(input);
                            });
                        }
                        else {
                            // just a text input
                            input.addEventListener("change", async () => {
                                await changeHandler(input);
                            });
                        }
                        break;
                    case "textarea":
                        const textarea = el;
                        textarea.addEventListener("change", async () => {
                            await changeHandler(textarea);
                        });
                        textarea.addEventListener("input", async () => {
                            await changeHandler(textarea);
                        });
                        break;
                    case "select":
                        const select = el;
                        select.addEventListener("change", async () => {
                            await changeHandler(select);
                        });
                        break;
                    default:
                        break;
                }
            }
        }
    }
    /**
     * Sets a data field and optionally updates the data.
     * @param key - The key of the data field to set.
     * @param value - The value to set for the data field.
     * @param push - Whether to update the data after setting the field.
     */
    async setDataField(key, value, push) {
        if (this.data[key] !== value) {
            this.data[key] = value;
        }
        // push even if no change
        if (push === true) {
            await this.updateData();
        }
    }
    /**
     * Gets the current plugin data.
     * @returns A promise that resolves to the plugin data.
     */
    async getData() {
        if (this.dataLoaded !== null) {
            return this.data;
        }
        else {
            await this.loadData();
            return this.data;
        }
    }
    /**
     * Loads the plugin data from the server.
     */
    async loadData() {
        var _a, _b;
        var _c, _d, _e;
        let pluginUrl = window.location.href;
        // adjust for core reports, 3rd party will not hit this
        if (pluginUrl === "about:srcdoc") {
            pluginUrl = `/reports/${(_c = (_a = window.parent.document.getElementById("report")) === null || _a === void 0 ? void 0 : _a.dataset.report) !== null && _c !== void 0 ? _c : ""}/`;
        }
        // console.log(`${pluginUrl}`)
        const kwargs = {
            "pluginUrl": pluginUrl,
        };
        const startTime = new Date().getTime();
        const result = await host_js_1.Host.postApiRequest("GetPluginData", kwargs);
        const endTime = new Date().getTime();
        try {
            host_js_1.Host.logTiming(`Loaded options: ${JSON.stringify(kwargs)}`, endTime - startTime);
            const jsonResponseData = result["data"];
            const jsonResponseDataEmpty = Object.keys(jsonResponseData).length === 0;
            const merged = {};
            for (const k in this.defaultData) {
                merged[k] = (this.defaultData)[k];
            }
            // stored options overwrites default data, if available
            for (const k in jsonResponseData) {
                merged[k] = (jsonResponseData)[k];
            }
            // if nothing is in the database, push the defaults (inc. meta)
            if (jsonResponseDataEmpty) {
                this.data = merged;
                await this.updateData();
            }
            this.data = merged;
            this.dataLoaded = new Date();
        }
        catch {
            console.warn(`failed to load plugin data @ \n${JSON.stringify(kwargs)}`);
        }
        if (this.autoformInputs.length > 0) {
            // init autoform if necessary
            if (!("autoform" in this.data)) {
                this.data["autoform"] = {};
            }
            else {
                // PluginData 1.0 stored legacy form data, remove
                for (let key in this.data["autoform"]) {
                    if (isNaN(parseInt(key, 10))) {
                        delete this.data["autoform"][key];
                    }
                    // else presumed number (projectId) -- already project aware
                }
                // end legacy
            }
            // init project level autoform, this is where input values stored
            if (!(this.project in this.data["autoform"])) {
                const defaultProjectData = (_d = (_b = this.defaultData["autoform"]) === null || _b === void 0 ? void 0 : _b[this.project]) !== null && _d !== void 0 ? _d : {};
                this.data["autoform"][this.project] = defaultProjectData;
            }
        }
        const radioGroups = [];
        // loop html elements, and set values to stored
        for (let el of this.autoformInputs) {
            // happens with 0 inputs
            if (el === null) {
                continue;
            }
            const name = el.name;
            const val = (_e = this.data["autoform"][this.project][name]) !== null && _e !== void 0 ? _e : null;
            const lowerTag = el.tagName.toLowerCase();
            let input;
            let isBooleanCheckbox = false;
            let isMultiCheckbox = false;
            let isRadio = false;
            let isSelect = false;
            let isTextarea = false;
            switch (lowerTag) {
                case "input":
                    input = el;
                    if (input.type === "radio") {
                        isRadio = true;
                        radioGroups.push(name);
                    }
                    else if (input.type === "checkbox" && typeof val === "boolean") {
                        isBooleanCheckbox = true;
                    }
                    else if (input.type === "checkbox" && typeof val === "string") {
                        isMultiCheckbox = true;
                    }
                    break;
                case "textarea":
                    input = el;
                    isTextarea = true;
                    break;
                case "select":
                    input = el;
                    isSelect = true;
                    break;
                default:
                    break;
            }
            // unsalvageable
            if (!input) {
                console.warn(`autoform: no input found`);
                return;
            }
            // got to custom handle the various checkboxes and radios
            switch (true) {
                case isRadio:
                    input.checked = val === input.value;
                    break;
                case isBooleanCheckbox:
                    input.checked = val ? val : false;
                    break;
                case isMultiCheckbox:
                    input.checked = val ? val.toString().indexOf(input.value) >= 0 : false;
                    break;
                case isTextarea:
                    input.value = val || "";
                    break;
                case isSelect:
                default:
                    // val null prior to being set
                    if (val) {
                        input.value = val;
                    }
                    // else input to self assign (default)
                    break;
            }
        }
        // clean up unchecked radios
        radioGroups.forEach((inputName) => {
            const hasCheck = document.querySelector(`input[name=${CSS.escape(inputName)}]:checked`) !== null;
            if (!hasCheck) {
                const firstRadio = document.querySelector(`input[name=${CSS.escape(inputName)}]`);
                if (firstRadio) {
                    firstRadio.checked = true;
                }
            }
        });
        return;
    }
    /**
     * Sets an autoform field and updates the data.
     * @param name - The name of the autoform field.
     * @param value - The value to set for the autoform field.
     */
    async setAutoformField(name, value) {
        var _a, _b;
        const data = await this.getData();
        const autoformData = (_a = data["autoform"]) !== null && _a !== void 0 ? _a : {};
        const projectAutoformData = (_b = autoformData[this.project]) !== null && _b !== void 0 ? _b : {};
        if (projectAutoformData[name] !== value) {
            projectAutoformData[name] = value;
            await this.setDataField("autoform", autoformData, true);
        }
    }
    /**
     * Updates the plugin data on the server.
     */
    async updateData() {
        const data = await this.getData();
        data["meta"] = this.meta;
        const kwargs = {
            pluginUrl: window.location.href,
            pluginData: data,
        };
        const result = await host_js_1.Host.postApiRequest("SetPluginData", kwargs);
        return;
    }
}
exports.PluginData = PluginData;
class SearchQuery {
    /**
     * Creates an instance of SearchQuery. Only project and query are
     * required, remaining params have sensible defaults.
     * @param params - Configuration object containing project, query, fields, type, includeExternal, and includeNoRobots
     */
    constructor(params) {
        var _a, _b, _c, _d, _e;
        this.includeExternal = true;
        this.includeNoRobots = false;
        this.project = params.project;
        this.query = params.query;
        // backcompat <=0.17 (piped string handling)
        if (typeof params.fields === "string") {
            this.fields = params.fields.split("|");
        }
        else {
            this.fields = (_a = params.fields) !== null && _a !== void 0 ? _a : [];
        }
        this.type = (_b = params.type) !== null && _b !== void 0 ? _b : SearchQueryType.Any;
        this.includeExternal = (_c = params.includeExternal) !== null && _c !== void 0 ? _c : true;
        this.includeNoRobots = (_d = params.includeNoRobots) !== null && _d !== void 0 ? _d : false;
        this.perPage = (_e = params.perPage) !== null && _e !== void 0 ? _e : SearchQuery.maxPerPage;
        if (params.sort !== undefined && SearchQuery.validSorts.indexOf(params.sort) >= 0) {
            this.sort = params.sort;
        }
        else {
            this.sort = SearchQuery.validSorts[1];
        }
    }
    /**
     * Gets the cache key for the haystack.
     * @returns A string representing the cache key.
     */
    getHaystackCacheKey() {
        return `${this.project}~${this.fields.join("|")}~${this.type}~${this.includeExternal}~${this.includeNoRobots}`;
    }
}
exports.SearchQuery = SearchQuery;
SearchQuery.maxPerPage = 100;
SearchQuery.validSorts = ["?", "id", "-id", "time", "-time", "status", "-status", "url", "-url",];
class Search {
    /**
     * Executes a search query.
     * @param query - The search query to execute
     * @param resultsMap - Map of existing results
     * @param resultHandler - Function to handle each search result
     * @param options - Optional configuration for pagination, progress display, and custom messages
     * @returns A promise that resolves to a boolean indicating if results were from cache
     */
    static async execute(query, resultsMap, resultHandler, options) {
        host_js_1.Host.logWarning(Search.executeDeprecationWarning);
        const timeStart = new Date().getTime();
        const { paginate = false, showProgress = true, progressMessage = "Processing..." } = options !== null && options !== void 0 ? options : {};
        // Promise<boolean> returned is a from-cache flag, true if cached
        if (resultsMap && Search.resultsCache.get(resultsMap) === query.getHaystackCacheKey()) {
            const resultTotal = resultsMap.size;
            // reuse api reuslts
            // print something to screen to inform user of operation
            // this is a blitz, doesn't get the http request breathing room of api http requests
            // anyways, paint first, then saturate cpu
            if (showProgress === true) {
                const eventStart = new CustomEvent("ProcessingMessage", { detail: { action: "set", message: progressMessage } });
                document.dispatchEvent(eventStart);
            }
            // give main thread a short break to render progress
            await host_js_1.Host.sleep(16);
            // note for of loop with sleep mod 100 works, looks smooth, but slows the operation by > 20%
            // this is faster, but it can't paint progress well as it can saturate the main thread
            for (const result of resultsMap.values()) {
                await resultHandler(result);
            }
            host_js_1.Host.logTiming(`Processed ${resultTotal.toLocaleString()} search result(s)`, new Date().getTime() - timeStart);
            if (showProgress === true) {
                const msg = { detail: { action: "clear" } };
                const eventFinished = new CustomEvent("ProcessingMessage", msg);
                document.dispatchEvent(eventFinished);
            }
            return true;
        }
        else if (resultsMap) {
            // mark the map as loaded for this haystack, caller populates it
            // via resultHandler for replay on the next same-haystack execute
            Search.resultsCache.set(resultsMap, query.getHaystackCacheKey());
        }
        const kwargs = {
            "project": query.project,
            "query": query.query,
            "external": query.includeExternal,
            "type": query.type,
            "offset": 0,
            "fields": query.fields,
            "norobots": query.includeNoRobots,
            "sort": query.sort,
            "perpage": query.perPage,
        };
        let responseJson = await host_js_1.Host.postApiRequest("GetResources", kwargs);
        const resultTotal = responseJson["__meta__"]["results"]["total"];
        let results = responseJson.results;
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            await Search.handleResult(result, resultTotal, resultHandler, showProgress);
        }
        while (responseJson["__meta__"]["results"]["pagination"]["nextOffset"] !== null && paginate === true) {
            const next = responseJson["__meta__"]["results"]["pagination"]["nextOffset"];
            kwargs["offset"] = next;
            if (query.sort === "?" && next > 0) {
                console.warn("Random sort (?) with pagination generates fresh randomness on each page. " +
                    "Consider maxing perpage (100) and using 1 page of results when sampling.");
            }
            responseJson = await host_js_1.Host.postApiRequest("GetResources", kwargs);
            results = responseJson.results;
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                await Search.handleResult(result, resultTotal, resultHandler, showProgress);
            }
        }
        host_js_1.Host.logTiming(`Loaded/processed ${resultTotal.toLocaleString()} search result(s)`, new Date().getTime() - timeStart);
        return false;
    }
    /**
     * Streams search results as an async iterator, paginating internally.
     * The streamlined alternative to execute():
     *
     *     for await (const result of Search.results(query)) { ... }
     *
     * No implicit caching, progress events are opt-in — break out of the
     * loop anytime to stop fetching.
     * @param query - The search query to execute
     * @param options - Optional; showProgress emits SearchResultHandled events
     * @returns An async generator yielding each SearchResult
     */
    static async *results(query, options) {
        var _a;
        const showProgress = (_a = options === null || options === void 0 ? void 0 : options.showProgress) !== null && _a !== void 0 ? _a : false;
        const kwargs = {
            "project": query.project,
            "query": query.query,
            "external": query.includeExternal,
            "type": query.type,
            "offset": 0,
            "fields": query.fields,
            "norobots": query.includeNoRobots,
            "sort": query.sort,
            "perpage": query.perPage,
        };
        while (true) {
            const responseJson = await host_js_1.Host.postApiRequest("GetResources", kwargs);
            const resultTotal = responseJson["__meta__"]["results"]["total"];
            for (const jsonResult of responseJson.results) {
                const searchResult = new SearchResult(jsonResult);
                yield searchResult;
                if (showProgress) {
                    Search.dispatchResultHandled(searchResult.result, resultTotal);
                }
            }
            const nextOffset = responseJson["__meta__"]["results"]["pagination"]["nextOffset"];
            if (nextOffset === null) {
                return;
            }
            if (query.sort === "?" && kwargs["offset"] === 0) {
                // once per query, not per page
                console.warn("Random sort (?) with pagination generates fresh randomness on each page. " +
                    "Consider maxing perpage (100) and using 1 page of results when sampling.");
            }
            kwargs["offset"] = nextOffset;
        }
    }
    /**
     * Handles a single search result.
     * @param jsonResult - The JSON representation of the search result.
     * @param resultTotal - The total number of results.
     * @param resultHandler - Function to handle the search result.
     * @param showProgress - Whether to emit a SearchResultHandled progress event.
     */
    static async handleResult(jsonResult, resultTotal, resultHandler, showProgress) {
        const searchResult = new SearchResult(jsonResult);
        await resultHandler(searchResult);
        if (showProgress) {
            Search.dispatchResultHandled(searchResult.result, resultTotal);
        }
    }
    /**
     * Dispatches the SearchResultHandled progress event.
     * @param resultNum - The 1-based position of the handled result.
     * @param resultTotal - The total number of results.
     */
    static dispatchResultHandled(resultNum, resultTotal) {
        const event = new CustomEvent("SearchResultHandled", { detail: { resultNum: resultNum, resultTotal: resultTotal } });
        document.dispatchEvent(event);
    }
}
exports.Search = Search;
Search.executeDeprecationWarning = `"execute" search method is deprecated, use "results" instead.`;
// haystack cache key is tracked per resultsMap instance, so that
// multiple queries sharing a page can't contaminate each other
Search.resultsCache = new WeakMap();
/**
 * Class representing a search result.
 */
class SearchResult {
    static normalizeContentWords(input) {
        const out = [];
        if (input !== "") {
            out.push.apply(out, input.split(/\s+/));
        }
        return out;
    }
    static normalizeContentString(input) {
        const words = SearchResult.normalizeContentWords(input);
        return words.join(" ");
    }
    /**
     * Creates an instance of SearchResult.
     * @param jsonResult - The JSON representation of the search result.
     */
    constructor(jsonResult) {
        var _a, _b;
        this.result = jsonResult.result;
        this.id = jsonResult.id;
        this.url = (_a = jsonResult.url) !== null && _a !== void 0 ? _a : ""; // deprecated
        this.name = (_b = jsonResult.name) !== null && _b !== void 0 ? _b : "";
        this.processedContent = "";
        for (const field of SearchResult.optionalFields) {
            if (field in jsonResult) {
                const value = jsonResult[field];
                if (field === "created" || field === "modified") {
                    this[field] = new Date(value);
                }
                else {
                    this[field] = value;
                }
            }
        }
    }
    /**
     * Checks if the result has processed content.
     * @returns True if processed content exists, false otherwise.
     */
    hasProcessedContent() {
        return this.processedContent != "";
    }
    /**
     * Gets the processed content of the search result.
     * @returns The processed content.
     */
    getProcessedContent() {
        return this.processedContent;
    }
    /**
     * Sets the processed content of the search result.
     * @param processedContent - The processed content to set.
     */
    setProcessedContent(processedContent) {
        this.processedContent = processedContent;
    }
    /**
     * Gets the raw content of the search result.
     * @returns The raw content.
     */
    getContent() {
        return this.content;
    }
    /**
     * Gets the content of the search result as text only.
     * @returns The content as plain text.
     */
    getContentTextOnly() {
        var _a;
        // out is the haystack string builder
        const out = [];
        let element = null;
        const texts = html_js_1.HtmlUtils.getDocumentCleanTextIterator(this.getContent());
        element = texts.iterateNext();
        while (element !== null) {
            let elementValue = SearchResult.normalizeContentString((_a = element.nodeValue) !== null && _a !== void 0 ? _a : "");
            if (elementValue !== "") {
                // filter empties
                const elementValueWords = elementValue.split(" ").filter((word) => word !== "");
                if (elementValueWords.length > 0) {
                    out.push.apply(out, elementValueWords);
                }
            }
            element = texts.iterateNext();
        }
        // tidy up html to text, doesn't have to be perfect
        let pageText = out.join(" ");
        pageText = pageText.replace(SearchResult.wordPunctuationRe, "");
        pageText = pageText.replace(SearchResult.wordWhitespaceRe, " ");
        return pageText;
    }
    /**
     * Gets the headers of the search result.
     * @returns The headers.
     */
    getHeaders() {
        return this.headers;
    }
    /**
     * Gets the path of the URL for the search result.
     * @returns The URL path.
     */
    getUrlPath() {
        const url = new URL(this.url);
        return url.pathname;
    }
    /**
     * Clears the full-text fields of the search result.
     */
    clearFulltextFields() {
        // an attempt to clear memory after use
        // other fields are small in comparison
        this.content = "";
        this.headers = "";
    }
}
exports.SearchResult = SearchResult;
SearchResult.wordPunctuationRe = /\s+(?=[\.,;:!\?] )/g;
SearchResult.wordWhitespaceRe = /\s+/g;
SearchResult.optionalFields = ["created", "modified", "size", "status",
    "time", "norobots", "name", "type", "content", "headers", "links", "assets", "origin"];
/**
 * Class representing a crawl.
 */
class Crawl {
    /**
     * Creates an instance of Crawl.
     * @param params - Configuration object containing id, project, created, modified, complete, time, and report
     */
    constructor(params) {
        var _a, _b, _c, _d, _e;
        this.id = -1;
        this.project = -1;
        this.created = null;
        this.modified = null;
        this.time = -1;
        this.report = null;
        this.id = params.id;
        this.project = params.project;
        this.created = (_a = params.created) !== null && _a !== void 0 ? _a : null;
        this.modified = (_b = params.modified) !== null && _b !== void 0 ? _b : null;
        this.complete = (_c = params.complete) !== null && _c !== void 0 ? _c : false;
        this.time = (_d = params.time) !== null && _d !== void 0 ? _d : -1;
        this.report = (_e = params.report) !== null && _e !== void 0 ? _e : null;
    }
    /**
     * Gets the timings from the crawl report.
     * @returns The timings object, or null (InterroBot pre-2.6).
     */
    getTimings() {
        return this.getReportDetailByKey("timings");
    }
    /**
     * Gets the sizes from the crawl report.
     * @returns The sizes object, or null (InterroBot pre-2.6).
     */
    getSizes() {
        return this.getReportDetailByKey("sizes");
    }
    /**
     * Gets the counts from the crawl report.
     * @returns The counts object, or null (InterroBot pre-2.6).
     */
    getCounts() {
        return this.getReportDetailByKey("counts");
    }
    getReportDetailByKey(key) {
        // returns a dictionary of key/values for the corresponding key
        // InterroBot pre-2.6 will not contain a detail object
        if (this.report && this.report.hasOwnProperty("detail") &&
            this.report.detail.hasOwnProperty(key)) {
            return this.report.detail[key];
        }
        else {
            return null;
        }
    }
}
exports.Crawl = Crawl;
/**
 * Class representing a project.
 */
class Project {
    /**
     * Creates an instance of Project.
     * @param params - Configuration object containing id, created, modified, name, type, url, urls, and imageDataUri
     */
    constructor(params) {
        this.id = -1;
        this.created = null;
        this.modified = null;
        this.name = null; // name to required when url shut down
        this.type = null; // name to required when url shut down
        this.url = null; // deprecated
        this.urls = null;
        this.imageDataUri = null;
        this.id = params.id;
        this.name = params.name;
        this.type = params.type;
        this.created = params.created;
        this.modified = params.modified;
        this.url = params.url;
        this.urls = params.urls;
        this.imageDataUri = params.imageDataUri;
    }
    /**
     * Gets the data URI of the project image.
     * @returns The image data URI.
     */
    getImageDataUri() {
        var _a;
        return (_a = this.imageDataUri) !== null && _a !== void 0 ? _a : "";
    }
    /**
     * Gets the display title of the project.
     * @returns The display title (hostname of the project URL).
     */
    getDisplayTitle() {
        if (this.name) {
            return this.name;
        }
        else if (this.url) {
            host_js_1.Host.logWarning(Project.urlDeprecationWarning);
            return new URL(this.url).hostname;
        }
        else {
            // no fields to work with, better blank than a sentinel in the UI
            host_js_1.Host.logWarning(`project ${this.id} display title unavailable, "name" empty`);
            return "";
        }
    }
    getDisplayUrl() {
        if (this.urls) {
            const firstUrl = this.urls[0];
            const urlCount = this.urls.length;
            const more = urlCount > 1 ? ` + ${urlCount - 1} more` : "";
            return `${firstUrl}${more}`;
        }
        else if (this.url) {
            host_js_1.Host.logWarning(Project.urlDeprecationWarning);
            return new URL(this.url).hostname;
        }
        else {
            // no fields to work with, better blank than a sentinel in the UI
            host_js_1.Host.logWarning(`project ${this.id} display url unavailable, "urls" empty`);
            return "";
        }
    }
    /**
     * Gets a project by its ID from the API.
     * @param id - The project ID.
     * @returns A promise that resolves to a Project instance.
     * @throws If no project matches the id.
     */
    static async getApiProject(id) {
        const kwargs = {
            "projects": [id],
            "fields": ["image", "created", "modified", "urls"],
        };
        const projects = await host_js_1.Host.postApiRequest("GetProjects", kwargs);
        const results = projects.results;
        for (let i = 0; i < results.length; i++) {
            const project = results[i];
            if (project.id === id) {
                // hit, return as instance
                const created = new Date(project.created);
                const modified = new Date(project.modified);
                const name = project.name || project.url; // url is deprecated
                const imageDataUri = project.image;
                const urls = project.urls || null;
                // return new Project(id, created, modified, url, imageDataUri);
                return new Project({
                    id: id,
                    created: created,
                    modified: modified,
                    name: name,
                    imageDataUri: imageDataUri,
                    urls: urls
                });
            }
        }
        // not found
        throw new Error(`project id=${id} not found`);
    }
    /**
     * Gets all crawls for a project from the API.
     * @param project - The project ID.
     * @returns A promise that resolves to an array of Crawl instances.
     */
    static async getApiCrawls(project) {
        const kwargs = {
            complete: "complete",
            project: project,
            fields: ["created", "modified", "report", "time"],
        };
        const response = await host_js_1.Host.postApiRequest("GetCrawls", kwargs);
        const crawls = [];
        const crawlResults = response.results;
        for (let i = 0; i < crawlResults.length; i++) {
            const crawlResult = crawlResults[i];
            crawls.push(new Crawl({
                id: crawlResult.id,
                project: project,
                created: new Date(crawlResult.created),
                modified: new Date(crawlResult.modified),
                complete: crawlResult.complete,
                time: crawlResult.time,
                report: crawlResult.report
            }));
        }
        return crawls;
    }
}
exports.Project = Project;
Project.urlDeprecationWarning = `"url" field is deprecated, use "name" or "urls" instead.`;
/** @deprecated misspelling, use urlDeprecationWarning */
Project.urlDeprectionWarning = Project.urlDeprecationWarning;
