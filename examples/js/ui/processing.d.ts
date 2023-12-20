declare class HtmlProcessingWidget {
    private baseElement;
    private total;
    private loaded;
    private prefix;
    static createElement(parentElement: HTMLElement, prefix: string): HtmlProcessingWidget;
    constructor(prefix: string);
    clearMessage(): void;
    getBaseElement(): HTMLElement;
    setPrefix(prefix: string): void;
    setMessage(msg: string): void;
}
export { HtmlProcessingWidget };
