import { Project, PluginData, SearchQueryParams, SearchResult } from "./api.js";
import { PluginConnection } from "./host.js";
/**
 * Enumeration for dark mode settings.
 */
declare enum DarkMode {
    Light = 0,
    Dark = 1
}
/**
 * Main Plugin class for InterroBot.
 */
declare class Plugin {
    /**
     * Metadata for the plugin.
     */
    static readonly meta: Record<string, string>;
    /**
     * Initializes the plugin class.
     * @param classtype - The plugin subclass to instantiate when the page is ready.
     * @returns A promise resolving to the instance of the initialized class.
     */
    static initialize<T extends Plugin>(classtype: new () => T): Promise<T>;
    /**
     * Posts the current content height to the parent frame.
     */
    static postContentHeight(constrainTo?: number | null): void;
    /**
     * Posts a request to open a resource link.
     * @param resource - The resource identifier.
     * @param openInBrowser - Whether to open the link in a browser.
     */
    static postOpenResourceLink(resource: number, openInBrowser: boolean): void;
    /**
     * Posts plugin metadata to the parent frame.
     * @param meta - The metadata object to post.
     */
    static postMeta(meta: Record<string, any>): void;
    /**
     * Wraps data in the host message envelope and delivers it to the host
     * frame. See Host.postToHost().
     * @param data - The payload, e.g. { reportHeight: 640 }.
     */
    static postToHost(data: Record<string, any>): void;
    /**
     * Sends an API request to the parent frame. See Host.postApiRequest().
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
     * Sleeps for the specified number of milliseconds. Useful to give the
     * main thread a break to paint (e.g. progress ui) mid-processing.
     * @param millis - The number of milliseconds to sleep.
     */
    static sleep(millis: number): Promise<void>;
    /** @deprecated casing, use getStaticBasePath() */
    static GetStaticBasePath(): string;
    static getStaticBasePath(): string;
    private static contentScrollHeight;
    data: PluginData | null;
    private projectId;
    private mode;
    private project;
    /**
     * Creates a new Plugin instance.
     */
    constructor();
    /**
     * Introduces a delay in the execution.
     * @param ms - The number of milliseconds to delay.
     * @returns A promise that resolves after the specified delay.
     */
    protected delay(ms: number): Promise<void>;
    /**
     * Gets the current mode.
     * @returns The mode (DarkMode.Light, DarkMode.Dark).
     */
    getMode(): DarkMode;
    /**
     * Gets the current project ID.
     * @returns The project ID.
     */
    getProjectId(): number;
    /**
     * Gets the instance meta, the subclassed override data
     * @returns the class meta.
     */
    getInstanceMeta(): Record<string, any>;
    /**
     * Initializes the plugin data.
     * @param defaultData - The default data for the plugin.
     * @param autoform - An array of HTML elements for the autoform.
     */
    initData(defaultData: Record<string, any>, autoform: HTMLElement[]): Promise<void>;
    /**
     * Initializes and returns the plugin data.
     * @param defaultData - The default data for the plugin.
     * @param autoform - An array of HTML elements for the autoform.
     * @returns A promise that resolves with the initialized PluginData.
     */
    initAndGetData(defaultData: any, autoform: HTMLElement[]): Promise<PluginData>;
    /**
     * Gets the plugin's project. Cached after first fetch.
     * @returns A promise that resolves with the current Project.
     * @throws If the project can't be retrieved — an unrecoverable
     *   state, the host supplied the project id at load.
     */
    getProject(): Promise<Project>;
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
    protected search(query: string, options?: Omit<SearchQueryParams, "project" | "query">): AsyncGenerator<SearchResult, void, undefined>;
    /**
     * Renders HTML content in the document body.
     * @param html - The HTML content to render.
     */
    protected render(html: string): void;
    /**
     * Initializes the plugin index page.
     */
    protected index(): Promise<void>;
    /**
     * Processes the plugin data.
     */
    protected process(): Promise<void>;
    /**
     * Generates and displays a report based on the processed data.
     * @param titleWords - A map of title words and their counts.
     */
    protected report(titleWords: Map<string, number>): Promise<void>;
    private parentIsOrigin;
}
export { Plugin, PluginConnection, DarkMode };
