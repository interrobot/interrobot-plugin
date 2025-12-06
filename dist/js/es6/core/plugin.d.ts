import { Project, PluginData } from "./api.js";
/**
 * Enumeration for dark mode settings.
 */
declare enum DarkMode {
    Light = 0,
    Dark = 1
}
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
 * Main Plugin class for InterroBot.
 */
declare class Plugin {
    /**
     * Metadata for the plugin.
     */
    static readonly meta: {};
    /**
     * Initializes the plugin class.
     * @param classtype - The class type to initialize.
     * @returns An instance of the initialized class.
     */
    static initialize(classtype: any): Promise<any>;
    /**
     * Posts the current content height to the parent frame.
     */
    static postContentHeight(constrainTo?: number): void;
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
    static postMeta(meta: {}): void;
    /**
     * Sends an API request to the parent frame.
     * @param apiMethod - The API method to call.
     * @param apiKwargs - The arguments for the API call.
     * @returns A promise that resolves with the API response.
     */
    static postApiRequest(apiMethod: string, apiKwargs: {}): Promise<any>;
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
    static logWarning(msg: string): void;
    /**
     * Routes a message to the parent frame.
     * @param msg - The message to route.
     */
    private static routeMessage;
    static GetStaticBasePath(): string;
    private static contentScrollHeight;
    private static connection;
    data: PluginData;
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
    protected delay(ms: number): Promise<unknown>;
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
    getInstanceMeta(): {};
    /**
     * Initializes the plugin data.
     * @param defaultData - The default data for the plugin.
     * @param autoform - An array of HTML elements for the autoform.
     */
    initData(defaultData: {}, autoform: HTMLElement[]): Promise<void>;
    /**
     * Initializes and returns the plugin data.
     * @param defaultData - The default data for the plugin.
     * @param autoform - An array of HTML elements for the autoform.
     * @returns A promise that resolves with the initialized PluginData.
     */
    initAndGetData(defaultData: any, autoform: HTMLElement[]): Promise<PluginData>;
    /**
     * Gets the current project.
     * @returns A promise that resolves with the current Project.
     */
    getProject(): Promise<Project>;
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
    protected report(titleWords: any): Promise<void>;
    private parentIsOrigin;
}
export { Plugin, PluginConnection, DarkMode };
