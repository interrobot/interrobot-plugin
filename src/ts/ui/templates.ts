import { Project } from "../core/api.js";
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
    public static standardHeading(project: Project, title: string): string {
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
    public static standardForm(formHtml: string): string {
        return `<div class="main__form">${formHtml}</div>`;
    }

    /**
     * Generates a standard results container.
     * @returns A string containing the HTML for the standard results container.
     */
    public static standardResults(): string {
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
    public static standardCheckbox(name: string, value: string, label: string, synopsis: string): string {
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
    public static standardRadio(name: string, value: string, label: string, synopsis: string): string {
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


    // use table headers as distinct memos in order to handle many per row
    private static cellHandlerSameAsLastMemo: {} = {};

    /**
     * Renders a cell with "same as last" functionality.
     * @param cellValue - The value of the current cell.
     * @param rowData - An object containing the data for the entire row.
     * @param i - The index of the current row.
     * @returns An object containing classes and content for the cell.
     */
    public static cellRendererSameAsLast(cellValue: string, rowData: {}, i: number): {} {

        if (!("ID" in rowData)) {
            throw ("ID must be present to use cellHandlerSameAsLast");
        }

        const keys: string[] = Object.keys(rowData);
        const values: string[] = Object.values(rowData) as string[];
        const valueIndex = values.indexOf(cellValue);
        const cellHeading = keys[valueIndex];
        const currentId: string = rowData["ID"].toString();
        const lastId = Templates.cellHandlerSameAsLastMemo[cellHeading] ?? "";
        const classes: string[] = [];
        
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
    public static cellRendererSameAsLastLink(cellValue: string, rowData: {}, i: number): {} {
        const result = Templates.cellRendererSameAsLast(cellValue, rowData, i);
        result["content"] = `<a tabindex="0" class= "ulink" 
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
    public static cellRendererLinkedId(cellValue: string, rowData: {}, i: number): {} {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        const origin = params.origin;
        const projectId = params.project;
        if (!origin || !projectId) {
            throw ("missing required url arguments");
        }
        const interrobotPageDetail: string = `${origin}/search/${projectId}/resource/${cellValue}/`;
        const result = {
            "classes": [],
            "content": `<a tabindex="0" href="${HtmlUtils.htmlEncode(interrobotPageDetail)}"
                data-id="${HtmlUtils.htmlEncode(rowData["ID"])}" 
                class="ulink">${HtmlUtils.htmlEncode(cellValue)}</a>`
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
    public static cellRendererWrappedContent(cellValue: string, rowData: {}, i: number): {} {
        return {
            "classes": ["wrap"],
            "content": `${HtmlUtils.htmlEncode(cellValue)}`,
        };
    }
}

export { Templates };
