import { Plugin } from "../core/plugin.js";
import { HtmlUtils } from "../core/html.js";

enum SortOrder {
    Ascending,
    Descending,
}

class HTMLResultsTablePage {
    public readonly label: string;
    public readonly offset: number;
    public readonly limit: number;

    constructor(label: string, offset: number, limit: number) {
        this.label = label;
        this.offset = offset;
        this.limit = limit;
    }
}

class HTMLResultsTableSort {
    public primaryHeading: string;
    public primarySort: SortOrder;
    public readonly secondaryHeading: string;
    public readonly secondarySort: SortOrder;

    constructor(primaryHeading: string, primarySort: number, secondaryHeading: string, secondarySort: number) {
        this.primaryHeading = primaryHeading;
        this.primarySort = primarySort;
        this.secondaryHeading = secondaryHeading;
        this.secondarySort = secondarySort;
    }
}

class HTMLResultsTableButton {

    public readonly element: HTMLButtonElement;
    public readonly data: Map<string, string>;
    public readonly documentId: number;
    private clickHandler: any;

    public static createElement(parentElement: HTMLElement, documentId: number,
        data: Map<string, string>, contents: string, classes: string[], clickHandler: any) {
        const button = new HTMLResultsTableButton(documentId, data, contents, classes, clickHandler);
        parentElement.appendChild(button.element);
        return button;
    }
    
    constructor(documentId: number, data: Map<string, string>,
        contents: string, classes:string[], clickHandler: any) {
        this.data = data;
        this.documentId = documentId;
        this.clickHandler = clickHandler;
        this.element = document.createElement("button") as HTMLButtonElement;
        this.element.classList.add(...classes);
        this.element.innerHTML = contents;
        this.element.addEventListener("click", this.clickHandler);
    }
}

class HtmlResultsTable {

    public readonly baseElement: HTMLElement;
    private rowRenderer: Function;
    private cellRenderer: Object;
    private exportExtra: Object;
    private header: string;
    private headings: string[];
    private perPage: number;
    private projectId: number;
    private results: string[][];
    private resultsSort: HTMLResultsTableSort;
    private resultsOffset: number;
    private resultsCount: number;

    // functions attached to DOM events
    private navHandler: Function;
    private downloadHandler: Function;
    private downloadMenuHandler: Function;
    private cellHandler: Function;
    private outlinkHandler: Function;
    private inlinkHandler: Function;
    private sortableHandler: Function;
    
    public static createElement(parentElement: HTMLElement, projectId: number, perPage: number,
        header: string, headings: string[], results: string[][], resultsSort: HTMLResultsTableSort,
        rowRenderer: Function, cellRenderer: {}, cellHandler: Function,
        exportExtra: Object): HtmlResultsTable {

        const pagedTable: HtmlResultsTable = new HtmlResultsTable(projectId, perPage, header, headings,
            results, resultsSort, rowRenderer, cellRenderer, cellHandler, exportExtra);
        parentElement.appendChild(pagedTable.baseElement);
        Plugin.postContentHeight();
        return pagedTable;
    }

    public static generateFormatedColumnNumber(num: number): string {
        return `${(num).toString().padStart(2, '0')}.`;
    }

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
        } else {
            // sort alpha
            if (sortOrder === SortOrder.Ascending) {
                return a.localeCompare(b);
            } else {
                return b.localeCompare(a);
            }
        }
    }

    public constructor(projectId: number, perPage: number, header: string, headings: string[],
        results: any[], resultsSort: HTMLResultsTableSort, rowRenderer: Function, cellRenderer: Object, cellHandler: Function,
        exportExtra: Object) {

        this.baseElement = document.createElement("div");
        this.header = header;
        this.results = results;
        this.resultsSort = resultsSort;
        this.headings = headings;
        this.perPage = perPage;
        this.projectId = projectId;
        this.resultsCount = results.length;
        this.resultsOffset = 0;
        this.cellRenderer = cellRenderer;
        this.rowRenderer = rowRenderer;
        this.cellHandler = cellHandler;
        this.exportExtra = exportExtra;
        
        this.navHandler = (ev: MouseEvent) => {
            this.resultsOffset = parseInt((ev.target as HTMLAnchorElement).dataset.offset);
            this.renderSection();
            Plugin.postContentHeight();
        };

        this.outlinkHandler = (ev: MouseEvent) => {
            const anchor = ev.target as HTMLAnchorElement;
            const openInBrowser = true;
            Plugin.postOpenResourceLink(this.projectId, Number(anchor.dataset.id), openInBrowser);
            ev.preventDefault();
            ev.stopPropagation();            
        };

        this.inlinkHandler = (ev: MouseEvent) => {
            const anchor = ev.target as HTMLAnchorElement;
            const openInBrowser = false;
            Plugin.postOpenResourceLink(this.projectId, Number(anchor.dataset.id), openInBrowser);
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
        };

        this.downloadMenuHandler = (ev: MouseEvent) => {
            const dlLinks: HTMLElement = this.baseElement.querySelector(".info__dl") as HTMLElement;
            if (dlLinks !== null) {
                dlLinks.classList.toggle("visible");
            }
        };

        this.downloadHandler = (ev: MouseEvent) => {

            // export ignores the result # column
            const dlLinks: HTMLElement = this.baseElement.querySelector(".info__dl") as HTMLElement;
            dlLinks.classList.remove("visible");
            let exportHeaders: string[] = this.headings.concat(Object.keys(this.exportExtra));
            let truncatedExport: boolean = false;
            if (exportHeaders[0] === "") {
                truncatedExport = true;
                exportHeaders.shift();
            }

            const exportRows: string[][] = [];
            for (let i = 0; i < this.results.length; i++) {
                const result = this.results[i];
                const resultValues: any = Object.values(this.exportExtra);
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

    public getHeadingIndex(headingLabel: string): number {
        // returns -1 if not found
        return this.headings.indexOf(headingLabel);
    }

    public getResults(): string[][] {
        return this.results;
    }

    public getHeadings(): string[] {
        return this.headings;
    }

    public getResultsSort(): HTMLResultsTableSort {
        return this.resultsSort;
    }

    private sortResults() {

        const primaryHeading: string = this.resultsSort.primaryHeading;
        const primarySort: SortOrder = this.resultsSort.primarySort;
        const primarySortOnIndex: number = this.getHeadingIndex(primaryHeading);
        const secondaryHeading: string = this.resultsSort.secondaryHeading;
        const secondarySort: SortOrder = this.resultsSort.secondarySort;
        const secondarySortOnIndex: number = this.getHeadingIndex(secondaryHeading);

        if (primarySortOnIndex === -1) {
            console.warn(`Heading '${this.resultsSort.primaryHeading}' not found, aborting sort`);
            return;
        }

        // console.log(`${primaryHeading} | ${primarySort} | ${secondaryHeading} | ${secondarySort}`);

        const compoundSort: any = (a: string[], b: string[]) => {

            // two fields sort, e.g. id/crawl-order (numeric, acending) primary, term (alpha, acending) secondary
            const primaryAVal: string = a[primarySortOnIndex];            
            const primaryAValNumber: number = parseInt(primaryAVal, 10);
            const primaryAValIsNumber: boolean = !(isNaN(primaryAValNumber));

            const primaryBVal: string = b[primarySortOnIndex];
            const primaryBValNumber: number = parseInt(primaryBVal, 10);
            const primaryBValIsNumber: boolean = !(isNaN(primaryBValNumber));

            if (primaryAVal === primaryBVal) {

                // tiebreaker on primary sort, sort secondary
                const secondaryAVal: string = a[secondarySortOnIndex];
                const secondaryAValNumber: number = parseInt(secondaryAVal, 10);
                const secondaryAValIsNumber: boolean = !(isNaN(secondaryAValNumber));

                const secondaryBVal: string = b[secondarySortOnIndex];
                const secondaryBValNumber: number = parseInt(secondaryBVal, 10);
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
        return `column__${heading ? heading.replace(/[^\w]+/g, "").toLowerCase() : "empty" }`;
    }

    public setOffsetPage(page: number): void {
        // 0-indexed
        const requestedPage = page * this.perPage;
        if (requestedPage !== this.resultsOffset) {
            this.resultsOffset = requestedPage;
            this.renderSection();
        }
    }

    private renderTableHeadings(headings: string[]): string {
        const out: string[] = [];
        const svg = `<svg version="1.1" class="chevrons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	        x="0px" y="0px" width="12px" height="20px" viewBox="6 2 12 20" enable-background="new 6 2 12 20" xml:space="preserve">
	        <polyline class="d2" fill="none" stroke="#000000" stroke-miterlimit="10" points="7.32,16.655 12.015,21.208 16.566,16.633"/>
	        <polyline class="d1" fill="none" stroke="#000000" stroke-miterlimit="10" points="7.314,13.274 12.01,17.827 16.561,13.253"/>
	        <polyline class="u2" fill="none" stroke="#000000" stroke-miterlimit="10" points="16.685,10.594 12.115,6.041 7.439,10.615"/>
	        <polyline class="u1" fill="none" stroke="#000000" stroke-miterlimit="10" points="16.679,7.345 12.11,2.792 7.434,7.365"/>
        </svg>`;
        for (let heading of headings) {
            const encodedColumnClass: string = HtmlUtils.htmlEncode(this.getColumnClass(heading));
            const encodedLabel = `Sort by ${HtmlUtils.htmlEncode(heading)}`;
            const link = `<a title="${encodedLabel}" class="sortable" data-heading="${HtmlUtils.htmlEncode(heading)}" href="#">
                ${svg}<span class="reader">${encodedLabel}</span></a>`;
            const sortable = encodedColumnClass !== "column__empty" ? link : "";
            out.push(`<th class="${encodedColumnClass}">${HtmlUtils.htmlEncode(heading)} ${sortable}</th>`);
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
                    // too many of these reduces laying around                    
                    const callbackResult = cellCallback(cell, rowHeadingMapped, i);
                    cellContents = callbackResult.content;
                    classes.push(...callbackResult.classes);

                } else if (cellIsNumeric && !isNaN(cellNumber) && cellHeading !== "" && cellHeading !== "ID") {
                    cellContents = `${Number(cell).toLocaleString()}`;
                } else if (classes.indexOf("url") > -1) {
                    cellContents = `<a class="ulink" data-id="${HtmlUtils.htmlEncode(row[headingIdIndex])}" 
                        href="${HtmlUtils.htmlEncode(cell)}">${HtmlUtils.htmlEncode(cell)}</a>`;
                }

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
        } else {
            console.warn(`Nothing to sort`);
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
        for (let i:number = 0; i < resultPages.length; i++) {
            const page: HTMLResultsTablePage = resultPages[i];
            let classname: string = "";
            if (page.label in navigationTest) {
                classname = page.label == "◀◀" ? "rewind" : "fastforward";
            } else if (page.offset === this.resultsOffset) {
                classname = "current";
            }
            expandedNavigation.push(`<button class="${classname}" data-offset="${page.offset}">${page.label}</button>`);
        }

        const resultStart: number = this.resultsOffset + 1;
        const resultEnd: number = Math.min(this.resultsCount, this.resultsOffset + this.perPage);
        let section = `<section>
            ${this.header}
            <hgroup>
                <div class="info">
                    <span class="info__dl">
                        <button class="icon">\`</button>
                        <ul class="info__dl__ulink">
                            <li><a class="ulink" href="#" data-format="csv" download="download">Download CSV</a></li>
                            <li><a class="ulink" href="#" data-format="xlsx" download="download">Download Excel</a></li>
                        </ul>
                    </span>
                    <span class="info__results"><span class="info__results__nobr">
                        ${resultStart.toLocaleString()} - ${resultEnd.toLocaleString()}</span> 
                        <span class="info__results__nobr">of ${this.resultsCount.toLocaleString()}</span></span>
                </div>
                <nav>${expandedNavigation.join("")}</nav>
            </hgroup>
            <table>
                <thead>
                    <tr>
                        ${this.renderTableHeadings(this.headings)}                        
                    </tr>
                </thead>
                <tbody>
                    ${filteredExpandedRows.join("")}
                </tbody>
            </table>`;
        
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

    public addHandlers(): void {        
        this.applyHandlers(true);
    }

    public removeHandlers(): void {
        this.applyHandlers(false);
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
        }

        // button.custom is only acceptable way to pass custom interaction into table
        const customButtons: NodeListOf<HTMLButtonElement> = this.baseElement.querySelectorAll("button.custom");
        for (let button of customButtons) {
            button[navLinkMethod]("click", this.cellHandler);
        }

        const outLinks: NodeListOf<HTMLAnchorElement> = this.baseElement.querySelectorAll("td.url a");
        for (let i = 0; i < outLinks.length; i++) {
            const outLink: HTMLAnchorElement = outLinks[i] as HTMLAnchorElement;
            outLink[navLinkMethod]("click", this.outlinkHandler);
        }

        const inLinks: NodeListOf<HTMLAnchorElement> = this.baseElement.querySelectorAll("td.column__id a");
        for (let i = 0; i < inLinks.length; i++) {
            const inLink: HTMLAnchorElement = inLinks[i] as HTMLAnchorElement;
            inLink[navLinkMethod]("click", this.inlinkHandler);
        }

        const sortables: NodeListOf<HTMLAnchorElement> = this.baseElement.querySelectorAll("th a.sortable");
        for (let i = 0; i < sortables.length; i++) {
            const sortable: HTMLAnchorElement = sortables[i] as HTMLAnchorElement;
            sortable[navLinkMethod]("click", this.sortableHandler);
        }
    }

    public getPagination(): HTMLResultsTablePage[] {
        
        const pages: HTMLResultsTablePage[] = [];
        let pagesAdded = 0;

        // between 2 and 4 BEHIND offset
        let precedePagesMax = 2;
        let tempOffset = this.resultsOffset;
        const remainingPages = Math.ceil(((this.resultsCount - this.resultsOffset) / this.perPage) - 1);
        const addPrecedingPages = Math.max(precedePagesMax - remainingPages, 0);
        precedePagesMax += addPrecedingPages;

        while (tempOffset > 0 && pagesAdded < precedePagesMax) {
            tempOffset -= this.perPage;
            const pageLinkLabel: string = `${((tempOffset / this.perPage) + 1)}`;
            const pageLink = new HTMLResultsTablePage(pageLinkLabel, tempOffset, this.perPage);
            pages.push(pageLink);
            pagesAdded++;
        }

        // previous links now, why? built in reverse, see subsequent reverse()
        if (this.resultsOffset > 0) {
            pages.push(new HTMLResultsTablePage("◀", (this.resultsOffset - this.perPage), this.perPage));
            pages.push(new HTMLResultsTablePage("◀◀", 0, this.perPage));
        }

        // flip it
        pages.reverse();

        // current offset
        if (this.resultsCount > this.perPage) {
            const pageLinkLabel: string = `${(this.resultsOffset / this.perPage) + 1}`;
            const pageLink = new HTMLResultsTablePage(pageLinkLabel, this.resultsOffset, this.perPage);
            pages.push(pageLink);
        }

        // between 2 and 4 AFTER offset
        let postcedePagesMax: number = 2;
        const precedingPages = Math.ceil(this.resultsOffset / this.perPage);
        const addPages = Math.max(postcedePagesMax - precedingPages, 0);
        postcedePagesMax += Math.max(addPages, 0);

        pagesAdded = 0;
        tempOffset = this.resultsOffset + this.perPage;
        while (tempOffset < this.resultsCount && pagesAdded < postcedePagesMax) {
            const pageLinkLabel: string = `${((tempOffset / this.perPage) + 1)}`;
            const pageLink = new HTMLResultsTablePage(pageLinkLabel, tempOffset, this.perPage);
            pages.push(pageLink);
            tempOffset += this.perPage;
            pagesAdded++;
        }

        // next?
        if (this.resultsCount > this.resultsOffset + this.perPage) {
            pages.push(new HTMLResultsTablePage("▶", this.resultsOffset + this.perPage, this.perPage));
            let modLast: number = this.resultsCount - (this.resultsCount % this.perPage);
            modLast = modLast == this.resultsCount ? modLast - this.perPage : modLast;
            pages.push(new HTMLResultsTablePage("▶▶", modLast, this.perPage));
        }

        return pages;
    }
}

export { HtmlResultsTable, HTMLResultsTableSort, SortOrder };
