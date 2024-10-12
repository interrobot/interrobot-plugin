/**
 * Enumeration for different types of search queries.
 */
declare enum SearchQueryType {
    Page = 0,
    Asset = 1,
    Any = 2
}
/**
 * Container for plugin settings
 */
declare class PluginData {
    private autoformInputs;
    private defaultData;
    private data;
    private dataLoaded;
    private meta;
    private project;
    /**
     * Creates an instance of PluginData.
     * @param projectId - The ID of the project.
     * @param meta - Metadata for the plugin.
     * @param defaultData - Default data for the plugin.
     * @param autoformInputs - Array of HTML elements for autoform inputs.
     */
    constructor(projectId: number, meta: {}, defaultData: {}, autoformInputs: HTMLElement[]);
    /**
     * Sets a data field and optionally updates the data.
     * @param key - The key of the data field to set.
     * @param value - The value to set for the data field.
     * @param push - Whether to update the data after setting the field.
     */
    setDataField(key: string, value: any, push: boolean): Promise<void>;
    /**
     * Gets the current plugin data.
     * @returns A promise that resolves to the plugin data.
     */
    getData(): Promise<{}>;
    /**
     * Loads the plugin data from the server.
     */
    loadData(): Promise<void>;
    /**
     * Sets an autoform field and updates the data.
     * @param name - The name of the autoform field.
     * @param value - The value to set for the autoform field.
     */
    setAutoformField(name: string, value: string): Promise<void>;
    /**
     * Updates the plugin data on the server.
     */
    updateData(): Promise<void>;
    /**
     * Gets the data slug for the plugin.
     * @returns The base64 encoded plugin URL.
     */
    private getDataSlug;
    /**
     * Gets the current plugin URL.
     * @returns The full URL of the plugin.
     */
    private getPluginUrl;
}
declare class SearchQuery {
    readonly project: number;
    readonly query: string;
    readonly fields: string;
    readonly type: SearchQueryType;
    readonly includeExternal: boolean;
    /**
     * Creates an instance of SearchQuery.
     * @param project - The project ID.
     * @param query - The search query string.
     * @param fields - The fields to search in.
     * @param type - The type of search query.
     * @param includeExternal - Whether to include external results.
     */
    constructor(project: number, query: string, fields: string, type: SearchQueryType, includeExternal: boolean);
    /**
     * Gets the cache key for the haystack.
     * @returns A string representing the cache key.
     */
    getHaystackCacheKey(): string;
}
declare class Search {
    private static resultsCacheTotal;
    private static resultsHaystackCacheKey;
    /**
     * Executes a search query.
     * @param query - The search query to execute.
     * @param existingResults - Map of existing results.
     * @param processingMessage - Message to display during processing.
     * @param resultHandler - Function to handle each search result.
     * @returns A promise that resolves to a boolean indicating if results were from cache.
     */
    static execute(query: SearchQuery, existingResults: Map<number, SearchResult>, processingMessage: string, resultHandler: any): Promise<boolean>;
    /**
     * Sleeps for the specified number of milliseconds.
     * @param millis - The number of milliseconds to sleep.
     */
    private static sleep;
    /**
     * Handles a single search result.
     * @param jsonResult - The JSON representation of the search result.
     * @param resultTotal - The total number of results.
     * @param resultHandler - Function to handle the search result.
     */
    private static handleResult;
}
/**
 * Class representing a search result.
 */
declare class SearchResult {
    private static readonly wordPunctuationRe;
    private static readonly wordWhitespaceRe;
    readonly result: number;
    readonly id: number;
    readonly url: string;
    readonly created: Date;
    readonly modified: Date;
    readonly size: number;
    readonly status: number;
    readonly time: number;
    readonly norobots: boolean;
    readonly name: string;
    readonly type: string;
    readonly links: string[];
    readonly assets: string[];
    protected content: string;
    protected headers: string;
    private processedContent;
    private optionalFields;
    private static normalizeContentWords;
    private static normalizeContentString;
    /**
     * Creates an instance of SearchResult.
     * @param jsonResult - The JSON representation of the search result.
     */
    constructor(jsonResult: any);
    /**
     * Checks if the result has processed content.
     * @returns True if processed content exists, false otherwise.
     */
    hasProcessedContent(): boolean;
    /**
     * Gets the processed content of the search result.
     * @returns The processed content.
     */
    getProcessedContent(): string;
    /**
     * Sets the processed content of the search result.
     * @param processedContent - The processed content to set.
     */
    setProcessedContent(processedContent: string): void;
    /**
     * Gets the raw content of the search result.
     * @returns The raw content.
     */
    getContent(): string;
    /**
     * Gets the content of the search result as text only.
     * @returns The content as plain text.
     */
    getContentTextOnly(): string;
    /**
     * Gets the headers of the search result.
     * @returns The headers.
     */
    getHeaders(): string;
    /**
     * Gets the path of the URL for the search result.
     * @returns The URL path.
     */
    getUrlPath(): string;
    /**
     * Clears the full-text fields of the search result.
     */
    clearFulltextFields(): void;
}
/**
 * Class representing a crawl.
 */
declare class Crawl {
    id: number;
    created: Date;
    modified: Date;
    project: number;
    complete: boolean;
    time: number;
    report: any;
    /**
     * Creates an instance of Crawl.
     * @param id - The crawl ID.
     * @param project - The project ID.
     * @param created - The creation date.
     * @param modified - The last modified date.
     * @param complete - Whether the crawl is complete.
     * @param time - The time taken for the crawl.
     * @param report - The crawl report.
     */
    constructor(id: number, project: number, created: Date, modified: Date, complete: boolean, time: number, report: any);
    /**
     * Gets the timings from the crawl report.
     * @returns The timings object.
     */
    getTimings(): {};
    /**
     * Gets the sizes from the crawl report.
     * @returns The sizes object.
     */
    getSizes(): {};
    /**
     * Gets the counts from the crawl report.
     * @returns The counts object.
     */
    getCounts(): {};
    private getReportDetailByKey;
}
/**
 * Class representing a project.
 */
declare class Project {
    id: number;
    created: Date;
    modified: Date;
    url: string;
    imageDataUri: string;
    /**
     * Creates an instance of Project.
     * @param id - The project ID.
     * @param created - The creation date.
     * @param modified - The last modified date.
     * @param url - The project URL.
     * @param imageDataUri - The data URI of the project image.
     */
    constructor(id: number, created: Date, modified: Date, url: string, imageDataUri: string);
    /**
     * Gets the data URI of the project image.
     * @returns The image data URI.
     */
    getImageDataUri(): string;
    /**
     * Gets the display title of the project.
     * @returns The display title (hostname of the project URL).
     */
    getDisplayTitle(): string;
    /**
     * Gets a project by its ID from the API.
     * @param id - The project ID.
     * @returns A promise that resolves to a Project instance, or null if not found.
     */
    static getApiProject(id: number): Promise<Project>;
    /**
     * Gets all crawls for a project from the API.
     * @param project - The project ID.
     * @returns A promise that resolves to an array of Crawl instances.
     */
    static getApiCrawls(project: number): Promise<Crawl[]>;
}
export { Project, Crawl, SearchQueryType, SearchQuery, Search, SearchResult, PluginData };
