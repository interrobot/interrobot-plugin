import { HtmlUtils } from "../core/html.js";
class Templates {
    static standardHeading(project, title) {
        return `<div class="main__heading">
            <div class="main__heading__icon">
                <img id="projectIcon" src="${project.getImageDataUri()}" alt="Icon for @crawlView.DisplayTitle" />
            </div>
            <div class="main__heading__title">
                <h1>${HtmlUtils.htmlEncode(title)}</h1>
                <div><span>${HtmlUtils.htmlEncode(project.getDisplayTitle())}</span></div>
            </div>
        </div>`;
    }
    static standardForm(formHtml) {
        return `<div class="main__form">${formHtml}</div>`;
    }
    static standardResults() {
        return `<div class="main__results"></div>`;
    }
    // use table headers as distinct memos in order to handle many per row
    static cellHandlerSameAsLastMemo = {};
    static cellRendererSameAsLast(cellValue, rowData) {
        if (!("ID" in rowData)) {
            throw ("ID must be present to use cellHandlerSameAsLast");
        }
        const keys = Object.keys(rowData);
        const values = Object.values(rowData);
        const valueIndex = values.indexOf(cellValue);
        const cellHeading = keys[valueIndex];
        const currentId = rowData["ID"].toString();
        const lastId = Templates.cellHandlerSameAsLastMemo[cellHeading] ?? "";
        const classes = [];
        // css class dims subsequent cell data when it is same id as last (the previous row)
        if (lastId === currentId) {
            classes.push("sameaslast");
        }
        Templates.cellHandlerSameAsLastMemo[cellHeading] = currentId;
        return { "classes": classes, "content": `${HtmlUtils.htmlEncode(cellValue)}` };
    }
    static cellRendererSameAsLastLink(cellValue, rowData) {
        const result = Templates.cellRendererSameAsLast(cellValue, rowData);
        result["content"] = `<a class= "ulink" 
            data-id="${HtmlUtils.htmlEncode(rowData["ID"])}" 
            href="${HtmlUtils.htmlEncode(cellValue)}">${HtmlUtils.htmlEncode(cellValue)}</a>`;
        return result;
    }
}
export { Templates };
