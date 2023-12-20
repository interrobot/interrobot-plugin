import { Project } from "../core/api.js";
declare class Templates {
    static standardHeading(project: Project, title: string): string;
    static standardForm(formHtml: string): string;
    static standardResults(): string;
    private static cellHandlerSameAsLastMemo;
    static cellRendererSameAsLast(cellValue: string, rowData: {}): {};
    static cellRendererSameAsLastLink(cellValue: string, rowData: {}): {};
}
export { Templates };
