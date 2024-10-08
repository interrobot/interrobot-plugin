import { HtmlUtils } from "../core/html.js";
class Templates {
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
    static standardForm(formHtml) {
        return `<div class="main__form">${formHtml}</div>`;
    }
    static standardResults() {
        return `<div class="main__results"></div>`;
    }
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
    static cellRendererSameAsLastLink(cellValue, rowData, i) {
        const result = Templates.cellRendererSameAsLast(cellValue, rowData, i);
        result["content"] = `<a class= "ulink" 
            data-id="${HtmlUtils.htmlEncode(rowData["ID"])}" 
            href="${HtmlUtils.htmlEncode(cellValue)}">${HtmlUtils.htmlEncode(cellValue)}</a>`;
        return result;
    }
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
