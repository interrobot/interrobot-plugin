/**
 * Enumeration for sorting order.
 */
declare enum SortOrder {
    Ascending = 0,
    Descending = 1
}
/**
 * Enumeration for sorting order.
 */
interface TableConfig {
    container: HTMLElement;
    project: number;
    headings: string[];
    results: string[][];
    perPage?: number;
    header?: string;
    resultsSort?: HTMLResultsTableSort;
    rowRenderer?: Function | null;
    cellRenderer?: {
        [id: string]: Function;
    } | null;
    cellHandler?: Function | null;
    exportExtra?: {
        [id: string]: any;
    } | null;
}
/**
 * Represents a page in the HTML results table.
 */
declare class HTMLResultsTablePage {
    /**
     * Creates a new instance of HTMLResultsTablePage.
     * @param label - The label for the page.
     * @param offset - The offset of the page.
     * @param limit - The limit of items per page.
     * @param extended - Indicates if this is an extended page.
     */
    readonly label: string;
    readonly offset: number;
    readonly limit: number;
    readonly extended: boolean;
    constructor(label: string, offset: number, limit: number, extended: boolean);
}
/**
 * Represents the sorting configuration for the HTML results table.
 */
declare class HTMLResultsTableSort {
    primaryHeading: string;
    primarySort: SortOrder;
    readonly secondaryHeading: string;
    readonly secondarySort: SortOrder;
    /**
     * Creates a new instance of HTMLResultsTableSort.
     * @param primaryHeading - The primary heading to sort by.
     * @param primarySort - The sort order for the primary heading.
     * @param secondaryHeading - The secondary heading to sort by.
     * @param secondarySort - The sort order for the secondary heading.
     */
    constructor(primaryHeading: string, primarySort: number, secondaryHeading: string, secondarySort: number);
}
/**
 * Represents an HTML results table with sorting and pagination functionality.
 */
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
    /**
     * Creates a new HtmlResultsTable and appends it to the parent element.
     * @deprecated Use create() instead. This method will be removed at some point tbd.
     * @param parentElement - The parent element to append the table to.
     * @param project - The project number.
     * @param perPage - The number of items per page.
     * @param header - The header text for the table.
     * @param headings - The column headings.
     * @param results - The data to be displayed in the table.
     * @param resultsSort - The initial sorting configuration.
     * @param rowRenderer - A function to render custom rows.
     * @param cellRenderer - An object with functions to render custom cells.
     * @param cellHandler - A function to handle cell events.
     * @param exportExtra - Additional data for export.
     * @returns A new instance of HtmlResultsTable.
     */
    static createElement(parentElement: HTMLElement, project: number, perPage: number, header: string, headings: string[], results: string[][], resultsSort: HTMLResultsTableSort, rowRenderer: Function | null, cellRenderer: {
        [id: string]: Function;
    } | null, cellHandler: Function | null, exportExtra: {
        [id: string]: any;
    } | null): HtmlResultsTable;
    static create(config: TableConfig): HtmlResultsTable;
    /**
     * Generates a formatted column number.
     * @param num - The number to format.
     * @returns A string representation of the formatted number.
     */
    static generateFormatedColumnNumber(num: number): string;
    /**
     * Helper function for sorting results.
     * @param a - First value to compare.
     * @param aNum - Numeric representation of the first value.
     * @param aIsNum - Indicates if the first value is a number.
     * @param b - Second value to compare.
     * @param bNum - Numeric representation of the second value.
     * @param bIsNum - Indicates if the second value is a number.
     * @param sortOrder - The sort order to apply.
     * @returns A number indicating the sort order of the two values.
     */
    static sortResultsHelper(a: string, aNum: number, aIsNum: boolean, b: string, bNum: number, bIsNum: boolean, sortOrder: SortOrder): number;
    /**
     * Creates a new instance of HtmlResultsTable.
     * @param project - The project number.
     * @param perPage - The number of items per page.
     * @param header - The header text for the table.
     * @param headings - The column headings.
     * @param results - The data to be displayed in the table.
     * @param resultsSort - The initial sorting configuration.
     * @param rowRenderer - A function to render custom rows.
     * @param cellRenderer - An object with functions to render custom cells.
     * @param cellHandler - A function to handle cell events.
     * @param exportExtra - Additional data for export.
     */
    constructor(project: number, perPage: number, header: string, headings: string[], results: any[], resultsSort: HTMLResultsTableSort, rowRenderer: Function | null, cellRenderer: {
        [id: string]: Function;
    } | null, cellHandler: Function | null, exportExtra: {
        [id: string]: any;
    } | null);
    /**
     * Gets the index of a heading in the headings array.
     * @param headingLabel - The label of the heading to find.
     * @returns The index of the heading, or -1 if not found.
     */
    getHeadingIndex(headingLabel: string): number;
    /**
     * Gets the results data.
     * @returns The results data as a 2D array of strings.
     */
    getResults(): string[][];
    /**
     * Gets the headings of the table.
     * @returns An array of heading strings.
     */
    getHeadings(): string[];
    /**
     * Gets the current sorting configuration.
     * @returns The current HTMLResultsTableSort object.
     */
    getResultsSort(): HTMLResultsTableSort;
    /**
     * Sets the sticky headers based on the current scroll position.
     * @param scrollY - The current vertical scroll position.
     */
    setStickyHeaders(scrollY: number): void;
    /**
     * Sets the current page offset.
     * @param page - The page number to set (0-indexed).
     */
    setOffsetPage(page: number): void;
    private sortResults;
    private getColumnClass;
    private renderTableHeadings;
    private renderTableData;
    private renderSection;
    /**
     * Adds event handlers to the table elements.
     */
    addHandlers(): void;
    /**
     * Removes event handlers from the table elements.
     */
    removeHandlers(): void;
    /**
     * Identifies a core plugin (as true)
     */
    private isCorePlugin;
    private applyHandlers;
    /**
     * Gets the pagination configuration.
     * @returns An array of HTMLResultsTablePage objects representing the pagination.
     */
    getPagination(): HTMLResultsTablePage[];
}
export { HtmlResultsTable, HTMLResultsTablePage, HTMLResultsTableSort, SortOrder, TableConfig };
