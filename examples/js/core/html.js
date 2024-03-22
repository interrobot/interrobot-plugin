/* tslint:disable:no-console */
/* tslint:disable:max-line-length */
class HtmlUtils {
    static urlsRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/g;
    static urlRegex = /^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)$/;
    static getDocument(html) {
        return new DOMParser().parseFromString(html, "text/html");
    }
    static getDocumentCleanText(html) {
        // remove dom nodes that hurt more than they help wrt search
        const dom = this.getDocument(html);
        // iframes can contain (invalid html) text... seen with own eyes, html treated as text
        const textUnfriendly = dom.querySelectorAll("script, style, svg, noscript, iframe");
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
        // return (URL as any).canParse();
    }
    static htmlEncode(str) {
        return new Option(str).innerHTML;
    }
}
export { HtmlUtils };
