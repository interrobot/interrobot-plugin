import { Project, PluginData } from "./api.js";
declare class PluginConnection {
    private iframeSrc;
    private hostOrigin;
    private pluginOrigin;
    constructor(iframeSrc: string, hostOrigin: string | null);
    getIframeSrc(): string;
    getHostOrigin(): string;
    getPluginOrigin(): string;
    toString(): string;
}
declare class Plugin {
    static readonly meta: {};
    static initialize(classtype: any): any;
    static postContentHeight(): void;
    static postOpenResourceLink(resource: number, openInBrowser: boolean): void;
    static postMeta(meta: {}): void;
    static postApiRequest(apiMethod: string, apiKwargs: {}): Promise<any>;
    static logTiming(msg: string, millis: number): void;
    private static routeMessage;
    private static contentScrollHeight;
    private static connection;
    data: PluginData;
    private projectId;
    private mode;
    private project;
    constructor();
    protected delay(ms: number): Promise<unknown>;
    getProjectId(): number;
    init(meta: {}): Promise<void>;
    initData(meta: {}, defaultData: {}, autoform: HTMLElement[]): Promise<void>;
    initAndGetData(meta: {}, defaultData: any, autoform: HTMLElement[]): Promise<PluginData>;
    getProject(): Promise<Project>;
    protected render(html: string): void;
    protected index(): Promise<void>;
    protected process(): Promise<void>;
    protected report(titleWords: any): Promise<void>;
    private parentIsOrigin;
}
export { Plugin, PluginConnection };
