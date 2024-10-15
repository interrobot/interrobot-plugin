/* tslint:disable:no-console */
/* tslint:disable:max-line-length */

// important note: this script runs from the context of the plugin iframe
// but static methods will have the context of the caller

import { Project, PluginData, SearchQuery, Search, SearchResult, SearchQueryType } from "./api.js";
import { HtmlUtils } from "./html.js";
import { TouchProxy } from "./touch.js";

/**
 * Enumeration for dark mode settings.
 */
enum DarkMode {
    Light,
    Dark,
}

/**
 * Represents a connection between the plugin and its host.
 */
class PluginConnection {

    private iframeSrc: string;
    private hostOrigin: string;
    private pluginOrigin: string;

    /**
     * Creates a new PluginConnection instance.
     * @param iframeSrc - The source URL of the iframe.
     * @param hostOrigin - The origin of the host (optional).
     */
    public constructor(iframeSrc: string, hostOrigin: string | null) {
        this.iframeSrc = iframeSrc;
        if (hostOrigin) {
            this.hostOrigin = hostOrigin;
        } else {
            this.hostOrigin = "";
        }

        const url = new URL(iframeSrc);
        if (iframeSrc === "about:srcdoc") {
            this.pluginOrigin = "about:srcdoc"; // there is no faithful origin
        } else {
            this.pluginOrigin = url.origin;
        }
    }

    /**
     * Gets the iframe source URL.
     * @returns The iframe source URL.
     */
    public getIframeSrc(): string {
        return this.iframeSrc;
    }

    /**
     * Gets the host origin.
     * @returns The host origin.
     */
    public getHostOrigin(): string {
        return this.hostOrigin;
    }

    /**
     * Gets the plugin origin.
     * @returns The plugin origin.
     */
    public getPluginOrigin(): string {
        return this.pluginOrigin;
    }

    /**
     * Returns a string representation of the connection.
     * @returns A string describing the host and plugin origins.
     */
    public toString(): string {
        return `host = ${this.hostOrigin}; plugin = ${this.pluginOrigin}`;
    }
}

/**
 * Main Plugin class for InterroBot.
 */
class Plugin {

    /**
     * Metadata for the plugin.
     */
    public static readonly meta: {} = {
        "title": "InterroBot Base Plugin",
        "category": "Example",
        "version": "1.0",
        "author": "InterroBot",
        "description": `Welcome to InterroBot plugin development. This base-class Plugin can already 
        query the database, draw conclusions, and report back. It's just few tweaks away from being 
        your own creation.\n\nThis is the default plugin description. Set meta: {} values
        in the source to update these display values.`,
    }

    /**
     * Initializes the plugin class.
     * @param classtype - The class type to initialize.
     * @returns An instance of the initialized class.
     */
    public static async initialize(classtype: any): Promise<any> {
        console.log("hi");
        const createAndConfigure = () => {
            let instance: any | null = new classtype();
            Plugin.postMeta(instance.constructor.meta);
            window.addEventListener("load", Plugin.postContentHeight);
            window.addEventListener("resize", Plugin.postContentHeight);
            return instance;
        };

        if (document.readyState === "complete" || document.readyState === "interactive") {
            return createAndConfigure();
        } else {
            return new Promise((resolve) => {
                document.addEventListener("DOMContentLoaded", () => {
                    resolve(createAndConfigure());
                });
            });
        }
    }

    /**
     * Posts the current content height to the parent frame.
     */
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
            Plugin.routeMessage(msg);
        }
    }

    /**
     * Posts a request to open a resource link.
     * @param resource - The resource identifier.
     * @param openInBrowser - Whether to open the link in a browser.
     */
    public static postOpenResourceLink(resource: number, openInBrowser: boolean): void {
        const msg = {
            target: "interrobot",
            data: {
                reportLink: {
                    openInBrowser: openInBrowser,
                    resource: resource,
                }
            },
        };
        Plugin.routeMessage(msg);
    }

    /**
     * Posts plugin metadata to the parent frame.
     * @param meta - The metadata object to post.
     */
    public static postMeta(meta: {}): void {
        // meta { url, title, category, version, author, description}
        const msg = {
            target: "interrobot",
            data: {
                reportMeta: meta
            },
        };
        Plugin.routeMessage(msg);
    }

    /**
     * Sends an API request to the parent frame.
     * @param apiMethod - The API method to call.
     * @param apiKwargs - The arguments for the API call.
     * @returns A promise that resolves with the API response.
     */
    public static async postApiRequest(apiMethod: string, apiKwargs: {}): Promise<any> {

        // meta { url, title, category, version, author, description}
        let result: any = null;
        const getPromisedResult = async () => {
            return new Promise((resolve: Function) => {
                const listener = async (ev: MessageEvent) => {

                    // debug message being passed here. too spammy to leave on officially,
                    // too dependably useful to remove
                    // console.log(ev);

                    if (ev === undefined) {
                        return;
                    }
                    const evData: any = ev.data;
                    const evDataData: any = evData.data ?? {};
                    if (evDataData && typeof evDataData === "object" && evDataData.hasOwnProperty("apiResponse")) {
                        const resultMethod = evDataData.apiResponse["__meta__"]["request"]["method"];
                        if (apiMethod === resultMethod) {
                            result = evData.data.apiResponse;
                            window.removeEventListener("message", listener);
                            resolve();
                        } else {
                            // SetPluginData on an independent event channel, doesn't serialize requests
                            // like GetResources, continue listening for correct respsonse
                            // console.log(`apiMethod mismatch: sent: ${apiMethod} recieved: ${resultMethod}`);
                        }
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
                Plugin.routeMessage(msg);
            });
        }
        await getPromisedResult();
        return result;
    }

    /**
     * Logs timing information to the console.
     * @param msg - The message to log.
     * @param millis - The time in milliseconds.
     */
    public static logTiming(msg: string, millis: number): void {
        const seconds = (millis / 1000).toFixed(3);
        console.log(`🤖 [${seconds}s] ${msg}`);
    }

    /**
     * Routes a message to the parent frame.
     * @param msg - The message to route.
     */
    private static routeMessage(msg: {}) {
        // Pt 1 of 2
        // window.parent.origin can't be read from external URL, only works with core
        // console.log(document.location.href);
        // console.log(Plugin.connection.toString());
        let parentOrigin: string = "";
        if (Plugin.connection) {
            parentOrigin = Plugin.connection.getHostOrigin();
            window.parent.postMessage(msg, parentOrigin);
        } else {
            // core iframe uses srcdoc, has no usable origin
            // TODO, Plugin.connection should be set regardless?
            // this happens on export dl ands external urls btw
            window.parent.postMessage(msg);
        }
    }

    private static contentScrollHeight: number;
    private static connection: PluginConnection;

    public data: PluginData;
    private projectId: number = -1;
    private mode: DarkMode = DarkMode.Light;
    private project: Project;

    /**
     * Creates a new Plugin instance.
     */
    public constructor() {

        let paramProject: number;
        let paramMode: number;
        let paramOrigin: string;

        if (this.parentIsOrigin()) {
            // core report, 3rd party will not have cross origin access
            // params stashed in dataset
            const ifx = window.parent.document.getElementById("report");
            paramProject = parseInt(ifx.dataset.project, 10);
            paramMode = parseInt(ifx.dataset.mode, 10);
            paramOrigin = ifx.dataset.origin;
        } else {
            // proper iframe
            const urlSearchParams = new URLSearchParams(window.location.search);
            paramProject = parseInt(urlSearchParams.get("project"), 10);
            paramMode = parseInt(urlSearchParams.get("mode"), 10);
            paramOrigin = urlSearchParams.get("origin");
        }

        // static functions will depend on this static variable
        Plugin.connection = new PluginConnection(document.location.href, paramOrigin);

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

        const tp = new TouchProxy();

    }

    /**
     * Introduces a delay in the execution.
     * @param ms - The number of milliseconds to delay.
     * @returns A promise that resolves after the specified delay.
     */
    protected delay(ms: number) {
        // for ui to force painting
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Gets the current project ID.
     * @returns The project ID.
     */
    public getProjectId(): number {
        return this.projectId;
    }

    /**
     * Gets the instance meta, the subclassed override data
     * @returns the class meta.
     */
    public getInstanceMeta(): {} {
        return this.constructor["meta"];
    }

    /**
     * Initializes the plugin data.
     * @param defaultData - The default data for the plugin.
     * @param autoform - An array of HTML elements for the autoform.
     */
    public async initData(defaultData: {}, autoform: HTMLElement[]): Promise<void> {
        this.data = new PluginData(this.getProjectId(), this.getInstanceMeta(), defaultData, autoform);
        await this.data.loadData();
    }

    /**
     * Initializes and returns the plugin data.
     * @param defaultData - The default data for the plugin.
     * @param autoform - An array of HTML elements for the autoform.
     * @returns A promise that resolves with the initialized PluginData.
     */
    public async initAndGetData(defaultData: any, autoform: HTMLElement[]): Promise<PluginData> {
        await this.initData(defaultData, autoform);
        return this.data;
    }

    /**
     * Gets the current project.
     * @returns A promise that resolves with the current Project.
     */
    public async getProject(): Promise<Project> {
        if (this.project === undefined) {
            const project: Project = await Project.getApiProject(this.projectId);
            if (project === null) {
                const errorMessage = `project id=${this.projectId} not found`;
                throw new Error(errorMessage);
            }
            this.project = project;
        }
        return this.project;
    }

    /**
     * Renders HTML content in the document body.
     * @param html - The HTML content to render.
     */
    protected render(html: string): void {
        document.body.innerHTML = html;
    }

    /**
     * Initializes the plugin index page.
     */
    protected async index() {

        // init() would generally would go into a constructor
        // it is here contain it to the example it will push meta
        // to the host page, and activate some resize handlers
        // this.init(Plugin.meta);

        // this collects project information given the project id passed in
        // as url argument, there will always be a project id passed
        const project: Project = await Project.getApiProject(this.getProjectId());
        const encodedTitle: string = HtmlUtils.htmlEncode(project.getDisplayTitle());
        const encodedMetaTitle: string = HtmlUtils.htmlEncode(Plugin.meta["title"]);
        // if you reuse InterroBot UI, please fork your own CSS, mine isn't stable
        this.render(`
            <div class="main__heading">
                <div class="main__heading__icon">
                    <img id="projectIcon" src="${project.getImageDataUri()}" alt="Icon for ${encodedTitle}" />
                </div>
                <div class="main__heading__title">
                    <h1>${encodedMetaTitle}</h1>
                    <div><span>${encodedTitle}</span></div>
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

    /**
     * Processes the plugin data.
     */
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

    /**
     * Generates and displays a report based on the processed data.
     * @param titleWords - A map of title words and their counts.
     */
    protected async report(titleWords) {

        // sort titleWords by count, then by term
        const titleWordsRemap = new Map<string, number>([...titleWords.entries()].sort(
            (a, b) => {
                const aVal: number = a[1];
                const bVal: number = b[1];
                if (aVal === bVal) {
                    // secondary sort is term, alpha ascending
                    return (a[0] as string).toLowerCase().localeCompare((b[0] as string).toLowerCase());
                } else {
                    // primary sort is term count, numeric descending
                    return bVal - aVal;
                }
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

    private parentIsOrigin(): boolean {
        try {
            if (!window.parent || window.parent === window) {
                return false;
            }
            let parentDocument = window.parent.document;
            if (!parentDocument) {
                return false;
            }
            return !parentDocument.hidden;
        } catch {
            return false;
        }
    }
}

export { Plugin, PluginConnection };
