/* tslint:disable:no-console */
/* tslint:disable:max-line-length */
// important note: this script runs from the context of the plugin iframe
// but static methods will have the context of the caller
import { Project, PluginData, SearchQuery, Search, SearchQueryType } from "./api.js";
import { HtmlUtils } from "./html.js";
import { TouchProxy } from "./touch.js";
/**
 * Enumeration for dark mode settings.
 */
var DarkMode;
(function (DarkMode) {
    DarkMode[DarkMode["Light"] = 0] = "Light";
    DarkMode[DarkMode["Dark"] = 1] = "Dark";
})(DarkMode || (DarkMode = {}));
/**
 * Represents a connection between the plugin and its host.
 */
class PluginConnection {
    /**
     * Creates a new PluginConnection instance.
     * @param iframeSrc - The source URL of the iframe.
     * @param hostOrigin - The origin of the host (optional).
     */
    constructor(iframeSrc, hostOrigin) {
        this.iframeSrc = iframeSrc;
        if (hostOrigin) {
            this.hostOrigin = hostOrigin;
        }
        else {
            this.hostOrigin = "";
        }
        const url = new URL(iframeSrc);
        if (iframeSrc === "about:srcdoc") {
            this.pluginOrigin = "about:srcdoc"; // there is no faithful origin
        }
        else {
            this.pluginOrigin = url.origin;
        }
    }
    /**
     * Gets the iframe source URL.
     * @returns The iframe source URL.
     */
    getIframeSrc() {
        return this.iframeSrc;
    }
    /**
     * Gets the host origin.
     * @returns The host origin.
     */
    getHostOrigin() {
        return this.hostOrigin;
    }
    /**
     * Gets the plugin origin.
     * @returns The plugin origin.
     */
    getPluginOrigin() {
        return this.pluginOrigin;
    }
    /**
     * Returns a string representation of the connection.
     * @returns A string describing the host and plugin origins.
     */
    toString() {
        return `host = ${this.hostOrigin}; plugin = ${this.pluginOrigin}`;
    }
}
/**
 * Main Plugin class for InterroBot.
 */
class Plugin {
    /**
     * Initializes the plugin class.
     * @param classtype - The class type to initialize.
     * @returns An instance of the initialized class.
     */
    static async initialize(classtype) {
        const createAndConfigure = () => {
            let instance = new classtype();
            Plugin.postMeta(instance.constructor.meta);
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
            const msg = {
                target: "interrobot",
                data: {
                    reportHeight: constrainedHeight,
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
    static postOpenResourceLink(resource, openInBrowser) {
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
    static postMeta(meta) {
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
    static async postApiRequest(apiMethod, apiKwargs) {
        // meta { url, title, category, version, author, description}
        let result = null;
        const getPromisedResult = async () => {
            return new Promise((resolve) => {
                const listener = async (ev) => {
                    // debug message being passed here. too spammy to leave on officially,
                    // too dependably useful to remove
                    // console.log(ev);
                    var _a;
                    if (ev === undefined) {
                        return;
                    }
                    const evData = ev.data;
                    const evDataData = (_a = evData.data) !== null && _a !== void 0 ? _a : {};
                    if (evDataData && typeof evDataData === "object" && evDataData.hasOwnProperty("apiResponse")) {
                        const resultMethod = evDataData.apiResponse["__meta__"]["request"]["method"];
                        if (apiMethod === resultMethod) {
                            result = evData.data.apiResponse;
                            window.removeEventListener("message", listener);
                            resolve();
                        }
                        else {
                            // SetPluginData on an independent event channel, doesn't serialize requests
                            // like GetResources, continue listening for correct respsonse
                            // console.log(`apiMethod mismatch: sent: ${apiMethod} recieved: ${resultMethod}`);
                        }
                    }
                };
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
        };
        await getPromisedResult();
        return result;
    }
    /**
     * Logs timing information to the console.
     * @param msg - The message to log.
     * @param millis - The time in milliseconds.
     */
    static logTiming(msg, millis) {
        const seconds = (millis / 1000).toFixed(3);
        console.log(`🤖 [${seconds}s] ${msg}`);
    }
    /**
     * Logs warning information to the console.
     * @param msg - The message to log.
     */
    static logWarning(msg) {
        console.warn(`🤖 ${msg}`);
    }
    /**
     * Routes a message to the parent frame.
     * @param msg - The message to route.
     */
    static routeMessage(msg) {
        // Pt 1 of 2
        // window.parent.origin can't be read from external URL, only works with core
        // console.log(document.location.href);
        // console.log(Plugin.connection.toString());
        let parentOrigin = "";
        if (Plugin.connection) {
            parentOrigin = Plugin.connection.getHostOrigin();
            window.parent.postMessage(msg, parentOrigin);
        }
        else {
            // core iframe uses srcdoc, has no usable origin
            // TODO, Plugin.connection should be set regardless?
            // this happens on export dl ands external urls btw
            window.parent.postMessage(msg);
        }
    }
    static GetStaticBasePath() {
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
        this.projectId = -1;
        this.mode = DarkMode.Light;
        let paramProject;
        let paramMode;
        let paramOrigin;
        if (this.parentIsOrigin()) {
            // core report, 3rd party will not have cross origin access
            // params stashed in dataset
            const ifx = window.parent.document.getElementById("report");
            paramProject = parseInt(ifx.dataset.project, 10);
            paramMode = parseInt(ifx.dataset.mode, 10);
            paramOrigin = ifx.dataset.origin;
        }
        else {
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
    delay(ms) {
        // for ui to force painting
        return new Promise(resolve => setTimeout(resolve, ms));
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
        return this.constructor["meta"];
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
     * Gets the current project.
     * @returns A promise that resolves with the current Project.
     */
    async getProject() {
        if (this.project === undefined) {
            const project = await Project.getApiProject(this.projectId);
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
        // this collects project information given the project id passed in
        // as url argument, there will always be a project id passed
        const project = await Project.getApiProject(this.getProjectId());
        const encodedTitle = HtmlUtils.htmlEncode(project.getDisplayTitle());
        const encodedMetaTitle = HtmlUtils.htmlEncode(Plugin.meta["title"]);
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
        button.addEventListener("click", async (ev) => {
            await this.process();
        });
    }
    /**
     * Processes the plugin data.
     */
    async process() {
        // as an example, collect page title word counts across all html pages
        // it's a contrived example, but let us keep things simple
        const titleWords = new Map();
        // resultsMap is probably a property on your plugin IRL, but I don't want to pollute
        // to pollute the Plugin namespace any more than necessary for the sake of example
        // plugin screens
        let resultsMap;
        // the function to handle individual SearchResults
        // in this example, counting term/word instances in the name field
        const exampleResultHandler = async (result, titleWordsMap) => {
            const terms = result.name.trim().split(/[\s\-—]+/g);
            for (let term of terms) {
                if (!titleWordsMap.has(term)) {
                    titleWordsMap.set(term, 1);
                }
                else {
                    const currentCount = titleWordsMap.get(term);
                    titleWordsMap.set(term, currentCount + 1);
                }
            }
        };
        // projectId comes for free as a member of Plugin
        const projectId = this.getProjectId();
        // build a query, these are exactly as you'd type them into InterroBot search
        const freeQueryString = "headers: text/html";
        // pipe delimited fields you want retrieved
        // id and url come with the base model, everything else costs time
        const fields = "name";
        // const internalHtmlPagesQuery = new SearchQuery(projectId, freeQueryString, fields,
        //     SearchQueryType.Any, false, false);
        const internalHtmlPagesQuery = new SearchQuery({
            project: projectId,
            query: freeQueryString,
            fields: fields,
            type: SearchQueryType.Any,
            includeExternal: false,
            includeNoRobots: false,
        });
        // run each SearchResult through its handler, and we're done processing
        await Search.execute(internalHtmlPagesQuery, resultsMap, async (result) => {
            await exampleResultHandler(result, titleWords);
        }, true, false, "Processing…");
        // call for html presentation
        await this.report(titleWords);
    }
    /**
     * Generates and displays a report based on the processed data.
     * @param titleWords - A map of title words and their counts.
     */
    async report(titleWords) {
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
            const count = titleWordsRemap.get(term);
            const truncatedTerm = term.length > 24 ? term.substring(24) + "…" : term;
            tableRows.push(`<tr><td>${HtmlUtils.htmlEncode(truncatedTerm)}</td><td>${count.toLocaleString()}</td></tr>`);
        }
        const resultsElement = document.querySelector(".main__results");
        resultsElement.innerHTML = tableRows.length === 0 ? `<p>No results found.</p>` :
            `<div><section><table style="max-width:340px">
            <thead><tr><th>Term</th><th>Count</th></tr></thead>
            <tbody>${tableRows.join("")}</tbody>
            </table></section></div>`;
        // send signal back to iframe host to alot current page height
        Plugin.postContentHeight();
    }
    parentIsOrigin() {
        try {
            if (!window.parent || window.parent === window) {
                return false;
            }
            let parentDocument = window.parent.document;
            if (!parentDocument) {
                return false;
            }
            return !parentDocument.hidden;
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
