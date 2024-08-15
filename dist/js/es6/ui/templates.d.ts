import { Project } from "../core/api.js";
declare class Templates {
    static standardHeading(project: Project, title: string): string;
    static standardForm(formHtml: string): string;
    static standardResults(): string;
    static standardCheckbox(name: string, value: string, label: string, synopsis: string): string;
    static standardRadio(name: string, value: string, label: string, synopsis: string): string;
    private static cellHandlerSameAsLastMemo;
    static cellRendererSameAsLast(cellValue: string, rowData: {}, i: number): {};
    static cellRendererSameAsLastLink(cellValue: string, rowData: {}, i: number): {};
    static cellRendererLinkedId(cellValue: string, rowData: {}, i: number): {};
    static cellRendererWrappedContent(cellValue: string, rowData: {}, i: number): {};
}
export { Templates };
