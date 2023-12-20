import * as api from "./core/api.js";
import * as html from "./core/html.js";
import * as plugin from "./core/plugin.js";
import * as processing from "./ui/processing.js";
import * as table from "./ui/table.js";
import * as templates from "./ui/templates.js";
export declare namespace Core {
    const Project: typeof api.Project;
    const SearchQueryType: typeof api.SearchQueryType;
    const SearchQuery: typeof api.SearchQuery;
    const Search: typeof api.Search;
    const SearchResult: typeof api.SearchResult;
    const PluginData: typeof api.PluginData;
    const HtmlUtils: typeof html.HtmlUtils;
    const Plugin: typeof plugin.Plugin;
}
export declare namespace Ui {
    const HtmlProcessingWidget: typeof processing.HtmlProcessingWidget;
    const HtmlResultsTable: typeof table.HtmlResultsTable;
    const Templates: typeof templates.Templates;
}
