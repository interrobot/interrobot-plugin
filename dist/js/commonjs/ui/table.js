"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortOrder = exports.HTMLResultsTableSort = exports.HtmlResultsTable = void 0;
const plugin_js_1 = require("../core/plugin.js");
const html_js_1 = require("../core/html.js");
var SortOrder;
(function (SortOrder) {
    SortOrder[SortOrder["Ascending"] = 0] = "Ascending";
    SortOrder[SortOrder["Descending"] = 1] = "Descending";
})(SortOrder || (SortOrder = {}));
exports.SortOrder = SortOrder;
class HTMLResultsTablePage {
    constructor(label, offset, limit) {
        this.label = label;
        this.offset = offset;
        this.limit = limit;
    }
}
class HTMLResultsTableSort {
    constructor(primaryHeading, primarySort, secondaryHeading, secondarySort) {
        this.primaryHeading = primaryHeading;
        this.primarySort = primarySort;
        this.secondaryHeading = secondaryHeading;
        this.secondarySort = secondarySort;
    }
}
exports.HTMLResultsTableSort = HTMLResultsTableSort;
class HTMLResultsTableButton {
    static createElement(parentElement, documentId, data, contents, classes, clickHandler) {
        const button = new HTMLResultsTableButton(documentId, data, contents, classes, clickHandler);
        parentElement.appendChild(button.element);
        return button;
    }
    constructor(documentId, data, contents, classes, clickHandler) {
        this.data = data;
        this.documentId = documentId;
        this.clickHandler = clickHandler;
        this.element = document.createElement("button");
        this.element.classList.add(...classes);
        this.element.innerHTML = contents;
        this.element.addEventListener("click", this.clickHandler);
    }
}
class HtmlResultsTable {
    static createElement(parentElement, projectId, perPage, header, headings, results, resultsSort, rowRenderer, cellRenderer, cellHandler, exportExtra) {
        const pagedTable = new HtmlResultsTable(projectId, perPage, header, headings, results, resultsSort, rowRenderer, cellRenderer, cellHandler, exportExtra);
        parentElement.appendChild(pagedTable.baseElement);
        plugin_js_1.Plugin.postContentHeight();
        return pagedTable;
    }
    static generateFormatedColumnNumber(num) {
        return `${(num).toString().padStart(2, '0')}.`;
    }
    static sortResultsHelper(a, aNum, aIsNum, b, bNum, bIsNum, sortOrder) {
        // return this.resultsSort.primarySort;
        if (aIsNum && bIsNum) {
            // sort numeric
            if (sortOrder === SortOrder.Ascending) {
                return aNum - bNum;
            }
            else {
                return bNum - aNum;
            }
        }
        else {
            // sort alpha
            if (sortOrder === SortOrder.Ascending) {
                return a.localeCompare(b);
            }
            else {
                return b.localeCompare(a);
            }
        }
    }
    constructor(projectId, perPage, header, headings, results, resultsSort, rowRenderer, cellRenderer, cellHandler, exportExtra) {
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
        this.navHandler = (ev) => {
            this.resultsOffset = parseInt(ev.target.dataset.offset);
            this.renderSection();
            plugin_js_1.Plugin.postContentHeight();
        };
        this.browserLinkHandler = (ev) => {
            const anchor = ev.target;
            const openInBrowser = true;
            plugin_js_1.Plugin.postOpenResourceLink(Number(anchor.dataset.id), openInBrowser);
            ev.preventDefault();
            ev.stopPropagation();
        };
        this.appLinkHandler = (ev) => {
            const anchor = ev.target;
            const openInBrowser = false;
            plugin_js_1.Plugin.postOpenResourceLink(Number(anchor.dataset.id), openInBrowser);
            ev.preventDefault();
            ev.stopPropagation();
        };
        this.sortableHandler = (ev) => {
            ev.preventDefault();
            if (this.results.length === 0) {
                return;
            }
            const anchor = ev.currentTarget;
            let sortHeading = anchor.dataset["heading"];
            let sortOrder;
            if (this.resultsSort.primaryHeading === sortHeading) {
                // already set, toggle
                sortOrder = this.resultsSort.primarySort === SortOrder.Ascending ? SortOrder.Descending : SortOrder.Ascending;
            }
            else {
                // not set, start with ascending
                sortOrder = SortOrder.Ascending;
            }
            this.resultsSort.primaryHeading = sortHeading;
            this.resultsSort.primarySort = sortOrder;
            this.resultsOffset = 0;
            this.sortResults();
            this.renderSection();
        };
        this.downloadMenuHandler = (ev) => {
            const dlLinks = this.baseElement.querySelector(".info__dl");
            if (dlLinks !== null) {
                dlLinks.classList.toggle("visible");
            }
        };
        this.downloadHandler = (ev) => {
            // export ignores the result # column
            const dlLinks = this.baseElement.querySelector(".info__dl");
            dlLinks.classList.remove("visible");
            let exportHeaders = this.headings.concat(Object.keys(this.exportExtra));
            let truncatedExport = false;
            if (exportHeaders[0] === "") {
                truncatedExport = true;
                exportHeaders.shift();
            }
            const exportRows = [];
            for (let i = 0; i < this.results.length; i++) {
                const result = this.results[i];
                const resultValues = Object.values(this.exportExtra);
                const textResultValues = [];
                for (let resultValue of resultValues) {
                    if (typeof resultValue === "function") {
                        const returned = resultValue(i);
                        textResultValues.push(returned);
                    }
                    else {
                        textResultValues.push(resultValue.toString());
                    }
                }
                if (truncatedExport) {
                    exportRows.push(result.slice(1).concat(textResultValues));
                }
                else {
                    exportRows.push(result.concat(textResultValues));
                }
            }
            const msg = {
                target: "interrobot",
                data: {
                    reportExport: {
                        format: ev.target.dataset.format,
                        headers: exportHeaders,
                        rows: exportRows,
                    }
                },
            };
            window.parent.postMessage(msg, "*");
        };
        this.renderSection();
    }
    getHeadingIndex(headingLabel) {
        // returns -1 if not found
        return this.headings.indexOf(headingLabel);
    }
    getResults() {
        return this.results;
    }
    getHeadings() {
        return this.headings;
    }
    getResultsSort() {
        return this.resultsSort;
    }
    sortResults() {
        const primaryHeading = this.resultsSort.primaryHeading;
        const primarySort = this.resultsSort.primarySort;
        const primarySortOnIndex = this.getHeadingIndex(primaryHeading);
        const secondaryHeading = this.resultsSort.secondaryHeading;
        const secondarySort = this.resultsSort.secondarySort;
        const secondarySortOnIndex = this.getHeadingIndex(secondaryHeading);
        if (primarySortOnIndex === -1) {
            console.warn(`Heading '${this.resultsSort.primaryHeading}' not found, aborting sort`);
            return;
        }
        const compoundSort = (a, b) => {
            // two fields sort, e.g. id/crawl-order (numeric, acending) primary, term (alpha, acending) secondary
            const primaryAVal = a[primarySortOnIndex];
            const primaryAValNumber = parseFloat(primaryAVal);
            const primaryAValIsNumber = !(isNaN(primaryAValNumber));
            const primaryBVal = b[primarySortOnIndex];
            const primaryBValNumber = parseFloat(primaryBVal);
            const primaryBValIsNumber = !(isNaN(primaryBValNumber));
            if (primaryAVal === primaryBVal) {
                // tiebreaker on primary sort, sort secondary
                const secondaryAVal = a[secondarySortOnIndex];
                const secondaryAValNumber = parseFloat(secondaryAVal);
                const secondaryAValIsNumber = !(isNaN(secondaryAValNumber));
                const secondaryBVal = b[secondarySortOnIndex];
                const secondaryBValNumber = parseFloat(secondaryBVal);
                const secondaryBValIsNumber = !(isNaN(secondaryBValNumber));
                return HtmlResultsTable.sortResultsHelper(secondaryAVal, secondaryAValNumber, secondaryAValIsNumber, secondaryBVal, secondaryBValNumber, secondaryBValIsNumber, secondarySort);
            }
            else {
                // sort primary
                return HtmlResultsTable.sortResultsHelper(primaryAVal, primaryAValNumber, primaryAValIsNumber, primaryBVal, primaryBValNumber, primaryBValIsNumber, primarySort);
            }
        };
        this.results.sort(compoundSort);
        // relabel result ##.
        if (this.headings[0] === "") {
            for (let i = 0; i < this.results.length; i++) {
                this.results[i][0] = HtmlResultsTable.generateFormatedColumnNumber(i + 1);
            }
        }
    }
    getColumnClass(heading) {
        return `column__${heading ? heading.replace(/[^\w]+/g, "").toLowerCase() : "empty"}`;
    }
    setOffsetPage(page) {
        // 0-indexed
        const requestedPage = page * this.perPage;
        if (requestedPage !== this.resultsOffset) {
            this.resultsOffset = requestedPage;
            this.renderSection();
        }
    }
    renderTableHeadings(headings) {
        const out = [];
        const svg = `<svg version="1.1" class="chevrons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	        x="0px" y="0px" width="12px" height="20px" viewBox="6 2 12 20" enable-background="new 6 2 12 20" xml:space="preserve">
	        <polyline class="d2" fill="none" stroke="#000000" stroke-miterlimit="10" points="7.32,16.655 12.015,21.208 16.566,16.633"/>
	        <polyline class="d1" fill="none" stroke="#000000" stroke-miterlimit="10" points="7.314,13.274 12.01,17.827 16.561,13.253"/>
	        <polyline class="u2" fill="none" stroke="#000000" stroke-miterlimit="10" points="16.685,10.594 12.115,6.041 7.439,10.615"/>
	        <polyline class="u1" fill="none" stroke="#000000" stroke-miterlimit="10" points="16.679,7.345 12.11,2.792 7.434,7.365"/>
        </svg>`;
        for (let heading of headings) {
            const encodedColumnClass = html_js_1.HtmlUtils.htmlEncode(this.getColumnClass(heading));
            const encodedLabel = `Sort by ${html_js_1.HtmlUtils.htmlEncode(heading)}`;
            const link = `<a title="${encodedLabel}" class="sortable" data-heading="${html_js_1.HtmlUtils.htmlEncode(heading)}" href="#">
                ${svg}<span class="reader">${encodedLabel}</span></a>`;
            const sortable = encodedColumnClass !== "column__empty" ? link : "";
            out.push(`<th class="${encodedColumnClass}">${html_js_1.HtmlUtils.htmlEncode(heading)} ${sortable}</th>`);
        }
        return out.join("");
    }
    renderTableData() {
        // table data, limiting to pagination offset and perpage
        const filteredExpandedRows = [];
        const headingIdIndex = this.getHeadingIndex("ID");
        const resultsSlice = this.results.slice(this.resultsOffset, this.resultsOffset + this.perPage);
        for (let i = 0; i < resultsSlice.length; i++) {
            const row = resultsSlice[i];
            const rowHeadingMapped = this.headings.reduce((obj, key, index) => ({ ...obj, [key]: row[index] }), {});
            const rowCells = [];
            const rowClasses = [];
            if (this.rowRenderer) {
                const result = this.rowRenderer(row, this.headings);
                if ("classes" in result) {
                    rowClasses.push.apply(rowClasses, result["classes"]);
                }
            }
            for (let j = 0; j < row.length; j++) {
                const classes = [];
                const cellHeading = this.headings[j];
                classes.push(this.getColumnClass(cellHeading));
                const cell = row[j];
                const cellNum = Number(cell);
                // NOT NOT a number, people. cmon || spaceless fraction
                const cellIsNumeric = !(isNaN(cellNum)) || cell.match(/^\d+\/\d+$/) !== null;
                // light touch styles, anything more requires a cellRenderer
                if (cellIsNumeric) {
                    classes.push("numeric");
                }
                else if (html_js_1.HtmlUtils.isUrl(cell)) {
                    classes.push("url");
                }
                let cellContents = `${cell}`;
                const cellNumber = Number(cell);
                const cellCallback = this.cellRenderer && cellHeading in this.cellRenderer ? this.cellRenderer[cellHeading] : null;
                if (cellCallback) {
                    // pass in custom ui (buttons, whatever) here, in cellCallback
                    const callbackResult = cellCallback(cell, rowHeadingMapped, i);
                    cellContents = callbackResult.content;
                    classes.push(...callbackResult.classes);
                }
                else if (cellIsNumeric && !isNaN(cellNumber) && cellHeading !== "" && cellHeading !== "ID") {
                    cellContents = `${Number(cell).toLocaleString()}`;
                }
                else if (classes.indexOf("url") > -1) {
                    cellContents = `<a class="ulink" data-id="${html_js_1.HtmlUtils.htmlEncode(row[headingIdIndex])}" 
                        href="${html_js_1.HtmlUtils.htmlEncode(cell)}">${html_js_1.HtmlUtils.htmlEncode(cell)}</a>`;
                }
                // console.log(cell);
                // cellContents is not escaped to allow cellContents to work with HTML tags
                rowCells.push(`<td class="${html_js_1.HtmlUtils.htmlEncode(classes.join(" "))}">${cellContents}</td>`);
            }
            filteredExpandedRows.push(`<tr class="${html_js_1.HtmlUtils.htmlEncode(rowClasses.join(" "))}">${rowCells.join("")}</tr>`);
        }
        return filteredExpandedRows;
    }
    renderSection() {
        // clean up old handlers, if they exist, before creating new
        this.removeHandlers();
        if (this.resultsSort.primarySort !== null && this.resultsSort.primaryHeading !== null) {
            this.sortResults();
        }
        else {
            console.warn(`Nothing to sort`);
        }
        // table data, limiting to pagination offset and perpage
        const filteredExpandedRows = this.renderTableData();
        // no data scenario
        if (filteredExpandedRows.length === 0) {
            this.baseElement.innerHTML = `<section>${this.header}<p>No results found.</p></section>`;
            return;
        }
        // nominal situation
        const expandedNavigation = [];
        const resultPages = this.getPagination();
        const navigationTest = { "◀◀": true, "▶▶": true };
        for (let i = 0; i < resultPages.length; i++) {
            const page = resultPages[i];
            let classname = "";
            if (page.label in navigationTest) {
                classname = page.label == "◀◀" ? "rewind" : "fastforward";
            }
            else if (page.offset === this.resultsOffset) {
                classname = "current";
            }
            expandedNavigation.push(`<button class="${classname}" data-offset="${page.offset}">${page.label}</button>`);
        }
        const resultStart = this.resultsOffset + 1;
        const resultEnd = Math.min(this.resultsCount, this.resultsOffset + this.perPage);
        let section = `<section>
            ${this.header}
            <hgroup>
                <div class="info">
                    <span class="info__dl">
                        <button class="icon">\`</button>
                        <ul class="info__dl__ulink">
                            <li><a class="ulink" href="#" data-format="csv" download="download">Export CSV</a></li>
                            <li><a class="ulink" href="#" data-format="xlsx" download="download">Export Excel</a></li>
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
        const sortables = this.baseElement.querySelectorAll(`a.sortable`);
        for (let i = 0; i < sortables.length; i++) {
            const sortAnchor = sortables[i];
            sortAnchor.classList.remove("ascending", "descending");
            if (sortAnchor.dataset.heading === this.resultsSort.primaryHeading) {
                const sortClass = this.resultsSort.primarySort == SortOrder.Ascending ? "ascending" : "descending";
                // console.log(`${sortAnchor.dataset.heading} ${this.resultsSort.primaryHeading} ${sortClass}`);
                sortAnchor.classList.add(sortClass);
            }
        }
        this.addHandlers();
    }
    addHandlers() {
        this.applyHandlers(true);
    }
    removeHandlers() {
        this.applyHandlers(false);
    }
    applyHandlers(add) {
        const navLinkMethod = add ? "addEventListener" : "removeEventListener";
        // if coming back through with new query, clean up handlers
        const navButtons = this.baseElement.querySelectorAll("nav button");
        for (let i = 0; i < navButtons.length; i++) {
            const navButton = navButtons[i];
            navButton[navLinkMethod]("click", this.navHandler);
        }
        const downloadLinks = this.baseElement.querySelectorAll(".info__dl .ulink");
        for (let i = 0; i < downloadLinks.length; i++) {
            const dlLink = downloadLinks[i];
            dlLink[navLinkMethod]("click", this.downloadHandler);
        }
        const downloadMenuToggle = this.baseElement.querySelector(".info__dl button");
        if (downloadMenuToggle !== null) {
            downloadMenuToggle[navLinkMethod]("click", this.downloadMenuHandler);
        }
        // button.custom is only acceptable way to pass custom interaction into table
        const customButtons = this.baseElement.querySelectorAll("button.custom");
        for (let button of customButtons) {
            button[navLinkMethod]("click", this.cellHandler);
        }
        const browserLinks = this.baseElement.querySelectorAll("td.url a");
        for (let i = 0; i < browserLinks.length; i++) {
            const browserLink = browserLinks[i];
            browserLink[navLinkMethod]("click", this.browserLinkHandler);
        }
        const appLinks = this.baseElement.querySelectorAll("td.column__id a");
        for (let i = 0; i < appLinks.length; i++) {
            const appLink = appLinks[i];
            appLink[navLinkMethod]("click", this.appLinkHandler);
        }
        const sortables = this.baseElement.querySelectorAll("th a.sortable");
        for (let i = 0; i < sortables.length; i++) {
            const sortable = sortables[i];
            sortable[navLinkMethod]("click", this.sortableHandler);
        }
    }
    getPagination() {
        const pages = [];
        let pagesAdded = 0;
        // between 2 and 4 BEHIND offset
        let precedePagesMax = 2;
        let tempOffset = this.resultsOffset;
        const remainingPages = Math.ceil(((this.resultsCount - this.resultsOffset) / this.perPage) - 1);
        const addPrecedingPages = Math.max(precedePagesMax - remainingPages, 0);
        precedePagesMax += addPrecedingPages;
        while (tempOffset > 0 && pagesAdded < precedePagesMax) {
            tempOffset -= this.perPage;
            const pageLinkLabel = `${((tempOffset / this.perPage) + 1)}`;
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
            const pageLinkLabel = `${(this.resultsOffset / this.perPage) + 1}`;
            const pageLink = new HTMLResultsTablePage(pageLinkLabel, this.resultsOffset, this.perPage);
            pages.push(pageLink);
        }
        // between 2 and 4 AFTER offset
        let postcedePagesMax = 2;
        const precedingPages = Math.ceil(this.resultsOffset / this.perPage);
        const addPages = Math.max(postcedePagesMax - precedingPages, 0);
        postcedePagesMax += Math.max(addPages, 0);
        pagesAdded = 0;
        tempOffset = this.resultsOffset + this.perPage;
        while (tempOffset < this.resultsCount && pagesAdded < postcedePagesMax) {
            const pageLinkLabel = `${((tempOffset / this.perPage) + 1)}`;
            const pageLink = new HTMLResultsTablePage(pageLinkLabel, tempOffset, this.perPage);
            pages.push(pageLink);
            tempOffset += this.perPage;
            pagesAdded++;
        }
        // next?
        if (this.resultsCount > this.resultsOffset + this.perPage) {
            pages.push(new HTMLResultsTablePage("▶", this.resultsOffset + this.perPage, this.perPage));
            let modLast = this.resultsCount - (this.resultsCount % this.perPage);
            modLast = modLast == this.resultsCount ? modLast - this.perPage : modLast;
            pages.push(new HTMLResultsTablePage("▶▶", modLast, this.perPage));
        }
        return pages;
    }
}
exports.HtmlResultsTable = HtmlResultsTable;
