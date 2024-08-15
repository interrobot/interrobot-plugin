/* tslint:disable:no-console */
/* tslint:disable:max-line-length */

import { HtmlUtils } from "./html.js";
import { Plugin } from "./plugin.js";

enum SearchQueryType {
    Page,
    Asset,
    Any,
}

class PluginData {

    private autoformInputs: HTMLElement[];
    private defaultData: {};
    private data: {[key: string]: any};
    private dataLoaded: Date;
    private meta: { [key: string]: string };
    private project: number;

    public constructor(projectId: number, meta: {}, defaultData: {}, autoformInputs: HTMLElement[]) {

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

            const changeHandler = async (el: any) => {                
                let name: string = el.getAttribute("name");
                const value = el.checked === undefined ? el.value : el.checked;
                await this.setAutoformField(name, value);
            }

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
    
    public async setDataField(key: string, value: any, push: boolean): Promise<void> {
        
        if (this.data[key] !== value) {
            this.data[key] = value;
        }
        // push even if no change
        if (push === true) {
            await this.updateData();
        }
    }

    public async getData(): Promise<{}> {
        if (this.dataLoaded !== null) {
            return this.data;
        } else {
            await this.loadData();
            return this.data;
        }
    }

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
            const defaultProjectData: {} = {};
            if (!("autoform" in this.data)) {
                this.data["autoform"] = {};
            } else {
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

    public async setAutoformField(name: string, value: string): Promise<void> {
        const data: {} = await this.getData();
        const autoformData: {} = data["autoform"] ?? {};
        const projectAutoformData: {} = autoformData[this.project] ?? {};
        if (projectAutoformData[name] !== value) {
            projectAutoformData[name] = value;
            await this.setDataField("autoform", autoformData, true);
        }
    }

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

    private getDataSlug(): string {
        const key: string = this.getPluginUrl();
        const b64Key: string = btoa(key);
        return b64Key;
    }
    
    private getPluginUrl(): string {
        return `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    }
}

class SearchQuery {

    public readonly project: number;
    public readonly query: string;
    public readonly fields: string;
    public readonly type: SearchQueryType;
    public readonly includeExternal: boolean;

    public constructor(project: number, query: string, fields: string, type: SearchQueryType,
        includeExternal: boolean) {

        this.project = project;
        this.query = query;
        this.fields = fields;
        this.type = type;
        this.includeExternal = includeExternal;
    }

    public getHaystackCacheKey(): string {
        return `${this.project}~${this.fields}~${this.type}~${this.includeExternal}`;
    }
}

class Search {

    private static resultsCacheTotal: number;
    private static resultsHaystackCacheKey: string;

    public static async execute(query: SearchQuery, existingResults: Map<number, SearchResult>,
        processingMessage: string, resultHandler: any): Promise<boolean> {

        const timeStart = new Date().getTime();
        processingMessage = processingMessage ?? "Processing...";
        // Promise<boolean> returned is a from-cache flag, true if cached
        if (query.getHaystackCacheKey() === Search.resultsHaystackCacheKey && existingResults) {

            const resultTotal: number = existingResults.size;

            // reuse api reuslts
            // print something to screen to inform user of operation
            // this is a blitz, doesn't get the http request breathing room of api http requests
            // anyways, paint first, then saturate cpu
            const eventStart: CustomEvent = new CustomEvent("ProcessingMessage",
                { detail: { action: "set", message: processingMessage } });
            document.dispatchEvent(eventStart);

            // give main thread a short break to render
            await Search.sleep(16);

            // note for of loop with sleep mod 100 works, looks smooth, but slows the operation by > 20%
            // this is faster, but it can't paint progress well as it can saturate the main thread
            let i = 0;
            await existingResults.forEach(async (result: SearchResult, resultId: number) => {
                await resultHandler(result);                
            });
            Plugin.logTiming(`Processed ${resultTotal.toLocaleString()} search result(s)`,
                new Date().getTime() - timeStart);
            const msg: {} = { detail: { action: "clear" }};
            const eventFinished: CustomEvent = new CustomEvent("ProcessingMessage", msg);
            document.dispatchEvent(eventFinished);
            return true;
        } else {
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

        let responseJson: any = await Plugin.postApiRequest("GetResources", kwargs);
        const resultTotal: number = responseJson["__meta__"]["results"]["total"];
        Search.resultsCacheTotal = resultTotal;
        let results = responseJson.results;
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            await Search.handleResult(result, resultTotal, resultHandler);
        }
        
        while (responseJson["__meta__"]["results"]["pagination"]["nextOffset"] !== null) {

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

    private static async sleep(millis: number): Promise<void> {
        return new Promise((resolve) => setTimeout(() => resolve(), millis));
    }
    
    private static async handleResult(jsonResult: any, resultTotal: number, resultHandler: any) {
        const searchResult: SearchResult = new SearchResult(jsonResult);
        await resultHandler(searchResult);
        const resultNum: number = searchResult.result;
        const event: CustomEvent = new CustomEvent("SearchResultHandled",
            { detail: { resultNum: resultNum, resultTotal: resultTotal } });
        document.dispatchEvent(event);
    }   
}

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

    public constructor(jsonResult: any) {
        this.result = jsonResult["result"];
        this.id = jsonResult["id"];
        this.url = jsonResult["url"];
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

    public hasProcessedContent() {
        return this.processedContent != "";
    }

    public getProcessedContent() {
        return this.processedContent;
    }

    public setProcessedContent(processedContent: string) {
        this.processedContent = processedContent;
    }

    public getContent() {
        return this.content;
    }

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
    
    public getHeaders() {
        return this.headers;
    }

    public getUrlPath() {
        const url: URL = new URL(this.url);
        return url.pathname;
    }

    public clearFulltextFields() {
        // an attempt to clear memory after use
        // other fields are small in comparison
        this.content = "";
        this.headers = "";
    }
}

class Crawl {

    id: number = -1;
    created: Date = null;
    modified: Date = null;
    project: number = -1;
    complete: boolean;
    time: number = -1;
    report: any = null;

    public constructor(id: number, project: number, created: Date, modified: Date, complete: boolean, time: number, report: any) {
        this.id = id;
        this.created = created;
        this.modified = modified;
        this.complete = complete;
        this.project = project;
        this.time = time;
        this.report = report;
    }

    public getTimings(): {} {
        return this.getReportDetailByKey("timings");
    }

    public getSizes(): {} {
        return this.getReportDetailByKey("sizes");
    }

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

class Project {

    id: number = -1;
    created: Date = null;
    modified: Date = null;
    url: string;
    imageDataUri: string;

    public constructor(id: number, created: Date, modified: Date, url: string, imageDataUri: string) {
        this.id = id;
        this.created = created;
        this.modified = modified;
        this.url = url;
        this.imageDataUri = imageDataUri;
    }

    public getImageDataUri(): string {
        return this.imageDataUri;
    }

    public getDisplayTitle(): string {
        return new URL(this.url).hostname;
    }

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
                const url: string = project.url;
                const imageDataUri: string = project.image;
                return new Project(id, created, modified, url, imageDataUri);
            }
        }
        // not found
        return null;
    }

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
            // console.log(crawlResult.created);
            // console.log(new Date(crawlResult.created));
            const crawl = new Crawl(crawlResult.id, project, new Date(crawlResult.created), new Date(crawlResult.modified), crawlResult.complete,
                crawlResult.time, crawlResult.report);
            crawls.push(crawl);
        }
        return crawls;
    }
}

export { Project, Crawl, SearchQueryType, SearchQuery, Search, SearchResult, PluginData };
