/* tslint:disable:no-console */
/* tslint:disable:max-line-length */

import { Project, PluginData, SearchQuery, Search, SearchResult, SearchQueryType } from "./api.js";
import { HtmlUtils } from "./html.js";


enum DarkMode {
    Light,
    Dark,
}

class Plugin {

    public static readonly meta: {} = {
        "url": "https://example.com/path/to/plugin-page/",
        "title": "InterroBot Base Plugin",
        "category": "Core Example",
        "version": "1.0",
        "author": "InterroBot",
        "description": `Welcome to InterroBot plugin development. This base-class Plugin can already 
        query the database, draw conclusions, and report back. It's just few tweaks away from being 
        your own creation.\n\nThis is the default plugin description. Set meta: {} values
        in the source to update these display values.`,
    }

    public static getHostOrigin(): string {
        if (!Plugin.origin) {
            const urlSearchParams = new URLSearchParams(window.location.search);
            const params = Object.fromEntries(urlSearchParams.entries());
            Plugin.origin = params.origin;
        }
        return Plugin.origin;        
    }

    public static postContentHeight(): void {
        
        const mainResults: HTMLElement = document.querySelector(".main__results");
        let currentScrollHeight: number = document.body.scrollHeight;
        if (mainResults) {
            // more accurate
            currentScrollHeight = Number(mainResults.getBoundingClientRect().bottom);
        }
        
        if (currentScrollHeight !== Plugin.contentScrollHeight) {
            const msg = {
                target: "interrobot",
                data: {
                    reportHeight: currentScrollHeight,
                },
            };
            window.parent.postMessage(msg, "*");
        }
    }

    public static postOpenResourceLink(resourceId: number, openInBrowser: boolean): void {
        const msg = {
            target: "interrobot",
            data: {
                reportLink: {
                    openInBrowser: openInBrowser,
                    resourceId: resourceId,
                }
            },
        };
        window.parent.postMessage(msg, "*");
    }

    public static postMeta(meta: {}): void {
        // meta { url, title, category, version, author, description}
        const msg = {
            target: "interrobot",
            data: {
                reportMeta: meta
            },
        };
        window.parent.postMessage(msg, "*");
    }

    public static async postApiRequest(apiMethod: string, apiKwargs: {}): Promise<any> {

        // meta { url, title, category, version, author, description}
        let result: any = null;
        const getPromisedResult = async () => {
            return new Promise((resolve: Function) => {
                const listener = async (ev: MessageEvent) => {
                    const evData: any = ev.data;
                    if (evData.data && evData.data.hasOwnProperty("apiResponse")) {
                        result = evData.data.apiResponse;
                        window.removeEventListener("message", listener);
                        resolve();
                    }
                }
                const msg = {
                    target: "interrobot",
                    data: {
                        apiRequest: {
                            method: apiMethod,
                            kwargs: apiKwargs,
                        }
                    },
                };
                // listen for response to postmessage api request with listener()
                window.addEventListener("message", listener);
                window.parent.window.postMessage(msg, window.parent.origin);                
            });
        }
        
        await getPromisedResult();
        return result;
    }

    public static logTiming(msg: string, millis: number): void {
        const seconds = (millis / 1000).toFixed(3);
        console.log(`🤖 [${seconds}s] ${msg}`);
    }
    
    private static origin: string;    
    private static contentScrollHeight: number;   

    public data: PluginData;
    private projectId: number = -1;
    private mode: DarkMode = DarkMode.Light;
    private project: Project;

    public constructor() {

        // pull params from iframe url
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        const paramProject: number = parseInt(params.project, 10);
        const paramMode: number = parseInt(params.mode, 10);

        // lock this in while we're initializing
        Plugin.origin = params.origin;

        // no salvaging this
        if (isNaN(paramProject)) {
            const errorMessage = `missing project url argument`;
            throw new Error(errorMessage);
        }

        this.data = null; // requires async loadData
        this.projectId = paramProject;
        this.mode = isNaN(paramMode) || paramMode !== 1 ? DarkMode.Light : DarkMode.Dark;
        Plugin.contentScrollHeight = 0;

        // dark/light css to body
        const modeClass = DarkMode[this.mode].toLowerCase();
        document.body.classList.remove("light", "dark");
        document.body.classList.add(modeClass);
    }

    public getProjectId(): number {
        return this.projectId;
    }

    public async init(meta: {}): Promise<void> {
        Plugin.postMeta(meta);
        window.addEventListener("load", Plugin.postContentHeight);
        window.addEventListener("resize", Plugin.postContentHeight);
    }
    
    public async initData(meta: {}, defaultData: {}, autoform: HTMLElement[]): Promise<void> {
        this.data = new PluginData(this.getProjectId(), meta, defaultData, autoform);
        await this.data.loadData();
    }

    public async initAndGetData(meta: {}, defaultData: any, autoform: HTMLElement[]): Promise<PluginData> {
        await this.initData(meta, defaultData, autoform);
        return this.data;
    }

    public async getProject(): Promise<Project> {
        const tsStart = Date.now();
        if (this.project === undefined) {
            const project: Project = await Project.getApiProject(this.projectId);
            if (project === null) {
                const errorMessage = `project id=${this.projectId} not found`;
                throw new Error(errorMessage);
            }
            this.project = project;
        }
        const tsEnd = Date.now();
        console.log(`InterroBot Plugin: retrieved project in ${tsEnd - tsStart}ms`);
        return this.project;
    }

    protected render(html: string): void {
        document.body.innerHTML = html;
    }

    protected async index() {

        // init() would generally would go into a constructor
        // it is here contain it to the example it will push meta
        // to the host page, and activate some resize handlers
        this.init(Plugin.meta);
        
        // this collects project information given the project id passed in
        // as url argument, there will always be a project id passed
        const project: Project = await Project.getApiProject(this.getProjectId());

        // if you reuse InterroBot UI, please fork your own CSS, mine isn't stable
        this.render(`
            <div class="main__heading">
                <div class="main__heading__icon">
                    <img id="projectIcon" src="${project.getImageDataUri()}" alt="Project icon for ${project.getDisplayTitle()}" />
                </div>
                <div class="main__heading__title">
                    <h1>${Plugin.meta["title"]}</h1>
                    <div><span>${project.getDisplayTitle()}</span></div>
                </div>
            </div>
            <div class="main__form">
                <p>Welcome, from the index() of the Plugin base-class. This page exists as a placeholder, 
                but in your hands it could be so much more. The Example Report form below will count and 
                present page title terms used across the website, by count.
                It's an example to help get you started.</p>
                <p>If you have any questions, please reach out to the dev via the in-app contact form.</p>
                <form><button>Example Report</button></form>
            </div>
            <div class="main__results"></div>`);

        const button = document.getElementsByTagName("button")[0];
        button.addEventListener("click", async (ev: MouseEvent) => {
            await this.process();
        });
    }

    protected async process() {

        // as an example, collect page title word counts across all html pages
        // it's a contrived example, but let us keep things simple
        const titleWords: Map<string, number> = new Map<string, number>();

        // resultsMap is probably a property on your plugin IRL, but I don't want to pollute
        // to pollute the Plugin namespace any more than necessary for the sake of example 
        // plugin screens
        let resultsMap: Map<number, SearchResult>;

        // the function to handle individual SearchResults
        // in this example, counting term/word instances in the name field
        const exampleResultHandler = async (result: SearchResult, titleWordsMap: Map<string, number>) => {
            const terms: string[] = result.name.trim().split(/[\s\-—]+/g);
            for (let term of terms) {
                if (!titleWordsMap.has(term)) {
                    titleWordsMap.set(term, 1);
                } else {
                    const currentCount = titleWordsMap.get(term);
                    titleWordsMap.set(term, currentCount + 1);
                }
            }
        }

        // projectId comes for free as a member of Plugin
        const projectId: number = this.getProjectId();

        // build a query, these are exactly as you'd type them into InterroBot search
        const freeQueryString: string = "headers: text/html";

        // pipe delimited fields you want retrieved
        // id and url come with the base model, everything else costs time
        const fields: string = "name";
        const internalHtmlPagesQuery = new SearchQuery(projectId, freeQueryString, fields,
            SearchQueryType.Any, false);

        // run each SearchResult through its handler, and we're done processing
        await Search.execute(internalHtmlPagesQuery, resultsMap, "Processing…", async (result: SearchResult) => {
            await exampleResultHandler(result, titleWords);
        });

        // call for html presentation
        await this.report(titleWords);
        
    }

    protected async report(titleWords) {

        // sort titleWords by count, then by term
        const titleWordsRemap = new Map<string, number>([...titleWords.entries()].sort(            
            (a, b) => {
                const aVal: number = a[1];
                const bVal: number = b[1];
                if (aVal === bVal) {
                    // secondary sort is term, alpha ascending
                    return (a[0] as string).toLowerCase().localeCompare((b[0] as string).toLowerCase());
                }
                // primary sort is term count, numeric descending
                return bVal - aVal;
            }
        ));

        // render html output from collected data
        const tableRows: string[] = [];
        for (let term of titleWordsRemap.keys()) {
            const count: number = titleWordsRemap.get(term);
            const truncatedTerm = term.length > 24 ? term.substring(24) + "…" : term;
            tableRows.push(`<tr><td>${HtmlUtils.htmlEncode(truncatedTerm)}</td><td>${count.toLocaleString()}</td></tr>`);
        }
        const resultsElement: HTMLElement = document.querySelector(".main__results");
        resultsElement.innerHTML = tableRows.length === 0 ? `<p>No results found.</p>` : 
            `<div><section><table style="max-width:340px">
            <thead><tr><th>Term</th><th>Count</th></tr></thead>
            <tbody>${tableRows.join("")}</tbody>
            </table></section></div>`;

        // send signal back to iframe host to alot current page height
        Plugin.postContentHeight();
    }
}

export { Plugin };
