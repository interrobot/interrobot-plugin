class BasicExamplePlugin extends InterroBot.Core.Plugin {

    static meta = {
        "url": "https://interro.bot",
        "title": "Basic Plugin Example",
        "category": "Example",
        "version": "1.0.3",
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
        const enc = InterroBot.Core.HtmlUtils.htmlEncode;
        this.render(`
        <div class="main__heading">
            <div class="main__heading__icon">
                <img id="projectIcon" src="${enc(project.getImageDataUri())}" alt="Icon for ${enc(project.getDisplayTitle())}" />
            </div>
            <div class="main__heading__title">
                <h1><span>${enc(BasicExamplePlugin.meta["title"])}</span></h1>
                <div><span>${enc(project.getDisplayTitle())}</span></div>
            </div>
        </div>
        <div class="main__form">
            <p>Welcome, from the index() of the BasicExamplePlugin. This page exists as a placeholder, 
                but in your hands it could be so much more. The Example Report form below will count and 
                present page title terms used across the website, by count.
                It's an example to help get you started.</p>
            <p>If you have any questions, please reach out to the dev via the in-app contact form (cog at bottom left).</p>
            <form class="main__form__standard main__form__ltr" id="LinkForm">
                <div><button class="submit">Report</button></div>
            </form>
        </div>
        <div class="main__results"></div>`);

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
        const titleWords = new Map();

        // Queries are exactly what you'd type into InterroBot search.
        // id and url come with the base model; request only the fields
        // you need — here just "name" (the page title). Pagination is
        // handled for you, and you can break out of the loop any time.
        for await (const result of this.search("headers: text/html", {
            fields: ["name"],
            includeExternal: false,
        })) {
            const terms = result.name.trim().split(/[\s\-—]+/g);
            for (const term of terms) {
                titleWords.set(term, (titleWords.get(term) ?? 0) + 1);
            }
        }

        await this.report(titleWords);
    }

    async report(titleWords) {
        const titleWordsRemap = new Map([...titleWords.entries()].sort((a, b) => {
            const aVal = a[1];
            const bVal = b[1];
            if (aVal === bVal) {
                return a[0].toLowerCase().localeCompare(b[0].toLowerCase());
            }
            return bVal - aVal;
        }));
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
        InterroBot.Core.Plugin.postContentHeight();
    }
}

InterroBot.Core.Plugin.initialize(BasicExamplePlugin);