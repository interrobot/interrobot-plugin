// Website Hypertree, interface wrap of d3 hypertree, (c) InterroBot 2024, MPL 2.0
// present crawled website as hyperbolic tree

import { DarkMode, Plugin } from "../../../src/ts/core/plugin";
import { SearchQueryType, SearchQuery, Search, SearchResult, Project } from "../../../src/ts/core/api";
import { HtmlUtils } from "../../../src/ts/core/html";

interface LanguageData {
    // add specific properties your langData contains
    [key: string]: any;
}

interface TreeData {
    // add specific tree data properties
    [key: string]: any;
}

type LangFileLoadCallback = (data: LanguageData, startTime?: number, dataLength?: number) => void;
type DataFileLoadCallback = (data: TreeData, startTime?: number, dataLength?: number) => void;

// d3 is modular, and not friendly outside npm
// don't bother, not worth the effort to reconcile types
declare const hyt: any;

class HypertreeUi {
    private static mode: DarkMode = DarkMode.Dark;
    public static setMode(mode: DarkMode): void{
        HypertreeUi.mode = mode;
    }
    public static status2Class(status: number): string{
        if (status < 0){
            return "disabled";
        } else if (status > 0 && status < 400) {
            return "ok";
        } else if (status >= 400 && status < 500) {
            return "warn";
        } else {
            return "error"
        }
    }
    public static status2Color(status: number): string{
        const className = HypertreeUi.status2Class(status);
        let classColorMap:{[id: string]: string} = {};
        if (HypertreeUi.mode === DarkMode.Dark){
            classColorMap = {
                disabled: "#666666",
                ok: "#00a0df",
                warn: "#babe42",
                error: "#d5350a",
            }
        } else {
            classColorMap = {
                disabled: "#666666",
                ok: "#0592b2",
                warn: "#bf8600",
                error: "#d53a0a",
            }
        }

        return classColorMap[className];
    }

    public static type2Char(type: string){
        if (type in HypertreeUi.charItMap){
            return HypertreeUi.charItMap[type];
        } else {
            return HypertreeUi.charItMap["html"];
        }
    }

    public static readonly charItMap: {[id: string]: string} = { img: "i", css: "c",
        script: "s", html: "h", style: "c", video: "v", audio: "a", rss: "y",
        iframe: "f", blob: "b" };
}

class Hypertree extends Plugin {

    public static override readonly meta: {} = {
        "title": "Website Hypertree",
        "category": "Visualization",
        "version": "1.0.1",
        "author": "InterroBot",
        "synopsis": `create a hypertree from website content`,
        "description": `Get a new, uniquely hyperbolic perspective on your website—your
            web hierarchy projected on a Poincaré disc. \n\n
            Hyperbolic trees display large hierarchies more effectively than traditional
            layouts because hyperbolic space grows exponentially. Knock out this details tab
            for even more projection area, and work the wheel-zoom to navigate
            depth.
            \n\n
            InterroBot Website Hypertree utilizes the d3 and d3-hypertree open-source visualization
             libraries to bring your website to life.`,
    };

    private static escapeRegExp(pattern: string) {
        return pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    private static readonly resultDialogId: string = "ResultDialog";
    private static readonly panicDialogId: string = "PanicDialog";
    private static readonly searchDialogId: string = "SearchDialog";
    private static readonly searchResultsDialogId: string = "SearchDialogResults";

    private nonResultId: number = 0;
    private getNonResultUniqueId() : number {
        return --this.nonResultId;
    }

    private resultDialog: HTMLDialogElement;
    private panicDialog: HTMLDialogElement;
    private searchDialog: HTMLDialogElement;

    private resultsMap: Map<number, SearchResult> = new Map<number, SearchResult>();
    private resultUrlMap: Map<string, SearchResult> = new Map<string, SearchResult>();
    private component: any;

    private renderedIds: number[] = [];
    private currentDetailId: number = -1;
    private currentSearchIndex: number = -1;
    private isNavigating: boolean = false;
    private searchNavigationQueue: Promise<void> = Promise.resolve();

    public constructor() {
        super();
        this.index();
    }

    protected override async index() {

        // this will effect the result of the 3 functions passed
        // to reflect dark mode correctly
        HypertreeUi.setMode(this.getMode());

        // hypertree script modifications to make this work
        // pass in style/icon information
        hyt.status2Class = HypertreeUi.status2Class;
        hyt.status2Color = HypertreeUi.status2Color;
        hyt.type2Char = HypertreeUi.type2Char;
        const defaultData: {} = {};

        const project: Project = await Project.getApiProject(this.getProjectId());
        const query = new SearchQuery({
            project: this.getProjectId(),
            query: "norobots: false AND redirect: false",
            fields: "name|status|type",
            type: SearchQueryType.Any,
            includeExternal: false,
            includeNoRobots: true,
        });

        // generate this first, dialogs depend on it
        this.component = new hyt.Hypertree(
            { parent: document.body },
            {
                dataloader: this.fromApi(query),
                langloader: this.fromUndefinedLangauge(),
                langInitBFS: (ht, n)=> {
                    // popover labels don't work without this
                    const id = n.data.name;
                    n.precalc.label = id;
                    // will demand attention if set to anything
                    n.precalc.icon = "";
                },
                filter: {
                    maxlabels: 12,
                },
                geometry: {
                    captionFont: "12px Montserrat",
                    captionHeight: .09,
                }
            }
        );

        await this.component.initPromise
            .then(()=> new Promise((ok, err)=> this.component.animateUp(ok, err)))
            .then(()=> this.component.drawDetailFrame());

        // build search after hypertree is built for access to data
        this.searchDialog = await this.generateSearchDialog();

        document.addEventListener("hypertreeDetail", async(ev: any) => {
            await this.openDetail(ev);
        });

        document.addEventListener("hypertreeUpdated", async(ev: any) => {
            const focusedInput: HTMLInputElement = document.querySelector("input:focus") as HTMLInputElement;
            if (focusedInput && focusedInput.name === "query"){
                console.log("close query");
                this.searchDialog.close();
                window.requestAnimationFrame(() => {
                    focusedInput.blur();
                });
            } else {
                const focusedButton: HTMLInputElement = document.querySelector("button:focus") as HTMLInputElement;
                if (focusedButton !== null){
                    await this.closeDetail(false);
                }
            }
        });

        document.addEventListener("hypertreePanic", async(ev: any) => {
            await this.openDialog(this.panicDialog);
        });

        // handle some UI via dialogs
        this.resultDialog = this.generateResultDialog();
        this.panicDialog = this.generatePanicDialog();

        window.addEventListener("resize", (ev) => {
            // clean up on resize or artifacts
            const dialogsHrs = document.querySelectorAll("dialog hr");
            dialogsHrs.forEach(element => {
                element.parentNode?.removeChild(element);
            });
            // 100% scale, width becomes max-height (1x1 aspect)
            Plugin.postContentHeight(window.innerWidth);
        });

        document.addEventListener("keydown", async(ev) => {
            // doc level keyup cleans up rough edges of UI
            switch (ev.key) {
                case "`":
                    ev.preventDefault();
                    await this.openDialog(this.searchDialog);
                    break;
                case "ArrowLeft":
                case "ArrowRight":
                    // add button toggle on left/right, because I like it
                    if (this.resultDialog.hasAttribute("open")){
                        const currentButton = this.resultDialog.querySelector("button:focus") as HTMLButtonElement;
                        if (currentButton){
                            const nextButton = currentButton.nextElementSibling as HTMLButtonElement;
                            const prevButton = currentButton.previousElementSibling as HTMLButtonElement;
                            if (nextButton?.tagName === "BUTTON"){
                                nextButton.focus();
                            } else if (prevButton?.tagName === "BUTTON") {
                                prevButton.focus();
                            }
                        }
                    }
                    break;
                case "ArrowUp":
                    if (this.searchDialog.hasAttribute("open")){
                        this.focusPreviousSearchDialogResult();
                    }
                    break;
                case "ArrowDown":
                    if (this.searchDialog.hasAttribute("open")){
                        this.focusNextSearchDialogResult();
                    }
                    break;
                case "Escape":
                    if (this.resultDialog.hasAttribute("open")) {
                        await this.closeDetail(true);
                    }
                    if (this.searchDialog.hasAttribute("open")) {
                        await this.closeDialog(this.searchDialog);
                        (this.searchDialog.querySelector("input[type=text]") as HTMLInputElement).blur();
                    }
                    break;
                default:
                    break;
            }
        });
        // 100% scale, width becomes max-height (1x1 aspect)
        Plugin.postContentHeight(window.innerWidth);
    }

    private clearMaps(): void {
        this.resultsMap.clear();
        this.resultUrlMap.clear();
        this.renderedIds = [];
    }

    private findNodeById(root:any, targetId: number){

        if (!root) {
            return null;
        }
        if (root["data"] && root["data"]["interrobotId"] === targetId) {
            return root;
        }
        if (root["children"] && Array.isArray(root["children"])) {
            for (const child of root["children"]) {
                const result = this.findNodeById(child, targetId);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    }

    private generateResultDialog(): HTMLDialogElement {
        const dialog: HTMLDialogElement = document.createElement("dialog");
        dialog.setAttribute("id", Hypertree.resultDialogId);
        document.body.appendChild(dialog);
        return dialog;
    }

    private async handleSearchResultClick(ev: MouseEvent, hitId: number) {

        this.searchDialog.querySelector("input")?.blur();
        this.searchDialog.close();

        this.searchNavigationQueue = this.searchNavigationQueue.then(async () => {
            this.isNavigating = true;
            try {


                // use this to tame events popping off over travel to node
                this.isNavigating = true;
                ev.preventDefault();

                // this bit was developed slowly, took time, be careful
                // this takes a mouse event and hitId, and pans into the node
                // used from search result click

                // do whatever it takes to navigate to the node, this involves
                // off script manipulations of d3 hypertree that I expect will be
                // fragile
                await this.component.initPromise
                // .then(() => new Promise((ok, err) => this.component.animateUp(ok, err)))
                .then(() => this.component.drawDetailFrame())
                .then(() => this.component.unitdisk.update.transformation())
                .then(() => new Promise((resolve, reject) => {

                    let attempts = 0;
                    const maxAttempts = 120; // ~2 seconds at 60fps
                    const checkNode = () => {
                        attempts++;
                        const resultNode = this.findNodeById(this.component.data, hitId);
                        // force an update, if necessary
                        if (resultNode?.layout === null) {
                            this.component.updateLayoutPath_(resultNode);
                        }

                        if (resultNode?.layout?.z) {
                            resolve(resultNode);
                        } else if (attempts > maxAttempts) {
                            // reset transformation state and force update
                            this.component.transition = null;
                            this.component.unitdisk.update.transformation();
                            return reject(new Error("failed checkNode after maximum attempts"));
                        } else {
                            requestAnimationFrame(checkNode);
                        }
                    };
                    checkNode();
                }))
                .then(resultNode => new Promise((resolve, reject) => {

                    // force an update, if necessary
                    if (resultNode?.layout === null) {
                        this.component.updateLayoutPath_(resultNode);
                    }

                    // gotoNode in promise to ensure completion
                    this.component.api.gotoNode(resultNode);

                    let attempts = 0;
                    const maxAttempts = 120;
                    const checkAnimation = () => {
                        attempts++;
                        if (attempts > maxAttempts) {
                            // reset transformation state and force update
                            this.component.transition = null;
                            this.component.unitdisk.update.transformation();
                            return reject(new Error("failed checkAnimation after maximum attempts"));
                        }

                        if (!this.component.transition) {
                            resolve(resultNode);
                        } else {
                            requestAnimationFrame(checkAnimation);
                        }
                    };
                    checkAnimation();
                }))
                .then(() => this.component.api.gotoλ(.25))
                .catch(error => {
                    console.error("navigation failed or interrupted:", error);
                });

                this.isNavigating = false;

                // incentivize a necessary draw of icons
                this.component.update.data();

                const resultNode = this.findNodeById(this.component.data, hitId);
                if (resultNode?.layout === null) {
                    // force an update, if necessary
                    this.component.updateLayoutPath_(resultNode);
                }

                // initiate dialog with event (bc shared with mod.js)
                const detailEvent = new CustomEvent("hypertreeDetail", {
                    detail: {
                        id: resultNode.data.interrobotId,
                        timestamp: Date.now()
                    }
                });
                document.dispatchEvent(detailEvent);

            } finally {
                this.isNavigating = false;
            }
        });


    }

    private async generateSearchDialog(): Promise<HTMLDialogElement> {
        const dialog: HTMLDialogElement = document.createElement("dialog");
        dialog.setAttribute("id", Hypertree.searchDialogId);
        document.body.appendChild(dialog);
        dialog.innerHTML = `
        <div class="message fadeIn">
            <form id="HypertreeForm">
                <div class="message__search">
                    <input type="text" name="query" value="" placeholder="Search by title and/or URL"
                        spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"/>
                    <button><span class="icon">%</span></button>
                    <input type="hidden" name="nodes" value=""/>
                </div>
                <div class="message__results__meta">
                    <!-- e.g. Found 120. Showing 1-5 and errors -->
                </div>
                <div id="${Hypertree.searchResultsDialogId}" class="message__results"></div>
            </form>
        <div>`;

        const queryButton: HTMLButtonElement = dialog.querySelector("button") as HTMLButtonElement;
        const queryInput: HTMLInputElement = dialog.querySelector("input[name=query]") as HTMLInputElement;
        const nodesInput: HTMLInputElement = dialog.querySelector("input[name=nodes]") as HTMLInputElement;

        // initialize PluginData for autoform to work, this manages query and nodes selected state
        const defaultData: {} = {};
        const autoformFields: HTMLElement[] = [queryInput, nodesInput];
        await this.initData(defaultData, autoformFields);

        const relinks = nodesInput.value.split(",").map(Number);
        relinks.forEach(relink => {
            const resultNode = this.findNodeById(this.component.data, relink);
            if (resultNode && !this.component.args.objects.selections.includes(resultNode)) {
                this.component.api.toggleSelection(resultNode);
            }
        });

        // this interface is just a series (3) of dialogs over a d3 visualization
        // hook up some event handling to facilitate
        queryButton?.addEventListener("click", (ev) => {
            ev.preventDefault();
            this.closeDialog(this.searchDialog);
        });
        queryInput?.addEventListener("focus", async(ev) => {
            await this.openDialog(this.searchDialog);
        });
        queryInput?.addEventListener("click", async(ev) => {
            await this.openDialog(this.searchDialog);
        });
        queryInput?.addEventListener("keyup", async(ev) => {
            await this.openDialog(this.searchDialog);
        });

        const searchInput: HTMLInputElement | null = dialog.querySelector("input[name=query]");
        if (searchInput !== null){
            searchInput.addEventListener("keyup", async(ev) => {

                ev.preventDefault();
                const queryString: string = searchInput.value.toLocaleLowerCase();
                let hits:SearchResult[] = [];
                const startsWithQuery: RegExp = new RegExp(`^${Hypertree.escapeRegExp(queryString)}`, "i");
                const bordersQuery: RegExp = new RegExp(`\b${Hypertree.escapeRegExp(queryString)}`, "i");
                const containsQuery: RegExp = new RegExp(`${Hypertree.escapeRegExp(queryString)}`, "i");

                for (const [resultId, result] of this.resultsMap) {
                    result["sort"] = -1;
                    if (result.status.toString() === queryString) {
                        result["sort"] = 70;
                    } else if (startsWithQuery.test(result.name)) {
                        result["sort"] = 60;
                    } else if (bordersQuery.test(result.name)) {
                        result["sort"] = 50;
                    } else if (containsQuery.test(result.name)) {
                        result["sort"] = 40;
                    } else if (startsWithQuery.test(result.url)) {
                        result["sort"] = 30;
                    } else if (containsQuery.test(result.url)) {
                        result["sort"] = 20;
                    }

                    // this.renderedIds handles corner cases like trailing and non-trailing
                    // slash identicals this arrangement strains the basic nested model
                    // since there is no node to navigate to, there should be no result.
                    // problem solved?
                    if (result["sort"] >= 20 && this.renderedIds.indexOf(result.id) >= 0){
                        hits.push(result);
                    }
                }

                hits.sort((a: SearchResult, b: SearchResult) => {
                    const sortDiff = b["sort"] - a["sort"];
                    if (sortDiff !== 0) {
                        return sortDiff;
                    }

                    const typeDiff = a.type.localeCompare(b.type);
                    if (typeDiff !== 0) {
                        return typeDiff;
                    }

                    return a.name.localeCompare(b.name);
                });

                const totalHits = hits.length;
                const isEmptyQuery: boolean = queryString.trim() === "";
                hits = hits.slice(0, 5);

                const metaElement: HTMLElement | null = dialog.querySelector(".message__results__meta");
                if (metaElement && !isEmptyQuery){
                    metaElement.innerHTML = `Found <strong>${totalHits.toLocaleString()}</strong> results.
                        ${totalHits === 0 ? "" : "Showing  1–" + hits.length}`;
                } else if (metaElement) {
                    metaElement.innerHTML = ``;
                }

                const resultsDiv: HTMLDivElement = document.getElementById(Hypertree.searchResultsDialogId) as HTMLDivElement;
                resultsDiv.innerHTML = ``;
                if (queryString.trim() === ""){
                    return;
                }

                const highlights = new RegExp(`${Hypertree.escapeRegExp(queryString)}`, "gi");
                const highlight = (text) => {
                    return text.replace(highlights, "<mark>$&</mark>");
                }

                const fragment: DocumentFragment = document.createDocumentFragment();
                for (let i=0; i< hits.length; i++){

                    const resultEl: HTMLAnchorElement = document.createElement("a");
                    const hit = hits[i];
                    const hitId = hit.id;
                    const truncatedUrl = new URL(hit.url).pathname;
                    resultEl.classList.add("result");
                    resultEl.href = "#";
                    resultEl.innerHTML = `<div class="result__name">${highlight(hit.name)}</div>
                        <div class="result__url">${highlight(truncatedUrl)}</div>`;

                    resultEl.addEventListener("click", async(ev: MouseEvent) => {
                        this.handleSearchResultClick(ev, hitId);
                    });
                    fragment.appendChild(resultEl);
                }

                resultsDiv?.append(fragment);
            });
        }

        return dialog;
    }

    private generatePanicDialog(): HTMLDialogElement {
        const dialog: HTMLDialogElement = document.createElement("dialog");
        dialog.setAttribute("id", Hypertree.panicDialogId);
        document.body.appendChild(dialog);
        dialog.innerHTML = `
        <div class="message">
            <h2 class="message__title">Out of bounds. Unrecoverable.</h2>
            <div class="message__link">You've flown too close to the sun. The edges of the map
                can be tricky, avoid zooming into voids.</div>
            <div class="message__buttons"><button>Reload</button></div>
        <div>`;

        dialog.querySelector("button")?.addEventListener("click", async(ev) => {
            this.panicDialog.close();
            await this.component.initPromise
                .then(()=> new Promise((ok, err)=> this.component.animateUp(ok, err)))
                .then(()=> this.component.drawDetailFrame())
                .then(() => this.component.unitdisk.update.transformation())
                .then(() => this.component.api.gotoλ(.25));
        });

        return dialog;
    }

    private getDialogs(): HTMLDialogElement[] {
        return [this.panicDialog, this.resultDialog, this.searchDialog];
    }

    private async openDialog(targetDialog: HTMLDialogElement): Promise<void> {

        this.resultDialog.classList.remove("fadeOut");

        const dialogClosePromises = this.getDialogs()
        .filter(dialog => dialog !== targetDialog && dialog.hasAttribute("open"))
        .map(async dialog => {
            if (dialog.id === Hypertree.resultDialogId) {
                await this.closeDetail(true);
            } else {
                dialog.close();
            }
        });

        await Promise.all(dialogClosePromises);

        // Open target dialog
        if (!targetDialog.hasAttribute("open")) {
            targetDialog.show();
            if (targetDialog.id === Hypertree.searchDialogId) {
                this.currentSearchIndex = -1;
                const searchInput = targetDialog.querySelector<HTMLInputElement>("input[name=query]");
                searchInput?.dispatchEvent(new Event("keyup", { bubbles: false }));
            }
        }
        /*
        // this.resultDialog.classList.remove("fadeOut");
        this.getDialogs().forEach(async(dialog) => {
            const dialogIsOpen: boolean = dialog.hasAttribute("open");
            if (!dialogIsOpen && dialog !== targetDialog){
                return;
            }
            if (dialog === targetDialog){
                if (!dialog.hasAttribute("open")){
                    dialog.show();
                    if (targetDialog.id === Hypertree.searchDialogId){
                        // get a search result from existing query primed on first contact
                        this.currentSearchIndex = -1;
                        const searchInput: HTMLInputElement | null = dialog.querySelector("input[name=query]");
                        const event = new Event("keyup", { bubbles: false });
                        searchInput?.dispatchEvent(event);
                    }
                }
            } else {
                if (dialog.id === Hypertree.resultDialogId){
                    await this.closeDetail(true);
                } else {
                    dialog.close();
                }

            }
        });
        */
    }

    private closeDialog(targetDialog: HTMLDialogElement): void {
        this.getDialogs().forEach(dialog => {
            if (dialog.hasAttribute("open")){
                dialog.close();
            }
        });
    }

    private focusSearchDialogResult(inc: number): void {

        const results: NodeListOf<HTMLElement> = this.searchDialog.querySelectorAll(".result") as NodeListOf<HTMLElement>;
        const searchInput: HTMLInputElement = this.searchDialog.querySelector("input[name=query]") as HTMLInputElement;

        if (!this.searchDialog.hasAttribute("open")){
            this.currentSearchIndex = -1;
            searchInput.focus();
            window.requestAnimationFrame(() => {
                searchInput.select();
            });
        }

        else if (results.length === 0){
            return;
        }

        this.currentSearchIndex += inc;

        // wrap around results, top of list to bottom
        if (this.currentSearchIndex === -2){
            this.currentSearchIndex = results.length - 1;
        }
        if (this.currentSearchIndex >= results.length || this.currentSearchIndex < 0){
            this.currentSearchIndex = -1;
            searchInput.focus();
            window.requestAnimationFrame(() => {
                searchInput.select();
            });
            return;
        }

        results[this.currentSearchIndex].focus();
    }

    private focusPreviousSearchDialogResult(): void {
        this.focusSearchDialogResult(-1);
    }

    private focusNextSearchDialogResult(): void {
        this.focusSearchDialogResult(1);
    }

    private async updateAutoformNodes(): Promise<void> {

        const activeIds: number[] = [];
        const selections = [...this.component.args.objects.selections];
        selections.sort((a, b) => {
            // sort so errors draw over ok paths
            return a.data["interrobotStatus"] - b.data["interrobotStatus"];

        });

        selections.forEach(selection => {
            const result: number = selection.data["interrobotId"];
            if (result >= 0){
                activeIds.push(result);
            }
        });

        const nodesVal: string = activeIds.join(",");
        await this.data.setAutoformField("nodes", nodesVal);
    }



    private async openDetail(ev: any): Promise<void> {

        const result: SearchResult | null = this.resultsMap.get(ev.detail.id) ?? null;

        // non result node, no detail
        if (result === null){
            return;
        }

        // reset animations, this is noisy but see above explanation
        const tempMsg = this.resultDialog.querySelector(".message") as HTMLElement;
        tempMsg?.classList.remove("fadeIn", "fadeOut");
        const tempHrs = this.resultDialog.querySelectorAll("hr.line");
        tempHrs.forEach(hr => {
            hr?.classList.remove("fadeIn", "fadeOut");
        });


        // click on, click off
        if (this.resultDialog.hasAttribute("open") && result && result.id === this.currentDetailId){
            await this.closeDetail(false);
            console.log(result);
            return;
        }

        // const detailHtml: string = this.getDetailHtml(result);
        const detailHtml: string =  `
        <div class="message fadeIn">
            <h2 class="message__title"><span class="status">${result.status}</span>
                <span class="type">${HypertreeUi.type2Char(result.type)}</span>
                ${HtmlUtils.htmlEncode(result.name)}</h2>
            <div class="message__link">
                <a data-id="${result.id}" href="${HtmlUtils.htmlEncode(result.url)}">
                    ${HtmlUtils.htmlEncode(result.url)}</a>
            </div>
            <div class="message__buttons">
                <button>Cancel</button>
                <button>Add Path</button>
            </div>
        </div>`;

        if (result && detailHtml){
            const activeIds: number[] = [];
            const selections = this.component.args.objects.selections;
            selections.forEach(selection => {
                activeIds.push(selection.data["interrobotId"]);
            });
            if (activeIds.indexOf(result.id) >= 0){
                // scenario: a user clicks on a leaf of a highlighted route
                // this turns off saved hypertree routes, without spawning a detail
                // note the activeIds are a tricky business, at mercy of hypertree
                // and require a series of events in order to have already occurred
                // update: this caused a lot of problems and the one problem it created,
                // that of a less quick path removal doesn't feel tedious anymore
                // basically, it's out of order, event driven nonsense. avoid this!
                // this.closeDetail(false);
                // return;
            }

            this.resultDialog.innerHTML = detailHtml;

            // toggle if not already selected, important for search results
            const resultNode = this.findNodeById(this.component.data, result.id);
            if (!this.component.args.objects.selections.includes(resultNode)) {
                this.component.api.toggleSelection(resultNode);
            }


            const buttons = this.resultDialog.querySelectorAll("button");
            const cancel = buttons[0];
            if (cancel){
                cancel.addEventListener("click", async(ev: MouseEvent) => {
                    ev.preventDefault();
                    await this.closeDetail(true);
                });
            }

            const addPath = buttons[1];
            if (addPath){
                addPath.addEventListener("click", async(ev: MouseEvent) => {
                    ev.preventDefault();
                    await this.closeDetail(false);
                });
                window.setTimeout(() => addPath.focus(), 10);
            }

            const detailLink: HTMLAnchorElement = this.resultDialog.querySelector("a") as HTMLAnchorElement;
            detailLink?.addEventListener("click", (ev: MouseEvent) => {
                ev.preventDefault();
                const pageId: number = parseInt(detailLink.dataset.id ?? "0", 10) ?? 0;
                Plugin.postOpenResourceLink(pageId, true);
            });

            await this.openDialog(this.resultDialog);
            this.resultDialog.classList.remove("ok", "error", "warn", "disabled");
            this.resultDialog.classList.add(HypertreeUi.status2Class(result.status));
            this.currentDetailId = result.id;
            const hit = document.getElementById(`result${result.id}`);
            const dialogBounds = this.resultDialog.getBoundingClientRect();
            if (hit !== null){
                const hitBounds = hit.getBoundingClientRect();
                const hitBoundsX: number = hitBounds.left + hitBounds.width/2;
                const hitBoundsY: number = hitBounds.top + hitBounds.height/2;


                const getDistance = (p1x: number, p1y: number, p2x: number, p2y: number): number => {
                    return Math.sqrt(
                        Math.pow(p1x - p2x, 2) +
                        Math.pow(p1y - p2y, 2)
                    );
                };
                // draw dialog zoom lines
                const corners: string[] = ["lt", "rt", "lb", "rb"];

                // fix bug where they go to top left of screen (theory - intel gpus?)
                // if it looks cooked, just don't draw the lines
                if (!(hitBounds.left === 0 && hitBounds.top === 0)){
                    corners.forEach((corner) => {
                        const hr = document.createElement("hr");
                        hr.setAttribute("class",`line ${corner}`);
                        this.resultDialog.append(hr);
                        const dialogPointX = corner[0] === "l" ? dialogBounds.x : dialogBounds.x + dialogBounds.width;
                        const dialogPointY = corner[1] === "t" ? dialogBounds.y : dialogBounds.y + dialogBounds.height;
                        const distance = getDistance(dialogPointX, dialogPointY, hitBoundsX, hitBoundsY);
                        let angle: number = 0;
                        if (corner[0] === "l"){
                            angle = Math.atan2( // left side, left anchored
                                hitBoundsY - dialogPointY,
                                hitBoundsX - dialogPointX
                            ) * (180 / Math.PI);
                        } else {
                            angle = Math.atan2( // right side, right anchored
                                dialogPointY - hitBoundsY,
                                (dialogPointX) - hitBoundsX
                            ) * (180 / Math.PI);
                        }
                        hr.style.width = `${distance}px`;
                        hr.style.transform = `rotate(${angle}deg)`;
                    });
                }

            }
        } else {

            await this.closeDetail(false);
        }
    }

    private async closeDetail(cancelAddPath: boolean): Promise<void> {

        // this gets called more often than you'd expect, because modifications to the
        // underlying hypertree also call this (to close dialog and recover when user
        // grabs the plane in background). anyways, be careful and maybe clean up at some point
        if (this.isNavigating){
            return;
        }

        // a cancel is a special case where an action (toggled selection on) is undone
        // get the last added selection and remove it. yet to see this simple method fail
        if (cancelAddPath === true){
            const selections = this.component.args.objects.selections;
            const node = selections.length > 0 ? selections[selections.length - 1] : null;
            if (node){
                this.component.api.toggleSelection(node);
            }
        }

        await this.updateAutoformNodes();

        // set up animations, this is noisy but the benefit is that you can see the
        // crosshairs of the underlying icon under the dialog when closed, which solves
        // a UI blind spot. the message fades faster than the hrs, for effect
        const msg = this.resultDialog.querySelector(".message") as HTMLElement;
        msg?.classList.remove("fadeIn");
        msg?.classList.add("fadeOut");
        const hrs = this.resultDialog.querySelectorAll("hr.line");
        hrs.forEach(hr => {
            hr.classList.add("fadeOut");
        });

         // this inevitably backfires (undesirable events), stick with above
        // window.setTimeout(() => { }, 2000);

        this.currentDetailId = -1; // reset detail dialog
        this.closeDialog(this.resultDialog);
        const query = this.searchDialog.querySelector("input[name=query]") as HTMLInputElement;
        query?.blur();
    }

    private fromUndefinedLangauge(): (callback: LangFileLoadCallback) => void {
        // return a function, this is a rewire of hypertree so I can get data
        // replaces hyt.loaders.fromLangFile
        // there is no lang file equivalent for this plugin
        return (callback: LangFileLoadCallback): void => {
            const t0 = performance.now();
            callback({} as LanguageData, t0, 0);
        };
    }

    private truncateTitle(title: string): string {
        const maxLength = 36;
        if (title.length <= maxLength){
            return title;
        }
        const words = title.split(" ");
        let result = words[0];

        // Add words until we would exceed maxLength
        for (let i = 1; i < words.length; i++) {
            const nextResult = result + " " + words[i];
            if (nextResult.length <= maxLength) {
                result = nextResult;
            } else {
                break;
            }
        }
        return result + "…";
    }

    private getResultStem(id: number, name: string, slug: string, status: number, type: string, children: {}[]): {} {
        return {
            "name": `${this.truncateTitle(name ? name : slug)}`,
            "numLeafs": children.length,
            "interrobotId": id,
            "interrobotType": type,
            "interrobotStatus": status,
            "children": children,
        };
    }

    private gatherResultsBranches(root: {}, baseUrl:string, renderedIds: number[]): {}[] {

        const seedObjects: {}[] = [];
        const rootKeys = Object.keys(root);
        for (let i=0; i< rootKeys.length; i++){
            const rootKey: string = rootKeys[i];
            if (rootKey === "__meta__"){
                continue;
            }

            const rootChild = root[rootKey];
            // const resultUrl: string = rootChild["__meta__"]["url"];
            const resultUrl: string = rootChild?.__meta__?.url;
            let result: SearchResult | undefined = this.resultUrlMap.get(this.normalizeUrl(resultUrl));
            const resultHit: boolean = result !== undefined;
            if (result !== undefined){
                const children = this.gatherResultsBranches(rootChild, result.url, renderedIds);
                if (children.length === 0){
                    // intentionally don't label leaf nodes ("") so the label overlay doesn't generate
                    seedObjects.push(this.getResultStem(result.id, "", "", result.status, result.type, children));
                } else {
                    seedObjects.push(this.getResultStem(result.id, result.name, rootKeys[i], result.status,
                        result.type, children));
                }

                if (renderedIds.indexOf(result.id) === -1) {
                    renderedIds.push(result.id);
                }

            } else {
                // this could be a lot of things, presume directory
                // handle other oddities upstream, filter search if necessary
                const children = this.gatherResultsBranches(rootChild, resultUrl, renderedIds);
                seedObjects.push(this.getResultStem(this.getNonResultUniqueId(), `./${rootKey}`, rootKey,
                    -400, "dir", children));
            }
        }
        seedObjects.sort((a, b) => {
            // primary and secondary sort
            return a["interrobotType"].localeCompare(b["interrobotType"]) ||
                a["interrobotStatus"] - b["interrobotStatus"];
        });
        return seedObjects;
    }

    private normalizeUrl(url: string): string {
        try {
            const urlObj = new URL(url);
            return `${urlObj.origin}${urlObj.pathname}`;
        } catch (e) {
            return url.split(/[?#]/)[0];
        }
    }

    private async gatherResults(query: SearchQuery): Promise<{}> {

        this.clearMaps();

        const projectUrl = (await this.getProject()).url;
        const gatheredUrls: string[] = [];

        let projectHitId: number = -1;
        let seedObject: {} | null = {};
        
        await Search.execute(query, this.resultsMap, async (result: SearchResult) => {

            const rUrl: string = result.url;
            if (gatheredUrls.indexOf(rUrl) >= 0){
                return;
            }
            gatheredUrls.push(rUrl);

            const rId: number = result.id;
            if (rUrl === projectUrl){
                projectHitId = rId;
            }

            this.resultsMap.set(rId, result);
            this.resultUrlMap.set(this.normalizeUrl(rUrl), result);
        }, true, false, "Rendering…");

        if (projectHitId === -1){
            return {};
        }

        const firstHit: SearchResult | undefined = this.resultsMap.get(projectHitId);
        if (firstHit === undefined){
            return {};
        }

        // regroup into tree, grab all URLs from search results, loop and extract hierarchy
        const resultUrlMapKeys: string[] = [...this.resultUrlMap.keys()];
        resultUrlMapKeys.sort();
        const root: { [key: string]: {} } = { __meta__ : {url: this.normalizeUrl(firstHit.url)} };

        for (const url of resultUrlMapKeys) {

            const urlProper = new URL(url);
            const origin = urlProper.origin;
            const segments = urlProper.pathname.split("/").filter(seg => seg);
            const segmentsLen = segments.length;
            const cycled: string[] = [];

            let current = root;
            segments.forEach((segment, i) => {
                cycled.push(segment);
                if (segmentsLen - 1 === i){
                    if (!current[segment]) {
                        current[segment] = { __meta__ : {url: url }};
                    }
                } else {
                    if (!current[segment]) {
                        current[segment] = { __meta__ : {url: `${origin}/${cycled.join("/")}/` }};
                    }
                }

                current = current[segment];
            });
        }
        const renderedIds: number[] = [];
        const children = this.gatherResultsBranches(root, firstHit.url, renderedIds);
        this.renderedIds = renderedIds;

        seedObject = this.getResultStem(firstHit?.id, new URL(firstHit.url).hostname, "",
            firstHit?.status, firstHit?.type, children);

        // console.log(seedObject);
        // console.log(renderedIds);
        return seedObject;
    }

    private fromApi(query: SearchQuery): (callback: DataFileLoadCallback) => void {
        return (callback: DataFileLoadCallback): void => {
            const t0 = performance.now();
            this.gatherResults(query).then(results => {
                callback(results as TreeData, t0, 0);
            })
            .catch(error => {
                console.error("Error gathering results:", error);
                callback({}, performance.now(), 0);
            });
        };
    }
}

// handles DOMContentLoaded initialization
Plugin.initialize(Hypertree);
