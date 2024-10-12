/* tslint:disable:no-console */
/* tslint:disable:max-line-length */

/**
 * Utility class for HTML-related operations.
 */
class HtmlUtils {

    /** Regular expression for matching URLs in a string. */
    private static readonly urlsRegex: RegExp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_\:]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/g;

    /** Regular expression for validating a single URL. */
    private static readonly urlRegex: RegExp = /^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_\:]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)$/;

    /** Regular expression for matching style attributes in HTML. */
    private static readonly styleAttributeRegex: RegExp = /style\s*=\s*("([^"]*)"|'([^']*)')/gi;

    /**
     * Parses an HTML string into a Document object.
     * @param html - The HTML string to parse.
     * @returns A Document object or null if parsing fails.
     */
    public static getDocument(html: string): Document | null {

        // inline styles can cause security warnings about style, and get
        // suppressed anyway. they get removed
        html = html.replace(HtmlUtils.styleAttributeRegex, "");
        try {
            return new DOMParser().parseFromString(html, "text/html");
        } catch (ex) {
            console.warn(ex);
        }

        // return new DOMParser().parseFromString(html, "text/html");
    }

    /**
     * Creates a Document object from HTML string with certain elements removed.
     * @param html - The HTML string to parse.
     * @returns A cleaned Document object.
     */
    public static getDocumentCleanText(html: string): Document {

        // remove dom nodes that hurt more than they help wrt search
        let dom: Document = this.getDocument(html);
        if (dom === null) {
            // without which, nulls begin to cascade into all related functions
            dom = new Document();
        }

        // iframes can contain (invalid html) text... seen with own eyes, html treated as text
        const textUnfriendly = dom.querySelectorAll("script, style, svg, noscript, iframe");
        for (let i = textUnfriendly.length - 1; i >= 0; i--) {
            textUnfriendly[i].parentElement.removeChild(textUnfriendly[i]);
        }

        return dom;
    }

    /**
     * Creates an XPathResult iterator for text nodes in a cleaned HTML document.
     * @param html - The HTML string to parse.
     * @returns An XPathResult iterator for text nodes.
     */
    public static getDocumentCleanTextIterator(html: string): XPathResult {
        const dom: Document = HtmlUtils.getDocumentCleanText(html);
        const xpath = "//text() | //meta[@name='description']/@content | //@alt";
        const texts: XPathResult = dom.evaluate(xpath, dom, null, XPathResult.ANY_TYPE, null);
        return texts;
    }

    /**
     * Creates an XPathResult iterator for text nodes within a specific element.
     * @param dom - The Document object.
     * @param element - The HTMLElement to search within.
     * @returns An XPathResult iterator for text nodes.
     */
    public static getElementTextIterator(dom: Document, element: HTMLElement): XPathResult {
        const xpath = ".//text()";
        const texts: XPathResult = dom.evaluate(xpath, element, null, XPathResult.ANY_TYPE, null);
        return texts;
    }

    /**
     * Extracts text content from a specific element.
     * @param dom - The Document object.
     * @param element - The HTMLElement to extract text from.
     * @returns A string containing the element's text content.
     */
    public static getElementTextOnly(dom: Document, element: HTMLElement): string {
        const xpr: XPathResult = HtmlUtils.getElementTextIterator(dom, element);
        const texts = [];
        let node: Node = xpr.iterateNext();
        while (node) {
            texts.push(node.nodeValue.trim());
            node = xpr.iterateNext();
        }
        return texts.join(" ");
    }

    /**
     * Checks if a string is a valid URL.
     * @param str - The string to check.
     * @returns True if the string is a valid URL, false otherwise.
     */
    public static isUrl(str: string): boolean {
        return str.match(HtmlUtils.urlRegex) !== null;
        // return (URL as any).canParse();
    }

    /**
     * Encodes HTML special characters in a string.
     * @param str - The string to encode.
     * @returns An HTML-encoded string.
     */
    public static htmlEncode(str: string) {
        return new Option(str).innerHTML;
    }
}

export { HtmlUtils };