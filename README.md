<p align="center">
    <img alt="InterroBot logo" src="https://interro.bot/media/static/images/icons/interrobot.webp">
</p>

<p align="center">
   <a href="https://interrobot.github.io/interrobot-plugin/">API Docs</a> ·
   <a href="https://github.com/interrobot/interrobot-plugin/">Repo</a> ·
   <a href="https://www.npmjs.com/package/interrobot-plugin">NPM</a> ·
   <a href="https://interro.bot/plugins/">Plugins</a> ·
   <a href="https://interro.bot/">InterroBot</a>
</p>

InterroBot plugins transform your web crawler into, well... anything you want. With unrestricted API crawl data access, Interrobot plugins can bring your website analysis concepts to life.

InterroBot plugins are simple HTML/JS/CSS pages that turn crawl data into insights, stunning visualizations, and interactive dashboards. With our flexible API, you can create custom plugins that analyze website content across entire domains, connecting with analytics, LLMs, or your favorite SaaS for deeper insights.

The InterroBot plugin ecosystem is designed for power users. Whether you're building proprietary tools, developing plugins for clients, or contributing to the open-source community, InterroBot plugins adapt to your needs. Available for Windows 10/11, macOS, Linux, and Android, InterroBot plugins are everywhere you need them.

## How Does it Work?

InterroBot hosts an iframe of your webpage and exposes an API from which you can pull data down for analysis.

If you're familiar with vanilla TypeScript or JavaScript, creating a custom plugin script for InterroBot is remarkably straight forward. First you start with a [bare-bones HTML file](https://raw.githubusercontent.com/interrobot/interrobot-plugin/refs/heads/master/examples/vanillajs/basic.html) and a script extending the Plugin base class.
```javascript
// TypeScript vs. JavaScript, both are fine. See examples.
import { Plugin } from "./src/ts/core/plugin";
class BasicExamplePlugin extends Plugin {
    static meta = {
        "title": "Example Plugin",
        "category": "Example",
        "version": "1.0.0",
        "author": "InterroBot",
        "synopsis": `a basic plugin example`,
        "description": `This example is as simple as it gets.`,
    };
    constructor() {
        super();
        // index() has nothing to do with the crawl index, btw. it is
        // the plugin index (think index.html), a view that shows by
        // default, and would generally consist of a form or visualization.
        this.index();
    }
}
// configure to initialize when the page is ready
Plugin.initialize(BasicExamplePlugin);
```

BasicExamplePlugin will not do much at this point, but it will load and run the default `index()` behavior.
You can, of course, override the default `index()` behavior, rendering your page however you wish.
```javascript
protected async index() {

    // add your form and supporting HTML
    this.render(`<div>HTML</div>`);

    // initialize the plugin within InterroBot, from within iframe
    await this.initData({}, []);

    // add handlers to the form
    const button = document.querySelector("button");
    button.addEventListener("click", async (ev) => {
        await this.process(); // where process() is a form handler
    });
}
```

The `process()` method called above would be where you process data. Query the crawl index with
`this.search()`, and stream the results — pagination is handled for you, and you can `break` out
of the loop at any point to stop fetching.
```javascript
protected async process() {

    // queries are exactly as you'd type them into InterroBot search.
    // id and url come with the base model, everything else costs time.
    // here, I just grab the "name" field (the page title)
    const titleWords = new Map();
    for await (const result of this.search("headers: text/html",
        { fields: ["name"], includeExternal: false })) {
        const terms = result.name.trim().split(/[\s\-—]+/g);
        terms.forEach(term => titleWords.set(term,
            (titleWords.get(term) ?? 0) + 1));
    }

    // call for HTML presentation of titleWords with processing complete
    await this.report(titleWords);
}
```

Behind `this.search()` sits the lower-level API: build an `InterroBot.Core.SearchQuery` for any
project, and either stream it (`InterroBot.Core.Search.results(query)`) or run a result handler
callback over it with progress events and result caching (`InterroBot.Core.Search.execute(query,
resultsMap, resultHandler, options)`). `this.search()` is the recommended path; reach for `execute`
when you want cached replay of the result set across reruns of a report.

For working plugins and more ideas getting started, check out the [examples](https://github.com/interrobot/interrobot-plugin/blob/master/examples/) directory.

## What data is available via API?

InterroBot's API provides developers with access to crawled data, enabling analysis and useful customizations. This data allows you to create insightful visualizations, perform complex analysis, or build interactive tools. Whether you're tracking SEO metrics, analyzing content structures, or developing custom reporting tools, our API offers the flexibility and depth you need. Below is an overview of the key data points available, organized by API endpoint:

### GetProjects

Retrieves a list of projects using the Plugin API.

**Optional Fields**

| Field | Description |
|-------|-------------|
| created | ISO 8601 date/time, project created |
| image | datauri of project icon |
| modified | ISO 8601 date/time, project modified |
| urls | Array of URLs configured for project |

### GetResources

Retrieves a list of resources associated with a project using the Plugin API.

**Optional Fields**

| Field | Description |
|-------|-------------|
| assets | array of assets, HTML only |
| content | page/file contents |
| created | ISO 8601 date/time, crawled resource |
| headers | HTTP headers |
| links | array of outlinks, HTML only |
| modified | ISO 8601 date/time, resource modified |
| name | page/file name |
| norobots | crawler indexable |
| origin | forwarding URL, if applicable |
| size | size in bytes |
| status | HTTP status code |
| time | request time, in millis |
| type | resource type, html, pdf, image, etc. |

### GetCrawls

Retrieves a list of crawls using the Plugin API.

**Optional Fields**

| Field | Description |
|-------|-------------|
| created | ISO 8601 date/time, crawl created |
| modified | ISO 8601 date/time, crawl modified |
| report | Crawl details as JSON |
| time | Crawl time in millis |


## Licensing

MPL 2.0. Earlier releases (0.18 and prior) additionally bundled JavaScript to TypeScript ports within `./src/lib` — *Typo.js* ([Modified BSD License](https://raw.githubusercontent.com/cfinke/Typo.js/master/license.txt)) and *Snowball.js* ([MPL 1.1](https://raw.githubusercontent.com/fortnightlabs/snowball-js/master/LICENSE)) — which remain under their original licenses where they appear in release history.