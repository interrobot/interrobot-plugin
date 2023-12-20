"use strict";
/* tslint:disable:no-console */
/* tslint:disable:max-line-length */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlUtils = void 0;
class HtmlUtils {
    static getDocument(html) {
        return new DOMParser().parseFromString(html, "text/html");
    }
    static getDocumentCleanText(html) {
        // remove dom nodes that hurt more than they help wrt search
        const dom = this.getDocument(html);
        const textUnfriendly = dom.querySelectorAll("script, style, svg, noscript");
        for (let i = textUnfriendly.length - 1; i >= 0; i--) {
            textUnfriendly[i].parentElement.removeChild(textUnfriendly[i]);
        }
        return dom;
    }
    static getDocumentCleanTextIterator(html) {
        const dom = HtmlUtils.getDocumentCleanText(html);
        const xpath = "//text() | //meta[@name='description']/@content | //@alt";
        const texts = dom.evaluate(xpath, dom, null, XPathResult.ANY_TYPE, null);
        return texts;
    }
    static getElementTextIterator(dom, element) {
        const xpath = ".//text()";
        const texts = dom.evaluate(xpath, element, null, XPathResult.ANY_TYPE, null);
        return texts;
    }
    static getElementTextOnly(dom, element) {
        const xpr = HtmlUtils.getElementTextIterator(dom, element);
        const texts = [];
        let node = xpr.iterateNext();
        while (node) {
            texts.push(node.nodeValue.trim());
            node = xpr.iterateNext();
        }
        return texts.join(" ");
    }
    static isUrl(str) {
        return str.match(HtmlUtils.urlRegex) !== null;
        /*
        // return (URL as any).canParse();
        try {
            return Boolean(new URL(str));
        }
        catch (ex) {
            return false;
        }
        */
    }
    static htmlEncode(str) {
        return new Option(str).innerHTML;
    }
}
exports.HtmlUtils = HtmlUtils;
HtmlUtils.urlsRegex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
HtmlUtils.urlRegex = /^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
