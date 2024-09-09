
// Wordcloud. Take web copy, pull out interesting words. 
//  Present aforementioned words as "cloud."

import { Plugin } from "../../../src/ts/core/plugin";
import { SearchQueryType, SearchQuery, Search, SearchResult, Project, PluginData } from "../../../src/ts/core/api";
import { HtmlProcessingWidget } from "../../../src/ts/ui/processing";
import { Templates } from "../../../src/ts/ui/templates";

class WordcloudWord {

    // fine displayed result, each SearchResult can contain many of these (or none at all)
    public readonly word: string;
    private count: number = 0;

    public constructor(word: string, count: number) {
        this.word = word;
        this.count = count;
    }

    public incrementCount() {
        this.count++;
    }
}

class Wordcloud extends Plugin {
    
    public static override readonly meta: {} = {
        "url": "https://interro.bot",
        "title": "Word Cloud",
        "category": "Fun",
        "version": "0.0.9",
        "author": "InterroBot",
        "synopsis": `create a wordcloud from website content`,
        "description": `Gonna be great.\n\n
            Check it out.`,
    }

    private progress: HtmlProcessingWidget | null;
    private perPage: number;
    
    public constructor() {
        
        super();
        
        this.progress = null;
        this.init(Wordcloud.meta);
        this.index();
    }

    protected override async index() {

        const project: Project = await Project.getApiProject(this.getProjectId());

        this.render(`
            ${Templates.standardHeading(project, Wordcloud.meta["title"])}
            ${Templates.standardForm(`
            <p>Finds interesting site keywords, generates a wordcloud.</p>
            <form class="main__form__standard main__form__ltr" id="LinkForm">
                <label>
                    <span>Strategy</span>
                    <select name="strategy">
                        <option value="0">Jargon</option>
                    </select>                 
                </label>
                <label>
                    <span>Min Word Length</span>
                    <select name="perPage">
                        <option value="3" selected>3 characters</option>
                        <option value="4">4 characters</option>
                        <option value="5">5 characters</option>
                    </select>                 
                </label>
                <div><button class="submit">Report</button></div>
            </form>
            <div id="LinkFormProgress"></div>`)}
            ${Templates.standardResults()}
        `);

        const strategySelect: HTMLSelectElement = document.querySelector("select[name='strategy']") as HTMLSelectElement;
        const perPageSelect: HTMLSelectElement = document.querySelector("select[name='perPage']") as HTMLSelectElement;
        const progressWrapper: HTMLDivElement = document.getElementById("LinkFormProgress") as HTMLDivElement;         
        this.progress = HtmlProcessingWidget.createElement(progressWrapper, "Scanning: ");

        // initialize PluginData for autoform to work
        const defaultData: {} = {};
        const autoformFields: HTMLElement[] = [strategySelect, perPageSelect];
        await this.initData(Wordcloud.meta, defaultData, autoformFields);
        
        this.perPage = Number(strategySelect.value);
        const button: HTMLButtonElement = document.querySelector("button") as HTMLButtonElement;
        button.addEventListener("click", async (ev: MouseEvent) => {
            ev.preventDefault();
            button.setAttribute("disabled", "disabled");
            try {
                await this.process();
            } finally {
                button.removeAttribute("disabled");
            }
        });

        Plugin.postContentHeight();
    }

    protected async process() {
        await this.report();
    }

    protected async report() {
        // present data
    }
}

// handles DOMContentLoaded initialization
Plugin.initialize(Wordcloud); 
