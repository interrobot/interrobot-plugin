"use strict";
/* tslint:disable:no-console */
/* tslint:disable:max-line-length */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlUtils = void 0;
/**
 * Utility class for HTML-related operations.
 */
class HtmlUtils {
    /**
     * Parses an HTML string into a Document object.
     * @param html - The HTML string to parse.
     * @returns A Document object or null if parsing fails.
     */
    static getDocument(html) {
        // inline styles can cause security warnings about style, and get
        // suppressed anyway. they get removed
        html = html.replace(HtmlUtils.styleAttributeRegex, "");
        try {
            return new DOMParser().parseFromString(html, "text/html");
        }
        catch (ex) {
            console.warn(ex);
            return null;
        }
        // return new DOMParser().parseFromString(html, "text/html");
    }
    /**
     * Creates a Document object from HTML string with certain elements removed.
     * @param html - The HTML string to parse.
     * @returns A cleaned Document object.
     */
    static getDocumentCleanText(html) {
        var _a;
        // remove dom nodes that hurt more than they help wrt search
        let dom = this.getDocument(html);
        if (dom === null) {
            // without which, nulls begin to cascade into all related functions
            dom = new Document();
        }
        // iframes can contain (invalid html) text... seen with own eyes, html treated as text
        const textUnfriendly = dom.querySelectorAll("script, style, svg, noscript, iframe");
        for (let i = textUnfriendly.length - 1; i >= 0; i--) {
            const tu = textUnfriendly[i];
            (_a = tu.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(textUnfriendly[i]);
        }
        return dom;
    }
    /**
     * Creates an XPathResult iterator for text nodes in a cleaned HTML document.
     * @param html - The HTML string to parse.
     * @returns An XPathResult iterator for text nodes.
     */
    static getDocumentCleanTextIterator(html) {
        const dom = HtmlUtils.getDocumentCleanText(html);
        const xpath = "//text() | //meta[@name='description']/@content | //@alt";
        const texts = dom.evaluate(xpath, dom, null, XPathResult.ANY_TYPE, null);
        return texts;
    }
    /**
     * Creates an XPathResult iterator for text nodes within a specific element.
     * @param dom - The Document object.
     * @param element - The HTMLElement to search within.
     * @returns An XPathResult iterator for text nodes.
     */
    static getElementTextIterator(dom, element) {
        const xpath = ".//text()";
        const texts = dom.evaluate(xpath, element, null, XPathResult.ANY_TYPE, null);
        return texts;
    }
    /**
     * Extracts text content from a specific element.
     * @param dom - The Document object.
     * @param element - The HTMLElement to extract text from.
     * @returns A string containing the element's text content.
     */
    static getElementTextOnly(dom, element) {
        var _a;
        const xpr = HtmlUtils.getElementTextIterator(dom, element);
        const texts = [];
        let node = xpr.iterateNext();
        while (node) {
            texts.push((_a = node.nodeValue) === null || _a === void 0 ? void 0 : _a.trim());
            node = xpr.iterateNext();
        }
        return texts.join(" ");
    }
    /**
     * Checks if a string is a valid URL.
     * @param str - The string to check.
     * @returns True if the string is a valid URL, false otherwise.
     */
    static isUrl(str) {
        // cast required, canParse postdates the installed ts dom lib
        return URL.canParse(str);
    }
    /**
     * Encodes HTML special characters in a string. Safe for use in
     * text nodes and attribute values (escapes quotes, unlike
     * text-node serialization).
     * @param str - The string to encode.
     * @returns An HTML-encoded string.
     */
    static htmlEncode(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
}
exports.HtmlUtils = HtmlUtils;
/** Regular expression for matching style attributes in HTML. */
HtmlUtils.styleAttributeRegex = /style\s*=\s*("([^"]*)"|'([^']*)')/gi;
