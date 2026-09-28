/* tslint:disable:no-console */
/* tslint:disable:max-line-length */
// important note: this script runs from the context of the plugin iframe
// but static methods will have the context of the caller
import { Project, PluginData, SearchQuery, Search } from "./api.js";
import { HtmlUtils } from "./html.js";
import { TouchProxy } from "./touch.js";
import { Host, PluginConnection } from "./host.js";
/**
 * Enumeration for dark mode settings.
 */
var DarkMode;
(function (DarkMode) {
    DarkMode[DarkMode["Light"] = 0] = "Light";
    DarkMode[DarkMode["Dark"] = 1] = "Dark";
})(DarkMode || (DarkMode = {}));
/**
 * Main Plugin class for InterroBot.
 */
class Plugin {
    /**
     * Initializes the plugin class.
     * @param classtype - The plugin subclass to instantiate when the page is ready.
     * @returns A promise resolving to the instance of the initialized class.
     */
    static async initialize(classtype) {
        const createAndConfigure = () => {
            const instance = new classtype();
            Plugin.postMeta(instance.getInstanceMeta());
            window.addEventListener("load", () => Plugin.postContentHeight());
            window.addEventListener("resize", () => Plugin.postContentHeight());
            return instance;
        };
        if (document.readyState === "complete" || document.readyState === "interactive") {
            return createAndConfigure();
        }
        else {
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
    static postContentHeight(constrainTo = null) {
        // Posts the current content height, or window height, whichever is lesser
        const mainResults = document.querySelector(".main__results");
        let currentScrollHeight = document.body.scrollHeight;
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
    static postOpenResourceLink(resource, openInBrowser) {
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
    static postMeta(meta) {
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
    static postToHost(data) {
        Host.postToHost(data);
    }
    /**
     * Sends an API request to the parent frame. See Host.postApiRequest().
     * @param apiMethod - The API method to call.
     * @param apiKwargs - The arguments for the API call.
     * @param timeoutMillis - Milliseconds before the request rejects (default 300000).
     * @returns A promise that resolves with the API response.
     */
    static async postApiRequest(apiMethod, apiKwargs, timeoutMillis = 300000) {
        return Host.postApiRequest(apiMethod, apiKwargs, timeoutMillis);
    }
    /**
     * Logs timing information to the console.
     * @param msg - The message to log.
     * @param millis - The time in milliseconds.
     */
    static logTiming(msg, millis) {
        Host.logTiming(msg, millis);
    }
    /**
     * Logs warning information to the console.
     * @param msg - The message to log.
     */
    static logWarning(msg, ex = null) {
        Host.logWarning(msg, ex);
    }
    /**
     * Sleeps for the specified number of milliseconds. Useful to give the
     * main thread a break to paint (e.g. progress ui) mid-processing.
     * @param millis - The number of milliseconds to sleep.
     */
    static async sleep(millis) {
        return Host.sleep(millis);
    }
    /** @deprecated casing, use getStaticBasePath() */
    static GetStaticBasePath() {
        return Plugin.getStaticBasePath();
    }
    static getStaticBasePath() {
        function isLinux() {
            if ("userAgentData" in navigator && navigator.userAgentData) {
                const platform = navigator.userAgentData.platform.toLowerCase();
                return platform === "linux";
            }
            else {
                const ua = navigator.userAgent.toLowerCase();
                if (ua.includes("android"))
                    return false;
                if (ua.includes("cros"))
                    return false;
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
    /**
     * Creates a new Plugin instance.
     */
    constructor() {
        var _a, _b, _c, _d, _e;
        this.data = null;
        this.projectId = -1;
        this.mode = DarkMode.Light;
        this.project = null;
        let paramProject;
        let paramMode;
        let paramOrigin;
        if (this.parentIsOrigin()) {
            // core report, 3rd party will not have cross origin access
            // params stashed in dataset
            const ifx = window.parent.document.getElementById("report");
            paramProject = parseInt((_a = ifx === null || ifx === void 0 ? void 0 : ifx.dataset.project) !== null && _a !== void 0 ? _a : "", 10);
            paramMode = parseInt((_b = ifx === null || ifx === void 0 ? void 0 : ifx.dataset.mode) !== null && _b !== void 0 ? _b : "", 10);
            paramOrigin = (_c = ifx === null || ifx === void 0 ? void 0 : ifx.dataset.origin) !== null && _c !== void 0 ? _c : null;
        }
        else {
            // proper iframe
            const urlSearchParams = new URLSearchParams(window.location.search);
            paramProject = parseInt((_d = urlSearchParams.get("project")) !== null && _d !== void 0 ? _d : "", 10);
            paramMode = parseInt((_e = urlSearchParams.get("mode")) !== null && _e !== void 0 ? _e : "", 10);
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
    delay(ms) {
        // for ui to force painting
        return Plugin.sleep(ms);
    }
    /**
     * Gets the current mode.
     * @returns The mode (DarkMode.Light, DarkMode.Dark).
     */
    getMode() {
        return this.mode;
    }
    /**
     * Gets the current project ID.
     * @returns The project ID.
     */
    getProjectId() {
        return this.projectId;
    }
    /**
     * Gets the instance meta, the subclassed override data
     * @returns the class meta.
     */
    getInstanceMeta() {
        return this.constructor.meta;
    }
    /**
     * Initializes the plugin data.
     * @param defaultData - The default data for the plugin.
     * @param autoform - An array of HTML elements for the autoform.
     */
    async initData(defaultData, autoform) {
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
    async initAndGetData(defaultData, autoform) {
        await this.initData(defaultData, autoform);
        return this.data;
    }
    /**
     * Gets the plugin's project. Cached after first fetch.
     * @returns A promise that resolves with the current Project.
     * @throws If the project can't be retrieved — an unrecoverable
     *   state, the host supplied the project id at load.
     */
    async getProject() {
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
    search(query, options) {
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
    render(html) {
        document.body.innerHTML = html;
    }
    /**
     * Initializes the plugin index page.
     */
    async index() {
        // init() would generally would go into a constructor
        // it is here contain it to the example it will push meta
        // to the host page, and activate some resize handlers
        // this.init(Plugin.meta);
        var _a;
        // this collects project information given the project id passed in
        // as url argument, there will always be a project id passed
        const project = await this.getProject();
        const encodedTitle = HtmlUtils.htmlEncode(project.getDisplayTitle());
        const encodedMetaTitle = HtmlUtils.htmlEncode((_a = this.getInstanceMeta()["title"]) !== null && _a !== void 0 ? _a : "");
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
        button.addEventListener("click", async (ev) => {
            await this.process();
        });
    }
    /**
     * Processes the plugin data.
     */
    async process() {
        var _a;
        // as an example, collect page title word counts across all html pages
        // it's a contrived example, but let us keep things simple
        const titleWords = new Map();
        // stream each SearchResult for the query, counting term/word
        // instances in the name field. the query is exactly as you'd type
        // it into InterroBot search. id and url come with the base model,
        // every field beyond ("name", here) costs time
        for await (const result of this.search("headers: text/html", { fields: ["name"], includeExternal: false })) {
            const terms = result.name.trim().split(/[\s\-—]+/g);
            for (const term of terms) {
                titleWords.set(term, ((_a = titleWords.get(term)) !== null && _a !== void 0 ? _a : 0) + 1);
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
    async report(titleWords) {
        var _a;
        // sort titleWords by count, then by term
        const titleWordsRemap = new Map([...titleWords.entries()].sort((a, b) => {
            const aVal = a[1];
            const bVal = b[1];
            if (aVal === bVal) {
                // secondary sort is term, alpha ascending
                return a[0].toLowerCase().localeCompare(b[0].toLowerCase());
            }
            else {
                // primary sort is term count, numeric descending
                return bVal - aVal;
            }
        }));
        // render html output from collected data
        const tableRows = [];
        for (let term of titleWordsRemap.keys()) {
            const count = (_a = titleWordsRemap.get(term)) !== null && _a !== void 0 ? _a : 0;
            const truncatedTerm = term.length > 24 ? term.substring(0, 24) + "…" : term;
            tableRows.push(`<tr><td>${HtmlUtils.htmlEncode(truncatedTerm)}</td><td>${count.toLocaleString()}</td></tr>`);
        }
        const resultsElement = document.querySelector(".main__results");
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
    parentIsOrigin() {
        try {
            if (!window.parent || window.parent === window) {
                return false;
            }
            return Boolean(window.parent.document);
        }
        catch {
            return false;
        }
    }
}
/**
 * Metadata for the plugin.
 */
Plugin.meta = {
    "title": "InterroBot Base Plugin",
    "category": "Example",
    "version": "1.0",
    "author": "InterroBot",
    "description": `Welcome to InterroBot plugin development. This base-class Plugin can already 
        query the database, draw conclusions, and report back. It's just few tweaks away from being 
        your own creation.\n\nThis is the default plugin description. Set meta: {} values
        in the source to update these display values.`,
};
export { Plugin, PluginConnection, DarkMode };
