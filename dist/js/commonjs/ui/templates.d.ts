import { Project } from "../core/api.js";
/**
 * A class containing static methods for generating HTML templates.
 */
declare class Templates {
    /**
     * Generates a standard heading HTML structure.
     * @param project - The project object containing project details.
     * @param title - The title to be displayed in the heading.
     * @returns A string containing the HTML for the standard heading.
     */
    static standardHeading(project: Project, title: string): string;
    /**
     * Wraps form HTML in a standard container.
     * @param formHtml - The HTML string of the form to be wrapped.
     * @returns A string containing the wrapped form HTML.
     */
    static standardForm(formHtml: string): string;
    /**
     * Generates a standard results container.
     * @returns A string containing the HTML for the standard results container.
     */
    static standardResults(): string;
    /**
     * Generates HTML for a standard checkbox input.
     * @param name - The name attribute for the checkbox.
     * @param value - The value attribute for the checkbox.
     * @param label - The label text for the checkbox.
     * @param synopsis - Optional synopsis text for the checkbox.
     * @returns A string containing the HTML for the checkbox.
     */
    static standardCheckbox(name: string, value: string, label: string, synopsis: string): string;
    /**
     * Generates HTML for a standard radio input.
     * @param name - The name attribute for the radio button.
     * @param value - The value attribute for the radio button.
     * @param label - The label text for the radio button.
     * @param synopsis - Optional synopsis text for the radio button.
     * @returns A string containing the HTML for the radio button.
     */
    static standardRadio(name: string, value: string, label: string, synopsis: string): string;
    private static cellHandlerSameAsLastMemo;
    /**
     * Renders a cell with "same as last" functionality.
     * @param cellValue - The value of the current cell.
     * @param rowData - An object containing the data for the entire row.
     * @param i - The index of the current row.
     * @returns An object containing classes and content for the cell.
     */
    static cellRendererSameAsLast(cellValue: string, rowData: {}, i: number): {};
    /**
     * Renders a cell with a link and "same as last" functionality.
     * @param cellValue - The value of the current cell (used as the link URL).
     * @param rowData - An object containing the data for the entire row.
     * @param i - The index of the current row.
     * @returns An object containing classes and content for the cell.
     */
    static cellRendererSameAsLastLink(cellValue: string, rowData: {}, i: number): {};
    /**
     * Renders a cell with a linked ID.
     * @param cellValue - The value of the current cell (used as the ID).
     * @param rowData - An object containing the data for the entire row.
     * @param i - The index of the current row.
     * @returns An object containing classes and content for the cell.
     */
    static cellRendererLinkedId(cellValue: string, rowData: {}, i: number): {};
    /**
     * Renders a cell with wrapped content.
     * @param cellValue - The value of the current cell.
     * @param rowData - An object containing the data for the entire row.
     * @param i - The index of the current row.
     * @returns An object containing classes and content for the cell.
     */
    static cellRendererWrappedContent(cellValue: string, rowData: {}, i: number): {};
}
export { Templates };
