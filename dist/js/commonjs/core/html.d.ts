/**
 * Utility class for HTML-related operations.
 */
declare class HtmlUtils {
    /** Regular expression for matching URLs in a string. */
    private static readonly urlsRegex;
    /** Regular expression for validating a single URL. */
    private static readonly urlRegex;
    /** Regular expression for matching style attributes in HTML. */
    private static readonly styleAttributeRegex;
    /**
     * Parses an HTML string into a Document object.
     * @param html - The HTML string to parse.
     * @returns A Document object or null if parsing fails.
     */
    static getDocument(html: string): Document | null;
    /**
     * Creates a Document object from HTML string with certain elements removed.
     * @param html - The HTML string to parse.
     * @returns A cleaned Document object.
     */
    static getDocumentCleanText(html: string): Document;
    /**
     * Creates an XPathResult iterator for text nodes in a cleaned HTML document.
     * @param html - The HTML string to parse.
     * @returns An XPathResult iterator for text nodes.
     */
    static getDocumentCleanTextIterator(html: string): XPathResult;
    /**
     * Creates an XPathResult iterator for text nodes within a specific element.
     * @param dom - The Document object.
     * @param element - The HTMLElement to search within.
     * @returns An XPathResult iterator for text nodes.
     */
    static getElementTextIterator(dom: Document, element: HTMLElement): XPathResult;
    /**
     * Extracts text content from a specific element.
     * @param dom - The Document object.
     * @param element - The HTMLElement to extract text from.
     * @returns A string containing the element's text content.
     */
    static getElementTextOnly(dom: Document, element: HTMLElement): string;
    /**
     * Checks if a string is a valid URL.
     * @param str - The string to check.
     * @returns True if the string is a valid URL, false otherwise.
     */
    static isUrl(str: string): boolean;
    /**
     * Encodes HTML special characters in a string.
     * @param str - The string to encode.
     * @returns An HTML-encoded string.
     */
    static htmlEncode(str: string): string;
}
export { HtmlUtils };
