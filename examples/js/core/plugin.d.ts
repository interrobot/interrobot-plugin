import { Project, PluginData } from "./api.js";
declare class Plugin {
    static readonly meta: {};
    static getHostOrigin(): string;
    static postContentHeight(): void;
    static postOpenResourceLink(resourceId: number, openInBrowser: boolean): void;
    static postMeta(meta: {}): void;
    static postApiRequest(apiMethod: string, apiKwargs: {}): Promise<any>;
    static logTiming(msg: string, millis: number): void;
    private static origin;
    private static contentScrollHeight;
    data: PluginData;
    private projectId;
    private mode;
    private project;
    constructor();
    getProjectId(): number;
    init(meta: {}): Promise<void>;
    initData(meta: {}, defaultData: {}, autoform: HTMLElement[]): Promise<void>;
    initAndGetData(meta: {}, defaultData: any, autoform: HTMLElement[]): Promise<PluginData>;
    getProject(): Promise<Project>;
    protected render(html: string): void;
    protected index(): Promise<void>;
    protected process(): Promise<void>;
    protected report(titleWords: any): Promise<void>;
}
export { Plugin };
