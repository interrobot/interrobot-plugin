/* tslint:disable:no-console */
/* tslint:disable:max-line-length */

class HtmlUtils {

    private static readonly urlsRegex: RegExp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_\:]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/g;
    private static readonly urlRegex: RegExp = /^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_\:]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)$/;

    public static getDocument(html: string): Document {
        return new DOMParser().parseFromString(html, "text/html");
    }

    public static getDocumentCleanText(html: string): Document {
        // remove dom nodes that hurt more than they help wrt search
        const dom: Document = this.getDocument(html);
        // iframes can contain (invalid html) text... seen with own eyes, html treated as text
        const textUnfriendly = dom.querySelectorAll("script, style, svg, noscript, iframe");
        for (let i = textUnfriendly.length - 1; i >= 0; i--) {
            textUnfriendly[i].parentElement.removeChild(textUnfriendly[i]);
        }
        return dom;
    }

    public static getDocumentCleanTextIterator(html: string): XPathResult {
        const dom: Document = HtmlUtils.getDocumentCleanText(html);
        const xpath = "//text() | //meta[@name='description']/@content | //@alt";
        const texts: XPathResult = dom.evaluate(xpath, dom, null, XPathResult.ANY_TYPE, null);
        return texts;
    }

    public static getElementTextIterator(dom: Document, element: HTMLElement): XPathResult {
        const xpath = ".//text()";
        const texts: XPathResult = dom.evaluate(xpath, element, null, XPathResult.ANY_TYPE, null);
        return texts;
    }

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

    public static isUrl(str: string): boolean {
        
        return str.match(HtmlUtils.urlRegex) !== null;
        // return (URL as any).canParse();
    }

    public static htmlEncode(str: string) {
        return new Option(str).innerHTML;
    }
}

export { HtmlUtils };