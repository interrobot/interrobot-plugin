/**
 * Enumeration for different types of search queries.
 */
declare enum SearchQueryType {
    Page = "page",
    Asset = "asset",
    Any = "any"
}
/**
 * Valid sort orders for search queries. Prefix "-" for descending,
 * "?" for random.
 */
type SearchQuerySort = "?" | "id" | "-id" | "time" | "-time" | "status" | "-status" | "url" | "-url";
interface SearchQueryParams {
    project: number;
    query: string;
    /** Additional fields to fetch. id and url come free, everything else costs time. Default []. */
    fields?: string[];
    /** Result type filter. Default SearchQueryType.Any. */
    type?: SearchQueryType;
    includeExternal?: boolean;
    includeNoRobots?: boolean;
    /** `(string & {})` preserves autocomplete without breaking untyped callers */
    sort?: SearchQuerySort | (string & {});
    perPage?: number;
}
interface SearchResultJson {
    result: number;
    id: number;
    url: string;
    created?: string;
    modified?: string;
    size?: number;
    status?: number;
    time?: number;
    norobots?: boolean;
    name?: string;
    type?: string;
    content?: string;
    headers?: string;
    links?: string[];
    assets?: string[];
    origin?: string;
}
interface SearchExecuteOptions {
    /** Fetch all pages of results, not just the first. Default false. */
    paginate?: boolean;
    /** Emit progress events (SearchResultHandled/ProcessingMessage) as results process. Default true. */
    showProgress?: boolean;
    /** Message displayed while replaying cached results. Default "Processing...". */
    progressMessage?: string;
}
interface SearchResultsOptions {
    /** Emit a SearchResultHandled progress event after each result is consumed. Default false. */
    showProgress?: boolean;
}
interface CrawlParams {
    id: number;
    project: number;
    created?: Date;
    modified?: Date;
    complete?: boolean;
    time?: number;
    report?: any;
}
interface ProjectParams {
    id: number;
    name?: string;
    type?: string;
    created?: Date;
    modified?: Date;
    url?: string;
    urls?: string[];
    imageDataUri?: string;
}
interface PluginDataParams {
    projectId: number;
    meta: Record<string, string>;
    defaultData: Record<string, any>;
    autoformInputs: HTMLElement[];
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
     * @param params - Configuration object containing projectId, meta, defaultData, and autoformInputs
     */
    constructor(params: PluginDataParams);
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
    getData(): Promise<Record<string, any>>;
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
}
declare class SearchQuery {
    static readonly maxPerPage: number;
    private static readonly validSorts;
    readonly project: number;
    readonly query: string;
    readonly fields: string[];
    readonly type: SearchQueryType;
    readonly includeExternal: boolean;
    readonly includeNoRobots: boolean;
    readonly sort: string;
    readonly perPage: number;
    /**
     * Creates an instance of SearchQuery. Only project and query are
     * required, remaining params have sensible defaults.
     * @param params - Configuration object containing project, query, fields, type, includeExternal, and includeNoRobots
     */
    constructor(params: SearchQueryParams);
    /**
     * Gets the cache key for the haystack.
     * @returns A string representing the cache key.
     */
    getHaystackCacheKey(): string;
}
declare class Search {
    private static readonly executeDeprecationWarning;
    private static resultsCache;
    /**
     * Executes a search query.
     * @param query - The search query to execute
     * @param resultsMap - Map of existing results
     * @param resultHandler - Function to handle each search result
     * @param options - Optional configuration for pagination, progress display, and custom messages
     * @returns A promise that resolves to a boolean indicating if results were from cache
     */
    static execute(query: SearchQuery, resultsMap: Map<number, SearchResult>, resultHandler: (result: SearchResult) => Promise<void>, options?: SearchExecuteOptions): Promise<boolean>;
    /**
     * Streams search results as an async iterator, paginating internally.
     * The streamlined alternative to execute():
     *
     *     for await (const result of Search.results(query)) { ... }
     *
     * No implicit caching, progress events are opt-in — break out of the
     * loop anytime to stop fetching.
     * @param query - The search query to execute
     * @param options - Optional; showProgress emits SearchResultHandled events
     * @returns An async generator yielding each SearchResult
     */
    static results(query: SearchQuery, options?: SearchResultsOptions): AsyncGenerator<SearchResult, void, undefined>;
    /**
     * Handles a single search result.
     * @param jsonResult - The JSON representation of the search result.
     * @param resultTotal - The total number of results.
     * @param resultHandler - Function to handle the search result.
     * @param showProgress - Whether to emit a SearchResultHandled progress event.
     */
    private static handleResult;
    /**
     * Dispatches the SearchResultHandled progress event.
     * @param resultNum - The 1-based position of the handled result.
     * @param resultTotal - The total number of results.
     */
    private static dispatchResultHandled;
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
    private static readonly optionalFields;
    private static normalizeContentWords;
    private static normalizeContentString;
    /**
     * Creates an instance of SearchResult.
     * @param jsonResult - The JSON representation of the search result.
     */
    constructor(jsonResult: SearchResultJson);
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
    project: number;
    complete: boolean;
    created: Date | null;
    modified: Date | null;
    time?: number;
    report?: any;
    /**
     * Creates an instance of Crawl.
     * @param params - Configuration object containing id, project, created, modified, complete, time, and report
     */
    constructor(params: CrawlParams);
    /**
     * Gets the timings from the crawl report.
     * @returns The timings object, or null (InterroBot pre-2.6).
     */
    getTimings(): Record<string, any> | null;
    /**
     * Gets the sizes from the crawl report.
     * @returns The sizes object, or null (InterroBot pre-2.6).
     */
    getSizes(): Record<string, any> | null;
    /**
     * Gets the counts from the crawl report.
     * @returns The counts object, or null (InterroBot pre-2.6).
     */
    getCounts(): Record<string, any> | null;
    private getReportDetailByKey;
}
/**
 * Class representing a project.
 */
declare class Project {
    id: number;
    created?: Date | null;
    modified?: Date | null;
    name?: string | null;
    type?: string | null;
    url?: string | null;
    urls?: string[] | null;
    imageDataUri?: string | null;
    static readonly urlDeprecationWarning: string;
    /** @deprecated misspelling, use urlDeprecationWarning */
    static readonly urlDeprectionWarning: string;
    /**
     * Creates an instance of Project.
     * @param params - Configuration object containing id, created, modified, name, type, url, urls, and imageDataUri
     */
    constructor(params: ProjectParams);
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
    getDisplayUrl(): string;
    /**
     * Gets a project by its ID from the API.
     * @param id - The project ID.
     * @returns A promise that resolves to a Project instance.
     * @throws If no project matches the id.
     */
    static getApiProject(id: number): Promise<Project>;
    /**
     * Gets all crawls for a project from the API.
     * @param project - The project ID.
     * @returns A promise that resolves to an array of Crawl instances.
     */
    static getApiCrawls(project: number): Promise<Crawl[]>;
}
export { Project, ProjectParams, Crawl, CrawlParams, SearchQueryType, SearchQuery, SearchQueryParams, SearchQuerySort, Search, SearchExecuteOptions, SearchResultsOptions, SearchResult, SearchResultJson, PluginData, PluginDataParams };
