import { HtmlUtils } from "../core/html.js";
/**
 * A class containing static methods for generating HTML templates.
 */
class Templates {
    /**
     * Generates a standard heading HTML structure.
     * @param project - The project object containing project details.
     * @param title - The title to be displayed in the heading.
     * @returns A string containing the HTML for the standard heading.
     */
    static standardHeading(project, title) {
        return `<div class="main__heading">
            <div class="main__heading__icon">
                <img id="projectIcon" src="${project.getImageDataUri()}" alt="Icon for @crawlView.DisplayTitle" />
            </div>
            <div class="main__heading__title">
                <h1><span>${HtmlUtils.htmlEncode(title)}</span></h1>
                <div><span>${HtmlUtils.htmlEncode(project.getDisplayTitle())}</span></div>
            </div>
        </div>`;
    }
    /**
     * Wraps form HTML in a standard container.
     * @param formHtml - The HTML string of the form to be wrapped.
     * @returns A string containing the wrapped form HTML.
     */
    static standardForm(formHtml) {
        return `<div class="main__form">${formHtml}</div>`;
    }
    /**
     * Generates a standard results container.
     * @returns A string containing the HTML for the standard results container.
     */
    static standardResults() {
        return `<div class="main__results"></div>`;
    }
    /**
     * Generates HTML for a standard checkbox input.
     * @param name - The name attribute for the checkbox.
     * @param value - The value attribute for the checkbox.
     * @param label - The label text for the checkbox.
     * @param synopsis - Optional synopsis text for the checkbox.
     * @returns A string containing the HTML for the checkbox.
     */
    static standardCheckbox(name, value, label, synopsis) {
        return `
        <label>
            <span class="checkbox">
                <input type="checkbox" name="${HtmlUtils.htmlEncode(name)}" value="${HtmlUtils.htmlEncode(value)}"/>
                <span class="checkbox__tick"></span>                                
            </span>
            <span class="checkbox__label">${HtmlUtils.htmlEncode(label)}</span> 
            ${synopsis ? `<span class="checkbox__synopsis">` + HtmlUtils.htmlEncode(synopsis) + `</span>` : ""}
        </label>`;
    }
    /**
     * Generates HTML for a standard radio input.
     * @param name - The name attribute for the radio button.
     * @param value - The value attribute for the radio button.
     * @param label - The label text for the radio button.
     * @param synopsis - Optional synopsis text for the radio button.
     * @returns A string containing the HTML for the radio button.
     */
    static standardRadio(name, value, label, synopsis) {
        return `        
        <label>
            <span class="radio">
                <input type="radio" name="${HtmlUtils.htmlEncode(name)}" value="${HtmlUtils.htmlEncode(value)}">
                <span class="radio__tick"></span>
            </span>
            <span class="radio__text">${HtmlUtils.htmlEncode(label)}</span>
            ${synopsis ? `<span class="radio__synopsis">` + HtmlUtils.htmlEncode(synopsis) + `</span>` : ""}
        </label>`;
    }
    /**
     * Renders a cell with "same as last" functionality.
     * @param cellValue - The value of the current cell.
     * @param rowData - An object containing the data for the entire row.
     * @param i - The index of the current row.
     * @returns An object containing classes and content for the cell.
     */
    static cellRendererSameAsLast(cellValue, rowData, i) {
        var _a;
        if (!("ID" in rowData)) {
            throw ("ID must be present to use cellHandlerSameAsLast");
        }
        const keys = Object.keys(rowData);
        const values = Object.values(rowData);
        const valueIndex = values.indexOf(cellValue);
        const cellHeading = keys[valueIndex];
        const currentId = rowData["ID"].toString();
        const lastId = (_a = Templates.cellHandlerSameAsLastMemo[cellHeading]) !== null && _a !== void 0 ? _a : "";
        const classes = [];
        // css class dims subsequent cell data when it is same id as last (the previous row)
        // i > 0 gaurds a flipping of column sort column bugging out (last becomes first)
        if (i > 0 && lastId === currentId) {
            classes.push("sameaslast");
        }
        Templates.cellHandlerSameAsLastMemo[cellHeading] = currentId;
        return { "classes": classes, "content": `${HtmlUtils.htmlEncode(cellValue)}` };
    }
    /**
     * Renders a cell with a link and "same as last" functionality.
     * @param cellValue - The value of the current cell (used as the link URL).
     * @param rowData - An object containing the data for the entire row.
     * @param i - The index of the current row.
     * @returns An object containing classes and content for the cell.
     */
    static cellRendererSameAsLastLink(cellValue, rowData, i) {
        const result = Templates.cellRendererSameAsLast(cellValue, rowData, i);
        result["content"] = `<a class= "ulink" 
            data-id="${HtmlUtils.htmlEncode(rowData["ID"])}" 
            href="${HtmlUtils.htmlEncode(cellValue)}">${HtmlUtils.htmlEncode(cellValue)}</a>`;
        return result;
    }
    /**
     * Renders a cell with a linked ID.
     * @param cellValue - The value of the current cell (used as the ID).
     * @param rowData - An object containing the data for the entire row.
     * @param i - The index of the current row.
     * @returns An object containing classes and content for the cell.
     */
    static cellRendererLinkedId(cellValue, rowData, i) {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        const origin = params.origin;
        const projectId = params.project;
        if (!origin || !projectId) {
            throw ("missing required url arguments");
        }
        const interrobotPageDetail = `${origin}/search/${projectId}/resource/${cellValue}/`;
        const result = {
            "classes": [],
            "content": `<a class= "ulink" href="${interrobotPageDetail}"
                data-id="${HtmlUtils.htmlEncode(rowData["ID"])}" 
                href="${HtmlUtils.htmlEncode(interrobotPageDetail)}">${HtmlUtils.htmlEncode(cellValue)}</a>`
        };
        return result;
    }
    /**
     * Renders a cell with wrapped content.
     * @param cellValue - The value of the current cell.
     * @param rowData - An object containing the data for the entire row.
     * @param i - The index of the current row.
     * @returns An object containing classes and content for the cell.
     */
    static cellRendererWrappedContent(cellValue, rowData, i) {
        return {
            "classes": ["wrap"],
            "content": `${HtmlUtils.htmlEncode(cellValue)}`,
        };
    }
}
// use table headers as distinct memos in order to handle many per row
Templates.cellHandlerSameAsLastMemo = {};
export { Templates };
