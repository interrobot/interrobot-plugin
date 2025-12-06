(() => {
  // examples/vanillats/js/build/src/ts/core/html.js
  var HtmlUtils = class {
    /**
     * Parses an HTML string into a Document object.
     * @param html - The HTML string to parse.
     * @returns A Document object or null if parsing fails.
     */
    static getDocument(html) {
      html = html.replace(HtmlUtils.styleAttributeRegex, "");
      try {
        return new DOMParser().parseFromString(html, "text/html");
      } catch (ex) {
        console.warn(ex);
      }
    }
    /**
     * Creates a Document object from HTML string with certain elements removed.
     * @param html - The HTML string to parse.
     * @returns A cleaned Document object.
     */
    static getDocumentCleanText(html) {
      let dom = this.getDocument(html);
      if (dom === null) {
        dom = new Document();
      }
      const textUnfriendly = dom.querySelectorAll("script, style, svg, noscript, iframe");
      for (let i = textUnfriendly.length - 1; i >= 0; i--) {
        textUnfriendly[i].parentElement.removeChild(textUnfriendly[i]);
      }
      return dom;
    }
    /**
     * Creates an XPathResult iterator for text nodes in a cleaned HTML document.
     * @param html - The HTML string to parse.
     * @returns An XPathResult iterator for text nodes.
     */
    static getDocumentCleanTextIterator(html) {
      const dom = HtmlUtils.getDocumentCleanText(html);
      const xpath = "//text() | //meta[@name='description']/@content | //@alt";
      const texts = dom.evaluate(xpath, dom, null, XPathResult.ANY_TYPE, null);
      return texts;
    }
    /**
     * Creates an XPathResult iterator for text nodes within a specific element.
     * @param dom - The Document object.
     * @param element - The HTMLElement to search within.
     * @returns An XPathResult iterator for text nodes.
     */
    static getElementTextIterator(dom, element) {
      const xpath = ".//text()";
      const texts = dom.evaluate(xpath, element, null, XPathResult.ANY_TYPE, null);
      return texts;
    }
    /**
     * Extracts text content from a specific element.
     * @param dom - The Document object.
     * @param element - The HTMLElement to extract text from.
     * @returns A string containing the element's text content.
     */
    static getElementTextOnly(dom, element) {
      const xpr = HtmlUtils.getElementTextIterator(dom, element);
      const texts = [];
      let node = xpr.iterateNext();
      while (node) {
        texts.push(node.nodeValue.trim());
        node = xpr.iterateNext();
      }
      return texts.join(" ");
    }
    /**
     * Checks if a string is a valid URL.
     * @param str - The string to check.
     * @returns True if the string is a valid URL, false otherwise.
     */
    static isUrl(str) {
      return URL.canParse(str);
    }
    /**
     * Encodes HTML special characters in a string.
     * @param str - The string to encode.
     * @returns An HTML-encoded string.
     */
    static htmlEncode(str) {
      return new Option(str).innerHTML;
    }
  };
  HtmlUtils.urlsRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_\:]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/g;
  HtmlUtils.urlRegex = /^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_\:]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)$/;
  HtmlUtils.styleAttributeRegex = /style\s*=\s*("([^"]*)"|'([^']*)')/gi;

  // examples/vanillats/js/build/src/ts/core/api.js
  var SearchQueryType;
  (function(SearchQueryType2) {
    SearchQueryType2[SearchQueryType2["Page"] = 0] = "Page";
    SearchQueryType2[SearchQueryType2["Asset"] = 1] = "Asset";
    SearchQueryType2[SearchQueryType2["Any"] = 2] = "Any";
  })(SearchQueryType || (SearchQueryType = {}));
  var SearchQuerySortField;
  (function(SearchQuerySortField2) {
    SearchQuerySortField2[SearchQuerySortField2["Id"] = 0] = "Id";
    SearchQuerySortField2[SearchQuerySortField2["Time"] = 1] = "Time";
    SearchQuerySortField2[SearchQuerySortField2["Status"] = 2] = "Status";
    SearchQuerySortField2[SearchQuerySortField2["Url"] = 3] = "Url";
  })(SearchQuerySortField || (SearchQuerySortField = {}));
  var SearchQuerySortDirection;
  (function(SearchQuerySortDirection2) {
    SearchQuerySortDirection2[SearchQuerySortDirection2["Ascending"] = 0] = "Ascending";
    SearchQuerySortDirection2[SearchQuerySortDirection2["Descending"] = 1] = "Descending";
  })(SearchQuerySortDirection || (SearchQuerySortDirection = {}));
  var PluginData = class {
    /**
     * Creates an instance of PluginData.
     * @param params - PluginDataParams, collection of arguments.
     */
    constructor(params) {
      var _a;
      this.meta = params.meta;
      this.defaultData = params.defaultData;
      this.autoformInputs = (_a = params.autoformInputs) !== null && _a !== void 0 ? _a : [];
      this.project = params.projectId;
      this.data = {
        apiVersion: "1.1",
        autoform: {}
      };
      if (this.data.autoform === null) {
        this.data.autoform = [];
      }
      this.data.autoform[this.project] = {};
      if (this.autoformInputs.length > 0) {
        const changeHandler = async (el) => {
          const name = el.getAttribute("name");
          let value;
          if (el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
            value = el.value;
          } else {
            const hasValue = el.hasAttribute("value");
            if (!hasValue) {
              value = el.checked === void 0 || el.checked === false ? false : true;
            } else {
              value = el.value;
            }
          }
          await this.setAutoformField(name, value);
        };
        const radioHandler = async (el) => {
          let name = el.getAttribute("name");
          const elInput = el;
          const checkedRadios = document.querySelectorAll(`input[type=radio][name=${elInput.name}]:checked`);
          if (checkedRadios.length !== 1) {
            console.error("radio control failure");
            return;
          }
          const value = checkedRadios[0].value;
          await this.setAutoformField(name, value);
        };
        const pipedHandler = async (el) => {
          let name = el.getAttribute("name");
          const elInput = el;
          const checkedCheckboxes = document.querySelectorAll(`input[type=checkbox][name=${elInput.name}]:checked`);
          const piperList = [];
          for (let i = 0; i < checkedCheckboxes.length; i++) {
            piperList.push(checkedCheckboxes[i].value);
          }
          const value = piperList.join("|");
          await this.setAutoformField(name, value);
        };
        for (let el of this.autoformInputs) {
          if (el === null) {
            continue;
          }
          const tag = el.tagName.toLowerCase();
          switch (tag) {
            case "input":
              const input = el;
              if (input.type == "checkbox") {
                const elInput = el;
                const allCheckboxes = document.querySelectorAll(`input[type=checkbox][name=${elInput.name}]`);
                if (allCheckboxes.length === 1) {
                  input.addEventListener("change", async (ev) => {
                    await changeHandler(input);
                  });
                } else if (allCheckboxes.length > 1) {
                  input.addEventListener("change", async (ev) => {
                    await pipedHandler(input);
                  });
                }
              } else if (input.type == "radio") {
                input.addEventListener("change", async (ev) => {
                  await radioHandler(input);
                });
              } else {
                input.addEventListener("change", async (ev) => {
                  await changeHandler(input);
                });
              }
              break;
            case "textarea":
              const textarea = el;
              textarea.addEventListener("change", async (ev) => {
                await changeHandler(textarea);
              });
              textarea.addEventListener("input", async (ev) => {
                await changeHandler(textarea);
              });
              break;
            case "select":
              const select = el;
              select.addEventListener("change", async (ev) => {
                await changeHandler(select);
              });
              break;
            default:
              break;
          }
        }
      }
    }
    /**
     * Sets a data field and optionally updates the data.
     * @param key - The key of the data field to set.
     * @param value - The value to set for the data field.
     * @param push - Whether to update the data after setting the field.
     */
    async setDataField(key, value, push) {
      if (this.data[key] !== value) {
        this.data[key] = value;
      }
      if (push === true) {
        await this.updateData();
      }
    }
    /**
     * Gets the current plugin data.
     * @returns A promise that resolves to the plugin data.
     */
    async getData() {
      if (this.dataLoaded !== null) {
        return this.data;
      } else {
        await this.loadData();
        return this.data;
      }
    }
    /**
     * Loads the plugin data from the server.
     */
    async loadData() {
      var _a, _b, _c;
      let pluginUrl = window.location.href;
      if (pluginUrl === "about:srcdoc") {
        pluginUrl = `/reports/${window.parent.document.getElementById("report").dataset.report}/`;
      }
      const kwargs = {
        "pluginUrl": pluginUrl
      };
      const startTime = (/* @__PURE__ */ new Date()).getTime();
      const result = await Plugin.postApiRequest("GetPluginData", kwargs);
      const endTime = (/* @__PURE__ */ new Date()).getTime();
      try {
        Plugin.logTiming(`Loaded options: ${JSON.stringify(kwargs)}`, endTime - startTime);
        const jsonResponseData = result["data"];
        const jsonResponseDataEmpty = Object.keys(jsonResponseData).length === 0;
        const merged = {};
        for (let k in this.defaultData) {
          const val = this.defaultData[k];
          merged[k] = this.defaultData[k];
        }
        for (let k in jsonResponseData) {
          const val = this.defaultData[k];
          merged[k] = jsonResponseData[k];
        }
        if (jsonResponseDataEmpty) {
          this.data = merged;
          await this.updateData();
        }
        this.data = merged;
        this.dataLoaded = /* @__PURE__ */ new Date();
      } catch {
        console.warn(`failed to load plugin data @ 
${JSON.stringify(kwargs)}`);
      }
      if (this.autoformInputs.length > 0) {
        if (!("autoform" in this.data)) {
          this.data["autoform"] = {};
        } else {
          for (let key in this.data["autoform"]) {
            if (isNaN(parseInt(key, 10))) {
              delete this.data["autoform"][key];
            }
          }
        }
        if (!(this.project in this.data["autoform"])) {
          const defaultProjectData = (_b = (_a = this.defaultData["autoform"]) === null || _a === void 0 ? void 0 : _a[this.project]) !== null && _b !== void 0 ? _b : {};
          this.data["autoform"][this.project] = defaultProjectData;
        }
      }
      const radioGroups = [];
      for (let el of this.autoformInputs) {
        if (el === null) {
          continue;
        }
        const name = el.name;
        const val = (_c = this.data["autoform"][this.project][name]) !== null && _c !== void 0 ? _c : null;
        const lowerTag = el.tagName.toLowerCase();
        let input;
        let isBooleanCheckbox = false;
        let isMultiCheckbox = false;
        let isRadio = false;
        let isSelect = false;
        let isTextarea = false;
        switch (lowerTag) {
          case "input":
            input = el;
            if (input.type === "radio") {
              isRadio = true;
              radioGroups.push(name);
            } else if (input.type === "checkbox" && typeof val === "boolean") {
              isBooleanCheckbox = true;
            } else if (input.type === "checkbox" && typeof val === "string") {
              isMultiCheckbox = true;
            }
            break;
          case "textarea":
            input = el;
            isTextarea = true;
            break;
          case "select":
            input = el;
            isSelect = true;
            break;
          default:
            break;
        }
        if (!input) {
          console.warn(`autoform: no input found`);
          return;
        }
        switch (true) {
          case isRadio:
            input.checked = val === input.value;
            break;
          case isBooleanCheckbox:
            input.checked = val ? val : false;
            break;
          case isMultiCheckbox:
            input.checked = val ? val.toString().indexOf(input.value) >= 0 : false;
            break;
          case isTextarea:
            input.value = val || "";
            break;
          case isSelect:
          default:
            if (val) {
              input.value = val;
            }
            break;
        }
      }
      radioGroups.forEach((inputName) => {
        const hasCheck = document.querySelector(`input[name=${inputName}]:checked`) !== null;
        if (!hasCheck) {
          const firstRadio = document.querySelector(`input[name=${inputName}]`);
          if (firstRadio) {
            firstRadio.checked = true;
          }
        }
      });
      return;
    }
    /**
     * Sets an autoform field and updates the data.
     * @param name - The name of the autoform field.
     * @param value - The value to set for the autoform field.
     */
    async setAutoformField(name, value) {
      var _a, _b;
      const data = await this.getData();
      const autoformData = (_a = data["autoform"]) !== null && _a !== void 0 ? _a : {};
      const projectAutoformData = (_b = autoformData[this.project]) !== null && _b !== void 0 ? _b : {};
      if (projectAutoformData[name] !== value) {
        projectAutoformData[name] = value;
        await this.setDataField("autoform", autoformData, true);
      }
    }
    /**
     * Updates the plugin data on the server.
     */
    async updateData() {
      const data = await this.getData();
      data["meta"] = this.meta;
      const kwargs = {
        pluginUrl: window.location.href,
        pluginData: data
      };
      const result = await Plugin.postApiRequest("SetPluginData", kwargs);
      return;
    }
    /**
     * Gets the data slug for the plugin.
     * @returns The base64 encoded plugin URL.
     */
    getDataSlug() {
      const key = this.getPluginUrl();
      const b64Key = btoa(key);
      return b64Key;
    }
    /**
     * Gets the current plugin URL.
     * @returns The full URL of the plugin.
     */
    getPluginUrl() {
      return `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    }
  };
  var SearchQuery = class {
    /**
     * Creates an instance of SearchQuery.
     * @param params - SearchQueryParams, collection of arguments.
     */
    constructor(params) {
      var _a, _b, _c;
      this.includeExternal = true;
      this.includeNoRobots = false;
      this.project = params.project;
      this.query = params.query;
      this.fields = params.fields;
      this.type = params.type;
      this.includeExternal = (_a = params.includeExternal) !== null && _a !== void 0 ? _a : true;
      this.includeNoRobots = (_b = params.includeNoRobots) !== null && _b !== void 0 ? _b : false;
      this.perPage = (_c = params.perPage) !== null && _c !== void 0 ? _c : SearchQuery.maxPerPage;
      if (SearchQuery.validSorts.indexOf(params.sort) >= 0) {
        this.sort = params.sort;
      } else {
        this.sort = SearchQuery.validSorts[1];
      }
    }
    /**
     * Gets the cache key for the haystack.
     * @returns A string representing the cache key.
     */
    getHaystackCacheKey() {
      return `${this.project}~${this.fields}~${this.type}~${this.includeExternal}~${this.includeNoRobots}`;
    }
  };
  SearchQuery.maxPerPage = 100;
  SearchQuery.validSorts = ["?", "id", "-id", "time", "-time", "status", "-status", "url", "-url"];
  var Search = class {
    /**
     * Executes a search query.
     * @param query - The search query to execute.
     * @param existingResults - Map of existing results.
     * @param processingMessage - Message to display during processing.
     * @param resultHandler - Function to handle each search result.
     * @returns A promise that resolves to a boolean indicating if results were from cache.
     */
    static async execute(query, existingResults, resultHandler, deep = false, quiet = true, processingMessage = "Processing...") {
      const timeStart = (/* @__PURE__ */ new Date()).getTime();
      if (query.getHaystackCacheKey() === Search.resultsHaystackCacheKey && existingResults) {
        const resultTotal2 = existingResults.size;
        if (quiet === false) {
          const eventStart = new CustomEvent("ProcessingMessage", { detail: { action: "set", message: processingMessage } });
          document.dispatchEvent(eventStart);
        }
        await Search.sleep(16);
        let i = 0;
        await existingResults.forEach(async (result, resultId) => {
          await resultHandler(result);
        });
        Plugin.logTiming(`Processed ${resultTotal2.toLocaleString()} search result(s)`, (/* @__PURE__ */ new Date()).getTime() - timeStart);
        if (quiet === false) {
          const msg = { detail: { action: "clear" } };
          const eventFinished = new CustomEvent("ProcessingMessage", msg);
          document.dispatchEvent(eventFinished);
        }
        return true;
      } else {
        Search.resultsHaystackCacheKey = query.getHaystackCacheKey();
        Search.resultsCacheTotal = 0;
      }
      const kwargs = {
        "project": query.project,
        "query": query.query,
        "external": query.includeExternal,
        "type": SearchQueryType[query.type].toLowerCase(),
        "offset": 0,
        "fields": query.fields.split("|"),
        "norobots": query.includeNoRobots,
        "sort": query.sort,
        "perpage": query.perPage
      };
      let responseJson = await Plugin.postApiRequest("GetResources", kwargs);
      const resultTotal = responseJson["__meta__"]["results"]["total"];
      Search.resultsCacheTotal = resultTotal;
      let results = responseJson.results;
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        await Search.handleResult(result, resultTotal, resultHandler);
      }
      while (responseJson["__meta__"]["results"]["pagination"]["nextOffset"] !== null && deep === true) {
        const next = responseJson["__meta__"]["results"]["pagination"]["nextOffset"];
        kwargs["offset"] = next;
        responseJson = await Plugin.postApiRequest("GetResources", kwargs);
        results = responseJson.results;
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          await Search.handleResult(result, resultTotal, resultHandler);
        }
      }
      Plugin.logTiming(`Loaded/processed ${resultTotal.toLocaleString()} search result(s)`, (/* @__PURE__ */ new Date()).getTime() - timeStart);
      return false;
    }
    /**
     * Sleeps for the specified number of milliseconds.
     * @param millis - The number of milliseconds to sleep.
     */
    static async sleep(millis) {
      return new Promise((resolve) => setTimeout(() => resolve(), millis));
    }
    /**
     * Handles a single search result.
     * @param jsonResult - The JSON representation of the search result.
     * @param resultTotal - The total number of results.
     * @param resultHandler - Function to handle the search result.
     */
    static async handleResult(jsonResult, resultTotal, resultHandler) {
      const searchResult = new SearchResult(jsonResult);
      await resultHandler(searchResult);
      const resultNum = searchResult.result;
      const event = new CustomEvent("SearchResultHandled", { detail: { resultNum, resultTotal } });
      document.dispatchEvent(event);
    }
  };
  var SearchResult = class {
    static normalizeContentWords(input) {
      const out = [];
      if (input !== "") {
        out.push.apply(out, input.split(/\s+/));
      }
      return out;
    }
    static normalizeContentString(input) {
      const words = SearchResult.normalizeContentWords(input);
      return words.join(" ");
    }
    /**
     * Creates an instance of SearchResult.
     * @param jsonResult - The JSON representation of the search result.
     */
    constructor(jsonResult) {
      var _a;
      this.optionalFields = [
        "created",
        "modified",
        "size",
        "status",
        "time",
        "norobots",
        "name",
        "type",
        "content",
        "headers",
        "links",
        "assets",
        "origin"
      ];
      this.result = jsonResult.result;
      this.id = jsonResult.id;
      this.url = (_a = jsonResult.url) !== null && _a !== void 0 ? _a : null;
      this.name = jsonResult.name;
      this.processedContent = "";
      for (let field of this.optionalFields) {
        if (field in jsonResult) {
          if (field === "created" || field === "modified") {
            this[field] = new Date(jsonResult[field]);
          } else {
            this[field] = jsonResult[field];
          }
        }
      }
    }
    /**
     * Checks if the result has processed content.
     * @returns True if processed content exists, false otherwise.
     */
    hasProcessedContent() {
      return this.processedContent != "";
    }
    /**
     * Gets the processed content of the search result.
     * @returns The processed content.
     */
    getProcessedContent() {
      return this.processedContent;
    }
    /**
     * Sets the processed content of the search result.
     * @param processedContent - The processed content to set.
     */
    setProcessedContent(processedContent) {
      this.processedContent = processedContent;
    }
    /**
     * Gets the raw content of the search result.
     * @returns The raw content.
     */
    getContent() {
      return this.content;
    }
    /**
     * Gets the content of the search result as text only.
     * @returns The content as plain text.
     */
    getContentTextOnly() {
      const out = [];
      let element = null;
      const texts = HtmlUtils.getDocumentCleanTextIterator(this.getContent());
      element = texts.iterateNext();
      while (element !== null) {
        let elementValue = SearchResult.normalizeContentString(element.nodeValue);
        if (elementValue !== "") {
          const elementValueWords = elementValue.split(" ").filter((word) => word !== "");
          if (elementValueWords.length > 0) {
            out.push.apply(out, elementValueWords);
          }
        }
        element = texts.iterateNext();
      }
      let pageText = out.join(" ");
      pageText = pageText.replace(SearchResult.wordPunctuationRe, "");
      pageText = pageText.replace(SearchResult.wordWhitespaceRe, " ");
      return pageText;
    }
    /**
     * Gets the headers of the search result.
     * @returns The headers.
     */
    getHeaders() {
      return this.headers;
    }
    /**
     * Gets the path of the URL for the search result.
     * @returns The URL path.
     */
    getUrlPath() {
      const url = new URL(this.url);
      return url.pathname;
    }
    /**
     * Clears the full-text fields of the search result.
     */
    clearFulltextFields() {
      this.content = "";
      this.headers = "";
    }
  };
  SearchResult.wordPunctuationRe = /\s+(?=[\.,;:!\?] )/g;
  SearchResult.wordWhitespaceRe = /\s+/g;
  var Crawl = class {
    /**
     * Creates an instance of Crawl.
     * @param params - CrawlParams, collection of arguments.
     */
    constructor(params) {
      this.id = -1;
      this.created = null;
      this.modified = null;
      this.project = -1;
      this.time = -1;
      this.report = null;
      this.id = params.id;
      this.project = params.project;
      this.created = params.created;
      this.modified = params.modified;
      this.complete = params.complete;
      this.time = params.time;
      this.report = params.report;
    }
    /**
     * Gets the timings from the crawl report.
     * @returns The timings object.
     */
    getTimings() {
      return this.getReportDetailByKey("timings");
    }
    /**
     * Gets the sizes from the crawl report.
     * @returns The sizes object.
     */
    getSizes() {
      return this.getReportDetailByKey("sizes");
    }
    /**
     * Gets the counts from the crawl report.
     * @returns The counts object.
     */
    getCounts() {
      return this.getReportDetailByKey("counts");
    }
    getReportDetailByKey(key) {
      if (this.report && this.report.hasOwnProperty("detail") && this.report.detail.hasOwnProperty(key)) {
        return this.report.detail[key];
      } else {
        return null;
      }
    }
  };
  var Project = class {
    /**
     * Creates an instance of Project.
     * @param params - ProjectParams, collection of arguments.
     */
    constructor(params) {
      this.id = -1;
      this.created = null;
      this.modified = null;
      this.name = null;
      this.url = null;
      this.urls = [];
      this.imageDataUri = null;
      this.id = params.id;
      this.created = params.created;
      this.modified = params.modified;
      this.url = params.url;
      this.name = params.name;
      this.imageDataUri = params.imageDataUri;
    }
    /**
     * Gets the data URI of the project image.
     * @returns The image data URI.
     */
    getImageDataUri() {
      return this.imageDataUri;
    }
    /**
     * Gets the display title of the project.
     * @returns The display title (hostname of the project URL).
     */
    getDisplayTitle() {
      if (this.name) {
        return this.name;
      } else if (this.url) {
        Plugin.logWarning(Project.urlDeprectionWarning);
        return new URL(this.url).hostname;
      } else {
        return "[error]";
      }
    }
    getDisplayUrl() {
      if (this.urls) {
        const firstUrl = this.urls[0];
        const urlCount = this.urls.length;
        const more = urlCount > 1 ? ` + ${urlCount - 1} more` : "";
        return `${firstUrl}${more}`;
      } else if (this.url) {
        Plugin.logWarning(Project.urlDeprectionWarning);
        return new URL(this.url).hostname;
      } else {
        return "[error]";
      }
    }
    /**
     * Gets a project by its ID from the API.
     * @param id - The project ID.
     * @returns A promise that resolves to a Project instance, or null if not found.
     */
    static async getApiProject(id) {
      const kwargs = {
        "projects": [id],
        "fields": ["image", "created", "modified"]
      };
      const projects = await Plugin.postApiRequest("GetProjects", kwargs);
      const results = projects.results;
      for (let i = 0; i < results.length; i++) {
        const project = results[i];
        if (project.id === id) {
          const created = new Date(project.created);
          const modified = new Date(project.modified);
          const name = project.name || project.url;
          const imageDataUri = project.image;
          return new Project({
            id,
            created,
            modified,
            name,
            imageDataUri
          });
        }
      }
      return null;
    }
    /**
     * Gets all crawls for a project from the API.
     * @param project - The project ID.
     * @returns A promise that resolves to an array of Crawl instances.
     */
    static async getApiCrawls(project) {
      const kwargs = {
        complete: "complete",
        project,
        fields: ["created", "modified", "report", "time"]
      };
      const response = await Plugin.postApiRequest("GetCrawls", kwargs);
      const crawls = [];
      const crawlResults = response.results;
      for (let i = 0; i < crawlResults.length; i++) {
        const crawlResult = crawlResults[i];
        crawls.push(new Crawl({
          id: crawlResult.id,
          project,
          created: new Date(crawlResult.created),
          modified: new Date(crawlResult.modified),
          complete: crawlResult.complete,
          time: crawlResult.time,
          report: crawlResult.report
        }));
      }
      return crawls;
    }
  };
  Project.urlDeprectionWarning = `"url" field is deprecated, use "name" or "urls" instead.`;

  // examples/vanillats/js/build/src/ts/core/touch.js
  var TouchProxy = class {
    /**
     * Creates a new TouchProxy instance and sets up event listeners.
     */
    constructor() {
      const content = document.body;
      content.addEventListener("touchstart", (ev) => {
        this.proxyToContainer(ev);
      }, { passive: true });
      content.addEventListener("touchend", (ev) => {
        this.proxyToContainer(ev);
      }, { passive: true });
      content.addEventListener("touchmove", (ev) => {
        this.proxyToContainer(ev);
      }, { passive: true });
    }
    /**
     * Proxies touch events to the container iframe.
     * @param ev - The TouchEvent to be proxied.
     */
    async proxyToContainer(ev) {
      var _a;
      let primeTouch;
      let touches = (_a = ev.touches) !== null && _a !== void 0 ? _a : ev.changedTouches;
      if (ev.touches.length === 1) {
        primeTouch = ev.touches[0];
      } else if (ev.changedTouches.length === 1) {
        primeTouch = ev.changedTouches[0];
      } else {
        return;
      }
      const touchData = {
        identifier: null,
        target: null,
        clientX: primeTouch.clientX,
        clientY: primeTouch.clientY,
        pageX: primeTouch.pageX,
        pageY: primeTouch.pageY,
        screenX: primeTouch.screenX,
        screenY: primeTouch.screenY,
        radiusX: primeTouch.radiusX,
        radiusY: primeTouch.radiusY,
        rotationAngle: primeTouch.rotationAngle,
        force: primeTouch.force,
        eventType: ev.type
      };
      const msg = {
        target: "interrobot",
        data: {
          reportTouch: touchData
        }
      };
      window.parent.postMessage(msg, "*");
    }
    async touchEnd(ev) {
    }
    async touchMove(ev) {
    }
  };

  // examples/vanillats/js/build/src/ts/core/plugin.js
  var DarkMode;
  (function(DarkMode2) {
    DarkMode2[DarkMode2["Light"] = 0] = "Light";
    DarkMode2[DarkMode2["Dark"] = 1] = "Dark";
  })(DarkMode || (DarkMode = {}));
  var PluginConnection = class {
    /**
     * Creates a new PluginConnection instance.
     * @param iframeSrc - The source URL of the iframe.
     * @param hostOrigin - The origin of the host (optional).
     */
    constructor(iframeSrc, hostOrigin) {
      this.iframeSrc = iframeSrc;
      if (hostOrigin) {
        this.hostOrigin = hostOrigin;
      } else {
        this.hostOrigin = "";
      }
      const url = new URL(iframeSrc);
      if (iframeSrc === "about:srcdoc") {
        this.pluginOrigin = "about:srcdoc";
      } else {
        this.pluginOrigin = url.origin;
      }
    }
    /**
     * Gets the iframe source URL.
     * @returns The iframe source URL.
     */
    getIframeSrc() {
      return this.iframeSrc;
    }
    /**
     * Gets the host origin.
     * @returns The host origin.
     */
    getHostOrigin() {
      return this.hostOrigin;
    }
    /**
     * Gets the plugin origin.
     * @returns The plugin origin.
     */
    getPluginOrigin() {
      return this.pluginOrigin;
    }
    /**
     * Returns a string representation of the connection.
     * @returns A string describing the host and plugin origins.
     */
    toString() {
      return `host = ${this.hostOrigin}; plugin = ${this.pluginOrigin}`;
    }
  };
  var Plugin = class {
    /**
     * Initializes the plugin class.
     * @param classtype - The class type to initialize.
     * @returns An instance of the initialized class.
     */
    static async initialize(classtype) {
      const createAndConfigure = () => {
        let instance = new classtype();
        Plugin.postMeta(instance.constructor.meta);
        window.addEventListener("load", () => Plugin.postContentHeight());
        window.addEventListener("resize", () => Plugin.postContentHeight());
        return instance;
      };
      if (document.readyState === "complete" || document.readyState === "interactive") {
        return createAndConfigure();
      } else {
        return new Promise((resolve) => {
          document.addEventListener("DOMContentLoaded", () => {
            resolve(createAndConfigure());
          });
        });
      }
    }
    /**
     * Posts the current content height to the parent frame.
     */
    static postContentHeight(constrainTo = null) {
      const mainResults = document.querySelector(".main__results");
      let currentScrollHeight = document.body.scrollHeight;
      if (mainResults) {
        currentScrollHeight = Number(mainResults.getBoundingClientRect().bottom);
      }
      if (currentScrollHeight !== Plugin.contentScrollHeight) {
        const constrainedHeight = constrainTo && constrainTo >= 1 ? Math.min(constrainTo, currentScrollHeight) : currentScrollHeight;
        const msg = {
          target: "interrobot",
          data: {
            reportHeight: constrainedHeight
          }
        };
        Plugin.routeMessage(msg);
      }
    }
    /**
     * Posts a request to open a resource link.
     * @param resource - The resource identifier.
     * @param openInBrowser - Whether to open the link in a browser.
     */
    static postOpenResourceLink(resource, openInBrowser) {
      const msg = {
        target: "interrobot",
        data: {
          reportLink: {
            openInBrowser,
            resource
          }
        }
      };
      Plugin.routeMessage(msg);
    }
    /**
     * Posts plugin metadata to the parent frame.
     * @param meta - The metadata object to post.
     */
    static postMeta(meta) {
      const msg = {
        target: "interrobot",
        data: {
          reportMeta: meta
        }
      };
      Plugin.routeMessage(msg);
    }
    /**
     * Sends an API request to the parent frame.
     * @param apiMethod - The API method to call.
     * @param apiKwargs - The arguments for the API call.
     * @returns A promise that resolves with the API response.
     */
    static async postApiRequest(apiMethod, apiKwargs) {
      let result = null;
      const getPromisedResult = async () => {
        return new Promise((resolve) => {
          const listener = async (ev) => {
            var _a;
            if (ev === void 0) {
              return;
            }
            const evData = ev.data;
            const evDataData = (_a = evData.data) !== null && _a !== void 0 ? _a : {};
            if (evDataData && typeof evDataData === "object" && evDataData.hasOwnProperty("apiResponse")) {
              const resultMethod = evDataData.apiResponse["__meta__"]["request"]["method"];
              if (apiMethod === resultMethod) {
                result = evData.data.apiResponse;
                window.removeEventListener("message", listener);
                resolve();
              } else {
              }
            }
          };
          const msg = {
            target: "interrobot",
            data: {
              apiRequest: {
                method: apiMethod,
                kwargs: apiKwargs
              }
            }
          };
          window.addEventListener("message", listener);
          Plugin.routeMessage(msg);
        });
      };
      await getPromisedResult();
      return result;
    }
    /**
     * Logs timing information to the console.
     * @param msg - The message to log.
     * @param millis - The time in milliseconds.
     */
    static logTiming(msg, millis) {
      const seconds = (millis / 1e3).toFixed(3);
      console.log(`\u{1F916} [${seconds}s] ${msg}`);
    }
    /**
     * Logs warning information to the console.
     * @param msg - The message to log.
     */
    static logWarning(msg) {
      console.warn(`\u{1F916} ${msg}`);
    }
    /**
     * Routes a message to the parent frame.
     * @param msg - The message to route.
     */
    static routeMessage(msg) {
      let parentOrigin = "";
      if (Plugin.connection) {
        parentOrigin = Plugin.connection.getHostOrigin();
        window.parent.postMessage(msg, parentOrigin);
      } else {
        window.parent.postMessage(msg);
      }
    }
    static GetStaticBasePath() {
      function isLinux() {
        if ("userAgentData" in navigator && navigator.userAgentData) {
          const platform = navigator.userAgentData.platform.toLowerCase();
          return platform === "linux";
        } else {
          const ua = navigator.userAgent.toLowerCase();
          if (ua.includes("android"))
            return false;
          if (ua.includes("cros"))
            return false;
          return ua.includes("linux");
        }
      }
      return isLinux() ? "" : "/_content/Interrobot.Common";
    }
    /**
     * Creates a new Plugin instance.
     */
    constructor() {
      this.projectId = -1;
      this.mode = DarkMode.Light;
      let paramProject;
      let paramMode;
      let paramOrigin;
      if (this.parentIsOrigin()) {
        const ifx = window.parent.document.getElementById("report");
        paramProject = parseInt(ifx.dataset.project, 10);
        paramMode = parseInt(ifx.dataset.mode, 10);
        paramOrigin = ifx.dataset.origin;
      } else {
        const urlSearchParams = new URLSearchParams(window.location.search);
        paramProject = parseInt(urlSearchParams.get("project"), 10);
        paramMode = parseInt(urlSearchParams.get("mode"), 10);
        paramOrigin = urlSearchParams.get("origin");
      }
      Plugin.connection = new PluginConnection(document.location.href, paramOrigin);
      if (isNaN(paramProject)) {
        const errorMessage = `missing project url argument`;
        throw new Error(errorMessage);
      }
      this.data = null;
      this.projectId = paramProject;
      this.mode = isNaN(paramMode) || paramMode !== 1 ? DarkMode.Light : DarkMode.Dark;
      Plugin.contentScrollHeight = 0;
      const modeClass = DarkMode[this.mode].toLowerCase();
      document.body.classList.remove("light", "dark");
      document.body.classList.add(modeClass);
      const tp = new TouchProxy();
    }
    /**
     * Introduces a delay in the execution.
     * @param ms - The number of milliseconds to delay.
     * @returns A promise that resolves after the specified delay.
     */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    /**
     * Gets the current mode.
     * @returns The mode (DarkMode.Light, DarkMode.Dark).
     */
    getMode() {
      return this.mode;
    }
    /**
     * Gets the current project ID.
     * @returns The project ID.
     */
    getProjectId() {
      return this.projectId;
    }
    /**
     * Gets the instance meta, the subclassed override data
     * @returns the class meta.
     */
    getInstanceMeta() {
      return this.constructor["meta"];
    }
    /**
     * Initializes the plugin data.
     * @param defaultData - The default data for the plugin.
     * @param autoform - An array of HTML elements for the autoform.
     */
    async initData(defaultData, autoform) {
      this.data = new PluginData({
        projectId: this.getProjectId(),
        meta: this.getInstanceMeta(),
        defaultData,
        autoformInputs: autoform
      });
      await this.data.loadData();
    }
    /**
     * Initializes and returns the plugin data.
     * @param defaultData - The default data for the plugin.
     * @param autoform - An array of HTML elements for the autoform.
     * @returns A promise that resolves with the initialized PluginData.
     */
    async initAndGetData(defaultData, autoform) {
      await this.initData(defaultData, autoform);
      return this.data;
    }
    /**
     * Gets the current project.
     * @returns A promise that resolves with the current Project.
     */
    async getProject() {
      if (this.project === void 0) {
        const project = await Project.getApiProject(this.projectId);
        if (project === null) {
          const errorMessage = `project id=${this.projectId} not found`;
          throw new Error(errorMessage);
        }
        this.project = project;
      }
      return this.project;
    }
    /**
     * Renders HTML content in the document body.
     * @param html - The HTML content to render.
     */
    render(html) {
      document.body.innerHTML = html;
    }
    /**
     * Initializes the plugin index page.
     */
    async index() {
      const project = await Project.getApiProject(this.getProjectId());
      const encodedTitle = HtmlUtils.htmlEncode(project.getDisplayTitle());
      const encodedMetaTitle = HtmlUtils.htmlEncode(Plugin.meta["title"]);
      this.render(`
            <div class="main__heading">
                <div class="main__heading__icon">
                    <img id="projectIcon" src="${project.getImageDataUri()}" alt="Icon for ${encodedTitle}" />
                </div>
                <div class="main__heading__title">
                    <h1>${encodedMetaTitle}</h1>
                    <div><span>${encodedTitle}</span></div>
                </div>
            </div>
            <div class="main__form">
                <p>Welcome, from the index() of the Plugin base-class. This page exists as a placeholder, 
                but in your hands it could be so much more. The Example Report form below will count and 
                present page title terms used across the website, by count.
                It's an example to help get you started.</p>
                <p>If you have any questions, please reach out to the dev via the in-app contact form.</p>
                <form><button>Example Report</button></form>
            </div>
            <div class="main__results"></div>`);
      const button = document.getElementsByTagName("button")[0];
      button.addEventListener("click", async (ev) => {
        await this.process();
      });
    }
    /**
     * Processes the plugin data.
     */
    async process() {
      const titleWords = /* @__PURE__ */ new Map();
      let resultsMap;
      const exampleResultHandler = async (result, titleWordsMap) => {
        const terms = result.name.trim().split(/[\s\-—]+/g);
        for (let term of terms) {
          if (!titleWordsMap.has(term)) {
            titleWordsMap.set(term, 1);
          } else {
            const currentCount = titleWordsMap.get(term);
            titleWordsMap.set(term, currentCount + 1);
          }
        }
      };
      const projectId = this.getProjectId();
      const freeQueryString = "headers: text/html";
      const fields = "name";
      const internalHtmlPagesQuery = new SearchQuery({
        project: projectId,
        query: freeQueryString,
        fields,
        type: SearchQueryType.Any,
        includeExternal: false,
        includeNoRobots: false
      });
      await Search.execute(internalHtmlPagesQuery, resultsMap, async (result) => {
        await exampleResultHandler(result, titleWords);
      }, true, false, "Processing\u2026");
      await this.report(titleWords);
    }
    /**
     * Generates and displays a report based on the processed data.
     * @param titleWords - A map of title words and their counts.
     */
    async report(titleWords) {
      const titleWordsRemap = new Map([...titleWords.entries()].sort((a, b) => {
        const aVal = a[1];
        const bVal = b[1];
        if (aVal === bVal) {
          return a[0].toLowerCase().localeCompare(b[0].toLowerCase());
        } else {
          return bVal - aVal;
        }
      }));
      const tableRows = [];
      for (let term of titleWordsRemap.keys()) {
        const count = titleWordsRemap.get(term);
        const truncatedTerm = term.length > 24 ? term.substring(24) + "\u2026" : term;
        tableRows.push(`<tr><td>${HtmlUtils.htmlEncode(truncatedTerm)}</td><td>${count.toLocaleString()}</td></tr>`);
      }
      const resultsElement = document.querySelector(".main__results");
      resultsElement.innerHTML = tableRows.length === 0 ? `<p>No results found.</p>` : `<div><section><table style="max-width:340px">
            <thead><tr><th>Term</th><th>Count</th></tr></thead>
            <tbody>${tableRows.join("")}</tbody>
            </table></section></div>`;
      Plugin.postContentHeight();
    }
    parentIsOrigin() {
      try {
        if (!window.parent || window.parent === window) {
          return false;
        }
        let parentDocument = window.parent.document;
        if (!parentDocument) {
          return false;
        }
        return !parentDocument.hidden;
      } catch {
        return false;
      }
    }
  };
  Plugin.meta = {
    "title": "InterroBot Base Plugin",
    "category": "Example",
    "version": "1.0",
    "author": "InterroBot",
    "description": `Welcome to InterroBot plugin development. This base-class Plugin can already 
        query the database, draw conclusions, and report back. It's just few tweaks away from being 
        your own creation.

This is the default plugin description. Set meta: {} values
        in the source to update these display values.`
  };

  // examples/vanillats/js/build/examples/vanillats/ts/hypertree.js
  var HypertreeUi = class {
    static setMode(mode) {
      HypertreeUi.mode = mode;
    }
    static status2Class(status) {
      if (status < 0) {
        return "disabled";
      } else if (status > 0 && status < 400) {
        return "ok";
      } else if (status >= 400 && status < 500) {
        return "warn";
      } else {
        return "error";
      }
    }
    static status2Color(status) {
      const className = HypertreeUi.status2Class(status);
      let classColorMap = {};
      if (HypertreeUi.mode === DarkMode.Dark) {
        classColorMap = {
          disabled: "#666666",
          ok: "#00a0df",
          warn: "#babe42",
          error: "#d5350a"
        };
      } else {
        classColorMap = {
          disabled: "#666666",
          ok: "#0592b2",
          warn: "#bf8600",
          error: "#d53a0a"
        };
      }
      return classColorMap[className];
    }
    static type2Char(type) {
      if (type in HypertreeUi.charItMap) {
        return HypertreeUi.charItMap[type];
      } else {
        return HypertreeUi.charItMap["html"];
      }
    }
  };
  HypertreeUi.mode = DarkMode.Dark;
  HypertreeUi.charItMap = {
    img: "i",
    css: "c",
    script: "s",
    html: "h",
    style: "c",
    video: "v",
    audio: "a",
    rss: "y",
    iframe: "f",
    blob: "b"
  };
  var Hypertree = class extends Plugin {
    static escapeRegExp(pattern) {
      return pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    getNonResultUniqueId() {
      return --this.nonResultId;
    }
    constructor() {
      super();
      this.nonResultId = 0;
      this.resultsMap = /* @__PURE__ */ new Map();
      this.resultUrlMap = /* @__PURE__ */ new Map();
      this.renderedIds = [];
      this.currentDetailId = -1;
      this.currentSearchIndex = -1;
      this.isNavigating = false;
      this.searchNavigationQueue = Promise.resolve();
      this.index();
    }
    async index() {
      HypertreeUi.setMode(this.getMode());
      hyt.status2Class = HypertreeUi.status2Class;
      hyt.status2Color = HypertreeUi.status2Color;
      hyt.type2Char = HypertreeUi.type2Char;
      const defaultData = {};
      const project = await Project.getApiProject(this.getProjectId());
      const query = new SearchQuery({
        project: this.getProjectId(),
        query: "norobots: false AND redirect: false",
        fields: "name|status|type",
        type: SearchQueryType.Any,
        includeExternal: false,
        includeNoRobots: true
      });
      this.component = new hyt.Hypertree({ parent: document.body }, {
        dataloader: this.fromApi(query),
        langloader: this.fromUndefinedLangauge(),
        langInitBFS: (ht, n) => {
          const id = n.data.name;
          n.precalc.label = id;
          n.precalc.icon = "";
        },
        filter: {
          maxlabels: 12
        },
        geometry: {
          captionFont: "12px Montserrat",
          captionHeight: 0.09
        }
      });
      await this.component.initPromise.then(() => new Promise((ok, err) => this.component.animateUp(ok, err))).then(() => this.component.drawDetailFrame());
      this.searchDialog = await this.generateSearchDialog();
      document.addEventListener("hypertreeDetail", async (ev) => {
        await this.openDetail(ev);
      });
      document.addEventListener("hypertreeUpdated", async (ev) => {
        const focusedInput = document.querySelector("input:focus");
        if (focusedInput && focusedInput.name === "query") {
          console.log("close query");
          this.searchDialog.close();
          window.requestAnimationFrame(() => {
            focusedInput.blur();
          });
        } else {
          const focusedButton = document.querySelector("button:focus");
          if (focusedButton !== null) {
            await this.closeDetail(false);
          }
        }
      });
      document.addEventListener("hypertreePanic", async (ev) => {
        await this.openDialog(this.panicDialog);
      });
      this.resultDialog = this.generateResultDialog();
      this.panicDialog = this.generatePanicDialog();
      window.addEventListener("resize", (ev) => {
        const dialogsHrs = document.querySelectorAll("dialog hr");
        dialogsHrs.forEach((element) => {
          var _a;
          (_a = element.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(element);
        });
        Plugin.postContentHeight(window.innerWidth);
      });
      document.addEventListener("keydown", async (ev) => {
        switch (ev.key) {
          case "`":
            ev.preventDefault();
            await this.openDialog(this.searchDialog);
            break;
          case "ArrowLeft":
          case "ArrowRight":
            if (this.resultDialog.hasAttribute("open")) {
              const currentButton = this.resultDialog.querySelector("button:focus");
              if (currentButton) {
                const nextButton = currentButton.nextElementSibling;
                const prevButton = currentButton.previousElementSibling;
                if ((nextButton === null || nextButton === void 0 ? void 0 : nextButton.tagName) === "BUTTON") {
                  nextButton.focus();
                } else if ((prevButton === null || prevButton === void 0 ? void 0 : prevButton.tagName) === "BUTTON") {
                  prevButton.focus();
                }
              }
            }
            break;
          case "ArrowUp":
            if (this.searchDialog.hasAttribute("open")) {
              this.focusPreviousSearchDialogResult();
            }
            break;
          case "ArrowDown":
            if (this.searchDialog.hasAttribute("open")) {
              this.focusNextSearchDialogResult();
            }
            break;
          case "Escape":
            if (this.resultDialog.hasAttribute("open")) {
              await this.closeDetail(true);
            }
            if (this.searchDialog.hasAttribute("open")) {
              await this.closeDialog(this.searchDialog);
              this.searchDialog.querySelector("input[type=text]").blur();
            }
            break;
          default:
            break;
        }
      });
      Plugin.postContentHeight(window.innerWidth);
    }
    clearMaps() {
      this.resultsMap.clear();
      this.resultUrlMap.clear();
      this.renderedIds = [];
    }
    findNodeById(root, targetId) {
      if (!root) {
        return null;
      }
      if (root["data"] && root["data"]["interrobotId"] === targetId) {
        return root;
      }
      if (root["children"] && Array.isArray(root["children"])) {
        for (const child of root["children"]) {
          const result = this.findNodeById(child, targetId);
          if (result) {
            return result;
          }
        }
      }
      return null;
    }
    generateResultDialog() {
      const dialog = document.createElement("dialog");
      dialog.setAttribute("id", Hypertree.resultDialogId);
      document.body.appendChild(dialog);
      return dialog;
    }
    async handleSearchResultClick(ev, hitId) {
      var _a;
      (_a = this.searchDialog.querySelector("input")) === null || _a === void 0 ? void 0 : _a.blur();
      this.searchDialog.close();
      this.searchNavigationQueue = this.searchNavigationQueue.then(async () => {
        this.isNavigating = true;
        try {
          this.isNavigating = true;
          ev.preventDefault();
          await this.component.initPromise.then(() => this.component.drawDetailFrame()).then(() => this.component.unitdisk.update.transformation()).then(() => new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 120;
            const checkNode = () => {
              var _a2;
              attempts++;
              const resultNode2 = this.findNodeById(this.component.data, hitId);
              if ((resultNode2 === null || resultNode2 === void 0 ? void 0 : resultNode2.layout) === null) {
                this.component.updateLayoutPath_(resultNode2);
              }
              if ((_a2 = resultNode2 === null || resultNode2 === void 0 ? void 0 : resultNode2.layout) === null || _a2 === void 0 ? void 0 : _a2.z) {
                resolve(resultNode2);
              } else if (attempts > maxAttempts) {
                this.component.transition = null;
                this.component.unitdisk.update.transformation();
                return reject(new Error("failed checkNode after maximum attempts"));
              } else {
                requestAnimationFrame(checkNode);
              }
            };
            checkNode();
          })).then((resultNode2) => new Promise((resolve, reject) => {
            if ((resultNode2 === null || resultNode2 === void 0 ? void 0 : resultNode2.layout) === null) {
              this.component.updateLayoutPath_(resultNode2);
            }
            this.component.api.gotoNode(resultNode2);
            let attempts = 0;
            const maxAttempts = 120;
            const checkAnimation = () => {
              attempts++;
              if (attempts > maxAttempts) {
                this.component.transition = null;
                this.component.unitdisk.update.transformation();
                return reject(new Error("failed checkAnimation after maximum attempts"));
              }
              if (!this.component.transition) {
                resolve(resultNode2);
              } else {
                requestAnimationFrame(checkAnimation);
              }
            };
            checkAnimation();
          })).then(() => this.component.api.goto\u03BB(0.25)).catch((error) => {
            console.error("navigation failed or interrupted:", error);
          });
          this.isNavigating = false;
          this.component.update.data();
          const resultNode = this.findNodeById(this.component.data, hitId);
          if ((resultNode === null || resultNode === void 0 ? void 0 : resultNode.layout) === null) {
            this.component.updateLayoutPath_(resultNode);
          }
          const detailEvent = new CustomEvent("hypertreeDetail", {
            detail: {
              id: resultNode.data.interrobotId,
              timestamp: Date.now()
            }
          });
          document.dispatchEvent(detailEvent);
        } finally {
          this.isNavigating = false;
        }
      });
    }
    async generateSearchDialog() {
      const dialog = document.createElement("dialog");
      dialog.setAttribute("id", Hypertree.searchDialogId);
      document.body.appendChild(dialog);
      dialog.innerHTML = `
        <div class="message fadeIn">
            <form id="HypertreeForm">
                <div class="message__search">
                    <input type="text" name="query" value="" placeholder="Search by title and/or URL"
                        spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"/>
                    <button><span class="icon">%</span></button>
                    <input type="hidden" name="nodes" value=""/>
                </div>
                <div class="message__results__meta">
                    <!-- e.g. Found 120. Showing 1-5 and errors -->
                </div>
                <div id="${Hypertree.searchResultsDialogId}" class="message__results"></div>
            </form>
        <div>`;
      const queryButton = dialog.querySelector("button");
      const queryInput = dialog.querySelector("input[name=query]");
      const nodesInput = dialog.querySelector("input[name=nodes]");
      const defaultData = {};
      const autoformFields = [queryInput, nodesInput];
      await this.initData(defaultData, autoformFields);
      const relinks = nodesInput.value.split(",").map(Number);
      relinks.forEach((relink) => {
        const resultNode = this.findNodeById(this.component.data, relink);
        if (resultNode && !this.component.args.objects.selections.includes(resultNode)) {
          this.component.api.toggleSelection(resultNode);
        }
      });
      queryButton === null || queryButton === void 0 ? void 0 : queryButton.addEventListener("click", (ev) => {
        ev.preventDefault();
        this.closeDialog(this.searchDialog);
      });
      queryInput === null || queryInput === void 0 ? void 0 : queryInput.addEventListener("focus", async (ev) => {
        await this.openDialog(this.searchDialog);
      });
      queryInput === null || queryInput === void 0 ? void 0 : queryInput.addEventListener("click", async (ev) => {
        await this.openDialog(this.searchDialog);
      });
      queryInput === null || queryInput === void 0 ? void 0 : queryInput.addEventListener("keyup", async (ev) => {
        await this.openDialog(this.searchDialog);
      });
      const searchInput = dialog.querySelector("input[name=query]");
      if (searchInput !== null) {
        searchInput.addEventListener("keyup", async (ev) => {
          ev.preventDefault();
          const queryString = searchInput.value.toLocaleLowerCase();
          let hits = [];
          const startsWithQuery = new RegExp(`^${Hypertree.escapeRegExp(queryString)}`, "i");
          const bordersQuery = new RegExp(`\b${Hypertree.escapeRegExp(queryString)}`, "i");
          const containsQuery = new RegExp(`${Hypertree.escapeRegExp(queryString)}`, "i");
          for (const [resultId, result] of this.resultsMap) {
            result.sort = -1;
            if (result.status.toString() === queryString) {
              result.sort = 70;
            } else if (startsWithQuery.test(result.name)) {
              result.sort = 60;
            } else if (bordersQuery.test(result.name)) {
              result.sort = 50;
            } else if (containsQuery.test(result.name)) {
              result.sort = 40;
            } else if (startsWithQuery.test(result.url)) {
              result.sort = 30;
            } else if (containsQuery.test(result.url)) {
              result.sort = 20;
            }
            if (result.sort >= 20 && this.renderedIds.indexOf(result.id) >= 0) {
              hits.push(result);
            }
          }
          hits.sort((a, b) => {
            var _a, _b;
            const sortDiff = ((_a = b.sort) !== null && _a !== void 0 ? _a : 0) - ((_b = a.sort) !== null && _b !== void 0 ? _b : 0);
            if (sortDiff !== 0) {
              return sortDiff;
            }
            const typeDiff = a.type.localeCompare(b.type);
            if (typeDiff !== 0) {
              return typeDiff;
            }
            return a.name.localeCompare(b.name);
          });
          const totalHits = hits.length;
          const isEmptyQuery = queryString.trim() === "";
          hits = hits.slice(0, 5);
          const metaElement = dialog.querySelector(".message__results__meta");
          if (metaElement && !isEmptyQuery) {
            metaElement.innerHTML = `Found <strong>${totalHits.toLocaleString()}</strong> results.
                        ${totalHits === 0 ? "" : "Showing  1\u2013" + hits.length}`;
          } else if (metaElement) {
            metaElement.innerHTML = ``;
          }
          const resultsDiv = document.getElementById(Hypertree.searchResultsDialogId);
          resultsDiv.innerHTML = ``;
          if (queryString.trim() === "") {
            return;
          }
          const highlights = new RegExp(`${Hypertree.escapeRegExp(queryString)}`, "gi");
          const highlight = (text) => {
            return text.replace(highlights, "<mark>$&</mark>");
          };
          const fragment = document.createDocumentFragment();
          for (let i = 0; i < hits.length; i++) {
            const resultEl = document.createElement("a");
            const hit = hits[i];
            const hitId = hit.id;
            const truncatedUrl = new URL(hit.url).pathname;
            resultEl.classList.add("result");
            resultEl.href = "#";
            resultEl.innerHTML = `<div class="result__name">${highlight(hit.name)}</div>
                        <div class="result__url">${highlight(truncatedUrl)}</div>`;
            resultEl.addEventListener("click", async (ev2) => {
              this.handleSearchResultClick(ev2, hitId);
            });
            fragment.appendChild(resultEl);
          }
          resultsDiv === null || resultsDiv === void 0 ? void 0 : resultsDiv.append(fragment);
        });
      }
      return dialog;
    }
    generatePanicDialog() {
      var _a;
      const dialog = document.createElement("dialog");
      dialog.setAttribute("id", Hypertree.panicDialogId);
      document.body.appendChild(dialog);
      dialog.innerHTML = `
        <div class="message">
            <h2 class="message__title">Out of bounds. Unrecoverable.</h2>
            <div class="message__link">You've flown too close to the sun. The edges of the map
                can be tricky, avoid zooming into voids.</div>
            <div class="message__buttons"><button>Reload</button></div>
        <div>`;
      (_a = dialog.querySelector("button")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", async (ev) => {
        this.panicDialog.close();
        await this.component.initPromise.then(() => new Promise((ok, err) => this.component.animateUp(ok, err))).then(() => this.component.drawDetailFrame()).then(() => this.component.unitdisk.update.transformation()).then(() => this.component.api.goto\u03BB(0.25));
      });
      return dialog;
    }
    getDialogs() {
      return [this.panicDialog, this.resultDialog, this.searchDialog];
    }
    async openDialog(targetDialog) {
      this.resultDialog.classList.remove("fadeOut");
      const dialogClosePromises = this.getDialogs().filter((dialog) => dialog !== targetDialog && dialog.hasAttribute("open")).map(async (dialog) => {
        if (dialog.id === Hypertree.resultDialogId) {
          await this.closeDetail(true);
        } else {
          dialog.close();
        }
      });
      await Promise.all(dialogClosePromises);
      if (!targetDialog.hasAttribute("open")) {
        targetDialog.show();
        if (targetDialog.id === Hypertree.searchDialogId) {
          this.currentSearchIndex = -1;
          const searchInput = targetDialog.querySelector("input[name=query]");
          searchInput === null || searchInput === void 0 ? void 0 : searchInput.dispatchEvent(new Event("keyup", { bubbles: false }));
        }
      }
    }
    closeDialog(targetDialog) {
      this.getDialogs().forEach((dialog) => {
        if (dialog.hasAttribute("open")) {
          dialog.close();
        }
      });
    }
    focusSearchDialogResult(inc) {
      const results = this.searchDialog.querySelectorAll(".result");
      const searchInput = this.searchDialog.querySelector("input[name=query]");
      if (!this.searchDialog.hasAttribute("open")) {
        this.currentSearchIndex = -1;
        searchInput.focus();
        window.requestAnimationFrame(() => {
          searchInput.select();
        });
      } else if (results.length === 0) {
        return;
      }
      this.currentSearchIndex += inc;
      if (this.currentSearchIndex === -2) {
        this.currentSearchIndex = results.length - 1;
      }
      if (this.currentSearchIndex >= results.length || this.currentSearchIndex < 0) {
        this.currentSearchIndex = -1;
        searchInput.focus();
        window.requestAnimationFrame(() => {
          searchInput.select();
        });
        return;
      }
      results[this.currentSearchIndex].focus();
    }
    focusPreviousSearchDialogResult() {
      this.focusSearchDialogResult(-1);
    }
    focusNextSearchDialogResult() {
      this.focusSearchDialogResult(1);
    }
    async updateAutoformNodes() {
      const activeIds = [];
      const selections = [...this.component.args.objects.selections];
      selections.sort((a, b) => {
        return a.data["interrobotStatus"] - b.data["interrobotStatus"];
      });
      selections.forEach((selection) => {
        const result = selection.data["interrobotId"];
        if (result >= 0) {
          activeIds.push(result);
        }
      });
      const nodesVal = activeIds.join(",");
      await this.data.setAutoformField("nodes", nodesVal);
    }
    async openDetail(ev) {
      var _a;
      const result = (_a = this.resultsMap.get(ev.detail.id)) !== null && _a !== void 0 ? _a : null;
      if (result === null) {
        return;
      }
      const tempMsg = this.resultDialog.querySelector(".message");
      tempMsg === null || tempMsg === void 0 ? void 0 : tempMsg.classList.remove("fadeIn", "fadeOut");
      const tempHrs = this.resultDialog.querySelectorAll("hr.line");
      tempHrs.forEach((hr) => {
        hr === null || hr === void 0 ? void 0 : hr.classList.remove("fadeIn", "fadeOut");
      });
      if (this.resultDialog.hasAttribute("open") && result && result.id === this.currentDetailId) {
        await this.closeDetail(false);
        console.log(result);
        return;
      }
      const detailHtml = `
        <div class="message fadeIn">
            <h2 class="message__title"><span class="status">${result.status}</span>
                <span class="type">${HypertreeUi.type2Char(result.type)}</span>
                ${HtmlUtils.htmlEncode(result.name)}</h2>
            <div class="message__link">
                <a data-id="${result.id}" href="${HtmlUtils.htmlEncode(result.url)}">
                    ${HtmlUtils.htmlEncode(result.url)}</a>
            </div>
            <div class="message__buttons">
                <button>Cancel</button>
                <button>Add Path</button>
            </div>
        </div>`;
      if (result && detailHtml) {
        const activeIds = [];
        const selections = this.component.args.objects.selections;
        selections.forEach((selection) => {
          activeIds.push(selection.data["interrobotId"]);
        });
        if (activeIds.indexOf(result.id) >= 0) {
        }
        this.resultDialog.innerHTML = detailHtml;
        const resultNode = this.findNodeById(this.component.data, result.id);
        if (!this.component.args.objects.selections.includes(resultNode)) {
          this.component.api.toggleSelection(resultNode);
        }
        const buttons = this.resultDialog.querySelectorAll("button");
        const cancel = buttons[0];
        if (cancel) {
          cancel.addEventListener("click", async (ev2) => {
            ev2.preventDefault();
            await this.closeDetail(true);
          });
        }
        const addPath = buttons[1];
        if (addPath) {
          addPath.addEventListener("click", async (ev2) => {
            ev2.preventDefault();
            await this.closeDetail(false);
          });
          window.setTimeout(() => addPath.focus(), 10);
        }
        const detailLink = this.resultDialog.querySelector("a");
        detailLink === null || detailLink === void 0 ? void 0 : detailLink.addEventListener("click", (ev2) => {
          var _a2, _b;
          ev2.preventDefault();
          const pageId = (_b = parseInt((_a2 = detailLink.dataset.id) !== null && _a2 !== void 0 ? _a2 : "0", 10)) !== null && _b !== void 0 ? _b : 0;
          Plugin.postOpenResourceLink(pageId, true);
        });
        await this.openDialog(this.resultDialog);
        this.resultDialog.classList.remove("ok", "error", "warn", "disabled");
        this.resultDialog.classList.add(HypertreeUi.status2Class(result.status));
        this.currentDetailId = result.id;
        const hit = document.getElementById(`result${result.id}`);
        const dialogBounds = this.resultDialog.getBoundingClientRect();
        if (hit !== null) {
          const hitBounds = hit.getBoundingClientRect();
          const hitBoundsX = hitBounds.left + hitBounds.width / 2;
          const hitBoundsY = hitBounds.top + hitBounds.height / 2;
          const getDistance = (p1x, p1y, p2x, p2y) => {
            return Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2));
          };
          const corners = ["lt", "rt", "lb", "rb"];
          if (!(hitBounds.left === 0 && hitBounds.top === 0)) {
            corners.forEach((corner) => {
              const hr = document.createElement("hr");
              hr.setAttribute("class", `line ${corner}`);
              this.resultDialog.append(hr);
              const dialogPointX = corner[0] === "l" ? dialogBounds.x : dialogBounds.x + dialogBounds.width;
              const dialogPointY = corner[1] === "t" ? dialogBounds.y : dialogBounds.y + dialogBounds.height;
              const distance = getDistance(dialogPointX, dialogPointY, hitBoundsX, hitBoundsY);
              let angle = 0;
              if (corner[0] === "l") {
                angle = Math.atan2(
                  // left side, left anchored
                  hitBoundsY - dialogPointY,
                  hitBoundsX - dialogPointX
                ) * (180 / Math.PI);
              } else {
                angle = Math.atan2(
                  // right side, right anchored
                  dialogPointY - hitBoundsY,
                  dialogPointX - hitBoundsX
                ) * (180 / Math.PI);
              }
              hr.style.width = `${distance}px`;
              hr.style.transform = `rotate(${angle}deg)`;
            });
          }
        }
      } else {
        await this.closeDetail(false);
      }
    }
    async closeDetail(cancelAddPath) {
      if (this.isNavigating) {
        return;
      }
      if (cancelAddPath === true) {
        const selections = this.component.args.objects.selections;
        const node = selections.length > 0 ? selections[selections.length - 1] : null;
        if (node) {
          this.component.api.toggleSelection(node);
        }
      }
      await this.updateAutoformNodes();
      const msg = this.resultDialog.querySelector(".message");
      msg === null || msg === void 0 ? void 0 : msg.classList.remove("fadeIn");
      msg === null || msg === void 0 ? void 0 : msg.classList.add("fadeOut");
      const hrs = this.resultDialog.querySelectorAll("hr.line");
      hrs.forEach((hr) => {
        hr.classList.add("fadeOut");
      });
      this.currentDetailId = -1;
      this.closeDialog(this.resultDialog);
      const query = this.searchDialog.querySelector("input[name=query]");
      query === null || query === void 0 ? void 0 : query.blur();
    }
    fromUndefinedLangauge() {
      return (callback) => {
        const t0 = performance.now();
        callback({}, t0, 0);
      };
    }
    truncateTitle(title) {
      const maxLength = 36;
      if (title.length <= maxLength) {
        return title;
      }
      const words = title.split(" ");
      let result = words[0];
      for (let i = 1; i < words.length; i++) {
        const nextResult = result + " " + words[i];
        if (nextResult.length <= maxLength) {
          result = nextResult;
        } else {
          break;
        }
      }
      return result + "\u2026";
    }
    getResultStem(id, name, slug, status, type, children) {
      return {
        "name": `${this.truncateTitle(name ? name : slug)}`,
        "numLeafs": children.length,
        "interrobotId": id,
        "interrobotType": type,
        "interrobotStatus": status,
        "children": children
      };
    }
    gatherResultsBranches(root, baseUrl, renderedIds) {
      var _a;
      const seedObjects = [];
      const rootKeys = Object.keys(root);
      for (let i = 0; i < rootKeys.length; i++) {
        const rootKey = rootKeys[i];
        if (rootKey === "__meta__") {
          continue;
        }
        const rootChild = root[rootKey];
        const resultUrl = (_a = rootChild === null || rootChild === void 0 ? void 0 : rootChild.__meta__) === null || _a === void 0 ? void 0 : _a.url;
        let result = this.resultUrlMap.get(this.normalizeUrl(resultUrl));
        const resultHit = result !== void 0;
        if (result !== void 0) {
          const children = this.gatherResultsBranches(rootChild, result.url, renderedIds);
          if (children.length === 0) {
            seedObjects.push(this.getResultStem(result.id, "", "", result.status, result.type, children));
          } else {
            seedObjects.push(this.getResultStem(result.id, result.name, rootKeys[i], result.status, result.type, children));
          }
          if (renderedIds.indexOf(result.id) === -1) {
            renderedIds.push(result.id);
          }
        } else {
          const children = this.gatherResultsBranches(rootChild, resultUrl, renderedIds);
          seedObjects.push(this.getResultStem(this.getNonResultUniqueId(), `./${rootKey}`, rootKey, -400, "dir", children));
        }
      }
      seedObjects.sort((a, b) => {
        return a["interrobotType"].localeCompare(b["interrobotType"]) || a["interrobotStatus"] - b["interrobotStatus"];
      });
      return seedObjects;
    }
    normalizeUrl(url) {
      try {
        const urlObj = new URL(url);
        return `${urlObj.origin}${urlObj.pathname}`;
      } catch (e) {
        return url.split(/[?#]/)[0];
      }
    }
    async gatherResults(query) {
      this.clearMaps();
      const projectUrl = (await this.getProject()).url;
      const gatheredUrls = [];
      let projectHitId = -1;
      let seedObject = {};
      await Search.execute(query, this.resultsMap, async (result) => {
        const rUrl = result.url;
        if (gatheredUrls.indexOf(rUrl) >= 0) {
          return;
        }
        gatheredUrls.push(rUrl);
        const rId = result.id;
        if (rUrl === projectUrl) {
          projectHitId = rId;
        }
        this.resultsMap.set(rId, result);
        this.resultUrlMap.set(this.normalizeUrl(rUrl), result);
      }, true, false, "Rendering\u2026");
      if (projectHitId === -1) {
        return {};
      }
      const firstHit = this.resultsMap.get(projectHitId);
      if (firstHit === void 0) {
        return {};
      }
      const resultUrlMapKeys = [...this.resultUrlMap.keys()];
      resultUrlMapKeys.sort();
      const root = { __meta__: { url: this.normalizeUrl(firstHit.url) } };
      for (const url of resultUrlMapKeys) {
        const urlProper = new URL(url);
        const origin = urlProper.origin;
        const segments = urlProper.pathname.split("/").filter((seg) => seg);
        const segmentsLen = segments.length;
        const cycled = [];
        let current = root;
        segments.forEach((segment, i) => {
          cycled.push(segment);
          if (segmentsLen - 1 === i) {
            if (!current[segment]) {
              current[segment] = { __meta__: { url } };
            }
          } else {
            if (!current[segment]) {
              current[segment] = { __meta__: { url: `${origin}/${cycled.join("/")}/` } };
            }
          }
          current = current[segment];
        });
      }
      const renderedIds = [];
      const children = this.gatherResultsBranches(root, firstHit.url, renderedIds);
      this.renderedIds = renderedIds;
      seedObject = this.getResultStem(firstHit === null || firstHit === void 0 ? void 0 : firstHit.id, new URL(firstHit.url).hostname, "", firstHit === null || firstHit === void 0 ? void 0 : firstHit.status, firstHit === null || firstHit === void 0 ? void 0 : firstHit.type, children);
      return seedObject;
    }
    fromApi(query) {
      return (callback) => {
        const t0 = performance.now();
        this.gatherResults(query).then((results) => {
          callback(results, t0, 0);
        }).catch((error) => {
          console.error("Error gathering results:", error);
          callback({}, performance.now(), 0);
        });
      };
    }
  };
  Hypertree.meta = {
    "title": "Website Hypertree",
    "category": "Visualization",
    "version": "1.0.1",
    "author": "InterroBot",
    "synopsis": `create a hypertree from website content`,
    "description": `Get a new, uniquely hyperbolic perspective on your website\u2014your
            web hierarchy projected on a Poincar\xE9 disc. 


            Hyperbolic trees display large hierarchies more effectively than traditional
            layouts because hyperbolic space grows exponentially. Knock out this details tab
            for even more projection area, and work the wheel-zoom to navigate
            depth.
            


            InterroBot Website Hypertree utilizes the d3 and d3-hypertree open-source visualization
             libraries to bring your website to life.`
  };
  Hypertree.resultDialogId = "ResultDialog";
  Hypertree.panicDialogId = "PanicDialog";
  Hypertree.searchDialogId = "SearchDialog";
  Hypertree.searchResultsDialogId = "SearchDialogResults";
  Plugin.initialize(Hypertree);
})();
