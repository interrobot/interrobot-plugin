declare class HTMLResultsTablePage {
    readonly label: string;
    readonly offset: number;
    readonly limit: number;
    constructor(label: string, offset: number, limit: number);
}
declare class HtmlResultsTable {
    readonly baseElement: HTMLElement;
    private rowRenderer;
    private cellRenderer;
    private exportExtra;
    private header;
    private headings;
    private perPage;
    private projectId;
    private results;
    private resultsOffset;
    private resultsCount;
    private navHandler;
    private downloadHandler;
    private downloadMenuHandler;
    private cellHandler;
    private outlinkHandler;
    static createElement(parentElement: HTMLElement, projectId: number, perPage: number, header: string, headings: string[], results: string[][], rowRenderer: Function, cellRenderer: {}, cellHandler: Function, exportExtra: Object): HtmlResultsTable;
    constructor(projectId: number, perPage: number, header: string, headings: string[], results: any[], rowRenderer: Function, cellRenderer: Object, cellHandler: Function, exportExtra: Object);
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
export { HtmlResultsTable };
