// when bundled into js, this consolidates all classes into a single
// script src, to be used with classic javascript patterns (imported
// to window).
// used to generate js source used by vanillajs/basic.js

import * as api from "../../../src/ts/core/api.js";
import * as html from "../../../src/ts/core/html.js";
import * as plugin from "../../../src/ts/core/plugin.js";

export namespace Core {
    // stable, at least that is the direction of travel
    export const Project = api.Project;
    export const SearchQueryType = api.SearchQueryType;
    export const SearchQuery = api.SearchQuery;
    export const Search = api.Search;
    export const SearchResult = api.SearchResult;
    export type SearchExecuteOptions = api.SearchExecuteOptions;
    export type SearchResultsOptions = api.SearchResultsOptions;
    export const PluginData = api.PluginData;
    export const HtmlUtils = html.HtmlUtils;
    export const Plugin = plugin.Plugin;
}

(window as any).InterroBot = {
    Core: Core,
};