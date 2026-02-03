"use strict";
/* tslint:disable:no-console */
/* tslint:disable:max-line-length */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginData = exports.SearchResult = exports.Search = exports.SearchQuery = exports.SearchQueryType = exports.Crawl = exports.Project = void 0;
const html_js_1 = require("./html.js");
const plugin_js_1 = require("./plugin.js");
/**
 * Enumeration for different types of search queries.
 */
var SearchQueryType;
(function (SearchQueryType) {
    SearchQueryType["Page"] = "page";
    SearchQueryType["Asset"] = "asset";
    SearchQueryType["Any"] = "any";
})(SearchQueryType || (SearchQueryType = {}));
exports.SearchQueryType = SearchQueryType;
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
        if (this.data.autoform === null) {
            this.data.autoform = [];
        }
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
                const checkedRadios = document.querySelectorAll(`input[type=radio][name=${elInput.name}]:checked`);
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
                const checkedCheckboxes = document.querySelectorAll(`input[type=checkbox][name=${elInput.name}]:checked`);
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
                            const allCheckboxes = document.querySelectorAll(`input[type=checkbox][name=${elInput.name}]`);
                            if (allCheckboxes.length === 1) {
                                // true/false branch start
                                input.addEventListener("change", async (ev) => {
                                    await changeHandler(input);
                                });
                            }
                            else if (allCheckboxes.length > 1) {
                                // piped branch
                                input.addEventListener("change", async (ev) => {
                                    await pipedHandler(input);
                                });
                            }
                        }
                        else if (input.type == "radio") {
                            // just a text input
                            input.addEventListener("change", async (ev) => {
                                await radioHandler(input);
                            });
                        }
                        else {
                            // just a text input
                            input.addEventListener("change", async (ev) => {
                                await changeHandler(input);
                            });
                        }
                        break;
                    case "textarea":
                        const textarea = el;
                        textarea.addEventListener("change", async (ev) => {
                            await changeHandler(textarea);
                        });
                        textarea.addEventListener("input", async (ev) => {
                            await changeHandler(textarea);
                        });
                        break;
                    case "select":
                        const select = el;
                        select.addEventListener("change", async (ev) => {
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
        var _a, _b, _c;
        let pluginUrl = window.location.href;
        // adjust for core reports, 3rd party will not hit this
        if (pluginUrl === "about:srcdoc") {
            pluginUrl = `/reports/${window.parent.document.getElementById("report").dataset.report}/`;
        }
        // console.log(`${pluginUrl}`)
        const kwargs = {
            "pluginUrl": pluginUrl,
        };
        const startTime = new Date().getTime();
        const result = await plugin_js_1.Plugin.postApiRequest("GetPluginData", kwargs);
        const endTime = new Date().getTime();
        try {
            plugin_js_1.Plugin.logTiming(`Loaded options: ${JSON.stringify(kwargs)}`, endTime - startTime);
            const jsonResponseData = result["data"];
            const jsonResponseDataEmpty = Object.keys(jsonResponseData).length === 0;
            const merged = {};
            for (let k in this.defaultData) {
                const val = this.defaultData[k];
                merged[k] = this.defaultData[k];
            }
            // stored options overwrites default data, if available
            for (let k in jsonResponseData) {
                const val = this.defaultData[k];
                merged[k] = jsonResponseData[k];
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
                const defaultProjectData = (_b = (_a = this.defaultData["autoform"]) === null || _a === void 0 ? void 0 : _a[this.project]) !== null && _b !== void 0 ? _b : {};
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
            const val = (_c = this.data["autoform"][this.project][name]) !== null && _c !== void 0 ? _c : null;
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
            const hasCheck = document.querySelector(`input[name=${inputName}]:checked`) !== null;
            if (!hasCheck) {
                const firstRadio = document.querySelector(`input[name=${inputName}]`);
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
        // const updateEndpoint = this.getDataEndpoint();
        const data = await this.getData();
        data["meta"] = this.meta;
        const kwargs = {
            pluginUrl: window.location.href,
            pluginData: data,
        };
        const result = await plugin_js_1.Plugin.postApiRequest("SetPluginData", kwargs);
        return;
    }
    /**
     * Gets the data slug for the plugin.
     * @returns The base64 encoded plugin URL.
     */
    getDataSlug() {
        const key = this.getPluginUrl();
        const b64Key = btoa(key);
        return b64Key;
    }
    /**
     * Gets the current plugin URL.
     * @returns The full URL of the plugin.
     */
    getPluginUrl() {
        return `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    }
}
exports.PluginData = PluginData;
class SearchQuery {
    /**
     * Creates an instance of SearchQuery.
     * @param params - Configuration object containing project, query, fields, type, includeExternal, and includeNoRobots
     */
    constructor(params) {
        var _a, _b, _c;
        this.includeExternal = true;
        this.includeNoRobots = false;
        this.project = params.project;
        this.query = params.query;
        // backcompat <=0.17 (piped string handling)
        if (typeof params.fields === "string") {
            this.fields = params.fields.split("|");
        }
        else {
            this.fields = params.fields;
        }
        this.type = params.type;
        this.includeExternal = (_a = params.includeExternal) !== null && _a !== void 0 ? _a : true;
        this.includeNoRobots = (_b = params.includeNoRobots) !== null && _b !== void 0 ? _b : false;
        this.perPage = (_c = params.perPage) !== null && _c !== void 0 ? _c : SearchQuery.maxPerPage;
        if (SearchQuery.validSorts.indexOf(params.sort) >= 0) {
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
        const timeStart = new Date().getTime();
        const { paginate = false, showProgress = true, progressMessage = "Processing..." } = options !== null && options !== void 0 ? options : {};
        // Promise<boolean> returned is a from-cache flag, true if cached
        if (query.getHaystackCacheKey() === Search.resultsHaystackCacheKey && resultsMap) {
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
            await Search.sleep(16);
            // note for of loop with sleep mod 100 works, looks smooth, but slows the operation by > 20%
            // this is faster, but it can't paint progress well as it can saturate the main thread
            let i = 0;
            await resultsMap.forEach(async (result, resultId) => {
                await resultHandler(result);
            });
            plugin_js_1.Plugin.logTiming(`Processed ${resultTotal.toLocaleString()} search result(s)`, new Date().getTime() - timeStart);
            if (showProgress === true) {
                const msg = { detail: { action: "clear" } };
                const eventFinished = new CustomEvent("ProcessingMessage", msg);
                document.dispatchEvent(eventFinished);
            }
            return true;
        }
        else {
            Search.resultsHaystackCacheKey = query.getHaystackCacheKey();
            Search.resultsCacheTotal = 0;
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
        let responseJson = await plugin_js_1.Plugin.postApiRequest("GetResources", kwargs);
        const resultTotal = responseJson["__meta__"]["results"]["total"];
        Search.resultsCacheTotal = resultTotal;
        let results = responseJson.results;
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            await Search.handleResult(result, resultTotal, resultHandler);
        }
        while (responseJson["__meta__"]["results"]["pagination"]["nextOffset"] !== null && paginate === true) {
            const next = responseJson["__meta__"]["results"]["pagination"]["nextOffset"];
            kwargs["offset"] = next;
            if (query.sort === "?" && next > 0) {
                console.warn("Random sort (?) with pagination generates fresh randomness on each page. " +
                    "Consider maxing perpage (100) and using 1 page of results when sampling.");
            }
            responseJson = await plugin_js_1.Plugin.postApiRequest("GetResources", kwargs);
            results = responseJson.results;
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                await Search.handleResult(result, resultTotal, resultHandler);
            }
        }
        plugin_js_1.Plugin.logTiming(`Loaded/processed ${resultTotal.toLocaleString()} search result(s)`, new Date().getTime() - timeStart);
        return false;
    }
    /**
     * Sleeps for the specified number of milliseconds.
     * @param millis - The number of milliseconds to sleep.
     */
    static async sleep(millis) {
        return new Promise((resolve) => setTimeout(() => resolve(), millis));
    }
    /**
     * Handles a single search result.
     * @param jsonResult - The JSON representation of the search result.
     * @param resultTotal - The total number of results.
     * @param resultHandler - Function to handle the search result.
     */
    static async handleResult(jsonResult, resultTotal, resultHandler) {
        const searchResult = new SearchResult(jsonResult);
        await resultHandler(searchResult);
        const resultNum = searchResult.result;
        const event = new CustomEvent("SearchResultHandled", { detail: { resultNum: resultNum, resultTotal: resultTotal } });
        document.dispatchEvent(event);
    }
}
exports.Search = Search;
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
        var _a;
        this.optionalFields = ["created", "modified", "size", "status",
            "time", "norobots", "name", "type", "content", "headers", "links", "assets", "origin"];
        this.result = jsonResult.result;
        this.id = jsonResult.id;
        this.url = (_a = jsonResult.url) !== null && _a !== void 0 ? _a : null; // deprecated
        this.name = jsonResult.name;
        this.processedContent = "";
        for (let field of this.optionalFields) {
            if (field in jsonResult) {
                if (field === "created" || field === "modified") {
                    this[field] = new Date(jsonResult[field]);
                }
                else {
                    this[field] = jsonResult[field];
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
        // out is the haystack string builder
        const out = [];
        let element = null;
        const texts = html_js_1.HtmlUtils.getDocumentCleanTextIterator(this.getContent());
        element = texts.iterateNext();
        while (element !== null) {
            let elementValue = SearchResult.normalizeContentString(element.nodeValue);
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
/**
 * Class representing a crawl.
 */
class Crawl {
    /**
     * Creates an instance of Crawl.
     * @param params - Configuration object containing id, project, created, modified, complete, time, and report
     */
    constructor(params) {
        this.id = -1;
        this.project = -1;
        this.created = null;
        this.modified = null;
        this.time = -1;
        this.report = null;
        this.id = params.id;
        this.project = params.project;
        this.created = params.created;
        this.modified = params.modified;
        this.complete = params.complete;
        this.time = params.time;
        this.report = params.report;
    }
    /**
     * Gets the timings from the crawl report.
     * @returns The timings object.
     */
    getTimings() {
        return this.getReportDetailByKey("timings");
    }
    /**
     * Gets the sizes from the crawl report.
     * @returns The sizes object.
     */
    getSizes() {
        return this.getReportDetailByKey("sizes");
    }
    /**
     * Gets the counts from the crawl report.
     * @returns The counts object.
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
        return this.imageDataUri;
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
            plugin_js_1.Plugin.logWarning(Project.urlDeprectionWarning);
            return new URL(this.url).hostname;
        }
        else {
            return "[error]";
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
            plugin_js_1.Plugin.logWarning(Project.urlDeprectionWarning);
            return new URL(this.url).hostname;
        }
        else {
            return "[error]";
        }
    }
    /**
     * Gets a project by its ID from the API.
     * @param id - The project ID.
     * @returns A promise that resolves to a Project instance, or null if not found.
     */
    static async getApiProject(id) {
        const kwargs = {
            "projects": [id],
            "fields": ["image", "created", "modified", "urls"],
        };
        const projects = await plugin_js_1.Plugin.postApiRequest("GetProjects", kwargs);
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
        return null;
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
        const response = await plugin_js_1.Plugin.postApiRequest("GetCrawls", kwargs);
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
Project.urlDeprectionWarning = `"url" field is deprecated, use "name" or "urls" instead.`;
