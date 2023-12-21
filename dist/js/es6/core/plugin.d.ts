import { Project, PluginData } from "./api.js";
declare class Plugin {
    static readonly meta: {};
    static getHostOrigin(): string;
    static postContentHeight(): void;
    static postOpenResourceLink(projectId: number, resourceId: number, openInBrowser: boolean): void;
    static postMeta(meta: {}): void;
    static logTiming(msg: string, millis: number): void;
    data: PluginData;
    private static origin;
    private static contentScrollHeight;
    private projectId;
    private mode;
    private project;
    constructor();
    getProjectId(): number;
    init(meta: {}): Promise<void>;
    initData(meta: {}, defaultData: any, autoform: HTMLElement[]): Promise<void>;
    initAndGetData(meta: {}, defaultData: any, autoform: HTMLElement[]): Promise<PluginData>;
    getProject(): Promise<Project>;
    protected render(html: string): void;
    protected index(): Promise<void>;
    protected process(): Promise<void>;
    protected report(titleWords: any): Promise<void>;
}
export { Plugin };
