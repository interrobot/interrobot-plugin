/**
 * Represents a connection between the plugin and its host.
 */
declare class PluginConnection {
    private iframeSrc;
    private hostOrigin;
    private pluginOrigin;
    /**
     * Creates a new PluginConnection instance.
     * @param iframeSrc - The source URL of the iframe.
     * @param hostOrigin - The origin of the host (optional).
     */
    constructor(iframeSrc: string, hostOrigin: string | null);
    /**
     * Gets the iframe source URL.
     * @returns The iframe source URL.
     */
    getIframeSrc(): string;
    /**
     * Gets the host origin.
     * @returns The host origin.
     */
    getHostOrigin(): string;
    /**
     * Gets the plugin origin.
     * @returns The plugin origin.
     */
    getPluginOrigin(): string;
    /**
     * Returns a string representation of the connection.
     * @returns A string describing the host and plugin origins.
     */
    toString(): string;
}
/**
 * Plugin-to-host messaging. All postMessage traffic to the host frame,
 * and API request/response matching, lives here.
 */
declare class Host {
    private static connection;
    private static apiRequestSeq;
    private static originMismatchWarned;
    /**
     * Sets the connection used to pin messages to the host origin.
     * @param connection - The plugin/host connection.
     */
    static setConnection(connection: PluginConnection): void;
    /**
     * Wraps data in the host message envelope and delivers it to the host
     * frame, pinned to the host origin when known. All plugin-to-host
     * traffic funnels through here — prefer this over raw
     * window.parent.postMessage(msg, "*"), which delivers to any embedder.
     * @param data - The payload, e.g. { reportHeight: 640 }.
     */
    static postToHost(data: Record<string, any>): void;
    /**
     * Sends an API request to the parent frame.
     * @param apiMethod - The API method to call.
     * @param apiKwargs - The arguments for the API call.
     * @param timeoutMillis - Milliseconds before the request rejects (default 300000).
     * @returns A promise that resolves with the API response.
     */
    static postApiRequest(apiMethod: string, apiKwargs: {}, timeoutMillis?: number): Promise<any>;
    /**
     * Logs timing information to the console.
     * @param msg - The message to log.
     * @param millis - The time in milliseconds.
     */
    static logTiming(msg: string, millis: number): void;
    /**
     * Logs warning information to the console.
     * @param msg - The message to log.
     */
    static logWarning(msg: string, ex?: Error | null): void;
    /**
     * Delivers an enveloped message to the parent frame, pinned to the host
     * origin when known. Use postToHost(), which builds the envelope.
     * @param msg - The message to route.
     */
    private static routeMessage;
    /**
     * Sleeps for the specified number of milliseconds. Useful to give the
     * main thread a break to paint (e.g. progress ui) mid-processing.
     * @param millis - The number of milliseconds to sleep.
     */
    static sleep(millis: number): Promise<void>;
}
export { Host, PluginConnection };
