import * as api from "./core/api.js";
import * as html from "./core/html.js";
import * as plugin from "./core/plugin.js";
import * as processing from "./ui/processing.js";
import * as table from "./ui/table.js";
import * as templates from "./ui/templates.js";
// a project needs an index file. It's fine to skip this
// in favor of standard imports against a directory path,
// as does the basic example.
export var Core;
(function (Core) {
    // fairly stable, at least that is the direction of travel
    Core.Project = api.Project;
    Core.SearchQueryType = api.SearchQueryType;
    Core.SearchQuery = api.SearchQuery;
    Core.Search = api.Search;
    Core.SearchResult = api.SearchResult;
    Core.PluginData = api.PluginData;
    Core.HtmlUtils = html.HtmlUtils;
    Core.Plugin = plugin.Plugin;
})(Core || (Core = {}));
export var Ui;
(function (Ui) {
    // unstable, will evolve... but you can freeze whatever, whenever.
    // use this, your own spa framework, or vanilla js. def not required.
    Ui.HtmlProcessingWidget = processing.HtmlProcessingWidget;
    Ui.HtmlResultsTable = table.HtmlResultsTable;
    Ui.Templates = templates.Templates;
})(Ui || (Ui = {}));
