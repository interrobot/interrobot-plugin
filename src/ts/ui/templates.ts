import { Project } from "../core/api.js";
import { HtmlUtils } from "../core/html.js";

class Templates {
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

    public static standardForm(formHtml: string): string {
        return `<div class="main__form">${formHtml}</div>`;
    }

    public static standardResults(): string {
        return `<div class="main__results"></div>`;
    }

    // use table headers as distinct memos in order to handle many per row
    private static cellHandlerSameAsLastMemo: {} = {};
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

    public static cellRendererSameAsLastLink(cellValue: string, rowData: {}, i: number): {} {
        const result = Templates.cellRendererSameAsLast(cellValue, rowData, i);
        result["content"] = `<a class= "ulink" 
            data-id="${HtmlUtils.htmlEncode(rowData["ID"])}" 
            href="${HtmlUtils.htmlEncode(cellValue)}">${HtmlUtils.htmlEncode(cellValue)}</a>`;
        return result;
    }

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
            "content": `<a class= "ulink" href="${interrobotPageDetail}"
                data-id="${HtmlUtils.htmlEncode(rowData["ID"])}" 
                href="${HtmlUtils.htmlEncode(interrobotPageDetail)}">${HtmlUtils.htmlEncode(cellValue)}</a>`
        };
        return result;
    }

    public static cellRendererWrappedContent(cellValue: string, rowData: {}, i: number): {} {
        return {
            "classes": ["wrap"],
            "content": `${HtmlUtils.htmlEncode(cellValue)}`,
        };
    }
}

export { Templates };
