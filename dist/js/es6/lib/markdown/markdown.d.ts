/**
 * Utility class for converting HTML to Markdown
 */
declare class Markdown {
    /**
     * XSLT stylesheet for HTML to Markdown conversion
     */
    static readonly stylesheet: string;
    /**
     * Total time spent on Markdown conversion
     */
    private static totalTime;
    /**
     * Converts HTML to Markdown
     * @param html - The HTML string to convert
     * @returns The converted Markdown string
     */
    static fromHtml(html: string): string;
}
export { Markdown };
