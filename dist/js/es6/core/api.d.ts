declare enum SearchQueryType {
    Page = 0,
    Asset = 1,
    Any = 2
}
declare class PluginData {
    private autoformInputs;
    private defaultData;
    private data;
    private dataLoaded;
    private meta;
    private projectId;
    constructor(projectId: number, meta: {}, defaultData: {}, autoformInputs: HTMLElement[]);
    setDataField(key: string, value: any, push: boolean): Promise<void>;
    getData(): Promise<{}>;
    loadData(): Promise<void>;
    private updateData;
    private getDataEndpoint;
    private getPluginUrl;
}
declare class SearchQuery {
    readonly projectId: number;
    readonly query: string;
    readonly fields: string;
    readonly type: SearchQueryType;
    readonly includeExternal: boolean;
    constructor(projectId: number, query: string, fields: string, type: SearchQueryType, includeExternal: boolean);
    getHaystackCacheKey(): string;
}
declare class Search {
    private static resultsCacheTotal;
    private static resultsHaystackCacheKey;
    static execute(query: SearchQuery, existingResults: Map<number, SearchResult>, processingMessage: string, resultHandler: any): Promise<boolean>;
    private static sleep;
    private static handleResult;
}
declare class SearchResult {
    private static readonly wordPunctuationRe;
    private static readonly wordWhitespaceRe;
    readonly result: number;
    readonly id: number;
    readonly url: string;
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
    constructor(jsonResult: any);
    hasProcessedContent(): boolean;
    getProcessedContent(): string;
    setProcessedContent(processedContent: string): void;
    getContent(): string;
    getContentTextOnly(): string;
    getHeaders(): string;
    getUrlPath(): string;
    clearFulltextFields(): void;
}
declare class Project {
    id: number;
    created: Date;
    modified: Date;
    url: string;
    imageDataUri: string;
    constructor(id: number, created: Date, modified: Date, url: string, imageDataUri: string);
    getImageDataUri(): string;
    getDisplayTitle(): string;
    static getApiProject(id: number): Promise<Project>;
}
export { Project, SearchQueryType, SearchQuery, Search, SearchResult, PluginData };
