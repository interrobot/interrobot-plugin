import { Plugin } from "../core/plugin.js";
import { HtmlUtils } from "../core/html.js";
var SortOrder;
(function (SortOrder) {
    SortOrder[SortOrder["Ascending"] = 0] = "Ascending";
    SortOrder[SortOrder["Descending"] = 1] = "Descending";
})(SortOrder || (SortOrder = {}));
class HTMLResultsTablePage {
    constructor(label, offset, limit, extended) {
        this.label = label;
        this.offset = offset;
        this.limit = limit;
        this.extended = extended;
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
    static createElement(parentElement, project, perPage, header, headings, results, resultsSort, rowRenderer, cellRenderer, cellHandler, exportExtra) {
        const pagedTable = new HtmlResultsTable(project, perPage, header, headings, results, resultsSort, rowRenderer, cellRenderer, cellHandler, exportExtra);
        parentElement.appendChild(pagedTable.baseElement);
        Plugin.postContentHeight();
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
        else if (a !== undefined && b !== undefined) {
            // sort alpha
            if (sortOrder === SortOrder.Ascending) {
                return a.localeCompare(b);
            }
            else {
                return b.localeCompare(a);
            }
        }
        else {
            console.warn(`sort failure: ${a}, ${b}`);
            return 0;
        }
    }
    constructor(project, perPage, header, headings, results, resultsSort, rowRenderer, cellRenderer, cellHandler, exportExtra) {
        this.paginationEdgeRangeDesktop = 2;
        this.paginationEdgeRangeMobile = 1;
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
        this.scrollHandler = (ev) => {
            var _a;
            const evData = ev.data;
            if (evData == null) {
                this.setStickyHeaders(0);
                return;
            }
            const evDataData = evData.data;
            const scrollY = (_a = evDataData === null || evDataData === void 0 ? void 0 : evDataData.reportScrollY) !== null && _a !== void 0 ? _a : null;
            if (scrollY === null || (evData === null || evData === void 0 ? void 0 : evData.target) !== "interrobot") {
                return;
            }
            this.setStickyHeaders(scrollY);
        };
        this.navHandler = (ev) => {
            this.resultsOffset = parseInt(ev.target.dataset.offset);
            this.renderSection();
            Plugin.postContentHeight();
        };
        this.browserLinkHandler = (ev) => {
            const anchor = ev.target;
            const openInBrowser = true;
            Plugin.postOpenResourceLink(Number(anchor.dataset.id), openInBrowser);
            ev.preventDefault();
            ev.stopPropagation();
        };
        this.appLinkHandler = (ev) => {
            const anchor = ev.target;
            const openInBrowser = false;
            Plugin.postOpenResourceLink(Number(anchor.dataset.id), openInBrowser);
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
            const msg = {
                target: "interrobot",
                data: {
                    reportScrollToTop: true,
                },
            };
            window.parent.postMessage(msg, "*");
        };
        this.downloadMenuHandler = (ev) => {
            const dlLinks = this.baseElement.querySelector(".info__dl");
            if (dlLinks !== null) {
                dlLinks.classList.toggle("visible");
                ev.preventDefault();
            }
        };
        this.downloadHandler = (ev) => {
            ev.preventDefault();
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
    setStickyHeaders(scrollY) {
        const thead = this.baseElement.querySelector("thead");
        const table = thead === null || thead === void 0 ? void 0 : thead.parentElement;
        if (thead === null || table === null) {
            return;
        }
        const rect = table.getBoundingClientRect();
        const inTable = rect.top <= scrollY && scrollY <= rect.bottom;
        if (inTable) {
            thead.classList.add("sticky");
            thead.style.top = `${scrollY - rect.top}px`;
        }
        else {
            thead.classList.remove("sticky");
            thead.style.top = `auto`;
        }
        return;
    }
    sortResults() {
        const primaryHeading = this.resultsSort.primaryHeading;
        const primarySort = this.resultsSort.primarySort;
        const primarySortOnIndex = this.getHeadingIndex(primaryHeading);
        const secondaryHeading = this.resultsSort.secondaryHeading;
        const secondarySort = this.resultsSort.secondarySort;
        const secondarySortOnIndex = this.getHeadingIndex(secondaryHeading);
        const naturalNumberRegex = /^[-+]?[0-9]+([,.]?[0-9]+)?$/;
        if (primarySortOnIndex === -1) {
            console.warn(`heading '${this.resultsSort.primaryHeading}' not found, aborting sort`);
            return;
        }
        const compoundSort = (a, b) => {
            // two fields sort, e.g. id/crawl-order (numeric, acending) primary, term (alpha, acending) secondary
            // danger! this is true -> isNaN(null) === false
            const primaryAVal = a[primarySortOnIndex];
            const primaryAValNumber = naturalNumberRegex.test(primaryAVal) ? parseFloat(primaryAVal) : null;
            const primaryAValIsNumber = primaryAValNumber !== null && !(isNaN(primaryAValNumber));
            const primaryBVal = b[primarySortOnIndex];
            const primaryBValNumber = naturalNumberRegex.test(primaryBVal) ? parseFloat(primaryBVal) : null;
            const primaryBValIsNumber = primaryBValNumber !== null && !(isNaN(primaryBValNumber));
            // console.warn(`compare ${primaryAVal} ${primaryAValNumber} ${primaryAValIsNumber}
            //     ${primaryBVal} ${primaryBValNumber} ${primaryBValIsNumber}`);
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
            <title>north/south chevrons</title>
	        <polyline class="d2" fill="none" stroke="#000000" stroke-miterlimit="10" points="7.32,16.655 12.015,21.208 16.566,16.633"/>
	        <polyline class="d1" fill="none" stroke="#000000" stroke-miterlimit="10" points="7.314,13.274 12.01,17.827 16.561,13.253"/>
	        <polyline class="u2" fill="none" stroke="#000000" stroke-miterlimit="10" points="16.685,10.594 12.115,6.041 7.439,10.615"/>
	        <polyline class="u1" fill="none" stroke="#000000" stroke-miterlimit="10" points="16.679,7.345 12.11,2.792 7.434,7.365"/>
        </svg>`;
        for (let heading of headings) {
            const encodedColumnClass = HtmlUtils.htmlEncode(this.getColumnClass(heading));
            const encodedLabel = `${HtmlUtils.htmlEncode(heading)}`;
            const sortable = encodedColumnClass !== "column__empty";
            let sortableLabel = "";
            let sortableChevronLink = "";
            if (sortable) {
                sortableLabel = `<a class="sortable" data-heading="${HtmlUtils.htmlEncode(heading)}" href="#">${HtmlUtils.htmlEncode(encodedLabel)}</a>`;
                sortableChevronLink = `<a title="${encodedLabel}" class="sortable" data-heading="${HtmlUtils.htmlEncode(heading)}" href="#">
                    ${svg}<span class="reader">${encodedLabel}</span></a>`;
            }
            else {
                sortableLabel = `${HtmlUtils.htmlEncode(encodedLabel)}`;
            }
            out.push(`<th class="${encodedColumnClass}">` + sortableLabel + " " + sortableChevronLink + `</th>`);
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
                else if (HtmlUtils.isUrl(cell)) {
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
    renderSection() {
        // clean up old handlers, if they exist, before creating new
        this.removeHandlers();
        if (this.resultsSort.primarySort !== null && this.resultsSort.primaryHeading !== null) {
            this.sortResults();
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
            let classnames = [];
            if (page.label in navigationTest) {
                classnames.push(page.label == "◀◀" ? "rewind" : "fastforward");
            }
            else if (page.offset === this.resultsOffset) {
                classnames.push("current");
            }
            else if (page.extended) {
                classnames.push("extended");
            }
            expandedNavigation.push(`<button class="${classnames.join(" ")}" data-offset="${page.offset}">${page.label}</button>`);
        }
        const resultStart = this.resultsOffset + 1;
        const resultEnd = Math.min(this.resultsCount, this.resultsOffset + this.perPage);
        let section = `<section>
            ${this.header}
            <hgroup>
                <div class="info">
                    <span class="info__dl export">
                        <button class="icon">\`</button>
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
            // fix touch hover keeping menu open after request to close            
            const hasMouse = matchMedia("(pointer:fine)").matches && !(/android/i.test(window.navigator.userAgent));
            if (hasMouse) {
                const dl = this.baseElement.querySelector(".info__dl");
                dl === null || dl === void 0 ? void 0 : dl.classList.add("hasmouse");
            }
        }
        const stickyHead = this.baseElement.querySelector("thead");
        if (stickyHead) {
            window[navLinkMethod]("message", this.scrollHandler);
            window[navLinkMethod]("resize", this.scrollHandler);
        }
        // prevent event propagation to navigation slide on/off when scrolling table
        const table = this.baseElement.querySelector("table");
        if (table) {
            const wrap = document.querySelector(".wrap");
            table[navLinkMethod]("touchstart", (ev) => {
                wrap === null || wrap === void 0 ? void 0 : wrap.classList.add("dragging");
                ev.stopPropagation();
            }, { passive: true });
            table[navLinkMethod]("touchend", (ev) => {
                wrap === null || wrap === void 0 ? void 0 : wrap.classList.remove("dragging");
                ev.stopPropagation();
            }, { passive: true });
            table[navLinkMethod]("touchmove", (ev) => {
                ev.stopPropagation();
            }, { passive: true });
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
        for (let i = 0; i < navButtons.length; i++) {
            const navButton = navButtons[i];
            navButton[navLinkMethod]("click", this.navHandler);
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
        // between 2 and 4 BEFORE offset (1 and 2 on mobile)
        let precedingPagesMaxDesktop = this.paginationEdgeRangeDesktop;
        let precedingPagesMaxMobile = this.paginationEdgeRangeMobile;
        const precedingPages = Math.ceil(this.resultsOffset / this.perPage);
        const addPrecedingDesktopPages = Math.max(precedingPagesMaxDesktop - precedingPages, 0);
        const addPrecedingMobilePages = Math.max(precedingPagesMaxMobile - precedingPages, 0);
        precedingPagesMaxDesktop += Math.max(addPrecedingDesktopPages, 0);
        precedingPagesMaxMobile += Math.max(addPrecedingMobilePages, 0);
        let tempOffset = this.resultsOffset;
        while (tempOffset > 0 && pagesAdded < precedingPagesMaxDesktop) {
            tempOffset -= this.perPage;
            const pageLinkLabel = `${((tempOffset / this.perPage) + 1)}`;
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
            const pageLinkLabel = `${(this.resultsOffset / this.perPage) + 1}`;
            const pageLink = new HTMLResultsTablePage(pageLinkLabel, this.resultsOffset, this.perPage, false);
            pages.push(pageLink);
        }
        // between 2 and 4 AFTER offset (1 and 2 on mobile)
        let followingPagesMaxDesktop = this.paginationEdgeRangeDesktop;
        let followingPagesMaxMobile = this.paginationEdgeRangeMobile;
        const followingPages = Math.ceil(this.resultsOffset / this.perPage);
        const addFollowingDesktopPages = Math.max(followingPagesMaxDesktop - followingPages, 0);
        const addFollowingMobilePages = Math.max(followingPagesMaxMobile - followingPages, 0);
        followingPagesMaxDesktop += Math.max(addFollowingDesktopPages, 0);
        followingPagesMaxMobile += Math.max(addFollowingMobilePages, 0);
        pagesAdded = 0;
        tempOffset = this.resultsOffset + this.perPage;
        while (tempOffset < this.resultsCount && pagesAdded < followingPagesMaxDesktop) {
            const pageLinkLabel = `${((tempOffset / this.perPage) + 1)}`;
            const pageLink = new HTMLResultsTablePage(pageLinkLabel, tempOffset, this.perPage, pagesAdded >= followingPagesMaxMobile);
            pages.push(pageLink);
            tempOffset += this.perPage;
            pagesAdded++;
        }
        // next?
        if (this.resultsCount > this.resultsOffset + this.perPage) {
            pages.push(new HTMLResultsTablePage("▶", this.resultsOffset + this.perPage, this.perPage, false));
            let modLast = this.resultsCount - (this.resultsCount % this.perPage);
            modLast = modLast == this.resultsCount ? modLast - this.perPage : modLast;
            pages.push(new HTMLResultsTablePage("▶▶", modLast, this.perPage, false));
        }
        return pages;
    }
}
export { HtmlResultsTable, HTMLResultsTableSort, SortOrder };
