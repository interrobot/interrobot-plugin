import { Project } from "../core/api.js";
import { HtmlUtils } from "../core/html.js";

class Templates {
    public static standardHeading(project: Project, title: string): string {
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

    public static standardForm(formHtml: string): string {
        return `<div class="main__form">${formHtml}</div>`;
    }

    public static standardResults(): string {
        return `<div class="main__results"></div>`;
    }

    // use table headers as distinct memos in order to handle many per row
    private static cellHandlerSameAsLastMemo: {} = {};
    public static cellRendererSameAsLast(cellValue: string, rowData: {}): {} {

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
        
        if (lastId === currentId) {
            classes.push("sameaslast");
        }

        Templates.cellHandlerSameAsLastMemo[cellHeading] = currentId;
        return { "classes": classes, "content": `${HtmlUtils.htmlEncode(cellValue)}` };
    }

    public static cellRendererSameAsLastLink(cellValue: string, rowData: {}): {} {
        const result = Templates.cellRendererSameAsLast(cellValue, rowData);
        result["content"] = `<a class= "ulink" 
            data-id="${HtmlUtils.htmlEncode(rowData["ID"])}" 
            href="${HtmlUtils.htmlEncode(cellValue)}">${HtmlUtils.htmlEncode(cellValue)}</a>`;
        return result;
    }
}

export { Templates };
