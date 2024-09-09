"use strict";
/* tslint:disable:no-console */
/* tslint:disable:max-line-length */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginData = exports.SearchResult = exports.Search = exports.SearchQuery = exports.SearchQueryType = exports.Crawl = exports.Project = void 0;
const html_js_1 = require("./html.js");
const plugin_js_1 = require("./plugin.js");
var SearchQueryType;
(function (SearchQueryType) {
    SearchQueryType[SearchQueryType["Page"] = 0] = "Page";
    SearchQueryType[SearchQueryType["Asset"] = 1] = "Asset";
    SearchQueryType[SearchQueryType["Any"] = 2] = "Any";
})(SearchQueryType || (exports.SearchQueryType = SearchQueryType = {}));
class PluginData {
    constructor(projectId, meta, defaultData, autoformInputs) {
        this.meta = meta;
        this.defaultData = defaultData;
        this.autoformInputs = autoformInputs;
        this.project = projectId;
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
        if (autoformInputs.length > 0) {
            // const setValue = async (name: string, value: string) => {
            //     const data: {} = await this.getData();
            //     const autoformData: {} = data["autoform"] ?? {};
            //     const projectAutoformData: {} = autoformData[this.project] ?? {};
            //     if (projectAutoformData[name] !== value) {
            //         projectAutoformData[name] = value;
            //         await this.setDataField("autoform", autoformData, true);
            //     }
            // }
            const changeHandler = async (el) => {
                let name = el.getAttribute("name");
                const value = el.checked === undefined ? el.value : el.checked;
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
        // push even if no change
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
            const defaultProjectData = {};
            if (!("autoform" in this.data)) {
                this.data["autoform"] = {};
            }
            else {
                // legacy PluginData stored form data, handle/remove
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
            const val = (_a = this.data["autoform"][this.project][name]) !== null && _a !== void 0 ? _a : null;
            const lowerTag = el.tagName.toLowerCase();
            let input;
            let isBooleanCheckbox = false;
            let isMultiCheckbox = false;
            let isRadio = false;
            let isSelect = false;
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
        /*
        // preserved for historical reference
        const response = await fetch(`${Plugin.getHostOrigin()}/api/v2/projects/?fields=image&ids=${id}`);
        const projects = await response.json();
        const dataUpload: string = JSON.stringify(data);
        const result = await fetch(updateEndpoint, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: dataUpload
        });
        const json: JSON = await result.json();
        return;
        */
    }
    getDataSlug() {
        const key = this.getPluginUrl();
        const b64Key = btoa(key);
        return b64Key;
    }
    getPluginUrl() {
        return `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    }
}
exports.PluginData = PluginData;
class SearchQuery {
    constructor(project, query, fields, type, includeExternal) {
        this.project = project;
        this.query = query;
        this.fields = fields;
        this.type = type;
        this.includeExternal = includeExternal;
    }
    getHaystackCacheKey() {
        return `${this.project}~${this.fields}~${this.type}~${this.includeExternal}`;
    }
}
exports.SearchQuery = SearchQuery;
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
            // give main thread a short break to render
            await Search.sleep(16);
            // note for of loop with sleep mod 100 works, looks smooth, but slows the operation by > 20%
            // this is faster, but it can't paint progress well as it can saturate the main thread
            let i = 0;
            await existingResults.forEach(async (result, resultId) => {
                await resultHandler(result);
            });
            plugin_js_1.Plugin.logTiming(`Processed ${resultTotal.toLocaleString()} search result(s)`, new Date().getTime() - timeStart);
            const msg = { detail: { action: "clear" } };
            const eventFinished = new CustomEvent("ProcessingMessage", msg);
            document.dispatchEvent(eventFinished);
            return true;
        }
        else {
            Search.resultsHaystackCacheKey = query.getHaystackCacheKey();
            Search.resultsCacheTotal = 0;
        }
        /*
        HTTP/old
        const resultsPageBase = `${Plugin.getHostOrigin()}/api/v2/projects/${query.projectId}/resources/`;
        const resultsPageQuery = `query=${encodeURIComponent(query.query)}`
            + `&type=${SearchQueryType[query.type].toLowerCase()}&external=${Number(query.includeExternal)}`
            + `&fields=${encodeURIComponent(query.fields)}&offset=0`;
        const resultsPageUrl = `${resultsPageBase}?${resultsPageQuery}`;
        let response = await fetch(resultsPageUrl);
        let responseJson = await response.json();
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
        */
        const kwargs = {
            "project": query.project,
            "query": query.query,
            "external": query.includeExternal,
            "type": SearchQueryType[query.type].toLowerCase(),
            "offset": 0,
            "fields": query.fields.split("|"),
        };
        let responseJson = await plugin_js_1.Plugin.postApiRequest("GetResources", kwargs);
        const resultTotal = responseJson["__meta__"]["results"]["total"];
        Search.resultsCacheTotal = resultTotal;
        let results = responseJson.results;
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            await Search.handleResult(result, resultTotal, resultHandler);
        }
        while (responseJson["__meta__"]["results"]["pagination"]["nextOffset"] !== null) {
            const next = responseJson["__meta__"]["results"]["pagination"]["nextOffset"];
            kwargs["offset"] = next;
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
exports.Search = Search;
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
        this.optionalFields = ["created", "modified", "size", "status",
            "time", "norobots", "name", "type", "content", "headers", "links", "assets", "origin"];
        this.result = jsonResult["result"];
        this.id = jsonResult["id"];
        this.url = jsonResult["url"];
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
exports.SearchResult = SearchResult;
SearchResult.wordPunctuationRe = /\s+(?=[\.,;:!\?] )/g;
SearchResult.wordWhitespaceRe = /\s+/g;
class Crawl {
    constructor(id, project, created, modified, complete, time, report) {
        this.id = -1;
        this.created = null;
        this.modified = null;
        this.project = -1;
        this.time = -1;
        this.report = null;
        this.id = id;
        this.created = created;
        this.modified = modified;
        this.complete = complete;
        this.project = project;
        this.time = time;
        this.report = report;
    }
    getTimings() {
        return this.getReportDetailByKey("timings");
    }
    getSizes() {
        return this.getReportDetailByKey("sizes");
    }
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
        const kwargs = {
            "projects": [id],
            "fields": ["image", "created", "modified"],
        };
        const projects = await plugin_js_1.Plugin.postApiRequest("GetProjects", kwargs);
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
        // not found
        return null;
    }
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
            // console.log(crawlResult.created);
            // console.log(new Date(crawlResult.created));
            const crawl = new Crawl(crawlResult.id, project, new Date(crawlResult.created), new Date(crawlResult.modified), crawlResult.complete, crawlResult.time, crawlResult.report);
            crawls.push(crawl);
        }
        return crawls;
    }
}
exports.Project = Project;
