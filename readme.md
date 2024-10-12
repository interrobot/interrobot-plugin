<p align="center">
    <img alt="InterroBot logo" src="https://interro.bot/media/static/images/icons/interrobot.webp">
</p>

<p align="center">
   <a href="https://interrobot.github.io/interrobot-plugin/">Plugin/API Docs</a> · 
   <a href="https://interro.bot/plugins/">Plugins Directory</a> · 
   <a href="https://interro.bot/">InterroBot Crawler</a>
<p>

Your web crawler just got superpowers. InterroBot plugins transform your web crawler into a customizable data powerhouse, unleashing unlimited potential for data extraction and analysis.

InterroBot plugins are simple HTML/JS/CSS pages that transform raw web crawl data into profound insights, stunning visualizations, and interactive dashboards. With our flexible API, you can create custom plugins that analyze website content across entire domains, connecting with analytics, LLMs, or your favorite SaaS for deeper insights.

Our plugin ecosystem is designed for versatility. Whether you're building proprietary tools, developing plugins for clients, or contributing to the open-source community, InterroBot plugins adapt to your needs. Available for Windows 10/11, macOS, and Android, our platform ensures your data analysis can happen wherever you work.

Here's a glimpse of how easy it is to create a custom plugin script with InterroBot:

```javascript
class ExamplePlugin extends Plugin {
    
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
        this.init(BasicExamplePlugin.meta);
        this.index();
    }
}
```

ExamplePlugin will not do much at this point, but it will load and run the default index() behavior.
You can, of course, override the default index() behavior, rendering your page however you wish.

```javascript
async index() {    
    // add your form and supporting HTML
    this.render(`[HTML to add to page body]`);
    
    // initialize the plugin
    await this.initData(BasicExamplePlugin.meta, {}, []);
    
    // add handlers to the form
    const button = document.querySelector("button");
    button.addEventListener("click", async (ev) => { 
        await this.process(); // where process is a form handler
    });
}
```

The process() method called above would be where you process data. Here a query is executed on 
the crawl index, and each result run through the exampleResultsHandler.

```
protected async process() {

    // gather title words with a result handler
    const titleWords: Map<string, number> = new Map<string, number>();
    let resultsMap: Map<number, SearchResult>;
    const exampleResultHandler = async (result: SearchResult, 
        titleWordsMap: Map<string, number>) => {
        const terms: string[] = result.name.trim().split(/[\s\-—]+/g);
        for (let term of terms) {
            if (!titleWordsMap.has(term)) {
                titleWordsMap.set(term, 1);
            } else {
                const currentCount = titleWordsMap.get(term);
                titleWordsMap.set(term, currentCount + 1);
            }
        }
    }

    // projectId comes for free as a member of Plugin
    const projectId: number = this.getProjectId();

    // build a query, these are exactly as you'd type them into InterroBot search
    const freeQueryString: string = "headers: text/html";

    // pipe delimited fields you want retrieved
    // id and url come with the base model, everything else costs time
    const fields: string = "name";
    const internalHtmlPagesQuery = new SearchQuery(projectId, freeQueryString, fields,
        SearchQueryType.Any, false);

    // run each SearchResult through its handler, and we're done processing
    await Search.execute(internalHtmlPagesQuery, resultsMap, "Processing…", 
        async (result: SearchResult) => {
            await exampleResultHandler(result, titleWords);
        }
    );

    // call for html presentation
    await this.report(titleWords);
}
```

The above snippets are a modified version of an example plugin in the repository, [basic.js](https://github.com/interrobot/interrobot-plugin/blob/master/examples/vanillajs/basic.js) 

## What data is available via API?

InterroBot's robust API provides plugin developers with access to crawled data, enabling deep analysis and useful customizations. This data forms the foundation of your plugin, allowing you to create insightful visualizations, perform complex analysis, or build interactive tools. Whether you're tracking SEO metrics, analyzing content structures, or developing custom reporting tools, our API offers the flexibility and depth you need. Below is an overview of the key data points available, organized by API endpoint:

### GetProjects

Retrieves a list of projects using the Plugin API.

**Optional Fields**

| Field | Description |
|-------|-------------|
| created | ISO 8601 date/time, project created |
| image | datauri of project icon |
| modified | ISO 8601 date/time, project modified |

### FilterProjects

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

MPL 2.0, with exceptions. This repo contains JavaScript to TypeScript ports and a Markdown library based on existing code, all contained within `./src/lib`. As they arrived under existing licenses, they will remain under those. 

* *Typo.js*: TypeScript port continues under the original [Modified BSD License](https://raw.githubusercontent.com/cfinke/Typo.js/master/license.txt).
* *Snowball.js*: TypeScript port continues under the original [MPL 1.1](https://raw.githubusercontent.com/fortnightlabs/snowball-js/master/LICENSE) license.
* *HTML To Markdown Text*: The Markdown library contains a modified version of an HTML to Markdown XSLT transformer by Michael Eichelsdoerfer. [MIT](https://en.wikipedia.org/wiki/MIT_License) license.

The InterroBot plugins and the Typo.js TypeScript port make use of a handful of unmodified Hunspell dictionaries, as found in [wooorm's UTF-8 collection](https://github.com/wooorm/dictionaries/): [`dictionary-en`](https://github.com/wooorm/dictionaries/en), [`dictionary-en-gb`](https://github.com/wooorm/dictionaries/en-GB), [`dictionary-es`](https://github.com/wooorm/dictionaries/es),  [`dictionary-es-mx`](https://github.com/wooorm/dictionaries/es-MX), [`dictionary-fr`](https://github.com/wooorm/dictionaries/fr), and [`dictionary-ru`](https://github.com/wooorm/dictionaries/ru).
