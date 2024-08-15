"use strict";
/* tslint:disable:no-console */
/* tslint:disable:max-line-length */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginConnection = exports.Plugin = void 0;
// important note: this script runs from the context of the plugin iframe
// but static methods will have the context of the caller
const api_js_1 = require("./api.js");
const html_js_1 = require("./html.js");
const touch_js_1 = require("./touch.js");
var DarkMode;
(function (DarkMode) {
    DarkMode[DarkMode["Light"] = 0] = "Light";
    DarkMode[DarkMode["Dark"] = 1] = "Dark";
})(DarkMode || (DarkMode = {}));
class PluginConnection {
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
    getIframeSrc() {
        return this.iframeSrc;
    }
    getHostOrigin() {
        return this.hostOrigin;
    }
    getPluginOrigin() {
        return this.pluginOrigin;
    }
    toString() {
        return `host = ${this.hostOrigin}; plugin = ${this.pluginOrigin}`;
    }
}
exports.PluginConnection = PluginConnection;
class Plugin {
    static postContentHeight() {
        const mainResults = document.querySelector(".main__results");
        let currentScrollHeight = document.body.scrollHeight;
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
    static logTiming(msg, millis) {
        const seconds = (millis / 1000).toFixed(3);
        console.log(`🤖 [${seconds}s] ${msg}`);
    }
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
    constructor() {
        this.projectId = -1;
        this.mode = DarkMode.Light;
        let paramProject;
        let paramMode;
        let paramOrigin;
        if (window.parent && window.parent !== window) {
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
        const tp = new touch_js_1.TouchProxy();
    }
    delay(ms) {
        // for ui to force painting
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    getProjectId() {
        return this.projectId;
    }
    async init(meta) {
        Plugin.postMeta(meta);
        window.addEventListener("load", Plugin.postContentHeight);
        window.addEventListener("resize", Plugin.postContentHeight);
    }
    async initData(meta, defaultData, autoform) {
        this.data = new api_js_1.PluginData(this.getProjectId(), meta, defaultData, autoform);
        await this.data.loadData();
    }
    async initAndGetData(meta, defaultData, autoform) {
        await this.initData(meta, defaultData, autoform);
        return this.data;
    }
    async getProject() {
        if (this.project === undefined) {
            const project = await api_js_1.Project.getApiProject(this.projectId);
            if (project === null) {
                const errorMessage = `project id=${this.projectId} not found`;
                throw new Error(errorMessage);
            }
            this.project = project;
        }
        return this.project;
    }
    render(html) {
        document.body.innerHTML = html;
    }
    async index() {
        // init() would generally would go into a constructor
        // it is here contain it to the example it will push meta
        // to the host page, and activate some resize handlers
        this.init(Plugin.meta);
        // this collects project information given the project id passed in
        // as url argument, there will always be a project id passed
        const project = await api_js_1.Project.getApiProject(this.getProjectId());
        const encodedTitle = html_js_1.HtmlUtils.htmlEncode(project.getDisplayTitle());
        const encodedMetaTitle = html_js_1.HtmlUtils.htmlEncode(Plugin.meta["title"]);
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
        const internalHtmlPagesQuery = new api_js_1.SearchQuery(projectId, freeQueryString, fields, api_js_1.SearchQueryType.Any, false);
        // run each SearchResult through its handler, and we're done processing
        await api_js_1.Search.execute(internalHtmlPagesQuery, resultsMap, "Processing…", async (result) => {
            await exampleResultHandler(result, titleWords);
        });
        // call for html presentation
        await this.report(titleWords);
    }
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
            tableRows.push(`<tr><td>${html_js_1.HtmlUtils.htmlEncode(truncatedTerm)}</td><td>${count.toLocaleString()}</td></tr>`);
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
}
exports.Plugin = Plugin;
Plugin.meta = {
    "url": "https://example.com/path/to/plugin-page/",
    "title": "InterroBot Base Plugin",
    "category": "Core Example",
    "version": "1.0",
    "author": "InterroBot",
    "description": `Welcome to InterroBot plugin development. This base-class Plugin can already 
        query the database, draw conclusions, and report back. It's just few tweaks away from being 
        your own creation.\n\nThis is the default plugin description. Set meta: {} values
        in the source to update these display values.`,
};
