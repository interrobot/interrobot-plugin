"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ui = exports.Core = void 0;
const api = require("./core/api.js");
const html = require("./core/html.js");
const plugin = require("./core/plugin.js");
const processing = require("./ui/processing.js");
const table = require("./ui/table.js");
const templates = require("./ui/templates.js");
// a project needs an index file. It's fine to skip this
// in favor of standard imports against a directory path,
// as does the basic example.
var Core;
(function (Core) {
    Core.Project = api.Project;
    Core.SearchQueryType = api.SearchQueryType;
    Core.SearchQuery = api.SearchQuery;
    Core.Search = api.Search;
    Core.SearchResult = api.SearchResult;
    Core.PluginData = api.PluginData;
    Core.HtmlUtils = html.HtmlUtils;
    Core.Plugin = plugin.Plugin;
})(Core = exports.Core || (exports.Core = {}));
var Ui;
(function (Ui) {
    // unstable, will evolve... but you can freeze whatever, whenever.
    // use this, your own spa framework, or vanillajs. def not required.
    Ui.HtmlProcessingWidget = processing.HtmlProcessingWidget;
    Ui.HtmlResultsTable = table.HtmlResultsTable;
    Ui.Templates = templates.Templates;
})(Ui = exports.Ui || (exports.Ui = {}));
