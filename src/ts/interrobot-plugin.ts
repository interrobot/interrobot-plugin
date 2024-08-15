import * as api from "./core/api.js";
import * as html from "./core/html.js";
import * as plugin from "./core/plugin.js";
import * as processing from "./ui/processing.js";
import * as table from "./ui/table.js";
import * as templates from "./ui/templates.js";

// a project needs an index file. It's fine to skip this
// in favor of standard imports against a directory path,
// as does the basic example.

export namespace Core {
    // fairly stable, at least that is the direction of travel
    export const Project = api.Project;
    export const SearchQueryType = api.SearchQueryType;
    export const SearchQuery = api.SearchQuery;
    export const Search = api.Search;
    export const SearchResult = api.SearchResult;
    export const PluginData = api.PluginData;
    export const HtmlUtils = html.HtmlUtils;
    export const Plugin = plugin.Plugin;
}

export namespace Ui {
    // unstable, will evolve... but you can freeze whatever, whenever.
    // use this, your own spa framework, or vanilla js. def not required.
    export const HtmlProcessingWidget = processing.HtmlProcessingWidget;
    export const HtmlResultsTable = table.HtmlResultsTable;
    export const Templates = templates.Templates;
}
