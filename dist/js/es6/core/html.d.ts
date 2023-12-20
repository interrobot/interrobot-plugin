declare class HtmlUtils {
    private static readonly urlsRegex;
    private static readonly urlRegex;
    static getDocument(html: string): Document;
    static getDocumentCleanText(html: string): Document;
    static getDocumentCleanTextIterator(html: string): XPathResult;
    static getElementTextIterator(dom: Document, element: HTMLElement): XPathResult;
    static getElementTextOnly(dom: Document, element: HTMLElement): string;
    static isUrl(str: string): boolean;
    static htmlEncode(str: string): string;
}
export { HtmlUtils };
