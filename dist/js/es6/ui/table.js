import { Plugin } from "../core/plugin.js";
import { HtmlUtils } from "../core/html.js";
class HTMLResultsTablePage {
    constructor(label, offset, limit) {
        this.label = label;
        this.offset = offset;
        this.limit = limit;
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
    static createElement(parentElement, projectId, perPage, header, headings, results, rowRenderer, cellRenderer, cellHandler, exportExtra) {
        const pagedTable = new HtmlResultsTable(projectId, perPage, header, headings, results, rowRenderer, cellRenderer, cellHandler, exportExtra);
        parentElement.appendChild(pagedTable.baseElement);
        Plugin.postContentHeight();
        return pagedTable;
    }
    constructor(projectId, perPage, header, headings, results, rowRenderer, cellRenderer, cellHandler, exportExtra) {
        this.baseElement = document.createElement("div");
        this.header = header;
        this.results = results;
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
            Plugin.postContentHeight();
        };
        this.outlinkHandler = (ev) => {
            this.projectId;
            const anchor = ev.target;
            const openInBrowser = true;
            Plugin.postOpenResourceLink(this.projectId, Number(anchor.dataset.id), openInBrowser);
            ev.preventDefault();
            ev.stopPropagation();
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
        for (let heading of headings) {
            out.push(`<th class="${HtmlUtils.htmlEncode(this.getColumnClass(heading))} ">${HtmlUtils.htmlEncode(heading)}</th>`);
        }
        return out.join("");
    }
    renderTableData() {
        // table data, limiting to pagination offset and perpage
        const filteredExpandedRows = [];
        const headingIdIndex = this.headings.indexOf("ID");
        for (let row of this.results.slice(this.resultsOffset, this.resultsOffset + this.perPage)) {
            const rowCallbackData = this.headings.reduce((obj, key, index) => ({ ...obj, [key]: row[index] }), {});
            const rowCells = [];
            const rowClasses = [];
            if (this.rowRenderer) {
                const result = this.rowRenderer(rowCallbackData);
                if ("classes" in result) {
                    rowClasses.push.apply(rowClasses, result["classes"]);
                }
            }
            for (let i = 0; i < row.length; i++) {
                const classes = [];
                const cellHeading = this.headings[i];
                classes.push(this.getColumnClass(cellHeading));
                const cell = row[i];
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
                    const callbackResult = cellCallback(cell, rowCallbackData);
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
        const outLinks = this.baseElement.querySelectorAll("td.url a");
        for (let i = 0; i < outLinks.length; i++) {
            const outLink = outLinks[i];
            outLink[navLinkMethod]("click", this.outlinkHandler);
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
export { HtmlResultsTable };
