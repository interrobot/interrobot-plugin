/* tslint:disable:no-console */
/* tslint:disable:max-line-length */
import { HtmlUtils } from "./html.js";
import { Plugin } from "./plugin.js";
var SearchQueryType;
(function (SearchQueryType) {
    SearchQueryType[SearchQueryType["Page"] = 0] = "Page";
    SearchQueryType[SearchQueryType["Asset"] = 1] = "Asset";
    SearchQueryType[SearchQueryType["Any"] = 2] = "Any";
})(SearchQueryType || (SearchQueryType = {}));
class PluginData {
    constructor(meta, defaultData, autoformInputs) {
        this.meta = meta;
        this.defaultData = defaultData;
        this.autoformInputs = autoformInputs;
        // init and copy in default data
        this.data = {
            generator: null,
            apiVersion: "1.1",
            autoform: {},
        };
        for (let key in defaultData) {
            this.data[key] = defaultData[key];
        }
        if (autoformInputs.length > 0) {
            const autoform = {};
            const changeHandler = async (el) => {
                var _a;
                let name = el.getAttribute("name");
                const value = el.value;
                const data = await this.getData();
                const autoform = (_a = data["autoform"]) !== null && _a !== void 0 ? _a : {};
                if (autoform[name] !== value) {
                    // console.log(`${name} | ${value} | ${autoform}`);
                    autoform[name] = value;
                    // console.log(autoform);
                    await this.setDataField("autoform", autoform, true);
                }
            };
            for (let el of this.autoformInputs) {
                const tag = el.tagName.toLowerCase();
                const name = el.getAttribute("name");
                autoform[name] = null;
                switch (tag) {
                    case "input":
                        const input = el;
                        input.addEventListener("change", async (ev) => {
                            await changeHandler(input);
                        });
                        break;
                    case "textarea":
                        const textarea = el;
                        textarea.addEventListener("change", async (ev) => {
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
    async setDataField(key, value, push) {
        if (this.data[key] !== value) {
            this.data[key] = value;
        }
        // push even if no change for the modtime
        if (push === true) {
            await this.updateData();
        }
    }
    async getData() {
        if (this.dataLoaded !== null) {
            return this.data;
        }
        else {
            await this.loadData();
            return this.data;
        }
    }
    async loadData() {
        var _a;
        const endpoint = this.getDataEndpoint();
        const result = await fetch(endpoint);
        try {
            const jsonResponse = await result.json();
            const jsonResponseData = jsonResponse["data"];
            // console.log(jsonResponse);
            const merged = {};
            for (let k in this.defaultData) {
                merged[k] = this.defaultData[k];
            }
            for (let k in jsonResponseData) {
                merged[k] = jsonResponseData[k];
            }
            this.data = merged;
            this.dataLoaded = new Date();
        }
        catch {
            console.warn(`failed to load plugin data @ ${endpoint}`);
        }
        for (let el of this.autoformInputs) {
            const name = el.name;
            if (!("autoform" in this.data)) {
                this.data["autoform"] = {};
            }
            const val = (_a = this.data["autoform"][name]) !== null && _a !== void 0 ? _a : null;
            let input;
            switch (el.tagName.toLowerCase()) {
                case "input":
                    input = el;
                    break;
                case "textarea":
                    input = el;
                    break;
                case "select":
                    input = el;
                    break;
                default:
                    break;
            }
            // console.log(this.data["autoform"]); console.log(input); console.log(val);
            if (input && val) {
                input.value = val;
            }
        }
        return;
    }
    async updateData() {
        const updateEndpoint = this.getDataEndpoint();
        const data = await this.getData();
        data["meta"] = this.meta;
        const dataUpload = JSON.stringify(data);
        const result = await fetch(updateEndpoint, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: dataUpload
        });
        const json = await result.json();
        return;
    }
    getDataEndpoint() {
        const key = this.getPluginUrl();
        const b64Key = btoa(key);
        const updateEndpoint = `${Plugin.getHostOrigin()}/api/v2/plugins/${encodeURIComponent(b64Key)}/data/`;
        return updateEndpoint;
    }
    getPluginUrl() {
        return `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    }
}
class SearchQuery {
    constructor(projectId, query, fields, type, includeExternal) {
        this.projectId = projectId;
        this.query = query;
        this.fields = fields;
        this.type = type;
        this.includeExternal = includeExternal;
    }
    getHaystackCacheKey() {
        return `${this.projectId}~${this.fields}~${this.type}~${this.includeExternal}`;
    }
}
class Search {
    static async execute(query, existingResults, processingMessage, resultHandler) {
        const timeStart = new Date().getTime();
        processingMessage = processingMessage !== null && processingMessage !== void 0 ? processingMessage : "Processing...";
        // Promise<boolean> returned is a from-cache flag, true if cached
        if (query.getHaystackCacheKey() === Search.resultsHaystackCacheKey && existingResults) {
            const resultTotal = existingResults.size;
            // reuse api reuslts
            // print something to screen to inform user of operation
            // this is a blitz, doesn't get the http request breathing room of api http requests
            // anyways, paint first, then saturate cpu
            const eventStart = new CustomEvent("ProcessingMessage", { detail: { action: "set", message: processingMessage } });
            document.dispatchEvent(eventStart);
            // give main thread a very short break to render
            await Search.sleep(16);
            // note for of loop with sleep mod 100 works, looks smooth, but slows the operation by > 20%
            // this is faster, but it can't paint progress
            let i = 0;
            await existingResults.forEach(async (result, resultId) => {
                await resultHandler(result);
            });
            Plugin.logTiming(`Processed ${resultTotal.toLocaleString()} search result(s)`, new Date().getTime() - timeStart);
            const msg = { detail: { action: "clear" } };
            const eventFinished = new CustomEvent("ProcessingMessage", msg);
            document.dispatchEvent(eventFinished);
            return true;
        }
        else {
            Search.resultsHaystackCacheKey = query.getHaystackCacheKey();
            Search.resultsCacheTotal = 0;
        }
        const resultsPageBase = `${Plugin.getHostOrigin()}/api/v2/projects/${query.projectId}/resources/`;
        const resultsPageQuery = `query=${encodeURIComponent(query.query)}`
            + `&type=${SearchQueryType[query.type].toLowerCase()}&external=${Number(query.includeExternal)}`
            + `&fields=${encodeURIComponent(query.fields)}&offset=0`;
        const resultsPageUrl = `${resultsPageBase}?${resultsPageQuery}`;
        let response = await fetch(resultsPageUrl);
        let responseJson = await response.json();
        const resultTotal = responseJson["__meta__"]["results"]["total"];
        Search.resultsCacheTotal = resultTotal;
        let results = responseJson.results;
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            await Search.handleResult(result, resultTotal, resultHandler);
        }
        while (responseJson["__meta__"]["results"]["pagination"]["next"] !== null) {
            const next = responseJson["__meta__"]["results"]["pagination"]["next"];
            response = await fetch(next);
            responseJson = await response.json();
            results = responseJson.results;
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                await Search.handleResult(result, resultTotal, resultHandler);
            }
        }
        Plugin.logTiming(`Loaded/processed ${resultTotal.toLocaleString()} search result(s)`, new Date().getTime() - timeStart);
        return false;
    }
    static async sleep(millis) {
        return new Promise((resolve) => setTimeout(() => resolve(), millis));
    }
    static async handleResult(jsonResult, resultTotal, resultHandler) {
        const searchResult = new SearchResult(jsonResult);
        await resultHandler(searchResult);
        const resultNum = searchResult.result;
        const event = new CustomEvent("SearchResultHandled", { detail: { resultNum: resultNum, resultTotal: resultTotal } });
        document.dispatchEvent(event);
    }
}
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
    constructor(jsonResult) {
        this.optionalFields = ["status", "time", "norobots", "name", "type", "content",
            "headers", "links", "assets"];
        this.result = jsonResult["result"];
        this.id = jsonResult["id"];
        this.url = jsonResult["url"];
        this.processedContent = "";
        for (let field of this.optionalFields) {
            if (field in jsonResult) {
                this[field] = jsonResult[field];
            }
        }
    }
    hasProcessedContent() {
        return this.processedContent != "";
    }
    getProcessedContent() {
        return this.processedContent;
    }
    setProcessedContent(processedContent) {
        this.processedContent = processedContent;
    }
    getContent() {
        return this.content;
    }
    getContentTextOnly() {
        // out is the haystack string builder, start with the url path
        const out = [];
        let element = null;
        const texts = HtmlUtils.getDocumentCleanTextIterator(this.getContent());
        element = texts.iterateNext();
        while (element !== null) {
            let elementValue = SearchResult.normalizeContentString(element.nodeValue);
            if (elementValue !== "") {
                // elementValue can be a word, a sentence, or more
                out.push.apply(out, elementValue.split(" "));
            }
            element = texts.iterateNext();
        }
        // tidy up html to text, doesn't have to be perfect
        let pageText = out.join(" ");
        pageText = pageText.replace(SearchResult.wordPunctuationRe, "");
        pageText = pageText.replace(SearchResult.wordWhitespaceRe, " ");
        return pageText;
    }
    getHeaders() {
        return this.headers;
    }
    getUrlPath() {
        const url = new URL(this.url);
        return url.pathname;
    }
    clearFulltextFields() {
        // an attempt to clear memory after use
        // other fields are small in comparison
        this.content = "";
        this.headers = "";
    }
}
SearchResult.wordPunctuationRe = /\s+(?=[\.,;:!\?])/g;
SearchResult.wordWhitespaceRe = /\s+/g;
class Project {
    constructor(id, created, modified, url, imageDataUri) {
        this.id = -1;
        this.created = null;
        this.modified = null;
        this.id = id;
        this.created = created;
        this.modified = modified;
        this.url = url;
        this.imageDataUri = imageDataUri;
    }
    getImageDataUri() {
        return this.imageDataUri;
    }
    getDisplayTitle() {
        return new URL(this.url).hostname;
    }
    static async getApiProject(id) {
        const response = await fetch(`${Plugin.getHostOrigin()}/api/v2/projects/?fields=image&ids=${id}`);
        const projects = await response.json();
        const results = projects.results;
        for (let i = 0; i < results.length; i++) {
            const project = results[i];
            if (project.id === id) {
                // hit, return as instance
                const created = new Date(project.created);
                const modified = new Date(project.modified);
                const url = project.url;
                const imageDataUri = project.image;
                return new Project(id, created, modified, url, imageDataUri);
            }
        }
        return null;
    }
}
export { Project, SearchQueryType, SearchQuery, Search, SearchResult, PluginData };
