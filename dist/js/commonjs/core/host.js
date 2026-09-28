"use strict";
/* tslint:disable:no-console */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginConnection = exports.Host = void 0;
// leaf module, imports nothing from core: avoids the api/touch <-> plugin import cycles
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
exports.PluginConnection = PluginConnection;
/**
 * Plugin-to-host messaging. All postMessage traffic to the host frame,
 * and API request/response matching, lives here.
 */
class Host {
    /**
     * Sets the connection used to pin messages to the host origin.
     * @param connection - The plugin/host connection.
     */
    static setConnection(connection) {
        Host.connection = connection;
    }
    /**
     * Wraps data in the host message envelope and delivers it to the host
     * frame, pinned to the host origin when known. All plugin-to-host
     * traffic funnels through here — prefer this over raw
     * window.parent.postMessage(msg, "*"), which delivers to any embedder.
     * @param data - The payload, e.g. { reportHeight: 640 }.
     */
    static postToHost(data) {
        Host.routeMessage({
            target: "interrobot",
            data: data,
        });
    }
    /**
     * Sends an API request to the parent frame.
     * @param apiMethod - The API method to call.
     * @param apiKwargs - The arguments for the API call.
     * @param timeoutMillis - Milliseconds before the request rejects (default 300000).
     * @returns A promise that resolves with the API response.
     */
    static async postApiRequest(apiMethod, apiKwargs, timeoutMillis = 300000) {
        // requests are matched to responses by method, and by sequence number
        // when the host echoes it back (__meta__.request.seq). hosts predating
        // the seq echo match on method alone, as before
        const seq = ++Host.apiRequestSeq;
        return new Promise((resolve, reject) => {
            let timer = 0;
            const listener = (ev) => {
                // debug message being passed here. too spammy to leave on officially,
                // too dependably useful to remove
                // console.log(ev);
                var _a, _b, _c;
                var _d, _e, _f;
                // api responses accepted from the host (parent) window only
                if (ev.source !== window.parent) {
                    return;
                }
                // ev.source identity is the gate, origin logged as diagnostic
                const hostOrigin = (_d = (_a = Host.connection) === null || _a === void 0 ? void 0 : _a.getHostOrigin()) !== null && _d !== void 0 ? _d : "";
                if (hostOrigin !== "" && ev.origin !== hostOrigin && !Host.originMismatchWarned) {
                    Host.originMismatchWarned = true;
                    Host.logWarning(`api response origin '${ev.origin}' != expected '${hostOrigin}'`);
                }
                const evData = ev.data;
                const evDataData = (_e = evData === null || evData === void 0 ? void 0 : evData.data) !== null && _e !== void 0 ? _e : {};
                if (evDataData && typeof evDataData === "object" && evDataData.hasOwnProperty("apiResponse")) {
                    const requestMeta = (_f = (_c = (_b = evDataData.apiResponse) === null || _b === void 0 ? void 0 : _b["__meta__"]) === null || _c === void 0 ? void 0 : _c["request"]) !== null && _f !== void 0 ? _f : {};
                    const seqMatched = requestMeta["seq"] === undefined || requestMeta["seq"] === seq;
                    if (apiMethod === requestMeta["method"] && seqMatched) {
                        window.clearTimeout(timer);
                        window.removeEventListener("message", listener);
                        resolve(evDataData.apiResponse);
                    }
                    // else keep listening. SetPluginData rides an independent
                    // event channel, doesn't serialize requests like GetResources
                }
            };
            timer = window.setTimeout(() => {
                window.removeEventListener("message", listener);
                reject(new Error(`api request '${apiMethod}' (seq=${seq}) timed out after ${timeoutMillis / 1000}s`));
            }, timeoutMillis);
            // listen for response to postmessage api request with listener()
            window.addEventListener("message", listener);
            Host.postToHost({
                apiRequest: {
                    method: apiMethod,
                    kwargs: apiKwargs,
                    seq: seq,
                }
            });
        });
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
    static logWarning(msg, ex = null) {
        const newlinedError = ex ? `\n${ex}` : "";
        console.warn(`🤖 ${msg}${newlinedError}`);
    }
    /**
     * Delivers an enveloped message to the parent frame, pinned to the host
     * origin when known. Use postToHost(), which builds the envelope.
     * @param msg - The message to route.
     */
    static routeMessage(msg) {
        // Pt 1 of 2
        // window.parent.origin can't be read from external URL, only works with core
        // console.log(document.location.href);
        // console.log(Host.connection.toString());
        let parentOrigin = "";
        if (Host.connection) {
            parentOrigin = Host.connection.getHostOrigin();
            window.parent.postMessage(msg, parentOrigin);
        }
        else {
            // core iframe uses srcdoc, has no usable origin
            // TODO, Host.connection should be set regardless?
            // this happens on export dl ands external urls btw
            window.parent.postMessage(msg);
        }
    }
    /**
     * Sleeps for the specified number of milliseconds. Useful to give the
     * main thread a break to paint (e.g. progress ui) mid-processing.
     * @param millis - The number of milliseconds to sleep.
     */
    static async sleep(millis) {
        return new Promise((resolve) => setTimeout(() => resolve(), millis));
    }
}
exports.Host = Host;
Host.connection = null;
Host.apiRequestSeq = 0;
Host.originMismatchWarned = false;
