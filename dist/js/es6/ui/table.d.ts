declare enum SortOrder {
    Ascending = 0,
    Descending = 1
}
declare class HTMLResultsTablePage {
    readonly label: string;
    readonly offset: number;
    readonly limit: number;
    readonly extended: boolean;
    constructor(label: string, offset: number, limit: number, extended: boolean);
}
declare class HTMLResultsTableSort {
    primaryHeading: string;
    primarySort: SortOrder;
    readonly secondaryHeading: string;
    readonly secondarySort: SortOrder;
    constructor(primaryHeading: string, primarySort: number, secondaryHeading: string, secondarySort: number);
}
declare class HtmlResultsTable {
    readonly baseElement: HTMLElement;
    private readonly paginationEdgeRangeDesktop;
    private readonly paginationEdgeRangeMobile;
    private rowRenderer;
    private cellRenderer;
    private exportExtra;
    private header;
    private headings;
    private perPage;
    private project;
    private results;
    private resultsSort;
    private resultsOffset;
    private resultsCount;
    private navHandler;
    private downloadHandler;
    private downloadMenuHandler;
    private cellHandler;
    private browserLinkHandler;
    private appLinkHandler;
    private sortableHandler;
    private scrollHandler;
    static createElement(parentElement: HTMLElement, project: number, perPage: number, header: string, headings: string[], results: string[][], resultsSort: HTMLResultsTableSort, rowRenderer: Function, cellRenderer: {}, cellHandler: Function, exportExtra: Object): HtmlResultsTable;
    static generateFormatedColumnNumber(num: number): string;
    static sortResultsHelper(a: string, aNum: number, aIsNum: boolean, b: string, bNum: number, bIsNum: boolean, sortOrder: SortOrder): number;
    constructor(project: number, perPage: number, header: string, headings: string[], results: any[], resultsSort: HTMLResultsTableSort, rowRenderer: Function, cellRenderer: Object, cellHandler: Function, exportExtra: Object);
    getHeadingIndex(headingLabel: string): number;
    getResults(): string[][];
    getHeadings(): string[];
    getResultsSort(): HTMLResultsTableSort;
    setStickyHeaders(scrollY: number): void;
    private sortResults;
    private getColumnClass;
    setOffsetPage(page: number): void;
    private renderTableHeadings;
    private renderTableData;
    private renderSection;
    addHandlers(): void;
    removeHandlers(): void;
    private applyHandlers;
    getPagination(): HTMLResultsTablePage[];
}
export { HtmlResultsTable, HTMLResultsTableSort, SortOrder };
