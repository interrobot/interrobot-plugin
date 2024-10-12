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
      return str.match(HtmlUtils.urlRegex) !== null;
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
  var PluginData = class {
    /**
     * Creates an instance of PluginData.
     * @param projectId - The ID of the project.
     * @param meta - Metadata for the plugin.
     * @param defaultData - Default data for the plugin.
     * @param autoformInputs - Array of HTML elements for autoform inputs.
     */
    constructor(projectId, meta, defaultData, autoformInputs) {
      this.meta = meta;
      this.defaultData = defaultData;
      this.autoformInputs = autoformInputs;
      this.project = projectId;
      this.data = {
        apiVersion: "1.1",
        autoform: {}
      };
      if (this.data.autoform === null) {
        this.data.autoform = [];
      }
      this.data.autoform[this.project] = {};
      if (autoformInputs.length > 0) {
        const changeHandler = async (el) => {
          let name = el.getAttribute("name");
          const value = el.checked === void 0 || el.checked === false ? el.value : el.checked;
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
      var _a;
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
        const defaultProjectData = {};
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
          this.data["autoform"][this.project] = defaultProjectData;
        }
      }
      const radioGroups = [];
      for (let el of this.autoformInputs) {
        if (el === null) {
          continue;
        }
        const name = el.name;
        const val = (_a = this.data["autoform"][this.project][name]) !== null && _a !== void 0 ? _a : null;
        const lowerTag = el.tagName.toLowerCase();
        let input;
        let isBooleanCheckbox = false;
        let isMultiCheckbox = false;
        let isRadio = false;
        let isSelect = false;
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
     * @param project - The project ID.
     * @param query - The search query string.
     * @param fields - The fields to search in.
     * @param type - The type of search query.
     * @param includeExternal - Whether to include external results.
     */
    constructor(project, query, fields, type, includeExternal) {
      this.project = project;
      this.query = query;
      this.fields = fields;
      this.type = type;
      this.includeExternal = includeExternal;
    }
    /**
     * Gets the cache key for the haystack.
     * @returns A string representing the cache key.
     */
    getHaystackCacheKey() {
      return `${this.project}~${this.fields}~${this.type}~${this.includeExternal}`;
    }
  };
  var Search = class {
    /**
     * Executes a search query.
     * @param query - The search query to execute.
     * @param existingResults - Map of existing results.
     * @param processingMessage - Message to display during processing.
     * @param resultHandler - Function to handle each search result.
     * @returns A promise that resolves to a boolean indicating if results were from cache.
     */
    static async execute(query, existingResults, processingMessage, resultHandler) {
      const timeStart = (/* @__PURE__ */ new Date()).getTime();
      processingMessage = processingMessage !== null && processingMessage !== void 0 ? processingMessage : "Processing...";
      if (query.getHaystackCacheKey() === Search.resultsHaystackCacheKey && existingResults) {
        const resultTotal2 = existingResults.size;
        const eventStart = new CustomEvent("ProcessingMessage", { detail: { action: "set", message: processingMessage } });
        document.dispatchEvent(eventStart);
        await Search.sleep(16);
        let i = 0;
        await existingResults.forEach(async (result, resultId) => {
          await resultHandler(result);
        });
        Plugin.logTiming(`Processed ${resultTotal2.toLocaleString()} search result(s)`, (/* @__PURE__ */ new Date()).getTime() - timeStart);
        const msg = { detail: { action: "clear" } };
        const eventFinished = new CustomEvent("ProcessingMessage", msg);
        document.dispatchEvent(eventFinished);
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
        "fields": query.fields.split("|")
      };
      let responseJson = await Plugin.postApiRequest("GetResources", kwargs);
      const resultTotal = responseJson["__meta__"]["results"]["total"];
      Search.resultsCacheTotal = resultTotal;
      let results = responseJson.results;
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        await Search.handleResult(result, resultTotal, resultHandler);
      }
      while (responseJson["__meta__"]["results"]["pagination"]["nextOffset"] !== null) {
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
      this.result = jsonResult["result"];
      this.id = jsonResult["id"];
      this.url = jsonResult["url"];
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
     * @param id - The crawl ID.
     * @param project - The project ID.
     * @param created - The creation date.
     * @param modified - The last modified date.
     * @param complete - Whether the crawl is complete.
     * @param time - The time taken for the crawl.
     * @param report - The crawl report.
     */
    constructor(id, project, created, modified, complete, time, report) {
      this.id = -1;
      this.created = null;
      this.modified = null;
      this.project = -1;
      this.time = -1;
      this.report = null;
      this.id = id;
      this.created = created;
      this.modified = modified;
      this.complete = complete;
      this.project = project;
      this.time = time;
      this.report = report;
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
     * @param id - The project ID.
     * @param created - The creation date.
     * @param modified - The last modified date.
     * @param url - The project URL.
     * @param imageDataUri - The data URI of the project image.
     */
    constructor(id, created, modified, url, imageDataUri) {
      this.id = -1;
      this.created = null;
      this.modified = null;
      this.id = id;
      this.created = created;
      this.modified = modified;
      this.url = url;
      this.imageDataUri = imageDataUri;
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
      return new URL(this.url).hostname;
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
          const url = project.url;
          const imageDataUri = project.image;
          return new Project(id, created, modified, url, imageDataUri);
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
        const crawl = new Crawl(crawlResult.id, project, new Date(crawlResult.created), new Date(crawlResult.modified), crawlResult.complete, crawlResult.time, crawlResult.report);
        crawls.push(crawl);
      }
      return crawls;
    }
  };

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
    static initialize(classtype) {
      let instance = null;
      if (document.readyState === "complete" || document.readyState === "interactive") {
        instance = new classtype();
      } else {
        document.addEventListener("DOMContentLoaded", async () => {
          instance = new classtype();
        });
      }
      return instance;
    }
    /**
     * Posts the current content height to the parent frame.
     */
    static postContentHeight() {
      const mainResults = document.querySelector(".main__results");
      let currentScrollHeight = document.body.scrollHeight;
      if (mainResults) {
        currentScrollHeight = Number(mainResults.getBoundingClientRect().bottom);
      }
      if (currentScrollHeight !== Plugin.contentScrollHeight) {
        const msg = {
          target: "interrobot",
          data: {
            reportHeight: currentScrollHeight
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
     * Gets the current project ID.
     * @returns The project ID.
     */
    getProjectId() {
      return this.projectId;
    }
    /**
     * Initializes the plugin with metadata and sets up event listeners.
     * @param meta - The metadata for the plugin.
     */
    async init(meta) {
      Plugin.postMeta(meta);
      window.addEventListener("load", Plugin.postContentHeight);
      window.addEventListener("resize", Plugin.postContentHeight);
    }
    /**
     * Initializes the plugin data.
     * @param meta - The metadata for the plugin.
     * @param defaultData - The default data for the plugin.
     * @param autoform - An array of HTML elements for the autoform.
     */
    async initData(meta, defaultData, autoform) {
      this.data = new PluginData(this.getProjectId(), meta, defaultData, autoform);
      await this.data.loadData();
    }
    /**
     * Initializes and returns the plugin data.
     * @param meta - The metadata for the plugin.
     * @param defaultData - The default data for the plugin.
     * @param autoform - An array of HTML elements for the autoform.
     * @returns A promise that resolves with the initialized PluginData.
     */
    async initAndGetData(meta, defaultData, autoform) {
      await this.initData(meta, defaultData, autoform);
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
      this.init(Plugin.meta);
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
      const internalHtmlPagesQuery = new SearchQuery(projectId, freeQueryString, fields, SearchQueryType.Any, false);
      await Search.execute(internalHtmlPagesQuery, resultsMap, "Processing\u2026", async (result) => {
        await exampleResultHandler(result, titleWords);
      });
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

  // examples/vanillats/js/build/src/ts/ui/processing.js
  var HtmlProcessingWidget = class {
    /**
     * Creates a new HtmlProcessingWidget and appends it to the specified parent element.
     * @param {HTMLElement} parentElement - The parent element to which the widget will be appended.
     * @param {string} prefix - The prefix text to display before the progress information.
     * @returns {HtmlProcessingWidget} A new instance of HtmlProcessingWidget.
     */
    static createElement(parentElement, prefix) {
      const widget = new HtmlProcessingWidget(prefix);
      const widgetBaseElement = widget.getBaseElement();
      if (parentElement && widgetBaseElement) {
        parentElement.appendChild(widgetBaseElement);
      } else {
        console.warn(`unable to create processing widget: parent [${parentElement}], base [${widgetBaseElement}]`);
      }
      return widget;
    }
    /**
     * Initializes a new instance of HtmlProcessingWidget.
     * @param {string} prefix - The prefix text to display before the progress information.
     */
    constructor(prefix) {
      this.prefix = prefix;
      this.total = 0;
      this.loaded = 0;
      this.baseElement = document.createElement("div");
      this.baseElement.id = "processingWidget";
      this.baseElement.classList.add("processing", "hidden");
      this.baseElement.innerHTML = ``;
      document.addEventListener("SearchResultHandled", async (ev) => {
        const evdTotal = ev.detail.resultTotal;
        const evdLoaded = ev.detail.resultNum;
        const evdPercent = Math.ceil(evdLoaded / evdTotal * 100);
        const currentPercent = Math.ceil(this.loaded / this.total * 100);
        if (evdPercent > 100 || currentPercent === 100) {
          this.baseElement.classList.remove("throbbing");
          return;
        }
        this.total = evdTotal;
        this.loaded = evdLoaded;
        this.baseElement.innerHTML = evdPercent > 100 ? "" : `${this.prefix}
                <span class="resultNum">##</span>/<span class="resultTotal">##</span>
                (<span class="percentTotal">##</span>)`;
        const resultNum = this.baseElement.querySelector(".resultNum");
        if (resultNum) {
          resultNum.innerText = `${ev.detail.resultNum.toLocaleString()}`;
        }
        const resultTotal = this.baseElement.querySelector(".resultTotal");
        if (resultTotal) {
          resultTotal.innerText = `${ev.detail.resultTotal.toLocaleString()}`;
        }
        const percentTotal = this.baseElement.querySelector(".percentTotal");
        if (percentTotal) {
          percentTotal.innerText = `${evdPercent}%`;
        }
        if ([0, 100].indexOf(evdPercent) >= 0) {
          this.baseElement.classList.remove("throbbing");
        } else {
          this.baseElement.classList.add("throbbing");
        }
      });
      document.addEventListener("ProcessingMessage", async (ev) => {
        const action = ev.detail.action;
        switch (action) {
          case "set":
            this.baseElement.innerHTML = ``;
            this.baseElement.innerText = ev.detail.message;
            this.baseElement.classList.add("throbbing");
            break;
          case "clear":
          default:
            this.baseElement.classList.remove("throbbing");
            break;
        }
      });
    }
    /**
     * Removes the throbbing effect from the widget.
     * @public
     */
    clearMessage() {
      this.baseElement.classList.remove("throbbing");
    }
    /**
     * Returns the base HTML element of the widget.
     * @public
     * @returns {HTMLElement} The base HTML element of the widget.
     */
    getBaseElement() {
      return this.baseElement;
    }
    /**
     * Sets a new prefix for the widget.
     * @public
     * @param {string} prefix - The new prefix to set.
     */
    setPrefix(prefix) {
      this.prefix = prefix;
    }
    /**
     * Sets a new message for the widget and adds the throbbing effect.
     * @public
     * @param {string} msg - The message to display in the widget.
     */
    setMessage(msg) {
      this.baseElement.innerHTML = `${msg}`;
      this.baseElement.classList.add("throbbing");
    }
  };

  // examples/vanillats/js/build/src/ts/ui/templates.js
  var Templates = class {
    /**
     * Generates a standard heading HTML structure.
     * @param project - The project object containing project details.
     * @param title - The title to be displayed in the heading.
     * @returns A string containing the HTML for the standard heading.
     */
    static standardHeading(project, title) {
      return `<div class="main__heading">
            <div class="main__heading__icon">
                <img id="projectIcon" src="${project.getImageDataUri()}" alt="Icon for @crawlView.DisplayTitle" />
            </div>
            <div class="main__heading__title">
                <h1><span>${HtmlUtils.htmlEncode(title)}</span></h1>
                <div><span>${HtmlUtils.htmlEncode(project.getDisplayTitle())}</span></div>
            </div>
        </div>`;
    }
    /**
     * Wraps form HTML in a standard container.
     * @param formHtml - The HTML string of the form to be wrapped.
     * @returns A string containing the wrapped form HTML.
     */
    static standardForm(formHtml) {
      return `<div class="main__form">${formHtml}</div>`;
    }
    /**
     * Generates a standard results container.
     * @returns A string containing the HTML for the standard results container.
     */
    static standardResults() {
      return `<div class="main__results"></div>`;
    }
    /**
     * Generates HTML for a standard checkbox input.
     * @param name - The name attribute for the checkbox.
     * @param value - The value attribute for the checkbox.
     * @param label - The label text for the checkbox.
     * @param synopsis - Optional synopsis text for the checkbox.
     * @returns A string containing the HTML for the checkbox.
     */
    static standardCheckbox(name, value, label, synopsis) {
      return `
        <label>
            <span class="checkbox">
                <input type="checkbox" name="${HtmlUtils.htmlEncode(name)}" value="${HtmlUtils.htmlEncode(value)}"/>
                <span class="checkbox__tick"></span>                                
            </span>
            <span class="checkbox__label">${HtmlUtils.htmlEncode(label)}</span> 
            ${synopsis ? `<span class="checkbox__synopsis">` + HtmlUtils.htmlEncode(synopsis) + `</span>` : ""}
        </label>`;
    }
    /**
     * Generates HTML for a standard radio input.
     * @param name - The name attribute for the radio button.
     * @param value - The value attribute for the radio button.
     * @param label - The label text for the radio button.
     * @param synopsis - Optional synopsis text for the radio button.
     * @returns A string containing the HTML for the radio button.
     */
    static standardRadio(name, value, label, synopsis) {
      return `        
        <label>
            <span class="radio">
                <input type="radio" name="${HtmlUtils.htmlEncode(name)}" value="${HtmlUtils.htmlEncode(value)}">
                <span class="radio__tick"></span>
            </span>
            <span class="radio__text">${HtmlUtils.htmlEncode(label)}</span>
            ${synopsis ? `<span class="radio__synopsis">` + HtmlUtils.htmlEncode(synopsis) + `</span>` : ""}
        </label>`;
    }
    /**
     * Renders a cell with "same as last" functionality.
     * @param cellValue - The value of the current cell.
     * @param rowData - An object containing the data for the entire row.
     * @param i - The index of the current row.
     * @returns An object containing classes and content for the cell.
     */
    static cellRendererSameAsLast(cellValue, rowData, i) {
      var _a;
      if (!("ID" in rowData)) {
        throw "ID must be present to use cellHandlerSameAsLast";
      }
      const keys = Object.keys(rowData);
      const values = Object.values(rowData);
      const valueIndex = values.indexOf(cellValue);
      const cellHeading = keys[valueIndex];
      const currentId = rowData["ID"].toString();
      const lastId = (_a = Templates.cellHandlerSameAsLastMemo[cellHeading]) !== null && _a !== void 0 ? _a : "";
      const classes = [];
      if (i > 0 && lastId === currentId) {
        classes.push("sameaslast");
      }
      Templates.cellHandlerSameAsLastMemo[cellHeading] = currentId;
      return { "classes": classes, "content": `${HtmlUtils.htmlEncode(cellValue)}` };
    }
    /**
     * Renders a cell with a link and "same as last" functionality.
     * @param cellValue - The value of the current cell (used as the link URL).
     * @param rowData - An object containing the data for the entire row.
     * @param i - The index of the current row.
     * @returns An object containing classes and content for the cell.
     */
    static cellRendererSameAsLastLink(cellValue, rowData, i) {
      const result = Templates.cellRendererSameAsLast(cellValue, rowData, i);
      result["content"] = `<a class= "ulink" 
            data-id="${HtmlUtils.htmlEncode(rowData["ID"])}" 
            href="${HtmlUtils.htmlEncode(cellValue)}">${HtmlUtils.htmlEncode(cellValue)}</a>`;
      return result;
    }
    /**
     * Renders a cell with a linked ID.
     * @param cellValue - The value of the current cell (used as the ID).
     * @param rowData - An object containing the data for the entire row.
     * @param i - The index of the current row.
     * @returns An object containing classes and content for the cell.
     */
    static cellRendererLinkedId(cellValue, rowData, i) {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      const origin = params.origin;
      const projectId = params.project;
      if (!origin || !projectId) {
        throw "missing required url arguments";
      }
      const interrobotPageDetail = `${origin}/search/${projectId}/resource/${cellValue}/`;
      const result = {
        "classes": [],
        "content": `<a class= "ulink" href="${interrobotPageDetail}"
                data-id="${HtmlUtils.htmlEncode(rowData["ID"])}" 
                href="${HtmlUtils.htmlEncode(interrobotPageDetail)}">${HtmlUtils.htmlEncode(cellValue)}</a>`
      };
      return result;
    }
    /**
     * Renders a cell with wrapped content.
     * @param cellValue - The value of the current cell.
     * @param rowData - An object containing the data for the entire row.
     * @param i - The index of the current row.
     * @returns An object containing classes and content for the cell.
     */
    static cellRendererWrappedContent(cellValue, rowData, i) {
      return {
        "classes": ["wrap"],
        "content": `${HtmlUtils.htmlEncode(cellValue)}`
      };
    }
  };
  Templates.cellHandlerSameAsLastMemo = {};

  // examples/vanillats/js/build/src/ts/core/stopwords.js
  var Stopwords = class {
    /**
     * Returns an object where keys are stopwords and values are true for quick lookup.
     * @param lang - The language code (e.g., "en" for English, "de" for German).
     * @returns An object with stopwords as keys and true as values.
     */
    static getStopwordsTruth(lang) {
      const words = this.getStopwords(lang);
      return words.reduce((obj, key, index) => ({ ...obj, [key]: true }), {});
    }
    /**
     * Returns an array of stopwords for the specified language.
     * @param lang - The language code (e.g., "en" for English, "de" for German).
     * @returns An array of stopwords for the specified language.
     */
    static getStopwords(lang) {
      switch (lang) {
        case "de":
          return [
            "aber",
            "alle",
            "allem",
            "allen",
            "aller",
            "alles",
            "als",
            "also",
            "am",
            "an",
            "ander",
            "andere",
            "anderem",
            "anderen",
            "anderer",
            "anderes",
            "anderm",
            "andern",
            "anderr",
            "anders",
            "auch",
            "auf",
            "aus",
            "bei",
            "bin",
            "bis",
            "bist",
            "da",
            "damit",
            "dann",
            "der",
            "den",
            "des",
            "dem",
            "die",
            "das",
            "dass",
            "da\xDF",
            "derselbe",
            "derselben",
            "denselben",
            "desselben",
            "demselben",
            "dieselbe",
            "dieselben",
            "dasselbe",
            "dazu",
            "dein",
            "deine",
            "deinem",
            "deinen",
            "deiner",
            "deines",
            "denn",
            "derer",
            "dessen",
            "dich",
            "dir",
            "du",
            "dies",
            "diese",
            "diesem",
            "diesen",
            "dieser",
            "dieses",
            "doch",
            "dort",
            "durch",
            "ein",
            "eine",
            "einem",
            "einen",
            "einer",
            "eines",
            "einig",
            "einige",
            "einigem",
            "einigen",
            "einiger",
            "einiges",
            "einmal",
            "er",
            "ihn",
            "ihm",
            "es",
            "etwas",
            "euer",
            "eure",
            "eurem",
            "euren",
            "eurer",
            "eures",
            "f\xFCr",
            "gegen",
            "gewesen",
            "hab",
            "habe",
            "haben",
            "hat",
            "hatte",
            "hatten",
            "hier",
            "hin",
            "hinter",
            "ich",
            "mich",
            "mir",
            "ihr",
            "ihre",
            "ihrem",
            "ihren",
            "ihrer",
            "ihres",
            "euch",
            "im",
            "in",
            "indem",
            "ins",
            "ist",
            "jede",
            "jedem",
            "jeden",
            "jeder",
            "jedes",
            "jene",
            "jenem",
            "jenen",
            "jener",
            "jenes",
            "jetzt",
            "kann",
            "kein",
            "keine",
            "keinem",
            "keinen",
            "keiner",
            "keines",
            "k\xF6nnen",
            "k\xF6nnte",
            "machen",
            "man",
            "manche",
            "manchem",
            "manchen",
            "mancher",
            "manches",
            "mein",
            "meine",
            "meinem",
            "meinen",
            "meiner",
            "meines",
            "mit",
            "muss",
            "musste",
            "nach",
            "nicht",
            "nichts",
            "noch",
            "nun",
            "nur",
            "ob",
            "oder",
            "ohne",
            "sehr",
            "sein",
            "seine",
            "seinem",
            "seinen",
            "seiner",
            "seines",
            "selbst",
            "sich",
            "sie",
            "ihnen",
            "sind",
            "so",
            "solche",
            "solchem",
            "solchen",
            "solcher",
            "solches",
            "soll",
            "sollte",
            "sondern",
            "sonst",
            "\xFCber",
            "um",
            "und",
            "uns",
            "unsere",
            "unserem",
            "unseren",
            "unser",
            "unseres",
            "unter",
            "viel",
            "vom",
            "von",
            "vor",
            "w\xE4hrend",
            "war",
            "waren",
            "warst",
            "was",
            "weg",
            "weil",
            "weiter",
            "welche",
            "welchem",
            "welchen",
            "welcher",
            "welches",
            "wenn",
            "werde",
            "werden",
            "wie",
            "wieder",
            "will",
            "wir",
            "wird",
            "wirst",
            "wo",
            "wollen",
            "wollte",
            "w\xFCrde",
            "w\xFCrden",
            "zu",
            "zum",
            "zur",
            "zwar",
            "zwischen"
          ];
        case "en":
          return [
            "i",
            "me",
            "my",
            "myself",
            "we",
            "our",
            "ours",
            "ourselves",
            "you",
            "you're",
            "you've",
            "you'll",
            "you'd",
            "your",
            "yours",
            "yourself",
            "yourselves",
            "he",
            "him",
            "his",
            "himself",
            "she",
            "she's",
            "her",
            "hers",
            "herself",
            "it",
            "it's",
            "its",
            "itself",
            "they",
            "them",
            "their",
            "theirs",
            "themselves",
            "what",
            "which",
            "who",
            "whom",
            "this",
            "that",
            "that'll",
            "these",
            "those",
            "am",
            "is",
            "are",
            "was",
            "were",
            "be",
            "been",
            "being",
            "have",
            "has",
            "had",
            "having",
            "do",
            "does",
            "did",
            "doing",
            "a",
            "an",
            "the",
            "and",
            "but",
            "if",
            "or",
            "because",
            "as",
            "until",
            "while",
            "of",
            "at",
            "by",
            "for",
            "with",
            "about",
            "against",
            "between",
            "into",
            "through",
            "during",
            "before",
            "after",
            "above",
            "below",
            "to",
            "from",
            "up",
            "down",
            "in",
            "out",
            "on",
            "off",
            "over",
            "under",
            "again",
            "further",
            "then",
            "once",
            "here",
            "there",
            "when",
            "where",
            "why",
            "how",
            "all",
            "any",
            "both",
            "each",
            "few",
            "more",
            "most",
            "other",
            "some",
            "such",
            "no",
            "nor",
            "not",
            "only",
            "own",
            "same",
            "so",
            "than",
            "too",
            "very",
            "s",
            "t",
            "can",
            "will",
            "just",
            "don",
            "don't",
            "should",
            "should've",
            "now",
            "d",
            "ll",
            "m",
            "o",
            "re",
            "ve",
            "y",
            "ain",
            "aren",
            "aren't",
            "couldn",
            "couldn't",
            "didn",
            "didn't",
            "doesn",
            "doesn't",
            "hadn",
            "hadn't",
            "hasn",
            "hasn't",
            "haven",
            "haven't",
            "isn",
            "isn't",
            "ma",
            "mightn",
            "mightn't",
            "mustn",
            "mustn't",
            "needn",
            "needn't",
            "shan",
            "shan't",
            "shouldn",
            "shouldn't",
            "wasn",
            "wasn't",
            "weren",
            "weren't",
            "won",
            "won't",
            "wouldn",
            "wouldn't"
          ];
        case "fr":
          return [
            "au",
            "aux",
            "avec",
            "ce",
            "ces",
            "dans",
            "de",
            "des",
            "du",
            "elle",
            "en",
            "et",
            "eux",
            "il",
            "ils",
            "je",
            "la",
            "le",
            "les",
            "leur",
            "lui",
            "ma",
            "mais",
            "me",
            "m\xEAme",
            "mes",
            "moi",
            "mon",
            "ne",
            "nos",
            "notre",
            "nous",
            "on",
            "ou",
            "par",
            "pas",
            "pour",
            "qu",
            "que",
            "qui",
            "sa",
            "se",
            "ses",
            "son",
            "sur",
            "ta",
            "te",
            "tes",
            "toi",
            "ton",
            "tu",
            "un",
            "une",
            "vos",
            "votre",
            "vous",
            "c",
            "d",
            "j",
            "l",
            "\xE0",
            "m",
            "n",
            "s",
            "t",
            "y",
            "\xE9t\xE9",
            "\xE9t\xE9e",
            "\xE9t\xE9es",
            "\xE9t\xE9s",
            "\xE9tant",
            "\xE9tante",
            "\xE9tants",
            "\xE9tantes",
            "suis",
            "es",
            "est",
            "sommes",
            "\xEAtes",
            "sont",
            "serai",
            "seras",
            "sera",
            "serons",
            "serez",
            "seront",
            "serais",
            "serait",
            "serions",
            "seriez",
            "seraient",
            "\xE9tais",
            "\xE9tait",
            "\xE9tions",
            "\xE9tiez",
            "\xE9taient",
            "fus",
            "fut",
            "f\xFBmes",
            "f\xFBtes",
            "furent",
            "sois",
            "soit",
            "soyons",
            "soyez",
            "soient",
            "fusse",
            "fusses",
            "f\xFBt",
            "fussions",
            "fussiez",
            "fussent",
            "ayant",
            "ayante",
            "ayantes",
            "ayants",
            "eu",
            "eue",
            "eues",
            "eus",
            "ai",
            "as",
            "avons",
            "avez",
            "ont",
            "aurai",
            "auras",
            "aura",
            "aurons",
            "aurez",
            "auront",
            "aurais",
            "aurait",
            "aurions",
            "auriez",
            "auraient",
            "avais",
            "avait",
            "avions",
            "aviez",
            "avaient",
            "eut",
            "e\xFBmes",
            "e\xFBtes",
            "eurent",
            "aie",
            "aies",
            "ait",
            "ayons",
            "ayez",
            "aient",
            "eusse",
            "eusses",
            "e\xFBt",
            "eussions",
            "eussiez",
            "eussent"
          ];
        case "pt":
          return [
            "a",
            "\xE0",
            "ao",
            "aos",
            "aquela",
            "aquelas",
            "aquele",
            "aqueles",
            "aquilo",
            "as",
            "\xE0s",
            "at\xE9",
            "com",
            "como",
            "da",
            "das",
            "de",
            "dela",
            "delas",
            "dele",
            "deles",
            "depois",
            "do",
            "dos",
            "e",
            "\xE9",
            "ela",
            "elas",
            "ele",
            "eles",
            "em",
            "entre",
            "era",
            "eram",
            "\xE9ramos",
            "essa",
            "essas",
            "esse",
            "esses",
            "esta",
            "est\xE1",
            "estamos",
            "est\xE3o",
            "estar",
            "estas",
            "estava",
            "estavam",
            "est\xE1vamos",
            "este",
            "esteja",
            "estejam",
            "estejamos",
            "estes",
            "esteve",
            "estive",
            "estivemos",
            "estiver",
            "estivera",
            "estiveram",
            "estiv\xE9ramos",
            "estiverem",
            "estivermos",
            "estivesse",
            "estivessem",
            "estiv\xE9ssemos",
            "estou",
            "eu",
            "foi",
            "fomos",
            "for",
            "fora",
            "foram",
            "f\xF4ramos",
            "forem",
            "formos",
            "fosse",
            "fossem",
            "f\xF4ssemos",
            "fui",
            "h\xE1",
            "haja",
            "hajam",
            "hajamos",
            "h\xE3o",
            "havemos",
            "haver",
            "hei",
            "houve",
            "houvemos",
            "houver",
            "houvera",
            "houver\xE1",
            "houveram",
            "houv\xE9ramos",
            "houver\xE3o",
            "houverei",
            "houverem",
            "houveremos",
            "houveria",
            "houveriam",
            "houver\xEDamos",
            "houvermos",
            "houvesse",
            "houvessem",
            "houv\xE9ssemos",
            "isso",
            "isto",
            "j\xE1",
            "lhe",
            "lhes",
            "mais",
            "mas",
            "me",
            "mesmo",
            "meu",
            "meus",
            "minha",
            "minhas",
            "muito",
            "na",
            "n\xE3o",
            "nas",
            "nem",
            "no",
            "nos",
            "n\xF3s",
            "nossa",
            "nossas",
            "nosso",
            "nossos",
            "num",
            "numa",
            "o",
            "os",
            "ou",
            "para",
            "pela",
            "pelas",
            "pelo",
            "pelos",
            "por",
            "qual",
            "quando",
            "que",
            "quem",
            "s\xE3o",
            "se",
            "seja",
            "sejam",
            "sejamos",
            "sem",
            "ser",
            "ser\xE1",
            "ser\xE3o",
            "serei",
            "seremos",
            "seria",
            "seriam",
            "ser\xEDamos",
            "seu",
            "seus",
            "s\xF3",
            "somos",
            "sou",
            "sua",
            "suas",
            "tamb\xE9m",
            "te",
            "tem",
            "t\xE9m",
            "temos",
            "tenha",
            "tenham",
            "tenhamos",
            "tenho",
            "ter\xE1",
            "ter\xE3o",
            "terei",
            "teremos",
            "teria",
            "teriam",
            "ter\xEDamos",
            "teu",
            "teus",
            "teve",
            "tinha",
            "tinham",
            "t\xEDnhamos",
            "tive",
            "tivemos",
            "tiver",
            "tivera",
            "tiveram",
            "tiv\xE9ramos",
            "tiverem",
            "tivermos",
            "tivesse",
            "tivessem",
            "tiv\xE9ssemos",
            "tu",
            "tua",
            "tuas",
            "um",
            "uma",
            "voc\xEA",
            "voc\xEAs",
            "vos"
          ];
        case "ru":
          return [
            "\u0438",
            "\u0432",
            "\u0432\u043E",
            "\u043D\u0435",
            "\u0447\u0442\u043E",
            "\u043E\u043D",
            "\u043D\u0430",
            "\u044F",
            "\u0441",
            "\u0441\u043E",
            "\u043A\u0430\u043A",
            "\u0430",
            "\u0442\u043E",
            "\u0432\u0441\u0435",
            "\u043E\u043D\u0430",
            "\u0442\u0430\u043A",
            "\u0435\u0433\u043E",
            "\u043D\u043E",
            "\u0434\u0430",
            "\u0442\u044B",
            "\u043A",
            "\u0443",
            "\u0436\u0435",
            "\u0432\u044B",
            "\u0437\u0430",
            "\u0431\u044B",
            "\u043F\u043E",
            "\u0442\u043E\u043B\u044C\u043A\u043E",
            "\u0435\u0435",
            "\u043C\u043D\u0435",
            "\u0431\u044B\u043B\u043E",
            "\u0432\u043E\u0442",
            "\u043E\u0442",
            "\u043C\u0435\u043D\u044F",
            "\u0435\u0449\u0435",
            "\u043D\u0435\u0442",
            "\u043E",
            "\u0438\u0437",
            "\u0435\u043C\u0443",
            "\u0442\u0435\u043F\u0435\u0440\u044C",
            "\u043A\u043E\u0433\u0434\u0430",
            "\u0434\u0430\u0436\u0435",
            "\u043D\u0443",
            "\u0432\u0434\u0440\u0443\u0433",
            "\u043B\u0438",
            "\u0435\u0441\u043B\u0438",
            "\u0443\u0436\u0435",
            "\u0438\u043B\u0438",
            "\u043D\u0438",
            "\u0431\u044B\u0442\u044C",
            "\u0431\u044B\u043B",
            "\u043D\u0435\u0433\u043E",
            "\u0434\u043E",
            "\u0432\u0430\u0441",
            "\u043D\u0438\u0431\u0443\u0434\u044C",
            "\u043E\u043F\u044F\u0442\u044C",
            "\u0443\u0436",
            "\u0432\u0430\u043C",
            "\u0432\u0435\u0434\u044C",
            "\u0442\u0430\u043C",
            "\u043F\u043E\u0442\u043E\u043C",
            "\u0441\u0435\u0431\u044F",
            "\u043D\u0438\u0447\u0435\u0433\u043E",
            "\u0435\u0439",
            "\u043C\u043E\u0436\u0435\u0442",
            "\u043E\u043D\u0438",
            "\u0442\u0443\u0442",
            "\u0433\u0434\u0435",
            "\u0435\u0441\u0442\u044C",
            "\u043D\u0430\u0434\u043E",
            "\u043D\u0435\u0439",
            "\u0434\u043B\u044F",
            "\u043C\u044B",
            "\u0442\u0435\u0431\u044F",
            "\u0438\u0445",
            "\u0447\u0435\u043C",
            "\u0431\u044B\u043B\u0430",
            "\u0441\u0430\u043C",
            "\u0447\u0442\u043E\u0431",
            "\u0431\u0435\u0437",
            "\u0431\u0443\u0434\u0442\u043E",
            "\u0447\u0435\u0433\u043E",
            "\u0440\u0430\u0437",
            "\u0442\u043E\u0436\u0435",
            "\u0441\u0435\u0431\u0435",
            "\u043F\u043E\u0434",
            "\u0431\u0443\u0434\u0435\u0442",
            "\u0436",
            "\u0442\u043E\u0433\u0434\u0430",
            "\u043A\u0442\u043E",
            "\u044D\u0442\u043E\u0442",
            "\u0442\u043E\u0433\u043E",
            "\u043F\u043E\u0442\u043E\u043C\u0443",
            "\u044D\u0442\u043E\u0433\u043E",
            "\u043A\u0430\u043A\u043E\u0439",
            "\u0441\u043E\u0432\u0441\u0435\u043C",
            "\u043D\u0438\u043C",
            "\u0437\u0434\u0435\u0441\u044C",
            "\u044D\u0442\u043E\u043C",
            "\u043E\u0434\u0438\u043D",
            "\u043F\u043E\u0447\u0442\u0438",
            "\u043C\u043E\u0439",
            "\u0442\u0435\u043C",
            "\u0447\u0442\u043E\u0431\u044B",
            "\u043D\u0435\u0435",
            "\u0441\u0435\u0439\u0447\u0430\u0441",
            "\u0431\u044B\u043B\u0438",
            "\u043A\u0443\u0434\u0430",
            "\u0437\u0430\u0447\u0435\u043C",
            "\u0432\u0441\u0435\u0445",
            "\u043D\u0438\u043A\u043E\u0433\u0434\u0430",
            "\u043C\u043E\u0436\u043D\u043E",
            "\u043F\u0440\u0438",
            "\u043D\u0430\u043A\u043E\u043D\u0435\u0446",
            "\u0434\u0432\u0430",
            "\u043E\u0431",
            "\u0434\u0440\u0443\u0433\u043E\u0439",
            "\u0445\u043E\u0442\u044C",
            "\u043F\u043E\u0441\u043B\u0435",
            "\u043D\u0430\u0434",
            "\u0431\u043E\u043B\u044C\u0448\u0435",
            "\u0442\u043E\u0442",
            "\u0447\u0435\u0440\u0435\u0437",
            "\u044D\u0442\u0438",
            "\u043D\u0430\u0441",
            "\u043F\u0440\u043E",
            "\u0432\u0441\u0435\u0433\u043E",
            "\u043D\u0438\u0445",
            "\u043A\u0430\u043A\u0430\u044F",
            "\u043C\u043D\u043E\u0433\u043E",
            "\u0440\u0430\u0437\u0432\u0435",
            "\u0442\u0440\u0438",
            "\u044D\u0442\u0443",
            "\u043C\u043E\u044F",
            "\u0432\u043F\u0440\u043E\u0447\u0435\u043C",
            "\u0445\u043E\u0440\u043E\u0448\u043E",
            "\u0441\u0432\u043E\u044E",
            "\u044D\u0442\u043E\u0439",
            "\u043F\u0435\u0440\u0435\u0434",
            "\u0438\u043D\u043E\u0433\u0434\u0430",
            "\u043B\u0443\u0447\u0448\u0435",
            "\u0447\u0443\u0442\u044C",
            "\u0442\u043E\u043C",
            "\u043D\u0435\u043B\u044C\u0437\u044F",
            "\u0442\u0430\u043A\u043E\u0439",
            "\u0438\u043C",
            "\u0431\u043E\u043B\u0435\u0435",
            "\u0432\u0441\u0435\u0433\u0434\u0430",
            "\u043A\u043E\u043D\u0435\u0447\u043D\u043E",
            "\u0432\u0441\u044E",
            "\u043C\u0435\u0436\u0434\u0443"
          ];
        case "sp":
          return [
            "de",
            "la",
            "que",
            "el",
            "en",
            "y",
            "a",
            "los",
            "del",
            "se",
            "las",
            "por",
            "un",
            "para",
            "con",
            "no",
            "una",
            "su",
            "al",
            "lo",
            "como",
            "m\xE1s",
            "pero",
            "sus",
            "le",
            "ya",
            "o",
            "este",
            "s\xED",
            "porque",
            "esta",
            "entre",
            "cuando",
            "muy",
            "sin",
            "sobre",
            "tambi\xE9n",
            "me",
            "hasta",
            "hay",
            "donde",
            "quien",
            "desde",
            "todo",
            "nos",
            "durante",
            "todos",
            "uno",
            "les",
            "ni",
            "contra",
            "otros",
            "ese",
            "eso",
            "ante",
            "ellos",
            "e",
            "esto",
            "m\xED",
            "antes",
            "algunos",
            "qu\xE9",
            "unos",
            "yo",
            "otro",
            "otras",
            "otra",
            "\xE9l",
            "tanto",
            "esa",
            "estos",
            "mucho",
            "quienes",
            "nada",
            "muchos",
            "cual",
            "poco",
            "ella",
            "estar",
            "estas",
            "algunas",
            "algo",
            "nosotros",
            "mi",
            "mis",
            "t\xFA",
            "te",
            "ti",
            "tu",
            "tus",
            "ellas",
            "nosotras",
            "vosotros",
            "vosotras",
            "os",
            "m\xEDo",
            "m\xEDa",
            "m\xEDos",
            "m\xEDas",
            "tuyo",
            "tuya",
            "tuyos",
            "tuyas",
            "suyo",
            "suya",
            "suyos",
            "suyas",
            "nuestro",
            "nuestra",
            "nuestros",
            "nuestras",
            "vuestro",
            "vuestra",
            "vuestros",
            "vuestras",
            "esos",
            "esas",
            "estoy",
            "est\xE1s",
            "est\xE1",
            "estamos",
            "est\xE1is",
            "est\xE1n",
            "est\xE9",
            "est\xE9s",
            "estemos",
            "est\xE9is",
            "est\xE9n",
            "estar\xE9",
            "estar\xE1s",
            "estar\xE1",
            "estaremos",
            "estar\xE9is",
            "estar\xE1n",
            "estar\xEDa",
            "estar\xEDas",
            "estar\xEDamos",
            "estar\xEDais",
            "estar\xEDan",
            "estaba",
            "estabas",
            "est\xE1bamos",
            "estabais",
            "estaban",
            "estuve",
            "estuviste",
            "estuvo",
            "estuvimos",
            "estuvisteis",
            "estuvieron",
            "estuviera",
            "estuvieras",
            "estuvi\xE9ramos",
            "estuvierais",
            "estuvieran",
            "estuviese",
            "estuvieses",
            "estuvi\xE9semos",
            "estuvieseis",
            "estuviesen",
            "estando",
            "estado",
            "estada",
            "estados",
            "estadas",
            "estad",
            "he",
            "has",
            "ha",
            "hemos",
            "hab\xE9is",
            "han",
            "haya",
            "hayas",
            "hayamos",
            "hay\xE1is",
            "hayan",
            "habr\xE9",
            "habr\xE1s",
            "habr\xE1",
            "habremos",
            "habr\xE9is",
            "habr\xE1n",
            "habr\xEDa",
            "habr\xEDas",
            "habr\xEDamos",
            "habr\xEDais",
            "habr\xEDan",
            "hab\xEDa",
            "hab\xEDas",
            "hab\xEDamos",
            "hab\xEDais",
            "hab\xEDan",
            "hube",
            "hubiste",
            "hubo",
            "hubimos",
            "hubisteis",
            "hubieron",
            "hubiera",
            "hubieras",
            "hubi\xE9ramos",
            "hubierais",
            "hubieran",
            "hubiese",
            "hubieses",
            "hubi\xE9semos",
            "hubieseis",
            "hubiesen",
            "habiendo",
            "habido",
            "habida",
            "habidos",
            "habidas",
            "soy",
            "eres",
            "es",
            "somos",
            "sois",
            "son",
            "sea",
            "seas",
            "seamos",
            "se\xE1is",
            "sean",
            "ser\xE9",
            "ser\xE1s",
            "ser\xE1",
            "seremos",
            "ser\xE9is",
            "ser\xE1n",
            "ser\xEDa",
            "ser\xEDas",
            "ser\xEDamos",
            "ser\xEDais",
            "ser\xEDan",
            "era",
            "eras",
            "\xE9ramos",
            "erais",
            "eran",
            "fui",
            "fuiste",
            "fue",
            "fuimos",
            "fuisteis",
            "fueron",
            "fuera",
            "fueras",
            "fu\xE9ramos",
            "fuerais",
            "fueran",
            "fuese",
            "fueses",
            "fu\xE9semos",
            "fueseis",
            "fuesen",
            "sintiendo",
            "sentido",
            "sentida",
            "sentidos",
            "sentidas",
            "siente",
            "sentid",
            "tengo",
            "tienes",
            "tiene",
            "tenemos",
            "ten\xE9is",
            "tienen",
            "tenga",
            "tengas",
            "tengamos",
            "teng\xE1is",
            "tengan",
            "tendr\xE9",
            "tendr\xE1s",
            "tendr\xE1",
            "tendremos",
            "tendr\xE9is",
            "tendr\xE1n",
            "tendr\xEDa",
            "tendr\xEDas",
            "tendr\xEDamos",
            "tendr\xEDais",
            "tendr\xEDan",
            "ten\xEDa",
            "ten\xEDas",
            "ten\xEDamos",
            "ten\xEDais",
            "ten\xEDan",
            "tuve",
            "tuviste",
            "tuvo",
            "tuvimos",
            "tuvisteis",
            "tuvieron",
            "tuviera",
            "tuvieras",
            "tuvi\xE9ramos",
            "tuvierais",
            "tuvieran",
            "tuviese",
            "tuvieses",
            "tuvi\xE9semos",
            "tuvieseis",
            "tuviesen",
            "teniendo",
            "tenido",
            "tenida",
            "tenidos",
            "tenidas",
            "tened"
          ];
        case "":
          return [];
        default:
          const warnMessage = `Language ${lang} not currently supported. Stopwords are disabled.`;
          console.warn(warnMessage);
          return [];
      }
    }
  };

  // examples/vanillats/js/build/src/ts/lib/typo/typo.js
  var Rule = class {
    /**
     * Parses flag codes from a string representation.
     * @param textCodes - The string containing flag codes.
     * @param flags - An object containing flag definitions.
     * @returns An array of parsed flag codes.
     */
    static parseCodes(textCodes, flags) {
      let result = [];
      if (!textCodes) {
        result = [];
      } else if (!("FLAG" in flags)) {
        result = textCodes.split("");
      } else if (flags.FLAG === "long") {
        const newFlags = [];
        for (var i = 0, _len = textCodes.length; i < _len; i += 2) {
          newFlags.push(textCodes.substring(i, i + 2));
        }
        result = newFlags;
      } else if (flags.FLAG === "num") {
        result = textCodes.split(",");
      } else if (flags.FLAG === "UTF-8") {
        result = Array.from(textCodes);
      } else {
        result = textCodes.split("");
      }
      return result;
    }
    /**
     * Creates a new Rule instance.
     * @param code - The rule code.
     * @param type - The rule type.
     * @param combinable - Whether the rule is combinable.
     * @param entries - An array of entries for the rule.
     */
    constructor(code, type, combinable, entries) {
      this.code = code;
      this.type = type;
      this.combinable = combinable;
      this.entries = entries;
    }
    /**
     * Applies the rule to a word and generates new words.
     * @param word - The base word to apply the rule to.
     * @param rules - An object containing all available rules.
     * @param resultWords - An array to store the generated words.
     */
    applyRule(word, rules, resultWords) {
      for (let i = 0, entriesLength = this.entries.length; i < entriesLength; i++) {
        let entry = this.entries[i];
        if (!entry.match || entry.match.test(word)) {
          let newWord = word;
          if (entry.remove) {
            newWord = newWord.replace(entry.remove, "");
          }
          if (this.type === "SFX") {
            newWord = newWord + entry.add;
          } else {
            newWord = entry.add + newWord;
          }
          resultWords.push(newWord);
          const continuationLength = entry.continuationClasses.length;
          if (continuationLength > 0) {
            for (let j = 0; j < continuationLength; j++) {
              const continuationClass = entry.continuationClasses[j];
              const continuationRule = rules[continuationClass];
              if (continuationRule) {
                continuationRule.applyRule(newWord, rules, resultWords);
              }
            }
          }
        }
      }
    }
  };
  var Entry = class {
    /**
     * Creates a new Entry instance.
     * @param add - The string to add.
     * @param matchStr - The match string.
     * @param removeStr - The remove string.
     * @param cont - An array of continuation classes.
     */
    constructor(add, matchStr, removeStr, cont) {
      this.add = add ? add : null;
      this.match = this.getMemoRegex(matchStr);
      this.remove = this.getMemoRegex(removeStr);
      this.continuationClasses = cont ? cont : [];
    }
    /**
     * Creates an Entry instance from a line in the affix file.
     * @param line - The line from the affix file.
     * @param ruleType - The type of the rule.
     * @param flags - An object containing flag definitions.
     * @returns A new Entry instance.
     */
    static fromLine(line, ruleType, flags) {
      const lineParts = line.split(/\s+/);
      const charactersToRemove = lineParts[2];
      const additionParts = lineParts[3] ? lineParts[3].split("/") : [];
      const regexToMatch = lineParts[4];
      let charactersToAdd = additionParts[0];
      let continuations = additionParts[1];
      if (charactersToAdd === "0") {
        charactersToAdd = "";
      }
      let add = charactersToAdd;
      let matchString = null;
      if (regexToMatch && regexToMatch !== ".") {
        if (ruleType === "SFX") {
          matchString = `${regexToMatch}$`;
        } else {
          matchString = `^${regexToMatch}`;
        }
      }
      let removeString = null;
      if (charactersToRemove != "0") {
        if (ruleType === "SFX") {
          removeString = `${charactersToRemove}$`;
        } else {
          removeString = `${charactersToRemove}`;
        }
      }
      var continuationClasses = Rule.parseCodes(continuations, flags);
      return new Entry(add, matchString, removeString, continuationClasses);
    }
    getMemoRegex(reString) {
      if (reString) {
        if (Entry.regex[reString] === void 0) {
          Entry.regex[reString] = this.getRegex(reString);
        }
      } else {
        Entry.regex[reString] = null;
      }
      return Entry.regex[reString];
    }
    getRegex(reString) {
      try {
        return new RegExp(reString);
      } catch {
        return null;
      }
    }
  };
  Entry.regex = /* @__PURE__ */ Object.create(null);
  var Typo = class {
    /**
     * Creates a new Typo instance.
     * @param dictionary - The locale code of the dictionary.
     * @param affData - The data from the dictionary's .aff file.
     * @param wordsData - The data from the dictionary's .dic file.
     * @param settings - Optional settings for the Typo instance.
     */
    constructor(dictionary, affData, wordsData, settings) {
      if (!(dictionary && affData && wordsData)) {
        const msg = `dictionary (${dictionary}) || affData (${affData}) || wordsData (${wordsData}) 
				not provided.unlike Typo.js, all are required by the constructor.`;
        throw new Error(msg);
      }
      this.dictionary = dictionary;
      this.affData = affData;
      this.wordsData = wordsData;
      this.settings = settings !== null && settings !== void 0 ? settings : /* @__PURE__ */ Object.create(null);
      this.rules = {};
      this.combinableRules = {};
      this.dictionaryMap = /* @__PURE__ */ new Map();
      this.compoundRules = [];
      this.compoundRuleCodes = {};
      this.replacementTable = [];
      this.flags = "flags" in this.settings ? this.settings["flags"] : /* @__PURE__ */ Object.create(null);
      this.memoized = {};
      this.loaded = false;
      this.alphabet = "";
      this.setup();
    }
    /**
     * Checks whether a word exists exactly as given in the dictionary.
     * @param word - The word to check.
     * @returns True if the word is found, false otherwise.
     */
    checkExact(word) {
      if (!this.loaded) {
        throw "Dictionary not loaded.";
      }
      const ruleCodes = this.dictionaryMap.get(word);
      let i, _len;
      if (typeof ruleCodes === "undefined") {
        if ("COMPOUNDMIN" in this.flags && word.length >= this.flags.COMPOUNDMIN) {
          for (i = 0, _len = this.compoundRules.length; i < _len; i++) {
            if (word.match(this.compoundRules[i])) {
              return true;
            }
          }
        }
      } else if (ruleCodes === null) {
        return true;
      } else if (typeof ruleCodes === "object") {
        for (i = 0, _len = ruleCodes.length; i < _len; i++) {
          if (!this.hasFlag(word, "ONLYINCOMPOUND", [ruleCodes[i]])) {
            return true;
          }
        }
      }
      return false;
    }
    /**
     * Returns a list of suggestions for a misspelled word.
     * @see http://www.norvig.com/spell-correct.html for the basis of this suggestor.
     * This suggestor is primitive, but it works.
     * @param word - The misspelled word.
     * @param limit - The maximum number of suggestions to return (default is 5).
     * @returns An array of suggested corrections.
     */
    suggest(word, limit) {
      if (!this.loaded) {
        throw "Dictionary not loaded.";
      }
      let alphabet = "";
      limit = limit || 5;
      if (this.memoized.hasOwnProperty(word)) {
        var memoizedLimit = this.memoized[word]["limit"];
        if (limit <= memoizedLimit || this.memoized[word]["suggestions"].length < memoizedLimit) {
          return this.memoized[word]["suggestions"].slice(0, limit);
        }
      }
      if (this.check(word))
        return [];
      for (var i = 0, _len = this.replacementTable.length; i < _len; i++) {
        var replacementEntry = this.replacementTable[i];
        if (word.indexOf(replacementEntry[0]) !== -1) {
          var correctedWord = word.replace(replacementEntry[0], replacementEntry[1]);
          if (this.check(correctedWord)) {
            return [correctedWord];
          }
        }
      }
      if (!this.alphabet) {
        this.alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if ("TRY" in this.flags) {
          this.alphabet += this.flags["TRY"];
        }
        if ("WORDCHARS" in this.flags) {
          this.alphabet += this.flags["WORDCHARS"];
        }
        var alphaArray = this.alphabet.split("");
        alphaArray.sort();
        var alphaHash = {};
        for (var i = 0; i < alphaArray.length; i++) {
          alphaHash[alphaArray[i]] = true;
        }
        this.alphabet = "";
        for (var k in alphaHash) {
          this.alphabet += k;
        }
      }
      function edits1(words, known_only) {
        var rv = {};
        var i2, j, _iilen, _len2, _jlen, _edit;
        var alphabetLength = this.alphabet.length;
        if (typeof words == "string") {
          var word2 = words;
          words = {};
          words[word2] = true;
        }
        for (var word2 in words) {
          for (i2 = 0, _len2 = word2.length + 1; i2 < _len2; i2++) {
            var s = [word2.substring(0, i2), word2.substring(i2)];
            if (s[1]) {
              _edit = s[0] + s[1].substring(1);
              if (!known_only || this.check(_edit)) {
                if (!(_edit in rv)) {
                  rv[_edit] = 1;
                } else {
                  rv[_edit] += 1;
                }
              }
            }
            if (s[1].length > 1 && s[1][1] !== s[1][0]) {
              _edit = s[0] + s[1][1] + s[1][0] + s[1].substring(2);
              if (!known_only || this.check(_edit)) {
                if (!(_edit in rv)) {
                  rv[_edit] = 1;
                } else {
                  rv[_edit] += 1;
                }
              }
            }
            if (s[1]) {
              var lettercase = s[1].substring(0, 1).toUpperCase() === s[1].substring(0, 1) ? "uppercase" : "lowercase";
              for (j = 0; j < alphabetLength; j++) {
                var replacementLetter = this.alphabet[j];
                if ("uppercase" === lettercase) {
                  replacementLetter = replacementLetter.toUpperCase();
                }
                if (replacementLetter != s[1].substring(0, 1)) {
                  _edit = s[0] + replacementLetter + s[1].substring(1);
                  if (!known_only || this.check(_edit)) {
                    if (!(_edit in rv)) {
                      rv[_edit] = 1;
                    } else {
                      rv[_edit] += 1;
                    }
                  }
                }
              }
            }
            if (s[1]) {
              for (j = 0; j < alphabetLength; j++) {
                var lettercase = s[0].substring(-1).toUpperCase() === s[0].substring(-1) && s[1].substring(0, 1).toUpperCase() === s[1].substring(0, 1) ? "uppercase" : "lowercase";
                var replacementLetter = this.alphabet[j];
                if ("uppercase" === lettercase) {
                  replacementLetter = replacementLetter.toUpperCase();
                }
                _edit = s[0] + replacementLetter + s[1];
                if (!known_only || this.check(_edit)) {
                  if (!(_edit in rv)) {
                    rv[_edit] = 1;
                  } else {
                    rv[_edit] += 1;
                  }
                }
              }
            }
          }
        }
        return rv;
      }
      function correct(word2) {
        const ed1 = edits1(word2, false);
        const ed2 = edits1(ed1, true);
        const weighted_corrections = ed2;
        for (var ed1word in ed1) {
          if (!this.check(ed1word)) {
            continue;
          }
          if (ed1word in weighted_corrections) {
            weighted_corrections[ed1word] += ed1[ed1word];
          } else {
            weighted_corrections[ed1word] = ed1[ed1word];
          }
        }
        let i2, _len2;
        const sorted_corrections = [];
        for (i2 in weighted_corrections) {
          if (weighted_corrections.hasOwnProperty(i2)) {
            sorted_corrections.push([i2, weighted_corrections[i2]]);
          }
        }
        function sorter(a, b) {
          let a_val = a[1];
          let b_val = b[1];
          if (a_val < b_val) {
            return -1;
          } else if (a_val > b_val) {
            return 1;
          }
          return b[0].localeCompare(a[0]);
        }
        sorted_corrections.sort(sorter).reverse();
        const rv = [];
        let capitalization_scheme = "lowercase";
        if (word2.toUpperCase() === word2) {
          capitalization_scheme = "uppercase";
        } else if (word2.substr(0, 1).toUpperCase() + word2.substr(1).toLowerCase() === word2) {
          capitalization_scheme = "capitalized";
        }
        let working_limit = limit;
        for (i2 = 0; i2 < Math.min(working_limit, sorted_corrections.length); i2++) {
          if ("uppercase" === capitalization_scheme) {
            sorted_corrections[i2][0] = sorted_corrections[i2][0].toUpperCase();
          } else if ("capitalized" === capitalization_scheme) {
            sorted_corrections[i2][0] = sorted_corrections[i2][0].substr(0, 1).toUpperCase() + sorted_corrections[i2][0].substr(1);
          }
          if (!this.hasFlag(sorted_corrections[i2][0], "NOSUGGEST", null) && rv.indexOf(sorted_corrections[i2][0]) == -1) {
            rv.push(sorted_corrections[i2][0]);
          } else {
            working_limit++;
          }
        }
        return rv;
      }
      this.memoized[word] = {
        "suggestions": correct(word),
        "limit": limit
      };
      return this.memoized[word]["suggestions"];
    }
    setup() {
      let i = 0;
      let j = 0;
      let _len = 0;
      let _jlen = 0;
      this.rules = this._parseAFF(this.affData);
      this.combinableRules = Object.assign({}, ...Object.entries(this.rules).filter(([k, v]) => v.combinable).map(([k, v]) => ({ [k]: v })));
      this.compoundRuleCodes = /* @__PURE__ */ Object.create(null);
      for (i = 0, _len = this.compoundRules.length; i < _len; i++) {
        var rule = this.compoundRules[i];
        for (j = 0, _jlen = rule.length; j < _jlen; j++) {
          this.compoundRuleCodes[rule[j]] = [];
        }
      }
      if ("ONLYINCOMPOUND" in this.flags) {
        this.compoundRuleCodes[this.flags.ONLYINCOMPOUND] = [];
      }
      console.time("load dictionary");
      this.parseDIC(this.wordsData);
      console.timeEnd("load dictionary");
      for (let k in this.compoundRuleCodes) {
        if (this.compoundRuleCodes[k].length === 0) {
          delete this.compoundRuleCodes[k];
        }
      }
      for (i = 0; i < this.compoundRules.length; i++) {
        const ruleText = this.compoundRules[i];
        let expressionText = "";
        for (j = 0, _jlen = ruleText.length; j < _jlen; j++) {
          var character = ruleText[j];
          if (character in this.compoundRuleCodes) {
            expressionText += "(" + this.compoundRuleCodes[character].join("|") + ")";
          } else {
            expressionText += character;
          }
        }
        this.compoundRules[i] = new RegExp(expressionText, "i");
      }
      this.loaded = true;
    }
    /**
     * Parse the rules out from a .aff file.
     *
     * @param {String} data The contents of the affix file.
     * @returns object The rules from the file.
     */
    _parseAFF(data) {
      const lineSplitRe = /\r?\n/;
      const definitionSplitRe = /\s+/;
      const rules = /* @__PURE__ */ Object.create(null);
      let line, subline, numEntries, lineParts;
      let i, j, _len, _jlen;
      const lines = data.split(lineSplitRe);
      for (i = 0, _len = lines.length; i < _len; i++) {
        line = this._removeAffixComments(lines[i]);
        line = line.trim();
        if (!line) {
          continue;
        }
        const definitionParts = line.split(definitionSplitRe);
        const ruleType = definitionParts[0];
        const entries = [];
        if (ruleType == "PFX" || ruleType == "SFX") {
          var ruleCode = definitionParts[1];
          var combinable = definitionParts[2];
          let numEntries2 = parseInt(definitionParts[3], 10);
          for (j = i + 1, _jlen = i + 1 + numEntries2; j < _jlen; j++) {
            subline = lines[j];
            entries.push(Entry.fromLine(subline, ruleType, this.flags));
          }
          rules[ruleCode] = new Rule(ruleCode, ruleType, combinable === "Y", entries);
          i += numEntries2;
        } else if (ruleType === "COMPOUNDRULE") {
          numEntries = parseInt(definitionParts[1], 10);
          for (j = i + 1, _jlen = i + 1 + numEntries; j < _jlen; j++) {
            line = lines[j];
            lineParts = line.split(/\s+/);
            this.compoundRules.push(lineParts[1]);
          }
          i += numEntries;
        } else if (ruleType === "REP") {
          lineParts = line.split(/\s+/);
          if (lineParts.length === 3) {
            this.replacementTable.push([lineParts[1], lineParts[2]]);
          }
        } else {
          this.flags[ruleType] = definitionParts[1];
        }
      }
      return rules;
    }
    /**
     * Removes comments.
     *
     * @param {String} data A line from an affix file.
     * @return {String} The cleaned-up line.
     */
    _removeAffixComments(line) {
      if (line.match(/^\s*#/)) {
        return "";
      }
      return line;
    }
    addWord(word, rules) {
      const result = this.dictionaryMap.get(word);
      const hasRules = rules.length > 0;
      if (result === void 0) {
        if (hasRules) {
          this.dictionaryMap.set(word, rules);
        } else {
          this.dictionaryMap.set(word, null);
        }
      } else if (result === null) {
        if (hasRules) {
          this.dictionaryMap.set(word, rules);
        }
      } else if (hasRules) {
        result.push.apply(result, rules);
      }
    }
    /**
     * Parses the words out from the .dic file.
     *
     * @param {String} data The data from the dictionary file.
     * @returns object The lookup table containing all of the words and
     *                 word forms from the dictionary.
     */
    parseDIC(data) {
      data = this.removeDicComments(data);
      const lines = data.split(/\r?\n/);
      this.dictionaryMap.clear();
      const ruleCodeWords = [];
      const ruleCodeOtherWords = [];
      let ruleCodesArrayLength = 0;
      let ruleCodesArray;
      for (let i = 0, lineLength = lines.length; i < lineLength; i++) {
        const [word, ruleCodesRaw] = lines[i].split("/", 2);
        if (ruleCodesRaw) {
          ruleCodesArray = Rule.parseCodes(ruleCodesRaw, this.flags);
          ruleCodesArrayLength = ruleCodesArray.length;
          ruleCodeWords.length = 0;
          ruleCodeOtherWords.length = 0;
          if (!("NEEDAFFIX" in this.flags) || ruleCodesArray.indexOf(this.flags.NEEDAFFIX) == -1) {
            this.addWord(word, ruleCodesArray);
          }
          for (let j = 0; j < ruleCodesArrayLength; j++) {
            const code = ruleCodesArray[j];
            const rule = this.rules[code];
            ruleCodeWords.length = 0;
            ruleCodeOtherWords.length = 0;
            if (rule) {
              rule.applyRule(word, this.rules, ruleCodeWords);
              if (rule.combinable) {
                const ruleCodeWordsLength = ruleCodeWords.length;
                for (let k = 0; k < ruleCodeWordsLength; k++) {
                  const ruleCodeWord = ruleCodeWords[k];
                  for (let l = 0; l < ruleCodesArrayLength; l++) {
                    var combineRule = this.combinableRules[ruleCodesArray[l]];
                    if (combineRule && rule.type !== combineRule.type) {
                      combineRule.applyRule(ruleCodeWord, this.rules, ruleCodeOtherWords);
                    }
                  }
                }
              }
            }
            ruleCodeWords.push.apply(ruleCodeWords, ruleCodeOtherWords);
            const uniques = new Set(ruleCodeWords);
            let uniquesLength = uniques.size;
            for (let unique of uniques) {
              this.addWord(unique, []);
            }
            if (code in this.compoundRuleCodes) {
              this.compoundRuleCodes[code].push(word);
            }
          }
          ;
        } else {
          this.addWord(word.trim(), []);
        }
      }
      ;
    }
    /**
     * Removes comment lines and then cleans up blank lines and trailing whitespace.
     *
     * @param {String} data The data from a .dic file.
     * @return {String} The cleaned-up data.
     */
    removeDicComments(data) {
      data = data.replace(/^\t.*$/mg, "");
      return data;
    }
    /**
     * Checks whether a word or its capitalization variant exists in the dictionary.
     * The word is trimmed and several variations of capitalizations are checked.
     * If you want to check a word without any changes made to it, call checkExact()
     *
     * @see http://blog.stevenlevithan.com/archives/faster-trim-javascript re:trimming function
     * @param aWord - The word to check.
     * @returns True if the word is found, false otherwise.
     */
    check(aWord) {
      if (!this.loaded) {
        throw "Dictionary not loaded.";
      }
      var trimmedWord = aWord.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
      if (trimmedWord === "") {
        return true;
      }
      if (this.checkExact(trimmedWord)) {
        return true;
      }
      if (trimmedWord.toUpperCase() === trimmedWord) {
        var capitalizedWord = trimmedWord[0] + trimmedWord.substring(1).toLowerCase();
        if (this.hasFlag(capitalizedWord, "KEEPCASE", null)) {
          return false;
        }
        if (this.checkExact(capitalizedWord)) {
          return true;
        }
        if (this.checkExact(trimmedWord.toLowerCase())) {
          return true;
        }
      }
      var uncapitalizedWord = trimmedWord[0].toLowerCase() + trimmedWord.substring(1);
      if (uncapitalizedWord !== trimmedWord) {
        if (this.hasFlag(uncapitalizedWord, "KEEPCASE", null)) {
          return false;
        }
        if (this.checkExact(uncapitalizedWord)) {
          return true;
        }
      }
      return false;
    }
    /**
     * Looks up whether a given word is flagged with a given flag.
     *
     * @param {String} word The word in question.
     * @param {String} flag The flag in question.
     * @return {Boolean}
     */
    hasFlag(word, flag, wordFlags) {
      if (!this.loaded) {
        throw "Dictionary not loaded.";
      }
      if (flag in this.flags) {
        if (typeof wordFlags === "undefined") {
          const result = this.dictionaryMap.get(word);
          wordFlags = Array.prototype.concat.apply([], result);
        }
        if (wordFlags && wordFlags.indexOf(this.flags[flag]) !== -1) {
          return true;
        }
      }
      return false;
    }
  };

  // examples/vanillats/js/build/src/ts/ui/table.js
  var SortOrder;
  (function(SortOrder2) {
    SortOrder2[SortOrder2["Ascending"] = 0] = "Ascending";
    SortOrder2[SortOrder2["Descending"] = 1] = "Descending";
  })(SortOrder || (SortOrder = {}));
  var HTMLResultsTablePage = class {
    constructor(label, offset, limit, extended) {
      this.label = label;
      this.offset = offset;
      this.limit = limit;
      this.extended = extended;
    }
  };
  var HTMLResultsTableSort = class {
    /**
     * Creates a new instance of HTMLResultsTableSort.
     * @param primaryHeading - The primary heading to sort by.
     * @param primarySort - The sort order for the primary heading.
     * @param secondaryHeading - The secondary heading to sort by.
     * @param secondarySort - The sort order for the secondary heading.
     */
    constructor(primaryHeading, primarySort, secondaryHeading, secondarySort) {
      this.primaryHeading = primaryHeading;
      this.primarySort = primarySort;
      this.secondaryHeading = secondaryHeading;
      this.secondarySort = secondarySort;
    }
  };
  var HtmlResultsTable = class {
    /**
     * Creates a new HtmlResultsTable and appends it to the parent element.
     * @param parentElement - The parent element to append the table to.
     * @param project - The project number.
     * @param perPage - The number of items per page.
     * @param header - The header text for the table.
     * @param headings - The column headings.
     * @param results - The data to be displayed in the table.
     * @param resultsSort - The initial sorting configuration.
     * @param rowRenderer - A function to render custom rows.
     * @param cellRenderer - An object with functions to render custom cells.
     * @param cellHandler - A function to handle cell events.
     * @param exportExtra - Additional data for export.
     * @returns A new instance of HtmlResultsTable.
     */
    static createElement(parentElement, project, perPage, header, headings, results, resultsSort, rowRenderer, cellRenderer, cellHandler, exportExtra) {
      const pagedTable = new HtmlResultsTable(project, perPage, header, headings, results, resultsSort, rowRenderer, cellRenderer, cellHandler, exportExtra);
      parentElement.appendChild(pagedTable.baseElement);
      Plugin.postContentHeight();
      return pagedTable;
    }
    /**
     * Generates a formatted column number.
     * @param num - The number to format.
     * @returns A string representation of the formatted number.
     */
    static generateFormatedColumnNumber(num) {
      return `${num.toString().padStart(2, "0")}.`;
    }
    /**
     * Helper function for sorting results.
     * @param a - First value to compare.
     * @param aNum - Numeric representation of the first value.
     * @param aIsNum - Indicates if the first value is a number.
     * @param b - Second value to compare.
     * @param bNum - Numeric representation of the second value.
     * @param bIsNum - Indicates if the second value is a number.
     * @param sortOrder - The sort order to apply.
     * @returns A number indicating the sort order of the two values.
     */
    static sortResultsHelper(a, aNum, aIsNum, b, bNum, bIsNum, sortOrder) {
      if (aIsNum && bIsNum) {
        if (sortOrder === SortOrder.Ascending) {
          return aNum - bNum;
        } else {
          return bNum - aNum;
        }
      } else if (a !== void 0 && b !== void 0) {
        if (sortOrder === SortOrder.Ascending) {
          return a.localeCompare(b);
        } else {
          return b.localeCompare(a);
        }
      } else {
        console.warn(`sort failure: ${a}, ${b}`);
        return 0;
      }
    }
    /**
     * Creates a new instance of HtmlResultsTable.
     * @param project - The project number.
     * @param perPage - The number of items per page.
     * @param header - The header text for the table.
     * @param headings - The column headings.
     * @param results - The data to be displayed in the table.
     * @param resultsSort - The initial sorting configuration.
     * @param rowRenderer - A function to render custom rows.
     * @param cellRenderer - An object with functions to render custom cells.
     * @param cellHandler - A function to handle cell events.
     * @param exportExtra - Additional data for export.
     */
    constructor(project, perPage, header, headings, results, resultsSort, rowRenderer, cellRenderer, cellHandler, exportExtra) {
      this.paginationEdgeRangeDesktop = 2;
      this.paginationEdgeRangeMobile = 1;
      this.baseElement = document.createElement("div");
      this.header = header;
      this.results = results;
      this.resultsSort = resultsSort;
      this.headings = headings;
      this.perPage = perPage;
      this.project = project;
      this.resultsCount = results.length;
      this.resultsOffset = 0;
      this.cellRenderer = cellRenderer;
      this.rowRenderer = rowRenderer;
      this.cellHandler = cellHandler;
      this.exportExtra = exportExtra;
      this.scrollHandler = (ev) => {
        var _a;
        const evData = ev.data;
        if (evData == null) {
          this.setStickyHeaders(0);
          return;
        }
        const evDataData = evData.data;
        const scrollY = (_a = evDataData === null || evDataData === void 0 ? void 0 : evDataData.reportScrollY) !== null && _a !== void 0 ? _a : null;
        if (scrollY === null || (evData === null || evData === void 0 ? void 0 : evData.target) !== "interrobot") {
          return;
        }
        this.setStickyHeaders(scrollY);
      };
      this.navHandler = (ev) => {
        this.resultsOffset = parseInt(ev.target.dataset.offset);
        this.renderSection();
        Plugin.postContentHeight();
      };
      this.browserLinkHandler = (ev) => {
        const anchor = ev.target;
        const openInBrowser = true;
        Plugin.postOpenResourceLink(Number(anchor.dataset.id), openInBrowser);
        ev.preventDefault();
        ev.stopPropagation();
      };
      this.appLinkHandler = (ev) => {
        const anchor = ev.target;
        const openInBrowser = false;
        Plugin.postOpenResourceLink(Number(anchor.dataset.id), openInBrowser);
        ev.preventDefault();
        ev.stopPropagation();
      };
      this.sortableHandler = (ev) => {
        ev.preventDefault();
        if (this.results.length === 0) {
          return;
        }
        const anchor = ev.currentTarget;
        let sortHeading = anchor.dataset["heading"];
        let sortOrder;
        if (this.resultsSort.primaryHeading === sortHeading) {
          sortOrder = this.resultsSort.primarySort === SortOrder.Ascending ? SortOrder.Descending : SortOrder.Ascending;
        } else {
          sortOrder = SortOrder.Ascending;
        }
        this.resultsSort.primaryHeading = sortHeading;
        this.resultsSort.primarySort = sortOrder;
        this.resultsOffset = 0;
        this.sortResults();
        this.renderSection();
        const msg = {
          target: "interrobot",
          data: {
            reportScrollToTop: true
          }
        };
        window.parent.postMessage(msg, "*");
      };
      this.downloadMenuHandler = (ev) => {
        const dlLinks = this.baseElement.querySelector(".info__dl");
        if (dlLinks !== null) {
          dlLinks.classList.toggle("visible");
          ev.preventDefault();
        }
      };
      this.downloadHandler = (ev) => {
        var _a, _b;
        ev.preventDefault();
        const dlLinks = this.baseElement.querySelector(".info__dl");
        dlLinks.classList.remove("visible");
        let exportHeaders = this.headings.concat(Object.keys((_a = this.exportExtra) !== null && _a !== void 0 ? _a : {}));
        let truncatedExport = false;
        if (exportHeaders[0] === "") {
          truncatedExport = true;
          exportHeaders.shift();
        }
        const exportRows = [];
        for (let i = 0; i < this.results.length; i++) {
          const result = this.results[i];
          const resultValues = Object.values((_b = this.exportExtra) !== null && _b !== void 0 ? _b : {});
          const textResultValues = [];
          for (let resultValue of resultValues) {
            if (typeof resultValue === "function") {
              const returned = resultValue(i);
              textResultValues.push(returned);
            } else {
              textResultValues.push(resultValue.toString());
            }
          }
          if (truncatedExport) {
            exportRows.push(result.slice(1).concat(textResultValues));
          } else {
            exportRows.push(result.concat(textResultValues));
          }
        }
        const msg = {
          target: "interrobot",
          data: {
            reportExport: {
              format: ev.target.dataset.format,
              headers: exportHeaders,
              rows: exportRows
            }
          }
        };
        window.parent.postMessage(msg, "*");
      };
      this.renderSection();
    }
    /**
     * Gets the index of a heading in the headings array.
     * @param headingLabel - The label of the heading to find.
     * @returns The index of the heading, or -1 if not found.
     */
    getHeadingIndex(headingLabel) {
      return this.headings.indexOf(headingLabel);
    }
    /**
     * Gets the results data.
     * @returns The results data as a 2D array of strings.
     */
    getResults() {
      return this.results;
    }
    /**
     * Gets the headings of the table.
     * @returns An array of heading strings.
     */
    getHeadings() {
      return this.headings;
    }
    /**
     * Gets the current sorting configuration.
     * @returns The current HTMLResultsTableSort object.
     */
    getResultsSort() {
      return this.resultsSort;
    }
    /**
     * Sets the sticky headers based on the current scroll position.
     * @param scrollY - The current vertical scroll position.
     */
    setStickyHeaders(scrollY) {
      const thead = this.baseElement.querySelector("thead");
      const table = thead === null || thead === void 0 ? void 0 : thead.parentElement;
      if (thead === null || table === null) {
        return;
      }
      const rect = table.getBoundingClientRect();
      const inTable = rect.top <= scrollY && scrollY <= rect.bottom;
      if (inTable) {
        thead.classList.add("sticky");
        thead.style.top = `${scrollY - rect.top}px`;
      } else {
        thead.classList.remove("sticky");
        thead.style.top = `auto`;
      }
      return;
    }
    /**
     * Sets the current page offset.
     * @param page - The page number to set (0-indexed).
     */
    setOffsetPage(page) {
      const requestedPage = page * this.perPage;
      if (requestedPage !== this.resultsOffset) {
        this.resultsOffset = requestedPage;
        this.renderSection();
      }
    }
    sortResults() {
      const primaryHeading = this.resultsSort.primaryHeading;
      const primarySort = this.resultsSort.primarySort;
      const primarySortOnIndex = this.getHeadingIndex(primaryHeading);
      const secondaryHeading = this.resultsSort.secondaryHeading;
      const secondarySort = this.resultsSort.secondarySort;
      const secondarySortOnIndex = this.getHeadingIndex(secondaryHeading);
      const naturalNumberRegex = /^[-+]?[0-9]+([,.]?[0-9]+)?$/;
      if (primarySortOnIndex === -1) {
        console.warn(`heading '${this.resultsSort.primaryHeading}' not found, aborting sort`);
        return;
      }
      const compoundSort = (a, b) => {
        const primaryAVal = a[primarySortOnIndex];
        const primaryAValNumber = naturalNumberRegex.test(primaryAVal) ? parseFloat(primaryAVal) : null;
        const primaryAValIsNumber = primaryAValNumber !== null && !isNaN(primaryAValNumber);
        const primaryBVal = b[primarySortOnIndex];
        const primaryBValNumber = naturalNumberRegex.test(primaryBVal) ? parseFloat(primaryBVal) : null;
        const primaryBValIsNumber = primaryBValNumber !== null && !isNaN(primaryBValNumber);
        if (primaryAVal === primaryBVal) {
          const secondaryAVal = a[secondarySortOnIndex];
          const secondaryAValNumber = parseFloat(secondaryAVal);
          const secondaryAValIsNumber = !isNaN(secondaryAValNumber);
          const secondaryBVal = b[secondarySortOnIndex];
          const secondaryBValNumber = parseFloat(secondaryBVal);
          const secondaryBValIsNumber = !isNaN(secondaryBValNumber);
          return HtmlResultsTable.sortResultsHelper(secondaryAVal, secondaryAValNumber, secondaryAValIsNumber, secondaryBVal, secondaryBValNumber, secondaryBValIsNumber, secondarySort);
        } else {
          return HtmlResultsTable.sortResultsHelper(primaryAVal, primaryAValNumber, primaryAValIsNumber, primaryBVal, primaryBValNumber, primaryBValIsNumber, primarySort);
        }
      };
      this.results.sort(compoundSort);
      if (this.headings[0] === "") {
        for (let i = 0; i < this.results.length; i++) {
          this.results[i][0] = HtmlResultsTable.generateFormatedColumnNumber(i + 1);
        }
      }
    }
    getColumnClass(heading) {
      return `column__${heading ? heading.replace(/[^\w]+/g, "").toLowerCase() : "empty"}`;
    }
    renderTableHeadings(headings) {
      const out = [];
      const svg = `<svg version="1.1" class="chevrons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	        x="0px" y="0px" width="12px" height="20px" viewBox="6 2 12 20" enable-background="new 6 2 12 20" xml:space="preserve">
            <title>north/south chevrons</title>
	        <polyline class="d2" fill="none" stroke="#000000" stroke-miterlimit="10" points="7.32,16.655 12.015,21.208 16.566,16.633"/>
	        <polyline class="d1" fill="none" stroke="#000000" stroke-miterlimit="10" points="7.314,13.274 12.01,17.827 16.561,13.253"/>
	        <polyline class="u2" fill="none" stroke="#000000" stroke-miterlimit="10" points="16.685,10.594 12.115,6.041 7.439,10.615"/>
	        <polyline class="u1" fill="none" stroke="#000000" stroke-miterlimit="10" points="16.679,7.345 12.11,2.792 7.434,7.365"/>
        </svg>`;
      for (let heading of headings) {
        const encodedColumnClass = HtmlUtils.htmlEncode(this.getColumnClass(heading));
        const encodedLabel = `${HtmlUtils.htmlEncode(heading)}`;
        const sortable = encodedColumnClass !== "column__empty";
        let sortableLabel = "";
        let sortableChevronLink = "";
        if (sortable) {
          sortableLabel = `<a class="sortable" data-heading="${HtmlUtils.htmlEncode(heading)}" href="#">${HtmlUtils.htmlEncode(encodedLabel)}</a>`;
          sortableChevronLink = `<a title="${encodedLabel}" class="sortable" data-heading="${HtmlUtils.htmlEncode(heading)}" href="#">
                    ${svg}<span class="reader">${encodedLabel}</span></a>`;
        } else {
          sortableLabel = `${HtmlUtils.htmlEncode(encodedLabel)}`;
        }
        out.push(`<th class="${encodedColumnClass}">` + sortableLabel + " " + sortableChevronLink + `</th>`);
      }
      return out.join("");
    }
    renderTableData() {
      const filteredExpandedRows = [];
      const headingIdIndex = this.getHeadingIndex("ID");
      const resultsSlice = this.results.slice(this.resultsOffset, this.resultsOffset + this.perPage);
      for (let i = 0; i < resultsSlice.length; i++) {
        const row = resultsSlice[i];
        const rowHeadingMapped = this.headings.reduce((obj, key, index) => ({ ...obj, [key]: row[index] }), {});
        const rowCells = [];
        const rowClasses = [];
        if (this.rowRenderer) {
          const result = this.rowRenderer(row, this.headings);
          if ("classes" in result) {
            rowClasses.push.apply(rowClasses, result["classes"]);
          }
        }
        for (let j = 0; j < row.length; j++) {
          const classes = [];
          const cellHeading = this.headings[j];
          classes.push(this.getColumnClass(cellHeading));
          const cell = row[j];
          const cellNum = Number(cell);
          const cellIsNumeric = !isNaN(cellNum) || cell.match(/^\d+\/\d+$/) !== null;
          if (cellIsNumeric) {
            classes.push("numeric");
          } else if (HtmlUtils.isUrl(cell)) {
            classes.push("url");
          }
          let cellContents = `${cell}`;
          const cellNumber = Number(cell);
          const cellCallback = this.cellRenderer && cellHeading in this.cellRenderer ? this.cellRenderer[cellHeading] : null;
          if (cellCallback) {
            const callbackResult = cellCallback(cell, rowHeadingMapped, i);
            cellContents = callbackResult.content;
            classes.push(...callbackResult.classes);
          } else if (cellIsNumeric && !isNaN(cellNumber) && cellHeading !== "" && cellHeading !== "ID") {
            cellContents = `${Number(cell).toLocaleString()}`;
          } else if (classes.indexOf("url") > -1) {
            cellContents = `<a class="ulink" data-id="${HtmlUtils.htmlEncode(row[headingIdIndex])}" 
                        href="${HtmlUtils.htmlEncode(cell)}">${HtmlUtils.htmlEncode(cell)}</a>`;
          }
          rowCells.push(`<td class="${HtmlUtils.htmlEncode(classes.join(" "))}">${cellContents}</td>`);
        }
        filteredExpandedRows.push(`<tr class="${HtmlUtils.htmlEncode(rowClasses.join(" "))}">${rowCells.join("")}</tr>`);
      }
      return filteredExpandedRows;
    }
    renderSection() {
      this.removeHandlers();
      if (this.resultsSort.primarySort !== null && this.resultsSort.primaryHeading !== null) {
        this.sortResults();
      }
      const filteredExpandedRows = this.renderTableData();
      if (filteredExpandedRows.length === 0) {
        this.baseElement.innerHTML = `<section>${this.header}<p>No results found.</p></section>`;
        return;
      }
      const expandedNavigation = [];
      const resultPages = this.getPagination();
      const navigationTest = { "\u25C0\u25C0": true, "\u25B6\u25B6": true };
      for (let i = 0; i < resultPages.length; i++) {
        const page = resultPages[i];
        let classnames = [];
        if (page.label in navigationTest) {
          classnames.push(page.label == "\u25C0\u25C0" ? "rewind" : "fastforward");
        } else if (page.offset === this.resultsOffset) {
          classnames.push("current");
        } else if (page.extended) {
          classnames.push("extended");
        }
        expandedNavigation.push(`<button class="${classnames.join(" ")}" data-offset="${page.offset}">${page.label}</button>`);
      }
      const resultStart = this.resultsOffset + 1;
      const resultEnd = Math.min(this.resultsCount, this.resultsOffset + this.perPage);
      const exportIconChar = this.isCorePlugin() ? "`" : "\u229E";
      let section = `<section>
            ${this.header}
            <hgroup>
                <div class="info">
                    <span class="info__dl export">
                        <button class="icon">\u229E</button>
                        <ul class="export__ulink">
                            <li><a class="ulink" href="#" data-format="csv">Export CSV</a></li>
                            <li><a class="ulink" href="#" data-format="xlsx">Export Excel</a></li>
                        </ul>
                    </span>
                    <span class="info__results"><span class="info__results__nobr">
                        ${resultStart.toLocaleString()} - ${resultEnd.toLocaleString()}</span> 
                        <span class="info__results__nobr">of ${this.resultsCount.toLocaleString()}</span></span>
                </div>
                <nav>${expandedNavigation.join("")}</nav>
            </hgroup>
            <div class="datatable">
                <table>
                    <thead>
                        <tr>
                            ${this.renderTableHeadings(this.headings)}                        
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredExpandedRows.join("")}
                    </tbody>
                </table>
            </div>`;
      this.baseElement.innerHTML = section;
      const sortables = this.baseElement.querySelectorAll(`a.sortable`);
      for (let i = 0; i < sortables.length; i++) {
        const sortAnchor = sortables[i];
        sortAnchor.classList.remove("ascending", "descending");
        if (sortAnchor.dataset.heading === this.resultsSort.primaryHeading) {
          const sortClass = this.resultsSort.primarySort == SortOrder.Ascending ? "ascending" : "descending";
          sortAnchor.classList.add(sortClass);
        }
      }
      this.addHandlers();
    }
    /**
     * Adds event handlers to the table elements.
     */
    addHandlers() {
      this.applyHandlers(true);
    }
    /**
     * Removes event handlers from the table elements.
     */
    removeHandlers() {
      this.applyHandlers(false);
    }
    /**
     * Identifies a core plugin (as true)
     */
    isCorePlugin() {
      const iframed = window.self !== window.top;
      let sameDomain = false;
      if (iframed) {
        try {
          sameDomain = Boolean(window.parent.location.href);
        } catch (e) {
          sameDomain = false;
        }
      }
      return iframed && sameDomain;
    }
    applyHandlers(add) {
      const navLinkMethod = add ? "addEventListener" : "removeEventListener";
      const navButtons = this.baseElement.querySelectorAll("nav button");
      for (let i = 0; i < navButtons.length; i++) {
        const navButton = navButtons[i];
        navButton[navLinkMethod]("click", this.navHandler);
      }
      const downloadLinks = this.baseElement.querySelectorAll(".info__dl .ulink");
      for (let i = 0; i < downloadLinks.length; i++) {
        const dlLink = downloadLinks[i];
        dlLink[navLinkMethod]("click", this.downloadHandler);
      }
      const downloadMenuToggle = this.baseElement.querySelector(".info__dl button");
      if (downloadMenuToggle !== null) {
        downloadMenuToggle[navLinkMethod]("click", this.downloadMenuHandler);
        const hasMouse = matchMedia("(pointer:fine)").matches && !/android/i.test(window.navigator.userAgent);
        if (hasMouse) {
          const dl = this.baseElement.querySelector(".info__dl");
          dl === null || dl === void 0 ? void 0 : dl.classList.add("hasmouse");
        }
      }
      const stickyHead = this.baseElement.querySelector("thead");
      if (stickyHead) {
        window[navLinkMethod]("message", this.scrollHandler);
        window[navLinkMethod]("resize", this.scrollHandler);
      }
      const table = this.baseElement.querySelector("table");
      if (table) {
        const wrap = document.querySelector(".wrap");
        table[navLinkMethod]("touchstart", (ev) => {
          wrap === null || wrap === void 0 ? void 0 : wrap.classList.add("dragging");
          ev.stopPropagation();
        }, { passive: true });
        table[navLinkMethod]("touchend", (ev) => {
          wrap === null || wrap === void 0 ? void 0 : wrap.classList.remove("dragging");
          ev.stopPropagation();
        }, { passive: true });
        table[navLinkMethod]("touchmove", (ev) => {
          ev.stopPropagation();
        }, { passive: true });
      }
      const customButtons = this.baseElement.querySelectorAll("button.custom");
      if (this.cellHandler) {
        for (let button of customButtons) {
          button[navLinkMethod]("click", this.cellHandler);
        }
      }
      const browserLinks = this.baseElement.querySelectorAll("td.url a");
      for (let i = 0; i < browserLinks.length; i++) {
        const browserLink = browserLinks[i];
        browserLink[navLinkMethod]("click", this.browserLinkHandler);
      }
      for (let i = 0; i < navButtons.length; i++) {
        const navButton = navButtons[i];
        navButton[navLinkMethod]("click", this.navHandler);
      }
      const appLinks = this.baseElement.querySelectorAll("td.column__id a");
      for (let i = 0; i < appLinks.length; i++) {
        const appLink = appLinks[i];
        appLink[navLinkMethod]("click", this.appLinkHandler);
      }
      const sortables = this.baseElement.querySelectorAll("th a.sortable");
      for (let i = 0; i < sortables.length; i++) {
        const sortable = sortables[i];
        sortable[navLinkMethod]("click", this.sortableHandler);
      }
    }
    /**
     * Gets the pagination configuration.
     * @returns An array of HTMLResultsTablePage objects representing the pagination.
     */
    getPagination() {
      const pages = [];
      let pagesAdded = 0;
      let precedingPagesMaxDesktop = this.paginationEdgeRangeDesktop;
      let precedingPagesMaxMobile = this.paginationEdgeRangeMobile;
      const precedingPages = Math.ceil(this.resultsOffset / this.perPage);
      const addPrecedingDesktopPages = Math.max(precedingPagesMaxDesktop - precedingPages, 0);
      const addPrecedingMobilePages = Math.max(precedingPagesMaxMobile - precedingPages, 0);
      precedingPagesMaxDesktop += Math.max(addPrecedingDesktopPages, 0);
      precedingPagesMaxMobile += Math.max(addPrecedingMobilePages, 0);
      let tempOffset = this.resultsOffset;
      while (tempOffset > 0 && pagesAdded < precedingPagesMaxDesktop) {
        tempOffset -= this.perPage;
        const pageLinkLabel = `${tempOffset / this.perPage + 1}`;
        const pageLink = new HTMLResultsTablePage(pageLinkLabel, tempOffset, this.perPage, pagesAdded >= precedingPagesMaxMobile);
        pages.push(pageLink);
        pagesAdded++;
      }
      if (this.resultsOffset > 0) {
        pages.push(new HTMLResultsTablePage("\u25C0", this.resultsOffset - this.perPage, this.perPage, false));
        pages.push(new HTMLResultsTablePage("\u25C0\u25C0", 0, this.perPage, false));
      }
      pages.reverse();
      if (this.resultsCount > this.perPage) {
        const pageLinkLabel = `${this.resultsOffset / this.perPage + 1}`;
        const pageLink = new HTMLResultsTablePage(pageLinkLabel, this.resultsOffset, this.perPage, false);
        pages.push(pageLink);
      }
      let followingPagesMaxDesktop = this.paginationEdgeRangeDesktop;
      let followingPagesMaxMobile = this.paginationEdgeRangeMobile;
      const followingPages = Math.ceil(this.resultsOffset / this.perPage);
      const addFollowingDesktopPages = Math.max(followingPagesMaxDesktop - followingPages, 0);
      const addFollowingMobilePages = Math.max(followingPagesMaxMobile - followingPages, 0);
      followingPagesMaxDesktop += Math.max(addFollowingDesktopPages, 0);
      followingPagesMaxMobile += Math.max(addFollowingMobilePages, 0);
      pagesAdded = 0;
      tempOffset = this.resultsOffset + this.perPage;
      while (tempOffset < this.resultsCount && pagesAdded < followingPagesMaxDesktop) {
        const pageLinkLabel = `${tempOffset / this.perPage + 1}`;
        const pageLink = new HTMLResultsTablePage(pageLinkLabel, tempOffset, this.perPage, pagesAdded >= followingPagesMaxMobile);
        pages.push(pageLink);
        tempOffset += this.perPage;
        pagesAdded++;
      }
      if (this.resultsCount > this.resultsOffset + this.perPage) {
        pages.push(new HTMLResultsTablePage("\u25B6", this.resultsOffset + this.perPage, this.perPage, false));
        let modLast = this.resultsCount - this.resultsCount % this.perPage;
        modLast = modLast == this.resultsCount ? modLast - this.perPage : modLast;
        pages.push(new HTMLResultsTablePage("\u25B6\u25B6", modLast, this.perPage, false));
      }
      return pages;
    }
  };

  // examples/vanillats/js/build/examples/vanillats/ts/wordcloud.js
  var WordcloudLayout = class {
    constructor(id, name, spiral, separated) {
      if (["archimedean", "rectangular"].indexOf(spiral) === -1) {
        throw new Error("invalid spiral value");
      }
      this.id = id;
      this.name = name;
      this.spiral = spiral;
      this.separated = separated;
    }
    toString() {
      return `{ id: ${this.id}, name: ${this.name}, spiral: ${this.spiral}, separated: ${this.separated},]`;
    }
  };
  var WordcloudWord = class {
    constructor(word, count) {
      this.count = 0;
      this.word = word;
      this.count = count;
    }
    incrementCount() {
      this.count++;
    }
    getCount() {
      return this.count;
    }
    getWord() {
      return this.word;
    }
    toString() {
      return `[${this.word} => ${this.count}]`;
    }
  };
  var Wordcloud = class extends Plugin {
    static getWordLayoutFontSize(words, value) {
      if (Wordcloud.cloudWordLayoutMemo === void 0) {
        let wordsMaxVal = 0;
        let wordsMinVal = 1e7;
        words.forEach((word) => {
          wordsMaxVal = Math.max(wordsMaxVal, word["value"]);
          wordsMinVal = Math.min(wordsMinVal, word["value"]);
        });
        const wordsMinValLog2 = Math.log1p(wordsMinVal);
        const wordsMaxValLog2 = Math.log1p(wordsMaxVal);
        Wordcloud.cloudWordLayoutMemo = {
          count: words.length,
          min: wordsMinVal,
          max: wordsMaxVal,
          minLog: wordsMinValLog2,
          maxLog: wordsMaxValLog2
        };
      }
      const wordsMinValLog = Wordcloud.cloudWordLayoutMemo["minLog"];
      const wordsMaxValLog = Wordcloud.cloudWordLayoutMemo["maxLog"];
      const normalizedValue = (Math.log1p(value) - wordsMaxValLog) / (wordsMinValLog - wordsMaxValLog);
      const scaledValue = Wordcloud.wordsMaxOutput - (Wordcloud.wordsMaxOutput - Wordcloud.wordsMinOutput) * Math.pow(normalizedValue, 2);
      const clamped = Math.round(Math.min(Math.max(scaledValue, Wordcloud.wordsMinOutput), Wordcloud.wordsMaxOutput));
      return clamped;
    }
    constructor() {
      super();
      this.language = "en_US";
      this.wordMap = /* @__PURE__ */ new Map();
      this.wordMapPresentation = [];
      this.resultsMap = /* @__PURE__ */ new Map();
      this.perPage = 25;
      this.table = null;
      this.progress = null;
      this.stopwordsTruth = Stopwords.getStopwordsTruth("en");
      this.init(Wordcloud.meta);
      this.deleteWordHandler = async (ev) => {
        const button = ev.target;
        for (let i = 0; i < this.wordMapPresentation.length; i++) {
          const cloudword = this.wordMapPresentation[i];
          console.log(`-- ${button.dataset.word} ${cloudword.word}`);
          if (cloudword.word === button.dataset.word) {
            this.wordMapPresentation.splice(i, 1);
            await this.displayResults();
            break;
          }
        }
      };
      this.addWordHandler = async (ev) => {
        ev.preventDefault();
        const button = ev.target;
        const form = button.form;
        const wordInput = form === null || form === void 0 ? void 0 : form.querySelector("input[name='word']");
        const countInput = form === null || form === void 0 ? void 0 : form.querySelector("input[name='count']");
        const word = wordInput.value;
        const count = Math.ceil(Number(countInput.value));
        if (word.length < this.minWordLength || count <= 0) {
          form.classList.add("error");
          window.setTimeout(() => {
            form.classList.remove("error");
          }, 900);
          ev.preventDefault();
          return;
        }
        const newWord = new WordcloudWord(word, count);
        console.log(newWord);
        this.wordMapPresentation.push(newWord);
        this.wordMapPresentation = this.sortAndTruncatePresentation(this.wordMapPresentation);
        console.log(this.wordMapPresentation);
        await this.displayResults();
        ev.preventDefault();
      };
      this.cloudExpandHandler = (ev) => {
        ev.preventDefault();
        const svgContainer = document.querySelector(".cloud__wrapper");
        if (!svgContainer) {
          return;
        } else if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          svgContainer === null || svgContainer === void 0 ? void 0 : svgContainer.requestFullscreen();
        }
      };
      this.cloudRefreshHandler = (ev) => {
        ev.preventDefault();
        this.displayResults();
      };
      this.cloudDownloadHandler = async (ev) => {
        ev.preventDefault();
        const svg = d3.select(`#${Wordcloud.svgId}`).node();
        const date = /* @__PURE__ */ new Date();
        const dateString = date.toISOString().slice(0, 16).replace(/[\-\:T]/g, "");
        const filename = `wordcloud-${dateString}.png`;
        await this.saveSvgAsImage(svg, filename);
        const msg = document.querySelector(".cloud__message");
        if (msg) {
          msg.innerText = `Saved ${filename} to ./Downloads`;
          msg.classList.add("visible");
          window.setTimeout(() => {
            msg.classList.remove("visible");
            msg.innerText = ``;
          }, 5e3);
        }
      };
      this.index();
    }
    async index() {
      const project = await Project.getApiProject(this.getProjectId());
      this.render(`
            ${Templates.standardHeading(project, Wordcloud.meta["title"])}
            ${Templates.standardForm(`
            <form class="main__form__standard main__form__ltr main__form__wordcloud" id="WordcloudForm" spellcheck="false">
                <label>
                    <span>Strategy</span>
                    <select name="strategy">
                        <option value="1">Frequency</option>
                        <option value="0">Jargon</option>
                        
                    </select>                 
                </label>
                <label>
                    <span>Layout</span>
                    <select name="layout">
                    </select>                 
                </label>
                <label>
                    <span>Min Word Length</span>
                    <select name="minWordLength">
                        <option value="3">3 characters</option>
                        <option value="4">4 characters</option>
                        <option value="5">5 characters</option>
                    </select>                 
                </label>
                <label>
                    <span>Font Family</span>
                    <input type="text" name="fontFamily" placeholder="Optional font" />
                </label>
                <label>
                    <span>Background</span>
                    <input type="color" name="backgroundColor" value="#ffffff" />
                    <span class="main__form__color">#??????</span>
                </label>
                <div><button class="submit">Generate</button></div> 
            </form>
            <div id="WordcloudFormProgress"></div>`)}
            ${Templates.standardResults()}
        `);
      const strategySelect = document.querySelector("select[name='strategy']");
      const minWordLengthSelect = document.querySelector("select[name='minWordLength']");
      const layoutSelect = document.querySelector("select[name='layout']");
      const backgroundColorInput = document.querySelector("input[name='backgroundColor']");
      const fontFamilyInput = document.querySelector("input[name='fontFamily']");
      const progressWrapper = document.getElementById("WordcloudFormProgress");
      for (let i = 0; i < Wordcloud.layouts.length; i++) {
        const clayout = Wordcloud.layouts[i];
        const option = document.createElement("option");
        option.innerText = clayout.name;
        option.setAttribute("value", `${clayout.id}`);
        layoutSelect.appendChild(option);
      }
      fontFamilyInput.addEventListener("mousedown", () => {
        const elementId = "Fontlist";
        let container = document.getElementById(elementId);
        if (container === null) {
          container = document.createElement("div");
          container.id = elementId;
          container.style.width = `${fontFamilyInput.offsetWidth}px`;
          container.classList.add("fontlist");
          const options = [
            "Arial",
            "Georgia",
            "Impact",
            "Palatino",
            "Tahoma",
            "Times New Roman",
            "Verdana"
          ];
          options.forEach((font) => {
            const option = document.createElement("a");
            option.innerText = font;
            option.href = "#";
            container.appendChild(option);
            option.addEventListener("mousedown", (ev) => {
              fontFamilyInput.value = font;
              container.style.display = "none";
              const event = new Event("change", {
                bubbles: true,
                cancelable: true
              });
              fontFamilyInput.dispatchEvent(event);
            });
            option.addEventListener("click", (ev) => {
              ev.preventDefault();
            });
          });
          fontFamilyInput.parentElement.classList.add("fontlist__label");
          fontFamilyInput.parentElement.appendChild(container);
        } else {
          container.style.display = "block";
          container.style.width = `${fontFamilyInput.offsetWidth}px`;
        }
        fontFamilyInput.addEventListener("blur", () => {
          container.style.display = "none";
        });
      });
      const defaultData = {};
      const autoformFields = [strategySelect, minWordLengthSelect, layoutSelect, backgroundColorInput, fontFamilyInput];
      await this.initData(Wordcloud.meta, defaultData, autoformFields);
      const updateFormValues = () => {
        var _a;
        this.strategy = Number(strategySelect.value);
        this.layout = (_a = Wordcloud.layouts.find((a) => a.id.toString() == layoutSelect.value)) !== null && _a !== void 0 ? _a : Wordcloud.layouts[0];
        this.minWordLength = Number(minWordLengthSelect.value);
        this.backgroundColor = backgroundColorInput.value;
        this.fontFamily = fontFamilyInput.value ? fontFamilyInput.value : "Montserrat SemiBold";
        const colorEcho = document.querySelector(".main__form__color");
        if (colorEcho) {
          colorEcho.innerText = this.backgroundColor;
        }
      };
      backgroundColorInput.addEventListener("change", (ev) => {
        updateFormValues();
      });
      this.progress = HtmlProcessingWidget.createElement(progressWrapper, "Scanning: ");
      this.strategy = Number(strategySelect.value);
      updateFormValues();
      const button = document.querySelector("button");
      button.addEventListener("click", async (ev) => {
        ev.preventDefault();
        button.setAttribute("disabled", "disabled");
        updateFormValues();
        try {
          await this.process();
        } catch (ex) {
          console.error(ex);
        } finally {
          button.removeAttribute("disabled");
        }
      });
      Plugin.postContentHeight();
    }
    async process() {
      await this.data.updateData();
      const basePath = "/hunspell";
      const requestOptions = {
        method: "GET",
        headers: {
          Accept: "text/plain",
          "Content-Type": "text/plain; charset=UTF-8"
        }
      };
      let [affData, wordsData] = await Promise.all([
        fetch(`${Wordcloud.baseMediaPath}/hunspell/${this.language}.aff`, requestOptions).then((response) => response.text()),
        fetch(`${Wordcloud.baseMediaPath}/hunspell/${this.language}.dic`, requestOptions).then((response) => response.text())
      ]);
      Wordcloud.typo = new Typo(this.language, affData, wordsData);
      this.wordMap.clear();
      const projectId = this.getProjectId();
      const internalQueryString = "headers: text/html";
      const internalHtmlPagesQuery = new SearchQuery(projectId, internalQueryString, "content", SearchQueryType.Any, false);
      await Search.execute(internalHtmlPagesQuery, this.resultsMap, "Finding jargon\u2026", async (result) => {
        await this.wordcloudResultHandler(result);
      });
      let wordcloudWordList = [...this.wordMap.values()];
      this.wordMapPresentation = this.sortAndTruncatePresentation(wordcloudWordList);
      await this.report();
    }
    async report() {
      await this.displayResults();
    }
    sortAndTruncatePresentation(wordcloudWordList) {
      wordcloudWordList = wordcloudWordList.filter((word) => word.getWord().length >= this.minWordLength);
      wordcloudWordList.sort((a, b) => b.getCount() - a.getCount());
      return wordcloudWordList.slice(0, Wordcloud.maxPresentationWords);
    }
    async displayResults() {
      var _a;
      Wordcloud.cloudWordLayoutMemo = void 0;
      this.removeHandlers();
      const resultsBits = [];
      resultsBits.push(`<div class="cloud__wrapper">`);
      resultsBits.push(`<form action="." method="get" class="cloud__actions">
            <div>
            <button class="cloud__action" aria-label="Expand">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="128px"
                height="128px" viewBox="388.5 1532.71 128 128" xml:space="preserve">
                <path d="M508.938,1653.148h-34.469v-7h27.469v-27.47h7V1653.148z M430.529,1653.148h-34.469v-34.47h7v27.47h27.469V1653.148z
                    M508.938,1574.741h-7v-27.47h-27.469v-7h34.469V1574.741z M403.06,1574.741h-7v-34.47h34.469v7H403.06V1574.741z"/>
            </svg>
            </button>
            <button class="cloud__action" aria-label="Refresh">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="128px"
                height="128px" viewBox="1188.5 1372.466 128 128" xml:space="preserve">
                <path d="M1210.944,1399.189c20.188-20.277,52.974-20.333,73.239-0.146l15.24,13.926v-16.084c0-2.383,8.632-2.383,8.632,0v25.896
                    c0,2.384-1.934,4.316-4.315,4.316h-25.896c-2.383,0-2.383-8.633,0-8.633h14.791l-14.342-13.14
                    c-0.045-0.044-0.101-0.089-0.134-0.135c-16.522-16.499-43.15-16.893-60.134-0.876c-17.343,16.354-18.142,43.666-1.788,61.01
                    c16.355,17.343,43.668,18.142,61.01,1.786c1.743-1.64,4.464-1.562,6.104,0.169c1.642,1.743,1.574,4.462-0.168,6.104
                    c-9.587,9.104-22.322,14.174-35.552,14.14h-0.696c-28.324-0.382-51.097-23.457-51.097-51.793
                    C1195.838,1422.028,1201.267,1408.889,1210.944,1399.189z"/>
            </svg>
            </button>
            <button class="cloud__action" aria-label="Download">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="128px"
                    height="128px" viewBox="1028.5 1212.5 128 128" xml:space="preserve">                    
                    <path d="M1066.222,1283.45l23.792,23.762c1.328,1.33,3.645,1.33,4.973,0l23.839-23.839c-0.018-0.049-0.116-0.781-1.131-2.058 c-1.345-1.692-3.121-2.872-3.875-2.872l-17.801,17.788v-75.353c-0.15-0.188-1.402-0.727-3.519-0.727s-3.368,0.539-3.54,0.814 l0.021,75.265l-17.834-17.832c-0.722,0.044-2.498,1.224-3.842,2.916C1066.291,1282.592,1066.192,1283.323,1066.222,1283.45z"/>
                    <path d="M1040.056,1290.463c-2.116,0-3.367,0.538-3.539,0.813l0.021,40.054c0,0.383,0,1.126,0.062,1.456 c0.33,0.062,1.073,0.062,1.456,0.062h108.889c0.383,0,1.126,0,1.456-0.062c0.062-0.33,0.062-1.073,0.062-1.456v-40.142 c-0.15-0.188-1.401-0.726-3.518-0.726c-2.115,0-3.366,0.538-3.538,0.813l0.021,34.537h-97.855v-34.625 C1043.422,1291.001,1042.171,1290.463,1040.056,1290.463z"/>                </svg>
            </button>
            </div>
            <div class="cloud__message">
                Hello, how are you?
            </div>
        </form>`);
      let fontdata = "";
      try {
        const response = await fetch(Wordcloud.embedFont);
        const blob = await response.blob();
        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.onloadend = () => resolve();
          reader.readAsDataURL(blob);
        });
        fontdata = reader.result.toString().split(",")[1];
      } catch {
        console.warn("default font not embedded in svg");
      }
      const stackedEmbedCss = `
            text {
                stroke: #cccccc44;
                paint-order: stroke;
            }
            .stacked text {
                stroke: #ffffffcc;
                stroke-width: 5px;
                paint-order: stroke;
            }
            .stacked .zsort {position: relative;}  
            .stacked .zsort5 {opacity: 10%;}
            .stacked .zsort6 {opacity: 10%;}
            .stacked .zsort7 {opacity: 11%;}
            .stacked .zsort8 {opacity: 11%;}
            .stacked .zsort9 {opacity: 12%;}
            .stacked .zsort10 {opacity: 12%;}
            .stacked .zsort11 {opacity: 13%;}
            .stacked .zsort12 {opacity: 13%;}
            .stacked .zsort13 {opacity: 14%;}
            .stacked .zsort14 {opacity: 14%;}
            .stacked .zsort15 {opacity: 15%;}
            .stacked .zsort16 {opacity: 15%;}
            .stacked .zsort17 {opacity: 16%;}
            .stacked .zsort18 {opacity: 17%;}
            .stacked .zsort19 {opacity: 17%;}
            .stacked .zsort20 {opacity: 18%;}
            .stacked .zsort21 {opacity: 19%;}
            .stacked .zsort22 {opacity: 19%;}
            .stacked .zsort23 {opacity: 20%;}
            .stacked .zsort24 {opacity: 21%;}
            .stacked .zsort25 {opacity: 22%;}
            .stacked .zsort26 {opacity: 23%;}
            .stacked .zsort27 {opacity: 24%;}
            .stacked .zsort28 {opacity: 25%;}
            .stacked .zsort29 {opacity: 26%;}
            .stacked .zsort30 {opacity: 27%;}
            .stacked .zsort31 {opacity: 28%;}
            .stacked .zsort32 {opacity: 29%;}
            .stacked .zsort33 {opacity: 31%;}
            .stacked .zsort34 {opacity: 32%;}
            .stacked .zsort35 {opacity: 34%;}
            .stacked .zsort36 {opacity: 35%;}
            .stacked .zsort37 {opacity: 37%;}
            .stacked .zsort38 {opacity: 39%;}
            .stacked .zsort39 {opacity: 41%;}
            .stacked .zsort40 {opacity: 43%;}
            .stacked .zsort41 {opacity: 45%;}
            .stacked .zsort42 {opacity: 47%;}
            .stacked .zsort43 {opacity: 49%;}
            .stacked .zsort44 {opacity: 52%;}
            .stacked .zsort45 {opacity: 54%;}
            .stacked .zsort46 {opacity: 57%;}
            .stacked .zsort47 {opacity: 60%;}
            .stacked .zsort48 {opacity: 63%;}
            .stacked .zsort49 {opacity: 67%;}
            .stacked .zsort50 {opacity: 70%;}
            .stacked .zsort51 {opacity: 74%;}
            .stacked .zsort52 {opacity: 78%;}
            .stacked .zsort53 {opacity: 82%;}
            .stacked .zsort54 {opacity: 87%;}
            .stacked .zsort55 {opacity: 92%;}`;
      resultsBits.push(`<svg class="cloud ${this.layout.spiral}" id="${Wordcloud.svgId}" width="${Wordcloud.svgWidth}" height="${Wordcloud.svgHeight}"
            viewBox="0 0 ${Wordcloud.svgWidth} ${Wordcloud.svgHeight}" fill="${this.backgroundColor}" 
            preserveAspectRatio="xMidYMid meet">
            <style>
            @font-face {
                font-family: 'Montserrat SemiBold';
                font-style: normal;
                font-weight: 600;
                src: url("data:font/woff2;base64,${fontdata}") format("woff2");
            }
            svg {
                font-family: "Montserrat SemiBold";
            }
            ${stackedEmbedCss}
            </style>
            </svg>`);
      resultsBits.push(`</div>`);
      const resultsElement = document.querySelector(".main__results");
      if (resultsElement !== null) {
        resultsElement.innerHTML = resultsBits.join("");
        const svg = resultsElement.querySelector("svg.cloud");
        if (svg !== null) {
          svg.style.backgroundColor = (_a = this.backgroundColor) !== null && _a !== void 0 ? _a : "#ffffff";
        }
      }
      const header = `<h2><span class="keywords">Word Cloud Terms</span></h2>
            <div>
                <p>
                Review word cloud data and modify terms (maximum ${Wordcloud.maxPresentationWords} words).
                </p>
                <form id="WordcloundManagerAdd" action="." method="GET">
                    <input type="text" name="word" placeholder="term" required />
                    <input type="number" name="count" placeholder="count" required />
                    <button>Add Term</button>
                </form>
            </div>`;
      const headings = ["", "TERM", "COUNT"];
      const results = [];
      for (let i = 0; i < this.wordMapPresentation.length; i++) {
        const cloudword = this.wordMapPresentation[i];
        const encodedCloudword = HtmlUtils.htmlEncode(cloudword.word);
        results.push([
          HtmlResultsTable.generateFormatedColumnNumber(i + 1),
          `${cloudword.getWord()}`,
          `${cloudword.getCount()}`
        ]);
      }
      const exportExtra = {};
      const cellHandler = async (ev) => {
        const button = ev.target;
        if (!button) {
          return;
        }
        this.deleteWordHandler(ev);
      };
      const rowRenderer = null;
      const cellRenderer = {
        "TERM": (cellValue, rowData) => {
          return {
            "classes": ["term"],
            "content": `<strong>${cellValue}</strong>
                        <button class="custom" data-word="${cellValue}">
                        <span>\xD7</span> Remove</button>`
          };
        }
      };
      const resultsSort = new HTMLResultsTableSort("COUNT", SortOrder.Descending, "TERM", SortOrder.Ascending);
      this.table = HtmlResultsTable.createElement(resultsElement, this.getProjectId(), this.perPage, header, headings, results, resultsSort, rowRenderer, cellRenderer, cellHandler, exportExtra);
      this.addHandlers();
      this.generateCloud();
      Plugin.postContentHeight();
    }
    draw(words) {
      if (this.cloudLayout === null) {
        console.error("layout unavailable (not ready)");
        return;
      }
      if (words.length === 0) {
        console.error("no words to add to cloud");
        return;
      }
      words.reverse();
      const halfWidth = Wordcloud.svgWidth / 2;
      const halfHeight = Wordcloud.svgHeight / 2;
      const color = d3.scaleOrdinal(d3.schemeCategory10);
      const transform = `translate(${halfWidth},${halfHeight})`;
      const svg = d3.select(`#${Wordcloud.svgId}`);
      const g = svg.append("g");
      g.attr("transform", transform);
      g.selectAll("text").data(words).enter().append("text").style("font-size", (d) => `${Wordcloud.getWordLayoutFontSize(words, d.value)}px`).style("font-family", (d) => `${d.fontFamily}`).style("fill", (d, i) => color(i)).attr("text-anchor", "middle").attr("transform", (d) => `translate(${d.x},${d.y})rotate(${d.rotate})`).text((d) => d.text);
      const svgEl = document.getElementById(Wordcloud.svgId);
      const allText = svgEl.querySelectorAll("text");
      for (let i = 0; i < allText.length; i++) {
        const text = allText[i];
        const textSize = parseInt(text.style.fontSize, 10);
        text.classList.add(`zsort`, `zsort${textSize}`);
      }
    }
    generateCloud() {
      let topVal = 0;
      const data = [];
      for (let i = 0; i < this.wordMapPresentation.length; i++) {
        const cloudword = this.wordMapPresentation[i];
        const cloudwordWord = cloudword.getWord();
        const cloudwordCount = cloudword.getCount();
        topVal = Math.max(topVal, cloudwordCount);
        data.push(cloudword);
      }
      const words = data.map((d) => ({
        text: d.getWord(),
        value: d.getCount(),
        fontFamily: this.fontFamily
        // x, y, and rotate will be set by the cloud layout
      }));
      const svgEl = document.getElementById(Wordcloud.svgId);
      svgEl.classList.remove("stacked");
      if (!this.layout.separated) {
        svgEl.classList.add("stacked");
      }
      this.cloudLayout = d3.layout.cloud().size([Wordcloud.svgWidth, Wordcloud.svgHeight]).words(words).font(this.layout.separated ? this.fontFamily : "").padding(4).rotate(() => ~~(Math.random() * 2) * 90).fontSize(function(d) {
        return Wordcloud.getWordLayoutFontSize(words, d.value);
      }).spiral(this.layout.spiral).on("end", this.draw);
      this.cloudLayout.start();
    }
    addHandlers() {
      if (this.table) {
        this.table.addHandlers();
      }
      this.applyHandlers(true);
    }
    removeHandlers() {
      if (this.table) {
        this.table.removeHandlers();
      }
      this.applyHandlers(false);
    }
    applyHandlers(add) {
      const navLinkMethod = add ? "addEventListener" : "removeEventListener";
      const actions = document.querySelectorAll(".cloud__action");
      if (actions.length == 3) {
        actions[0][navLinkMethod]("click", this.cloudExpandHandler);
        actions[1][navLinkMethod]("click", this.cloudRefreshHandler);
        actions[2][navLinkMethod]("click", this.cloudDownloadHandler);
        const rgb = parseInt(this.backgroundColor.slice(1), 16);
        const r = rgb >> 16 & 255, g = rgb >> 8 & 255, b = rgb & 255;
        const isLight = 0.2126 * r + 0.7152 * g + 0.0722 * b > 128;
        console.log(this.backgroundColor);
        console.log(isLight);
        if (isLight) {
          actions[0].classList.add("light");
          actions[1].classList.add("light");
          actions[2].classList.add("light");
        } else {
          actions[0].classList.remove("light");
          actions[1].classList.remove("light");
          actions[2].classList.remove("light");
        }
      } else {
        console.warn("wordcloud actions not found");
      }
      const addWordForm = document.getElementById("WordcloundManagerAdd");
      const addWordButton = addWordForm === null || addWordForm === void 0 ? void 0 : addWordForm.querySelector("button");
      if (addWordButton) {
        addWordButton[navLinkMethod]("click", this.addWordHandler);
      }
    }
    async wordcloudResultHandler(result) {
      if (!result.getContent() && !result.hasProcessedContent()) {
        return;
      }
      if (!result.hasProcessedContent()) {
        const textonly = result.getContentTextOnly();
        result.setProcessedContent(textonly);
        result.clearFulltextFields();
      }
      const documentTextWords = result.getProcessedContent().split(Wordcloud.wordSplitRe);
      for (let documentTextWord of documentTextWords) {
        let cleanedWord = documentTextWord.replace(Wordcloud.wordTrimRe, "");
        cleanedWord = cleanedWord.replace(/[‘’]/, "'");
        if (this.stopwordsTruth[cleanedWord.toLowerCase()] !== void 0) {
          continue;
        }
        if (cleanedWord.length < this.minWordLength) {
          continue;
        }
        const addToWordmap = (cleanedWord2) => {
          const wordMapKey = cleanedWord2.toLocaleLowerCase();
          let wordcloudWord = this.wordMap.get(wordMapKey);
          if (wordcloudWord === void 0) {
            const firstWordInstance = new WordcloudWord(cleanedWord2, 1);
            this.wordMap.set(wordMapKey, firstWordInstance);
          } else {
            wordcloudWord.incrementCount();
          }
        };
        switch (this.strategy) {
          case 0:
            let misspelled = this.isMisspelling(cleanedWord, {});
            if (misspelled) {
              addToWordmap(cleanedWord);
            }
            break;
          case 1:
          default:
            addToWordmap(cleanedWord);
            break;
        }
      }
      if (!this.resultsMap.has(result.id)) {
        this.resultsMap.set(result.id, result);
      }
    }
    isMisspelling(cleanedWord, ignoredMap) {
      if (cleanedWord.match(Wordcloud.wordAnyNumberRe) !== null) {
        return false;
      }
      if (cleanedWord.match(Wordcloud.wordAnyPunctuationRe) !== null) {
        return false;
      }
      let misspelled = !Wordcloud.typo.check(cleanedWord);
      if (misspelled === true) {
        return misspelled;
      }
      const ignorable = ignoredMap[cleanedWord] !== void 0;
      const urlLeniency = HtmlUtils.isUrl(cleanedWord);
      const numericLeniency = cleanedWord.match(Wordcloud.wordNumericRe) !== null;
      const hexLeniency = cleanedWord.match(Wordcloud.wordHexRe) !== null;
      const emailLeniency = cleanedWord.match(Wordcloud.emailRegex) !== null;
      const dateLeniency = !isNaN(Date.parse(cleanedWord));
      return ignorable || numericLeniency || hexLeniency || emailLeniency || dateLeniency || urlLeniency;
    }
    async saveSvgAsImage(svgElement, fileName) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const img = document.createElement("img");
      canvas.width = Wordcloud.svgWidth;
      canvas.height = Wordcloud.svgHeight;
      const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
      const dataURL = "data:image/svg+xml;base64," + svgBase64;
      img.onload = function() {
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const pngDataURL = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = fileName;
        downloadLink.href = pngDataURL;
        downloadLink.click();
      };
      img.src = dataURL;
    }
  };
  Wordcloud.meta = {
    "title": "Website Word Cloud",
    "category": "Visualization",
    "version": "1.0.0",
    "author": "InterroBot",
    "synopsis": `create a wordcloud from website content`,
    "description": `Relive the Web 2.0 dream in all its grandeur! Website Word Cloud finds unique and 
            interesting keywords in your web content and generates a word cloud, and the tools to tweak the 
            visualization.


            Word selection is governed by strategy, extracting unique terms (jargon) or by frequency, which 
            selects for any and all terms. The Layout option changes the aesthetic of the word cloud, while 
            Min Word Length filters exactly that. For font options, you can enter any installed font on your device or 
            select from a list of "web safe" fonts.
            


            InterroBot Word Cloud utilizes the d3 and d3-cloud open-source visualization libraries to bring 
            your word clouds to life.`
  };
  Wordcloud.layouts = [
    new WordcloudLayout(1, "Separated Quad", "rectangular", true),
    new WordcloudLayout(2, "Separated Oval", "archimedean", true),
    new WordcloudLayout(3, "Stacked", "rectangular", false)
  ];
  Wordcloud.baseMediaPath = "";
  Wordcloud.embedFont = Wordcloud.baseMediaPath + "/fonts/Montserrat-SemiBold.woff2";
  Wordcloud.cloudWordLayoutMemo = void 0;
  Wordcloud.wordSplitRe = /[ —\-\/\|]/g;
  Wordcloud.wordNumericRe = /^[v]?[\d\.\-–—:,<>=×xX\(\)]+[MKBmkbgs]*$/g;
  Wordcloud.wordHexRe = /^[\da-f]{6,}$/gi;
  Wordcloud.emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  Wordcloud.wordTrimRe = /^[^\da-zA-ZÀ-ɏ]+|[^\da-zA-ZÀ-ɏ]+$/g;
  Wordcloud.wordAnyNumberRe = /\d/;
  Wordcloud.wordAnyPunctuationRe = /\p{P}/u;
  Wordcloud.svgWidth = 1920;
  Wordcloud.svgHeight = 1080;
  Wordcloud.svgId = "d3svg";
  Wordcloud.maxPresentationWords = 250;
  Wordcloud.wordsMinOutput = 12;
  Wordcloud.wordsMaxOutput = 55;
  Plugin.initialize(Wordcloud);
})();
/*!
 * Stopwords themselves (c)?2023:
 * Source: NLTK (python natural language toolkit)
 * Apache License 2.0
 * from nltk.corpus import stopwords
 * print(json.dumps(stopwords.words('english'), ensure_ascii=False))
 */
/**
 * @license
 * This code may be useful for anyone trying to escape the
 * JS packaging vortex (0 dependency, pure ts, single source file).
 * For anyone else, you're better off using your favorite package
 * manager and type definitions to the original Typo.js. Beware,
 * browser extension and node 'fs' support have been removed.
 * There are not many contact points if you want to add them back,
 * yourself. Look to Typo.js for pre-baked solutions.
 *
 * Typescript/in-browser port, (c) 2023, Ben Caulfield
 * Released under same license as original Typo.js implementation.
 *
 * Copyright (c) 2011, Christopher Finke
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * The name of the author may not be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE AUTHOR FINKE BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
