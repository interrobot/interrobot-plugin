/* tslint:disable:no-console */
/* tslint:disable:max-line-length */

import { HtmlUtils } from "./html.js";
import { Plugin } from "./plugin.js";

/**
 * Enumeration for different types of search queries.
 */
enum SearchQueryType {
    Page,
    Asset,
    Any,
}

enum SearchQuerySortField {
    Id,
    Time,
    Status,
    Url,
}

enum SearchQuerySortDirection {
    Ascending,
    Descending,
}

interface SearchQueryParams {
    project: number;
    query: string;
    fields: string;
    type: SearchQueryType;
    includeExternal?: boolean;
    includeNoRobots?: boolean;
    sort?: string;
    perPage?: number;
}

interface SearchResultJson {
    result: number;
    id: number;
    url: string;
    created?: string;
    modified?: string;
    size?: number;
    status?: number;
    time?: number;
    norobots?: boolean;
    name?: string;
    type?: string;
    content?: string;
    headers?: string;
    links?: string[];
    assets?: string[];
    origin?: string;
}

interface CrawlParams {
    id: number;
    project: number;
    created: Date;
    modified: Date;
    complete?: boolean;
    time?: number;
    report?: any;
}

interface ProjectParams {
    id: number;
    created: Date;
    modified: Date;
    name?: string;
    url?: string;
    urls?: string[];
    imageDataUri?: string;
}

interface PluginDataParams {
    projectId: number;
    meta: {};
    defaultData: {};
    autoformInputs: HTMLElement[];
}

/**
 * Container for plugin settings
 */
class PluginData {

    private autoformInputs: HTMLElement[];
    private defaultData: {};
    private data: {[key: string]: any};
    private dataLoaded: Date;
    private meta: { [key: string]: string };
    private project: number;

    /**
     * Creates an instance of PluginData.
     * @param params - PluginDataParams, collection of arguments.
     */
    public constructor(params: PluginDataParams) {
        this.meta = params.meta;
        this.defaultData = params.defaultData;
        this.autoformInputs = params.autoformInputs ?? [];
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

            const changeHandler = async (el: any) => {
                const name = el.getAttribute("name");
                let value;

                if (el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
                    value = el.value;
                } else {
                    const hasValue = el.hasAttribute("value");
                    if (!hasValue) {
                        value = el.checked === undefined || el.checked === false ? false : true;
                    } else {
                        value = el.value;
                    }
                }

                await this.setAutoformField(name, value);
            };

            const radioHandler = async (el: any) => {
                let name: string = el.getAttribute("name");
                const elInput = el as HTMLInputElement;
                const checkedRadios = document.querySelectorAll(`input[type=radio][name=${elInput.name}]:checked`);
                if (checkedRadios.length !== 1) {
                    console.error("radio control failure");
                    return;
                }

                const value = (checkedRadios[0] as HTMLInputElement).value;
                await this.setAutoformField(name, value);
            }

            const pipedHandler = async (el: any) => {
                let name: string = el.getAttribute("name");
                const elInput = el as HTMLInputElement;
                const checkedCheckboxes = document.querySelectorAll(`input[type=checkbox][name=${elInput.name}]:checked`);
                const piperList = [];
                for (let i = 0; i < checkedCheckboxes.length; i++) {
                    piperList.push((checkedCheckboxes[i] as HTMLInputElement).value);
                }

                const value = piperList.join("|");
                await this.setAutoformField(name, value);
            }

            for (let el of this.autoformInputs) {
                // happens with 0 inputs
                if (el === null) {
                    continue;
                }

                const tag: string = el.tagName.toLowerCase();
                switch (tag) {
                    case "input":
                        const input: HTMLInputElement = el as HTMLInputElement;
                        // handle reasonable accomodations/variations in checkbox intent
                        // looks more complicated than it is
                        if (input.type == "checkbox") {
                            // this can go a couple ways
                            // either it is a single true/false or a multiple,
                            // in which it is piped|values|like|this, dig it?
                            const elInput = el as HTMLInputElement;
                            const allCheckboxes = document.querySelectorAll(`input[type=checkbox][name=${elInput.name}]`);
                            if (allCheckboxes.length === 1) {
                                // true/false branch start
                                input.addEventListener("change", async (ev: InputEvent) => {
                                    await changeHandler(input);
                                });
                            } else if (allCheckboxes.length > 1) {
                                // piped branch
                                input.addEventListener("change", async (ev: InputEvent) => {
                                    await pipedHandler(input);
                                });
                            }

                        } else if (input.type == "radio") {
                            // just a text input
                            input.addEventListener("change", async (ev: InputEvent) => {
                                await radioHandler(input);
                            });
                        } else {
                            // just a text input
                            input.addEventListener("change", async (ev: InputEvent) => {
                                await changeHandler(input);
                            });
                        }


                        break;
                    case "textarea":
                        const textarea: HTMLTextAreaElement = el as HTMLTextAreaElement;
                        textarea.addEventListener("change", async (ev: InputEvent) => {
                            await changeHandler(textarea);
                        });
                        textarea.addEventListener("input", async (ev: InputEvent) => {
                            await changeHandler(textarea);
                        });
                        break;
                    case "select":
                        const select: HTMLSelectElement = el as HTMLSelectElement;
                        select.addEventListener("change", async (ev: InputEvent) => {
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
    public async setDataField(key: string, value: any, push: boolean): Promise<void> {

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
    public async getData(): Promise<{}> {
        if (this.dataLoaded !== null) {
            return this.data;
        } else {
            await this.loadData();
            return this.data;
        }
    }

    /**
     * Loads the plugin data from the server.
     */
    public async loadData(): Promise<void> {

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
        const result = await Plugin.postApiRequest("GetPluginData", kwargs);
        const endTime = new Date().getTime();
        try {
            Plugin.logTiming(`Loaded options: ${JSON.stringify(kwargs)}`, endTime - startTime);
            const jsonResponseData: JSON = result["data"];
            const jsonResponseDataEmpty: boolean = Object.keys(jsonResponseData).length === 0;
            const merged: {} = {};
            for (let k in this.defaultData) {
                const val: any = this.defaultData[k];
                merged[k] = this.defaultData[k];
            }

            // stored options overwrites default data, if available
            for (let k in jsonResponseData) {
                const val: any = this.defaultData[k];
                merged[k] = jsonResponseData[k];
            }

            // if nothing is in the database, push the defaults (inc. meta)
            if (jsonResponseDataEmpty) {
                this.data = merged;
                await this.updateData();
            }

            this.data = merged;
            this.dataLoaded = new Date();
        } catch {
            console.warn(`failed to load plugin data @ \n${JSON.stringify(kwargs)}`);
        }

        if (this.autoformInputs.length > 0) {

            // init autoform if necessary
            if (!("autoform" in this.data)) {
                this.data["autoform"] = {};
            } else {
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
                const defaultProjectData: {} = this.defaultData["autoform"]?.[this.project] ?? {};
                this.data["autoform"][this.project] = defaultProjectData;
            }
        }
        const radioGroups: string[] = [];
        // loop html elements, and set values to stored
        for (let el of this.autoformInputs) {
            // happens with 0 inputs
            if (el === null) {
                continue;
            }

            const name = (el as HTMLInputElement).name;
            const val = this.data["autoform"][this.project][name] ?? null;
            const lowerTag = el.tagName.toLowerCase();

            let input;
            let isBooleanCheckbox = false;
            let isMultiCheckbox = false;
            let isRadio = false;
            let isSelect = false;
            let isTextarea = false;
            switch (lowerTag) {
                case "input":
                    input = el as HTMLInputElement;
                    if (input.type === "radio") {
                        isRadio = true;
                        radioGroups.push(name);
                    } else if (input.type === "checkbox" && typeof val === "boolean") {
                        isBooleanCheckbox = true;
                    } else if (input.type === "checkbox" && typeof val === "string") {
                        isMultiCheckbox = true;
                    }
                    break;
                case "textarea":
                    input = el as HTMLTextAreaElement;
                    isTextarea = true;
                    break;
                case "select":
                    input = el as HTMLSelectElement;
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
        radioGroups.forEach((inputName: string) => {
            const hasCheck = document.querySelector(`input[name=${inputName}]:checked`) !== null;
            if (!hasCheck) {
                const firstRadio: HTMLInputElement = document.querySelector(`input[name=${inputName}]`);
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
    public async setAutoformField(name: string, value: string): Promise<void> {
        const data: {} = await this.getData();
        const autoformData: {} = data["autoform"] ?? {};
        const projectAutoformData: {} = autoformData[this.project] ?? {};
        if (projectAutoformData[name] !== value) {
            projectAutoformData[name] = value;
            await this.setDataField("autoform", autoformData, true);
        }
    }

    /**
     * Updates the plugin data on the server.
     */
    public async updateData(): Promise<void> {
        // const updateEndpoint = this.getDataEndpoint();
        const data: {} = await this.getData();
        data["meta"] = this.meta;
        const kwargs = {
            pluginUrl: window.location.href,
            pluginData: data,
        };

        const result = await Plugin.postApiRequest("SetPluginData", kwargs);
        return;
    }

    /**
     * Gets the data slug for the plugin.
     * @returns The base64 encoded plugin URL.
     */
    private getDataSlug(): string {
        const key: string = this.getPluginUrl();
        const b64Key: string = btoa(key);
        return b64Key;
    }

    /**
     * Gets the current plugin URL.
     * @returns The full URL of the plugin.
     */
    private getPluginUrl(): string {
        return `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    }
}

class SearchQuery {

    public static readonly maxPerPage: number = 100;
    private static readonly validSorts: string[] = ["?", "id", "-id", "time", "-time", "status", "-status", "url", "-url",];
    public readonly project: number;
    public readonly query: string;
    public readonly fields: string;
    public readonly type: SearchQueryType;
    public readonly includeExternal: boolean = true;
    public readonly includeNoRobots: boolean = false;
    public readonly sort: string;
    public readonly perPage: number;

    /**
     * Creates an instance of SearchQuery.
     * @param params - SearchQueryParams, collection of arguments.
     */
    public constructor(params: SearchQueryParams) {
        this.project = params.project;
        this.query = params.query;
        this.fields = params.fields;
        this.type = params.type;
        this.includeExternal = params.includeExternal ?? true;
        this.includeNoRobots = params.includeNoRobots ?? false;
        this.perPage = params.perPage ?? SearchQuery.maxPerPage;

        if (SearchQuery.validSorts.indexOf(params.sort) >= 0) {
            this.sort = params.sort;
        } else {
            this.sort = SearchQuery.validSorts[1];
        }
    }

    /**
     * Gets the cache key for the haystack.
     * @returns A string representing the cache key.
     */
    public getHaystackCacheKey(): string {
        return `${this.project}~${this.fields}~${this.type}~${this.includeExternal}~${this.includeNoRobots}`;
    }
}

class Search {

    private static resultsCacheTotal: number;
    private static resultsHaystackCacheKey: string;

    /**
     * Executes a search query.
     * @param query - The search query to execute.
     * @param existingResults - Map of existing results.
     * @param processingMessage - Message to display during processing.
     * @param resultHandler - Function to handle each search result.
     * @returns A promise that resolves to a boolean indicating if results were from cache.
     */

    public static async execute(query: SearchQuery, existingResults: Map<number, SearchResult>,
        resultHandler: any, deep: boolean = false, quiet: boolean = true,
        processingMessage: string = "Processing..."): Promise<boolean> {

        const timeStart = new Date().getTime();

        // Promise<boolean> returned is a from-cache flag, true if cached
        if (query.getHaystackCacheKey() === Search.resultsHaystackCacheKey && existingResults) {

            const resultTotal: number = existingResults.size;

            // reuse api reuslts
            // print something to screen to inform user of operation
            // this is a blitz, doesn't get the http request breathing room of api http requests
            // anyways, paint first, then saturate cpu
            if (quiet === false) {
                const eventStart: CustomEvent = new CustomEvent("ProcessingMessage",
                    { detail: { action: "set", message: processingMessage } });
                document.dispatchEvent(eventStart);
            }


            // give main thread a short break to render progress
            await Search.sleep(16);

            // note for of loop with sleep mod 100 works, looks smooth, but slows the operation by > 20%
            // this is faster, but it can't paint progress well as it can saturate the main thread
            let i = 0;
            await existingResults.forEach(async (result: SearchResult, resultId: number) => {
                await resultHandler(result);
            });
            Plugin.logTiming(`Processed ${resultTotal.toLocaleString()} search result(s)`,
                new Date().getTime() - timeStart);

            if (quiet === false) {
                const msg: {} = { detail: { action: "clear" } };
                const eventFinished: CustomEvent = new CustomEvent("ProcessingMessage", msg);
                document.dispatchEvent(eventFinished);
            }

            return true;
        } else {
            Search.resultsHaystackCacheKey = query.getHaystackCacheKey();
            Search.resultsCacheTotal = 0;
        }

        const kwargs = {
            "project": query.project,
            "query": query.query,
            "external": query.includeExternal,
            "type": SearchQueryType[query.type].toLowerCase(),
            "offset": 0,
            "fields": query.fields.split("|"),
            "norobots": query.includeNoRobots,
            "sort": query.sort,
            "perpage": query.perPage,
        };

        let responseJson: any = await Plugin.postApiRequest("GetResources", kwargs);
        const resultTotal: number = responseJson["__meta__"]["results"]["total"];
        Search.resultsCacheTotal = resultTotal;
        let results = responseJson.results;
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            await Search.handleResult(result, resultTotal, resultHandler);
        }

        while (responseJson["__meta__"]["results"]["pagination"]["nextOffset"] !== null && deep === true) {

            const next = responseJson["__meta__"]["results"]["pagination"]["nextOffset"];
            kwargs["offset"] = next;
            responseJson = await Plugin.postApiRequest("GetResources", kwargs);

            results = responseJson.results;
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                await Search.handleResult(result, resultTotal, resultHandler);
            }
        }

        Plugin.logTiming(`Loaded/processed ${resultTotal.toLocaleString()} search result(s)`,
            new Date().getTime() - timeStart);
        return false;
    }

    /**
     * Sleeps for the specified number of milliseconds.
     * @param millis - The number of milliseconds to sleep.
     */
    private static async sleep(millis: number): Promise<void> {
        return new Promise((resolve) => setTimeout(() => resolve(), millis));
    }

    /**
     * Handles a single search result.
     * @param jsonResult - The JSON representation of the search result.
     * @param resultTotal - The total number of results.
     * @param resultHandler - Function to handle the search result.
     */
    private static async handleResult(jsonResult: any, resultTotal: number, resultHandler: any) {
        const searchResult: SearchResult = new SearchResult(jsonResult);
        await resultHandler(searchResult);
        const resultNum: number = searchResult.result;
        const event: CustomEvent = new CustomEvent("SearchResultHandled",
            { detail: { resultNum: resultNum, resultTotal: resultTotal } });
        document.dispatchEvent(event);
    }
}

/**
 * Class representing a search result.
 */
class SearchResult {

    private static readonly wordPunctuationRe: RegExp = /\s+(?=[\.,;:!\?] )/g;
    private static readonly wordWhitespaceRe: RegExp = /\s+/g;

    // core
    public readonly result: number;
    public readonly id: number;
    public readonly url: string;

    // optional
    public readonly created: Date;
    public readonly modified: Date;
    public readonly size: number;
    public readonly status: number;
    public readonly time: number;
    public readonly norobots: boolean;
    public readonly name: string;
    public readonly type: string;
    public readonly links: string[];
    public readonly assets: string[];

    protected content: string;
    protected headers: string;

    private processedContent: string;
    private optionalFields: string[] = ["created", "modified", "size", "status",
        "time", "norobots", "name", "type", "content", "headers", "links", "assets", "origin"];

    private static normalizeContentWords(input: string): string[] {
        const out: string[] = [];
        if (input !== "") {
            out.push.apply(out, input.split(/\s+/));
        }
        return out;
    }

    private static normalizeContentString(input: string): string {
        const words: string[] = SearchResult.normalizeContentWords(input);
        return words.join(" ");
    }

    /**
     * Creates an instance of SearchResult.
     * @param jsonResult - The JSON representation of the search result.
     */
    public constructor(jsonResult: SearchResultJson) {
        this.result = jsonResult.result;
        this.id = jsonResult.id;
        this.url = jsonResult.url ?? null; // deprecated
        this.name = jsonResult.name;
        this.processedContent = "";

        for (let field of this.optionalFields) {
            if (field in jsonResult) {
                if (field === "created" || field === "modified") {
                    this[field] = new Date(jsonResult[field]);
                } else {
                    this[field] = jsonResult[field];
                }
            }
        }
    }

    /**
     * Checks if the result has processed content.
     * @returns True if processed content exists, false otherwise.
     */
    public hasProcessedContent() {
        return this.processedContent != "";
    }

    /**
     * Gets the processed content of the search result.
     * @returns The processed content.
     */
    public getProcessedContent() {
        return this.processedContent;
    }

    /**
     * Sets the processed content of the search result.
     * @param processedContent - The processed content to set.
     */
    public setProcessedContent(processedContent: string) {
        this.processedContent = processedContent;
    }

    /**
     * Gets the raw content of the search result.
     * @returns The raw content.
     */
    public getContent() {
        return this.content;
    }

    /**
     * Gets the content of the search result as text only.
     * @returns The content as plain text.
     */
    public getContentTextOnly() {

        // out is the haystack string builder
        const out: string[] = [];
        let element: Node = null;
        const texts: XPathResult = HtmlUtils.getDocumentCleanTextIterator(this.getContent());

        element = texts.iterateNext();
        while (element !== null) {
            let elementValue: string = SearchResult.normalizeContentString(element.nodeValue);
            if (elementValue !== "") {
                // filter empties
                const elementValueWords: string[] = elementValue.split(" ").filter((word): boolean => word !== "");
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
    public getHeaders() {
        return this.headers;
    }

    /**
     * Gets the path of the URL for the search result.
     * @returns The URL path.
     */
    public getUrlPath() {
        const url: URL = new URL(this.url);
        return url.pathname;
    }

    /**
     * Clears the full-text fields of the search result.
     */
    public clearFulltextFields() {
        // an attempt to clear memory after use
        // other fields are small in comparison
        this.content = "";
        this.headers = "";
    }
}

/**
 * Class representing a crawl.
 */
class Crawl {

    id: number = -1;
    created: Date = null;
    modified: Date = null;
    project: number = -1;
    complete: boolean;
    time: number = -1;
    report: any = null;

    /**
     * Creates an instance of Crawl.
     * @param params - CrawlParams, collection of arguments.
     */
    public constructor(params: CrawlParams) {
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
    public getTimings(): {} {
        return this.getReportDetailByKey("timings");
    }

    /**
     * Gets the sizes from the crawl report.
     * @returns The sizes object.
     */
    public getSizes(): {} {
        return this.getReportDetailByKey("sizes");
    }

    /**
     * Gets the counts from the crawl report.
     * @returns The counts object.
     */
    public getCounts(): {} {
        return this.getReportDetailByKey("counts");
    }


    private getReportDetailByKey(key: string): boolean {
        // returns a dictionary of key/values for the corresponding key
        // InterroBot pre-2.6 will not contain a detail object
        if (this.report && this.report.hasOwnProperty("detail") &&
            this.report.detail.hasOwnProperty(key)) {
            return this.report.detail[key]
        } else {
            return null;
        }
    }

}

/**
 * Class representing a project.
 */
class Project {

    id: number = -1;
    created: Date = null;
    modified: Date = null;
    name?: string = null;   // name to required when url shut down
    url?: string = null;    // deprecated
    urls?: string[] = [];
    imageDataUri?: string = null;

    static readonly urlDeprectionWarning: string  =
        `"url" field is deprecated, use "name" or "urls" instead.`;

    /**
     * Creates an instance of Project.
     * @param params - ProjectParams, collection of arguments.
     */
    public constructor(params: ProjectParams) {
        this.id = params.id;
        this.created = params.created;
        this.modified = params.modified;
        this.url = params.url;
        this.name = params.name;
        this.imageDataUri = params.imageDataUri;
    }

    /**
     * Gets the data URI of the project image.
     * @returns The image data URI.
     */
    public getImageDataUri(): string {
        return this.imageDataUri;
    }

    /**
     * Gets the display title of the project.
     * @returns The display title (hostname of the project URL).
     */
    public getDisplayTitle(): string {
        if (this.name){
            return this.name;
        } else if (this.url) {
            Plugin.logWarning(Project.urlDeprectionWarning);
            return new URL(this.url).hostname;
        } else {
            return "[error]";
        }
    }

    public getDisplayUrl(): string {
        if (this.urls){
            const firstUrl: string = this.urls[0];
            const urlCount: number = this.urls.length;
            const more: string = urlCount > 1 ? ` + ${urlCount - 1} more` : "";
            return `${firstUrl}${more}`
        } else if (this.url) {
            Plugin.logWarning(Project.urlDeprectionWarning);
            return new URL(this.url).hostname;
        } else {
            return "[error]";
        }
    }

    /**
     * Gets a project by its ID from the API.
     * @param id - The project ID.
     * @returns A promise that resolves to a Project instance, or null if not found.
     */
    public static async getApiProject(id: number): Promise<Project> {
        const kwargs = {
            "projects": [id],
            "fields": ["image", "created", "modified"],
        };

        const projects = await Plugin.postApiRequest("GetProjects", kwargs);
        const results = projects.results;
        for (let i = 0; i < results.length; i++) {
            const project = results[i];
            if (project.id === id) {
                // hit, return as instance
                const created: Date = new Date(project.created);
                const modified: Date = new Date(project.modified);
                const name: string = project.name || project.url; // url is deprecated
                const imageDataUri: string = project.image;
                // return new Project(id, created, modified, url, imageDataUri);
                return new Project({
                    id: id,
                    created: created,
                    modified: modified,
                    name: name,
                    imageDataUri: imageDataUri
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
    public static async getApiCrawls(project: number): Promise<Crawl[]> {

        const kwargs = {
            complete: "complete",
            project: project,
            fields: ["created", "modified", "report", "time"],
        };

        const response = await Plugin.postApiRequest("GetCrawls", kwargs);
        const crawls: Crawl[] = [];
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

export { Project, Crawl, SearchQueryType, SearchQuery, Search, SearchResult, PluginData };
