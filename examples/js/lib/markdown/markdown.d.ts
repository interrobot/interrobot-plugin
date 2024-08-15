declare class Markdown {
    static readonly stylesheet: string;
    private static totalTime;
    static fromHtml(html: string): string;
}
export { Markdown };
