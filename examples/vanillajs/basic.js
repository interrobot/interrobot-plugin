

class BasicExamplePlugin extends InterroBot.Core.Plugin {
    
    static meta = {
        "url": "https://interro.bot",
        "title": "Basic Plugin Example",
        "category": "Example",
        "version": "1.0.1",
        "author": "InterroBot",
        "synopsis": `a basic plugin example, using vanillajs`,
        "description": `This example is as simple as it gets.`,
    };

    constructor() {
        super();
        this.index();
    }

    async index() {
        const project = await InterroBot.Core.Project.getApiProject(this.getProjectId());
        this.render(`
            ${InterroBot.Ui.Templates.standardHeading(project, BasicExamplePlugin.meta["title"])}
            ${InterroBot.Ui.Templates.standardForm(`
            <p>Welcome, from the index() of the BasicExamplePlugin. This page exists as a placeholder, 
                but in your hands it could be so much more. The Example Report form below will count and 
                present page title terms used across the website, by count.
                It's an example to help get you started.</p>
            <p>If you have any questions, please reach out to the dev via the in-app contact form (cog at bottom left).</p>
            <form class="main__form__standard main__form__ltr" id="LinkForm">
                <div><button class="submit">Report</button></div>
            </form>
            <div id="LinkFormProgress"></div>`)}
            ${InterroBot.Ui.Templates.standardResults()}
        `);
        
        await this.initData({}, []);
        
        const button = document.querySelector("button");
        button.addEventListener("click", async (ev) => {
            ev.preventDefault();
            button.setAttribute("disabled", "disabled");
            try {
                await this.process();
            } finally {
                button.removeAttribute("disabled");
            }
        });

        InterroBot.Core.Plugin.postContentHeight();
    }

    async process() {
        // as an example, collect page title word counts across all html pages
        // it's a contrived example, but let us keep things simple
        const titleWords = new Map();
        let resultsMap;
        // the function to handle individual SearchResults
        // in this example, counting term/word instances in the name field
        const exampleResultHandler = async (result, titleWordsMap) => {
            const terms = result.name.trim().split(/[\s\-—]+/g);
            for (let term of terms) {
                if (!titleWordsMap.has(term)) {
                    titleWordsMap.set(term, 1);
                }
                else {
                    const currentCount = titleWordsMap.get(term);
                    titleWordsMap.set(term, currentCount + 1);
                }
            }
        };
        // projectId comes for free as a member of Plugin
        const projectId = this.getProjectId();
        // build a query, these are exactly as you'd type them into InterroBot search
        const freeQueryString = "headers: text/html";
        // pipe delimited fields you want retrieved
        // id and url come with the base model, everything else costs time
        const fields = "name";
        const internalHtmlPagesQuery = new InterroBot.Core.SearchQuery(projectId, freeQueryString, fields, InterroBot.Core.SearchQueryType.Any, false);
        // run each SearchResult through its handler, and we're done processing
        await InterroBot.Core.Search.execute(internalHtmlPagesQuery, resultsMap, "Processing…", async (result) => {
            await exampleResultHandler(result, titleWords);
        });
        
        // call for html presentation
        await this.report(titleWords);
    }

    async report(titleWords) {
        // sort titleWords by count, then by term
        const titleWordsRemap = new Map([...titleWords.entries()].sort((a, b) => {
            const aVal = a[1];
            const bVal = b[1];
            if (aVal === bVal) {
                // secondary sort is term, alpha ascending
                return a[0].toLowerCase().localeCompare(b[0].toLowerCase());
            }
            // primary sort is term count, numeric descending
            return bVal - aVal;
        }));
        // render html output from collected data
        const tableRows = [];
        for (let term of titleWordsRemap.keys()) {
            const count = titleWordsRemap.get(term);
            const truncatedTerm = term.length > 24 ? term.substring(24) + "…" : term;
            tableRows.push(`<tr><td>${InterroBot.Core.HtmlUtils.htmlEncode(truncatedTerm)}</td><td>${count.toLocaleString()}</td></tr>`);
        }
        const resultsElement = document.querySelector(".main__results");
        resultsElement.innerHTML = tableRows.length === 0 ? `<p>No results found.</p>` :
            `<div><section><table style="max-width:340px">
            <thead><tr><th>Term</th><th>Count</th></tr></thead>
            <tbody>${tableRows.join("")}</tbody>
            </table></section></div>`;
        // send signal back to iframe host to alot current page height
        InterroBot.Core.Plugin.postContentHeight();
    }
}

InterroBot.Core.Plugin.initialize(BasicExamplePlugin);
