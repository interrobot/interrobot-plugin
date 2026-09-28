/* tslint:disable:no-console */
/* tslint:disable:max-line-length */

// important note: this script runs from the context of the plugin iframe
// but static methods will have the context of the caller

import { Project, PluginData, SearchQuery, SearchQueryParams, Search, SearchExecuteOptions, SearchResult, SearchQueryType } from "./api.js";
import { HtmlUtils } from "./html.js";
import { TouchProxy } from "./touch.js";
import { Host, PluginConnection } from "./host.js";

/**
 * Enumeration for dark mode settings.
 */
enum DarkMode {
    Light,
    Dark,
}

/**
 * Main Plugin class for InterroBot.
 */
class Plugin {


    /**
     * Metadata for the plugin.
     */
    public static readonly meta: Record<string, string> = {
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
     * @param classtype - The plugin subclass to instantiate when the page is ready.
     * @returns A promise resolving to the instance of the initialized class.
     */
    public static async initialize<T extends Plugin>(classtype: new () => T): Promise<T> {

        const createAndConfigure = (): T => {
            const instance: T = new classtype();
            Plugin.postMeta(instance.getInstanceMeta());
            window.addEventListener("load", () => Plugin.postContentHeight());
            window.addEventListener("resize", () => Plugin.postContentHeight());
            return instance;
        };

        if (document.readyState === "complete" || document.readyState === "interactive") {
            return createAndConfigure();
        } else {
            return new Promise<T>((resolve) => {
                document.addEventListener("DOMContentLoaded", () => {
                    resolve(createAndConfigure());
                });
            });
        }
    }

    /**
     * Posts the current content height to the parent frame.
     */
    public static postContentHeight(constrainTo: number | null = null): void {

        // Posts the current content height, or window height, whichever is lesser
        const mainResults: HTMLElement | null = document.querySelector(".main__results");
        let currentScrollHeight: number = document.body.scrollHeight;
        if (mainResults) {
            // more accurate
            currentScrollHeight = Number(mainResults.getBoundingClientRect().bottom);
        }

        if (currentScrollHeight !== Plugin.contentScrollHeight) {
            // useful in aspect ratio scaled situations, otherwise
            // height will only ever increase
            const constrainedHeight = constrainTo && constrainTo >= 1 ?
                Math.min(constrainTo, currentScrollHeight) : currentScrollHeight;
            Plugin.postToHost({
                reportHeight: constrainedHeight,
            });
        }
    }

    /**
     * Posts a request to open a resource link.
     * @param resource - The resource identifier.
     * @param openInBrowser - Whether to open the link in a browser.
     */
    public static postOpenResourceLink(resource: number, openInBrowser: boolean): void {
        Plugin.postToHost({
            reportLink: {
                openInBrowser: openInBrowser,
                resource: resource,
            }
        });
    }

    /**
     * Posts plugin metadata to the parent frame.
     * @param meta - The metadata object to post.
     */
    public static postMeta(meta: Record<string, any>): void {
        // meta { url, title, category, version, author, description}
        Plugin.postToHost({
            reportMeta: meta
        });
    }

    /**
     * Wraps data in the host message envelope and delivers it to the host
     * frame. See Host.postToHost().
     * @param data - The payload, e.g. { reportHeight: 640 }.
     */
    public static postToHost(data: Record<string, any>): void {
        Host.postToHost(data);
    }

    /**
     * Sends an API request to the parent frame. See Host.postApiRequest().
     * @param apiMethod - The API method to call.
     * @param apiKwargs - The arguments for the API call.
     * @param timeoutMillis - Milliseconds before the request rejects (default 300000).
     * @returns A promise that resolves with the API response.
     */
    public static async postApiRequest(apiMethod: string, apiKwargs: {},
        timeoutMillis: number = 300_000): Promise<any> {
        return Host.postApiRequest(apiMethod, apiKwargs, timeoutMillis);
    }

    /**
     * Logs timing information to the console.
     * @param msg - The message to log.
     * @param millis - The time in milliseconds.
     */
    public static logTiming(msg: string, millis: number): void {
        Host.logTiming(msg, millis);
    }

    /**
     * Logs warning information to the console.
     * @param msg - The message to log.
     */
    public static logWarning(msg: string, ex: Error | null = null): void {
        Host.logWarning(msg, ex);
    }

    /**
     * Sleeps for the specified number of milliseconds. Useful to give the
     * main thread a break to paint (e.g. progress ui) mid-processing.
     * @param millis - The number of milliseconds to sleep.
     */
    public static async sleep(millis: number): Promise<void> {
        return Host.sleep(millis);
    }

    /** @deprecated casing, use getStaticBasePath() */
    public static GetStaticBasePath(): string {
        return Plugin.getStaticBasePath();
    }

    public static getStaticBasePath(): string {

        function isLinux(): boolean {
            if ("userAgentData" in navigator && navigator.userAgentData) {
                const platform = (navigator.userAgentData as any).platform.toLowerCase();
                return platform === "linux";
            } else {
                const ua = navigator.userAgent.toLowerCase();
                if (ua.includes("android")) return false;
                if (ua.includes("cros")) return false;
                return ua.includes("linux");
            }
        }

        // different browsers, different runtime hosts
        // linux RCL paths don't work, so this is the workaround
        // see also css fonts, etc.
        // /_content/Interrobot.Common/ is an RCL path, autoestablished in MAUI
        // but inoperable in GTK Linux, even when present in wwwroot
        return isLinux() ? "" : "/_content/Interrobot.Common";
    }

    private static contentScrollHeight: number;

    public data: PluginData | null = null;
    private projectId: number = -1;
    private mode: DarkMode = DarkMode.Light;
    private project: Project | null = null;

    /**
     * Creates a new Plugin instance.
     */
    public constructor() {

        let paramProject: number;
        let paramMode: number;
        let paramOrigin: string | null;

        if (this.parentIsOrigin()) {
            // core report, 3rd party will not have cross origin access
            // params stashed in dataset
            const ifx = window.parent.document.getElementById("report");
            paramProject = parseInt(ifx?.dataset.project ?? "", 10);
            paramMode = parseInt(ifx?.dataset.mode ?? "", 10);
            paramOrigin = ifx?.dataset.origin ?? null;
        } else {
            // proper iframe
            const urlSearchParams = new URLSearchParams(window.location.search);
            paramProject = parseInt(urlSearchParams.get("project") ?? "", 10);
            paramMode = parseInt(urlSearchParams.get("mode") ?? "", 10);
            paramOrigin = urlSearchParams.get("origin");
        }

        // static functions will depend on this static variable
        Host.setConnection(new PluginConnection(document.location.href, paramOrigin));

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
    protected delay(ms: number): Promise<void> {
        // for ui to force painting
        return Plugin.sleep(ms);
    }

    /**
     * Gets the current mode.
     * @returns The mode (DarkMode.Light, DarkMode.Dark).
     */
    public getMode(): DarkMode {
        return this.mode;
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
    public getInstanceMeta(): Record<string, any> {
        return (this.constructor as typeof Plugin).meta;
    }

    /**
     * Initializes the plugin data.
     * @param defaultData - The default data for the plugin.
     * @param autoform - An array of HTML elements for the autoform.
     */
    public async initData(defaultData: Record<string, any>, autoform: HTMLElement[]): Promise<void> {
        this.data = new PluginData({
            projectId: this.getProjectId(),
            meta: this.getInstanceMeta(),
            defaultData: defaultData,
            autoformInputs: autoform
        });
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
        return this.data!;
    }

    /**
     * Gets the plugin's project. Cached after first fetch.
     * @returns A promise that resolves with the current Project.
     * @throws If the project can't be retrieved — an unrecoverable
     *   state, the host supplied the project id at load.
     */
    public async getProject(): Promise<Project> {
        if (this.project === null) {
            this.project = await Project.getApiProject(this.projectId);
        }
        return this.project;
    }

    /**
     * Streams search results for this plugin's project, paginating
     * internally. The simplest path from query to results:
     *
     *     for await (const result of this.search("headers: text/html", { fields: ["name"] })) {
     *         // result is a SearchResult
     *     }
     *
     * @param query - The query, exactly as you'd type it into InterroBot search.
     * @param options - Optional SearchQuery params (fields, type, sort, etc.); project and query come from context.
     * @returns An async generator yielding each SearchResult.
     */
    protected search(query: string, options?: Omit<SearchQueryParams, "project" | "query">): AsyncGenerator<SearchResult, void, undefined> {
        return Search.results(new SearchQuery({
            project: this.projectId,
            query: query,
            ...options,
        }));
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
        const project: Project = await this.getProject();
        const encodedTitle: string = HtmlUtils.htmlEncode(project.getDisplayTitle());
        const encodedMetaTitle: string = HtmlUtils.htmlEncode(this.getInstanceMeta()["title"] ?? "");
        // if you reuse InterroBot UI, please fork your own CSS, mine isn't stable
        this.render(`
            <div class="main__heading">
                <div class="main__heading__icon">
                    <img id="projectIcon" src="${HtmlUtils.htmlEncode(project.getImageDataUri())}" alt="Icon for ${encodedTitle}" />
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

        // stream each SearchResult for the query, counting term/word
        // instances in the name field. the query is exactly as you'd type
        // it into InterroBot search. id and url come with the base model,
        // every field beyond ("name", here) costs time
        for await (const result of this.search("headers: text/html",
            { fields: ["name"], includeExternal: false })) {
            const terms: string[] = result.name.trim().split(/[\s\-—]+/g);
            for (const term of terms) {
                titleWords.set(term, (titleWords.get(term) ?? 0) + 1);
            }
        }

        // for the callback/cache alternative, see Search.execute()

        // call for html presentation
        await this.report(titleWords);
    }

    /**
     * Generates and displays a report based on the processed data.
     * @param titleWords - A map of title words and their counts.
     */
    protected async report(titleWords: Map<string, number>) {

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
            const count: number = titleWordsRemap.get(term) ?? 0;
            const truncatedTerm = term.length > 24 ? term.substring(0, 24) + "…" : term;
            tableRows.push(`<tr><td>${HtmlUtils.htmlEncode(truncatedTerm)}</td><td>${count.toLocaleString()}</td></tr>`);
        }
        const resultsElement: HTMLElement | null = document.querySelector(".main__results");
        if (resultsElement) {
            resultsElement.innerHTML = tableRows.length === 0 ? `<p>No results found.</p>` :
                `<div><section><table style="max-width:340px">
                <thead><tr><th>Term</th><th>Count</th></tr></thead>
                <tbody>${tableRows.join("")}</tbody>
                </table></section></div>`;
        }

        // send signal back to iframe host to alot current page height
        Plugin.postContentHeight();
    }

    private parentIsOrigin(): boolean {
        try {
            if (!window.parent || window.parent === window) {
                return false;
            }
            return Boolean(window.parent.document);
        } catch {
            return false;
        }
    }
}

export { Plugin, PluginConnection, DarkMode };
