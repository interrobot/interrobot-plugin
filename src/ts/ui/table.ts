﻿import { Plugin } from "../core/plugin.js";
import { HtmlUtils } from "../core/html.js";

/**
 * Enumeration for sorting order.
 */
enum SortOrder {
    Ascending,
    Descending,
}

/**
 * Represents a page in the HTML results table.
 */
class HTMLResultsTablePage {
    /**
     * Creates a new instance of HTMLResultsTablePage.
     * @param label - The label for the page.
     * @param offset - The offset of the page.
     * @param limit - The limit of items per page.
     * @param extended - Indicates if this is an extended page.
     */
    public readonly label: string;
    public readonly offset: number;
    public readonly limit: number;
    public readonly extended: boolean;

    constructor(label: string, offset: number, limit: number, extended: boolean) {
        this.label = label;
        this.offset = offset;
        this.limit = limit;
        this.extended = extended;
    }
}

/**
 * Represents the sorting configuration for the HTML results table.
 */
class HTMLResultsTableSort {

    public primaryHeading: string;
    public primarySort: SortOrder;
    public readonly secondaryHeading: string;
    public readonly secondarySort: SortOrder;

    /**
     * Creates a new instance of HTMLResultsTableSort.
     * @param primaryHeading - The primary heading to sort by.
     * @param primarySort - The sort order for the primary heading.
     * @param secondaryHeading - The secondary heading to sort by.
     * @param secondarySort - The sort order for the secondary heading.
     */
    constructor(primaryHeading: string, primarySort: number, secondaryHeading: string, secondarySort: number) {
        this.primaryHeading = primaryHeading;
        this.primarySort = primarySort;
        this.secondaryHeading = secondaryHeading;
        this.secondarySort = secondarySort;
    }
}

/**
 * Represents a button in the HTML results table.
 */
class HTMLResultsTableButton {

    public readonly element: HTMLButtonElement;
    public readonly data: Map<string, string>;
    public readonly documentId: number;
    private clickHandler: any;

    /**
     * Creates a new HTMLResultsTableButton and appends it to the parent element.
     * @param parentElement - The parent element to append the button to.
     * @param documentId - The ID of the document associated with this button.
     * @param data - Additional data for the button.
     * @param contents - The contents of the button.
     * @param classes - CSS classes for the button.
     * @param clickHandler - The click event handler for the button.
     * @returns A new instance of HTMLResultsTableButton.
     */
    public static createElement(parentElement: HTMLElement, documentId: number,
        data: Map<string, string>, contents: string, classes: string[], clickHandler: any) {
        const button = new HTMLResultsTableButton(documentId, data, contents, classes, clickHandler);
        parentElement.appendChild(button.element);
        return button;
    }

    constructor(documentId: number, data: Map<string, string>,
        contents: string, classes: string[], clickHandler: any) {
        this.data = data;
        this.documentId = documentId;
        this.clickHandler = clickHandler;
        this.element = document.createElement("button") as HTMLButtonElement;
        this.element.classList.add(...classes);
        this.element.innerHTML = contents;
        this.element.addEventListener("click", this.clickHandler);
    }
}

/**
 * Represents an HTML results table with sorting and pagination functionality.
 */
class HtmlResultsTable {

    public readonly baseElement: HTMLElement;
    private readonly paginationEdgeRangeDesktop: number = 2;
    private readonly paginationEdgeRangeMobile: number = 1;
    private rowRenderer: Function | null;
    private cellRenderer: { [id: string]: Function } | null;
    private exportExtra: { [id: string]: any } | null;
    private header: string;
    private headings: string[];
    private perPage: number;
    private project: number;
    private results: string[][];
    private resultsSort: HTMLResultsTableSort;
    private resultsOffset: number;
    private resultsCount: number;

    // functions attached to DOM events
    private navHandler: Function;
    private downloadHandler: Function;
    private downloadMenuHandler: Function;
    private cellHandler: Function | null;
    private browserLinkHandler: Function;
    private appLinkHandler: Function;
    private sortableHandler: Function;
    private scrollHandler: Function;

    /**
     * Creates a new HtmlResultsTable and appends it to the parent element.
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
    public static createElement(parentElement: HTMLElement, project: number, perPage: number,
        header: string, headings: string[], results: string[][], resultsSort: HTMLResultsTableSort,
        rowRenderer: Function | null, cellRenderer: { [id: string]: Function } | null, cellHandler: Function | null,
        exportExtra: { [id: string]: any } | null): HtmlResultsTable {

        const pagedTable: HtmlResultsTable = new HtmlResultsTable(project, perPage, header, headings,
            results, resultsSort, rowRenderer, cellRenderer, cellHandler, exportExtra);
        parentElement.appendChild(pagedTable.baseElement);
        Plugin.postContentHeight();
        return pagedTable;
    }

    /**
     * Generates a formatted column number.
     * @param num - The number to format.
     * @returns A string representation of the formatted number.
     */
    public static generateFormatedColumnNumber(num: number): string {
        return `${(num).toString().padStart(2, '0')}.`;
    }

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
    public static sortResultsHelper(a: string, aNum: number, aIsNum: boolean, b: string, bNum: number,
        bIsNum: boolean, sortOrder: SortOrder): number {
        // return this.resultsSort.primarySort;
        if (aIsNum && bIsNum) {
            // sort numeric
            if (sortOrder === SortOrder.Ascending) {
                return aNum - bNum;
            } else {
                return bNum - aNum;
            }
        } else if (a !== undefined && b !== undefined) {
            // sort alpha
            if (sortOrder === SortOrder.Ascending) {
                return a.localeCompare(b);
            } else {
                return b.localeCompare(a);
            }
        } else {
            console.warn(`sort failure: ${a}, ${b}`)
            return 0;
        }
    }

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
    public constructor(project: number, perPage: number, header: string, headings: string[],
        results: any[], resultsSort: HTMLResultsTableSort, rowRenderer: Function | null,
        cellRenderer: { [id: string]: Function } | null, cellHandler: Function | null,
        exportExtra: { [id: string]: any } | null) {

        this.baseElement = document.createElement("div");
        this.header = header;
        this.results = results;
        this.resultsSort = resultsSort;
        this.headings = headings;
        this.perPage = perPage;
        this.project = project;
        this.resultsCount = results.length;
        this.resultsOffset = 0;
        this.cellRenderer = cellRenderer;
        this.rowRenderer = rowRenderer;
        this.cellHandler = cellHandler;
        this.exportExtra = exportExtra;

        // async (ev: MessageEvent)
        this.scrollHandler = (ev: MessageEvent) => {
            const evData: any = ev.data;
            if (evData == null) {
                this.setStickyHeaders(0);
                return;
            }
            const evDataData: any = evData.data;
            const scrollY: number = evDataData?.reportScrollY ?? null;
            if (scrollY === null || evData?.target !== "interrobot") {
                return;
            }
            this.setStickyHeaders(scrollY);
        };

        this.navHandler = (ev: MouseEvent) => {
            this.resultsOffset = parseInt((ev.target as HTMLAnchorElement).dataset.offset);
            this.renderSection();
            Plugin.postContentHeight();
        };

        this.browserLinkHandler = (ev: MouseEvent) => {
            const anchor = ev.target as HTMLAnchorElement;
            const openInBrowser = true;
            Plugin.postOpenResourceLink(Number(anchor.dataset.id), openInBrowser);
            ev.preventDefault();
            ev.stopPropagation();
        };

        this.appLinkHandler = (ev: MouseEvent) => {
            const anchor = ev.target as HTMLAnchorElement;
            const openInBrowser = false;
            Plugin.postOpenResourceLink(Number(anchor.dataset.id), openInBrowser);
            ev.preventDefault();
            ev.stopPropagation();
        };

        this.sortableHandler = (ev: MouseEvent) => {

            ev.preventDefault();
            if (this.results.length === 0) {
                return;
            }

            const anchor = ev.currentTarget as HTMLAnchorElement;
            let sortHeading: string = anchor.dataset["heading"];
            let sortOrder: SortOrder;
            if (this.resultsSort.primaryHeading === sortHeading) {
                // already set, toggle
                sortOrder = this.resultsSort.primarySort === SortOrder.Ascending ? SortOrder.Descending : SortOrder.Ascending;
            } else {
                // not set, start with ascending
                sortOrder = SortOrder.Ascending;
            }

            this.resultsSort.primaryHeading = sortHeading;
            this.resultsSort.primarySort = sortOrder;
            this.resultsOffset = 0;
            this.sortResults();
            this.renderSection();

            const msg = {
                target: "interrobot",
                data: {
                    reportScrollToTop: true,
                },
            };
            window.parent.postMessage(msg, "*");

        };

        this.downloadMenuHandler = (ev: MouseEvent) => {
            const dlLinks: HTMLElement = this.baseElement.querySelector(".info__dl") as HTMLElement;
            if (dlLinks !== null) {
                dlLinks.classList.toggle("visible");
                ev.preventDefault();
            }
        };

        this.downloadHandler = (ev: MouseEvent) => {

            ev.preventDefault();

            // export ignores the result # column
            const dlLinks: HTMLElement = this.baseElement.querySelector(".info__dl") as HTMLElement;
            dlLinks.classList.remove("visible");
            let exportHeaders: string[] = this.headings.concat(Object.keys(this.exportExtra ?? {}));
            let truncatedExport: boolean = false;
            if (exportHeaders[0] === "") {
                truncatedExport = true;
                exportHeaders.shift();
            }

            const exportRows: string[][] = [];
            for (let i = 0; i < this.results.length; i++) {
                const result = this.results[i];
                const resultValues: any = Object.values(this.exportExtra ?? {});
                const textResultValues: string[] = [];
                for (let resultValue of resultValues) {
                    if (typeof resultValue === "function") {
                        const returned = resultValue(i);
                        textResultValues.push(returned);
                    } else {
                        textResultValues.push(resultValue.toString());
                    }
                }

                if (truncatedExport) {
                    exportRows.push(result.slice(1).concat(textResultValues));
                } else {
                    exportRows.push(result.concat(textResultValues));
                }
            }

            const msg = {
                target: "interrobot",
                data: {
                    reportExport: {
                        format: (ev.target as HTMLElement).dataset.format,
                        headers: exportHeaders,
                        rows: exportRows,
                    }
                },
            };
            window.parent.postMessage(msg, "*");
        };

        this.renderSection();
    }

    /**
     * Gets the index of a heading in the headings array.
     * @param headingLabel - The label of the heading to find.
     * @returns The index of the heading, or -1 if not found.
     */
    public getHeadingIndex(headingLabel: string): number {
        // returns -1 if not found
        return this.headings.indexOf(headingLabel);
    }

    /**
     * Gets the results data.
     * @returns The results data as a 2D array of strings.
     */
    public getResults(): string[][] {
        return this.results;
    }

    /**
     * Gets the headings of the table.
     * @returns An array of heading strings.
     */
    public getHeadings(): string[] {
        return this.headings;
    }

    /**
     * Gets the current sorting configuration.
     * @returns The current HTMLResultsTableSort object.
     */
    public getResultsSort(): HTMLResultsTableSort {
        return this.resultsSort;
    }

    /**
     * Sets the sticky headers based on the current scroll position.
     * @param scrollY - The current vertical scroll position.
     */
    public setStickyHeaders(scrollY: number): void {
        const thead: HTMLElement = this.baseElement.querySelector("thead");
        const table: HTMLElement = thead?.parentElement;
        if (thead === null || table === null) {
            return;
        }

        const rect: DOMRect = table.getBoundingClientRect();
        const inTable: boolean = rect.top <= scrollY && scrollY <= rect.bottom;

        if (inTable) {
            thead.classList.add("sticky");
            thead.style.top = `${scrollY - rect.top}px`;
        } else {
            thead.classList.remove("sticky");
            thead.style.top = `auto`;
        }
        return;
    }

    /**
     * Sets the current page offset.
     * @param page - The page number to set (0-indexed).
     */
    public setOffsetPage(page: number): void {
        // 0-indexed
        const requestedPage = page * this.perPage;
        if (requestedPage !== this.resultsOffset) {
            this.resultsOffset = requestedPage;
            this.renderSection();
        }
    }


    private sortResults() {

        const primaryHeading: string = this.resultsSort.primaryHeading;
        const primarySort: SortOrder = this.resultsSort.primarySort;
        const primarySortOnIndex: number = this.getHeadingIndex(primaryHeading);
        const secondaryHeading: string = this.resultsSort.secondaryHeading;
        const secondarySort: SortOrder = this.resultsSort.secondarySort;
        const secondarySortOnIndex: number = this.getHeadingIndex(secondaryHeading);
        const naturalNumberRegex = /^[-+]?[0-9]+([,.]?[0-9]+)?$/;

        if (primarySortOnIndex === -1) {
            console.warn(`heading '${this.resultsSort.primaryHeading}' not found, aborting sort`);
            return;
        }

        const compoundSort: any = (a: string[], b: string[]) => {

            // two fields sort, e.g. id/crawl-order (numeric, acending) primary, term (alpha, acending) secondary
            // danger! this is true -> isNaN(null) === false
            const primaryAVal: string = a[primarySortOnIndex];
            const primaryAValNumber: number = naturalNumberRegex.test(primaryAVal) ? parseFloat(primaryAVal) : null;
            const primaryAValIsNumber: boolean = primaryAValNumber !== null && !(isNaN(primaryAValNumber));

            const primaryBVal: string = b[primarySortOnIndex];
            const primaryBValNumber: number = naturalNumberRegex.test(primaryBVal) ? parseFloat(primaryBVal) : null;
            const primaryBValIsNumber: boolean = primaryBValNumber !== null && !(isNaN(primaryBValNumber));

            // console.warn(`compare ${primaryAVal} ${primaryAValNumber} ${primaryAValIsNumber}
            //     ${primaryBVal} ${primaryBValNumber} ${primaryBValIsNumber}`);

            if (primaryAVal === primaryBVal) {

                // tiebreaker on primary sort, sort secondary
                const secondaryAVal: string = a[secondarySortOnIndex];
                const secondaryAValNumber: number = parseFloat(secondaryAVal);
                const secondaryAValIsNumber: boolean = !(isNaN(secondaryAValNumber));
                const secondaryBVal: string = b[secondarySortOnIndex];
                const secondaryBValNumber: number = parseFloat(secondaryBVal);
                const secondaryBValIsNumber: boolean = !(isNaN(secondaryBValNumber));

                return HtmlResultsTable.sortResultsHelper(secondaryAVal, secondaryAValNumber, secondaryAValIsNumber,
                    secondaryBVal, secondaryBValNumber, secondaryBValIsNumber, secondarySort);
            } else {
                // sort primary                
                return HtmlResultsTable.sortResultsHelper(primaryAVal, primaryAValNumber, primaryAValIsNumber,
                    primaryBVal, primaryBValNumber, primaryBValIsNumber, primarySort);
            }
        }

        this.results.sort(compoundSort);

        // relabel result ##.
        if (this.headings[0] === "") {
            for (let i = 0; i < this.results.length; i++) {
                this.results[i][0] = HtmlResultsTable.generateFormatedColumnNumber(i + 1);
            }
        }
    }

    private getColumnClass(heading: string): string {
        return `column__${heading ? heading.replace(/[^\w]+/g, "").toLowerCase() : "empty"}`;
    }

    private renderTableHeadings(headings: string[]): string {
        const out: string[] = [];
        const svg = `<svg version="1.1" class="chevrons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	        x="0px" y="0px" width="12px" height="20px" viewBox="6 2 12 20" enable-background="new 6 2 12 20" xml:space="preserve">
            <title>north/south chevrons</title>
	        <polyline class="d2" fill="none" stroke="#000000" stroke-miterlimit="10" points="7.32,16.655 12.015,21.208 16.566,16.633"/>
	        <polyline class="d1" fill="none" stroke="#000000" stroke-miterlimit="10" points="7.314,13.274 12.01,17.827 16.561,13.253"/>
	        <polyline class="u2" fill="none" stroke="#000000" stroke-miterlimit="10" points="16.685,10.594 12.115,6.041 7.439,10.615"/>
	        <polyline class="u1" fill="none" stroke="#000000" stroke-miterlimit="10" points="16.679,7.345 12.11,2.792 7.434,7.365"/>
        </svg>`;
        for (let heading of headings) {
            const encodedColumnClass: string = HtmlUtils.htmlEncode(this.getColumnClass(heading));
            const encodedLabel = `${HtmlUtils.htmlEncode(heading)}`;
            const sortable = encodedColumnClass !== "column__empty";

            let sortableLabel: string = "";
            let sortableChevronLink: string = "";
            if (sortable) {
                sortableLabel = `<a class="sortable" data-heading="${HtmlUtils.htmlEncode(heading)}" href="#">${HtmlUtils.htmlEncode(encodedLabel)}</a>`
                sortableChevronLink = `<a title="${encodedLabel}" class="sortable" data-heading="${HtmlUtils.htmlEncode(heading)}" href="#">
                    ${svg}<span class="reader">${encodedLabel}</span></a>`;
            } else {
                sortableLabel = `${HtmlUtils.htmlEncode(encodedLabel)}`;
            }

            out.push(`<th class="${encodedColumnClass}">` + sortableLabel + " " + sortableChevronLink + `</th>`);
        }
        return out.join("");
    }

    private renderTableData(): string[] {

        // table data, limiting to pagination offset and perpage
        const filteredExpandedRows = [];
        const headingIdIndex = this.getHeadingIndex("ID");
        const resultsSlice = this.results.slice(this.resultsOffset, this.resultsOffset + this.perPage);

        for (let i = 0; i < resultsSlice.length; i++) {

            const row = resultsSlice[i];
            const rowHeadingMapped = this.headings.reduce((obj, key, index) => ({ ...obj, [key]: row[index] }), {});
            const rowCells: string[] = [];
            const rowClasses: string[] = [];
            if (this.rowRenderer) {
                const result: string[] = this.rowRenderer(row, this.headings);
                if ("classes" in result) {
                    rowClasses.push.apply(rowClasses, result["classes"]);
                }
            }

            for (let j = 0; j < row.length; j++) {

                const classes: string[] = [];
                const cellHeading = this.headings[j];
                classes.push(this.getColumnClass(cellHeading));

                const cell: string = row[j];
                const cellNum: number = Number(cell);

                // NOT NOT a number, people. cmon || spaceless fraction
                const cellIsNumeric: boolean = !(isNaN(cellNum)) || cell.match(/^\d+\/\d+$/) !== null;

                // light touch styles, anything more requires a cellRenderer
                if (cellIsNumeric) {
                    classes.push("numeric");
                } else if (HtmlUtils.isUrl(cell)) {
                    classes.push("url");
                }

                let cellContents: string = `${cell}`;
                const cellNumber = Number(cell);
                const cellCallback = this.cellRenderer && cellHeading in this.cellRenderer ? this.cellRenderer[cellHeading] : null;

                if (cellCallback) {
                    // pass in custom ui (buttons, whatever) here, in cellCallback
                    const callbackResult = cellCallback(cell, rowHeadingMapped, i);
                    cellContents = callbackResult.content;
                    classes.push(...callbackResult.classes);

                } else if (cellIsNumeric && !isNaN(cellNumber) && cellHeading !== "" && cellHeading !== "ID") {
                    cellContents = `${Number(cell).toLocaleString()}`;
                } else if (classes.indexOf("url") > -1) {
                    cellContents = `<a class="ulink" data-id="${HtmlUtils.htmlEncode(row[headingIdIndex])}" 
                        href="${HtmlUtils.htmlEncode(cell)}">${HtmlUtils.htmlEncode(cell)}</a>`;
                }
                // console.log(cell);

                // cellContents is not escaped to allow cellContents to work with HTML tags
                rowCells.push(`<td class="${HtmlUtils.htmlEncode(classes.join(" "))}">${cellContents}</td>`);
            }

            filteredExpandedRows.push(`<tr class="${HtmlUtils.htmlEncode(rowClasses.join(" "))}">${rowCells.join("")}</tr>`);
        }

        return filteredExpandedRows;
    }

    private renderSection() {

        // clean up old handlers, if they exist, before creating new
        this.removeHandlers();

        if (this.resultsSort.primarySort !== null && this.resultsSort.primaryHeading !== null) {
            this.sortResults();
        }

        // table data, limiting to pagination offset and perpage
        const filteredExpandedRows: string[] = this.renderTableData();

        // no data scenario
        if (filteredExpandedRows.length === 0) {
            this.baseElement.innerHTML = `<section>${this.header}<p>No results found.</p></section>`;
            return;
        }

        // nominal situation
        const expandedNavigation = [];
        const resultPages: HTMLResultsTablePage[] = this.getPagination()
        const navigationTest = { "◀◀": true, "▶▶": true };
        for (let i: number = 0; i < resultPages.length; i++) {
            const page: HTMLResultsTablePage = resultPages[i];
            let classnames: string[] = [];
            if (page.label in navigationTest) {
                classnames.push(page.label == "◀◀" ? "rewind" : "fastforward");
            } else if (page.offset === this.resultsOffset) {
                classnames.push("current");
            } else if (page.extended) {
                classnames.push("extended");
            }
            expandedNavigation.push(`<button class="${classnames.join(" ")}" data-offset="${page.offset}">${page.label}</button>`);
        }

        const resultStart: number = this.resultsOffset + 1;
        const resultEnd: number = Math.min(this.resultsCount, this.resultsOffset + this.perPage);
        const exportIconChar: string = this.isCorePlugin() ? "`" : "⊞";
        let section = `<section>
            ${this.header}
            <hgroup>
                <div class="info">
                    <span class="info__dl export">
                        <button class="icon">${exportIconChar}</button>
                        <ul class="export__ulink">
                            <li><a class="ulink" href="#" data-format="csv">Export CSV</a></li>
                            <li><a class="ulink" href="#" data-format="xlsx">Export Excel</a></li>
                        </ul>
                    </span>
                    <span class="info__results"><span class="info__results__nobr">
                        ${resultStart.toLocaleString()} - ${resultEnd.toLocaleString()}</span> 
                        <span class="info__results__nobr">of ${this.resultsCount.toLocaleString()}</span></span>
                </div>
                <nav>${expandedNavigation.join("")}</nav>
            </hgroup>
            <div class="datatable">
                <table>
                    <thead>
                        <tr>
                            ${this.renderTableHeadings(this.headings)}                        
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredExpandedRows.join("")}
                    </tbody>
                </table>
            </div>`;

        this.baseElement.innerHTML = section;

        const sortables: NodeListOf<HTMLAnchorElement> = this.baseElement.querySelectorAll(`a.sortable`);
        for (let i = 0; i < sortables.length; i++) {
            const sortAnchor: HTMLAnchorElement = sortables[i] as HTMLAnchorElement;
            sortAnchor.classList.remove("ascending", "descending");
            if (sortAnchor.dataset.heading === this.resultsSort.primaryHeading) {
                const sortClass = this.resultsSort.primarySort == SortOrder.Ascending ? "ascending" : "descending";
                // console.log(`${sortAnchor.dataset.heading} ${this.resultsSort.primaryHeading} ${sortClass}`);
                sortAnchor.classList.add(sortClass);
            }
        }
        this.addHandlers();
    }

    /**
     * Adds event handlers to the table elements.
     */
    public addHandlers(): void {
        this.applyHandlers(true);
    }

    /**
     * Removes event handlers from the table elements.
     */
    public removeHandlers(): void {
        this.applyHandlers(false);
    }

    /**
     * Identifies a core plugin (as true)
     */
    private isCorePlugin() {
        const iframed = window.self !== window.top;
        let sameDomain = false;
        if (iframed) {
            try {
                sameDomain = Boolean(window.parent.location.href);
            } catch (e) {
                sameDomain = false;
            }
        }
        return iframed && sameDomain;
    }


    private applyHandlers(add: boolean): void {

        const navLinkMethod: string = add ? "addEventListener" : "removeEventListener";

        // if coming back through with new query, clean up handlers
        const navButtons: NodeListOf<HTMLButtonElement> = this.baseElement.querySelectorAll("nav button");
        for (let i = 0; i < navButtons.length; i++) {
            const navButton: HTMLButtonElement = navButtons[i] as HTMLButtonElement;
            navButton[navLinkMethod]("click", this.navHandler);
        }

        const downloadLinks: NodeListOf<HTMLAnchorElement> = this.baseElement.querySelectorAll(".info__dl .ulink");
        for (let i = 0; i < downloadLinks.length; i++) {
            const dlLink: HTMLAnchorElement = downloadLinks[i] as HTMLAnchorElement;
            dlLink[navLinkMethod]("click", this.downloadHandler);
        }

        const downloadMenuToggle: HTMLButtonElement = this.baseElement.querySelector(".info__dl button");
        if (downloadMenuToggle !== null) {
            downloadMenuToggle[navLinkMethod]("click", this.downloadMenuHandler);
            // fix touch hover keeping menu open after request to close            
            const hasMouse: boolean = matchMedia("(pointer:fine)").matches && !(/android/i.test(window.navigator.userAgent));
            if (hasMouse) {
                const dl = this.baseElement.querySelector(".info__dl");
                dl?.classList.add("hasmouse");
            }
        }

        const stickyHead: HTMLElement = this.baseElement.querySelector("thead");
        if (stickyHead) {
            window[navLinkMethod]("message", this.scrollHandler);
            window[navLinkMethod]("resize", this.scrollHandler);
        }

        // prevent event propagation to navigation slide on/off when scrolling table
        const table: HTMLElement = this.baseElement.querySelector("table");
        if (table) {
            const wrap = document.querySelector(".wrap");
            table[navLinkMethod]("touchstart", (ev: TouchEvent) => {
                wrap?.classList.add("dragging");
                ev.stopPropagation();
            }, { passive: true });
            table[navLinkMethod]("touchend", (ev: TouchEvent) => {
                wrap?.classList.remove("dragging");
                ev.stopPropagation();
            }, { passive: true });
            table[navLinkMethod]("touchmove", (ev: TouchEvent) => {
                ev.stopPropagation();
            }, { passive: true });
        }

        // button.custom is only acceptable way to pass custom interaction into table
        const customButtons: NodeListOf<HTMLButtonElement> = this.baseElement.querySelectorAll("button.custom");
        if (this.cellHandler) {
            for (let button of customButtons) {
                button[navLinkMethod]("click", this.cellHandler);
            }
        }

        const browserLinks: NodeListOf<HTMLAnchorElement> = this.baseElement.querySelectorAll("td.url a");
        for (let i = 0; i < browserLinks.length; i++) {
            const browserLink: HTMLAnchorElement = browserLinks[i] as HTMLAnchorElement;
            browserLink[navLinkMethod]("click", this.browserLinkHandler);
        }

        for (let i = 0; i < navButtons.length; i++) {
            const navButton: HTMLButtonElement = navButtons[i] as HTMLButtonElement;
            navButton[navLinkMethod]("click", this.navHandler);
        }

        const appLinks: NodeListOf<HTMLAnchorElement> = this.baseElement.querySelectorAll("td.column__id a");
        for (let i = 0; i < appLinks.length; i++) {
            const appLink: HTMLAnchorElement = appLinks[i] as HTMLAnchorElement;
            appLink[navLinkMethod]("click", this.appLinkHandler);
        }

        const sortables: NodeListOf<HTMLAnchorElement> = this.baseElement.querySelectorAll("th a.sortable");
        for (let i = 0; i < sortables.length; i++) {
            const sortable: HTMLAnchorElement = sortables[i] as HTMLAnchorElement;
            sortable[navLinkMethod]("click", this.sortableHandler);
        }
    }

    /**
     * Gets the pagination configuration.
     * @returns An array of HTMLResultsTablePage objects representing the pagination.
     */
    public getPagination(): HTMLResultsTablePage[] {

        const pages: HTMLResultsTablePage[] = [];
        let pagesAdded = 0;

        // between 2 and 4 BEFORE offset (1 and 2 on mobile)
        let precedingPagesMaxDesktop: number = this.paginationEdgeRangeDesktop;
        let precedingPagesMaxMobile: number = this.paginationEdgeRangeMobile;
        const precedingPages = Math.ceil(this.resultsOffset / this.perPage);
        const addPrecedingDesktopPages = Math.max(precedingPagesMaxDesktop - precedingPages, 0);
        const addPrecedingMobilePages = Math.max(precedingPagesMaxMobile - precedingPages, 0);
        precedingPagesMaxDesktop += Math.max(addPrecedingDesktopPages, 0);
        precedingPagesMaxMobile += Math.max(addPrecedingMobilePages, 0);

        let tempOffset = this.resultsOffset;
        while (tempOffset > 0 && pagesAdded < precedingPagesMaxDesktop) {
            tempOffset -= this.perPage;
            const pageLinkLabel: string = `${((tempOffset / this.perPage) + 1)}`;
            const pageLink = new HTMLResultsTablePage(pageLinkLabel, tempOffset, this.perPage, pagesAdded >= precedingPagesMaxMobile);
            pages.push(pageLink);
            pagesAdded++;
        }

        // previous links now, why? built in reverse, see subsequent reverse()
        if (this.resultsOffset > 0) {
            pages.push(new HTMLResultsTablePage("◀", (this.resultsOffset - this.perPage), this.perPage, false));
            pages.push(new HTMLResultsTablePage("◀◀", 0, this.perPage, false));
        }

        // flip it
        pages.reverse();

        // current offset
        if (this.resultsCount > this.perPage) {
            const pageLinkLabel: string = `${(this.resultsOffset / this.perPage) + 1}`;
            const pageLink = new HTMLResultsTablePage(pageLinkLabel, this.resultsOffset, this.perPage, false);
            pages.push(pageLink);
        }

        // between 2 and 4 AFTER offset (1 and 2 on mobile)
        let followingPagesMaxDesktop: number = this.paginationEdgeRangeDesktop;
        let followingPagesMaxMobile: number = this.paginationEdgeRangeMobile;
        const followingPages = Math.ceil(this.resultsOffset / this.perPage);
        const addFollowingDesktopPages = Math.max(followingPagesMaxDesktop - followingPages, 0);
        const addFollowingMobilePages = Math.max(followingPagesMaxMobile - followingPages, 0);
        followingPagesMaxDesktop += Math.max(addFollowingDesktopPages, 0);
        followingPagesMaxMobile += Math.max(addFollowingMobilePages, 0);
        pagesAdded = 0;
        tempOffset = this.resultsOffset + this.perPage;

        while (tempOffset < this.resultsCount && pagesAdded < followingPagesMaxDesktop) {
            const pageLinkLabel: string = `${((tempOffset / this.perPage) + 1)}`;
            const pageLink = new HTMLResultsTablePage(pageLinkLabel, tempOffset, this.perPage, pagesAdded >= followingPagesMaxMobile);
            pages.push(pageLink);
            tempOffset += this.perPage;
            pagesAdded++;
        }

        // next?
        if (this.resultsCount > this.resultsOffset + this.perPage) {
            pages.push(new HTMLResultsTablePage("▶", this.resultsOffset + this.perPage, this.perPage, false));
            let modLast: number = this.resultsCount - (this.resultsCount % this.perPage);
            modLast = modLast == this.resultsCount ? modLast - this.perPage : modLast;
            pages.push(new HTMLResultsTablePage("▶▶", modLast, this.perPage, false));
        }

        return pages;
    }
}

export { HtmlResultsTable, HTMLResultsTablePage, HTMLResultsTableSort, SortOrder };
