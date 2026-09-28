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
        return null;
      }
    }
    /**
     * Creates a Document object from HTML string with certain elements removed.
     * @param html - The HTML string to parse.
     * @returns A cleaned Document object.
     */
    static getDocumentCleanText(html) {
      var _a;
      let dom = this.getDocument(html);
      if (dom === null) {
        dom = new Document();
      }
      const textUnfriendly = dom.querySelectorAll("script, style, svg, noscript, iframe");
      for (let i = textUnfriendly.length - 1; i >= 0; i--) {
        const tu = textUnfriendly[i];
        (_a = tu.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(textUnfriendly[i]);
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
      var _a;
      const xpr = HtmlUtils.getElementTextIterator(dom, element);
      const texts = [];
      let node = xpr.iterateNext();
      while (node) {
        texts.push((_a = node.nodeValue) === null || _a === void 0 ? void 0 : _a.trim());
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
     * Encodes HTML special characters in a string. Safe for use in
     * text nodes and attribute values (escapes quotes, unlike
     * text-node serialization).
     * @param str - The string to encode.
     * @returns An HTML-encoded string.
     */
    static htmlEncode(str) {
      return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }
  };
  HtmlUtils.styleAttributeRegex = /style\s*=\s*("([^"]*)"|'([^']*)')/gi;

  // examples/vanillats/js/build/src/ts/core/host.js
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
  var Host = class {
    /**
     * Sets the connection used to pin messages to the host origin.
     * @param connection - The plugin/host connection.
     */
    static setConnection(connection) {
      Host.connection = connection;
    }
    /**
     * Wraps data in the host message envelope and delivers it to the host
     * frame, pinned to the host origin when known. All plugin-to-host
     * traffic funnels through here — prefer this over raw
     * window.parent.postMessage(msg, "*"), which delivers to any embedder.
     * @param data - The payload, e.g. { reportHeight: 640 }.
     */
    static postToHost(data) {
      Host.routeMessage({
        target: "interrobot",
        data
      });
    }
    /**
     * Sends an API request to the parent frame.
     * @param apiMethod - The API method to call.
     * @param apiKwargs - The arguments for the API call.
     * @param timeoutMillis - Milliseconds before the request rejects (default 300000).
     * @returns A promise that resolves with the API response.
     */
    static async postApiRequest(apiMethod, apiKwargs, timeoutMillis = 3e5) {
      const seq = ++Host.apiRequestSeq;
      return new Promise((resolve, reject) => {
        let timer = 0;
        const listener = (ev) => {
          var _a, _b, _c;
          var _d, _e, _f;
          if (ev.source !== window.parent) {
            return;
          }
          const hostOrigin = (_d = (_a = Host.connection) === null || _a === void 0 ? void 0 : _a.getHostOrigin()) !== null && _d !== void 0 ? _d : "";
          if (hostOrigin !== "" && ev.origin !== hostOrigin && !Host.originMismatchWarned) {
            Host.originMismatchWarned = true;
            Host.logWarning(`api response origin '${ev.origin}' != expected '${hostOrigin}'`);
          }
          const evData = ev.data;
          const evDataData = (_e = evData === null || evData === void 0 ? void 0 : evData.data) !== null && _e !== void 0 ? _e : {};
          if (evDataData && typeof evDataData === "object" && evDataData.hasOwnProperty("apiResponse")) {
            const requestMeta = (_f = (_c = (_b = evDataData.apiResponse) === null || _b === void 0 ? void 0 : _b["__meta__"]) === null || _c === void 0 ? void 0 : _c["request"]) !== null && _f !== void 0 ? _f : {};
            const seqMatched = requestMeta["seq"] === void 0 || requestMeta["seq"] === seq;
            if (apiMethod === requestMeta["method"] && seqMatched) {
              window.clearTimeout(timer);
              window.removeEventListener("message", listener);
              resolve(evDataData.apiResponse);
            }
          }
        };
        timer = window.setTimeout(() => {
          window.removeEventListener("message", listener);
          reject(new Error(`api request '${apiMethod}' (seq=${seq}) timed out after ${timeoutMillis / 1e3}s`));
        }, timeoutMillis);
        window.addEventListener("message", listener);
        Host.postToHost({
          apiRequest: {
            method: apiMethod,
            kwargs: apiKwargs,
            seq
          }
        });
      });
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
    static logWarning(msg, ex = null) {
      const newlinedError = ex ? `
${ex}` : "";
      console.warn(`\u{1F916} ${msg}${newlinedError}`);
    }
    /**
     * Delivers an enveloped message to the parent frame, pinned to the host
     * origin when known. Use postToHost(), which builds the envelope.
     * @param msg - The message to route.
     */
    static routeMessage(msg) {
      let parentOrigin = "";
      if (Host.connection) {
        parentOrigin = Host.connection.getHostOrigin();
        window.parent.postMessage(msg, parentOrigin);
      } else {
        window.parent.postMessage(msg);
      }
    }
    /**
     * Sleeps for the specified number of milliseconds. Useful to give the
     * main thread a break to paint (e.g. progress ui) mid-processing.
     * @param millis - The number of milliseconds to sleep.
     */
    static async sleep(millis) {
      return new Promise((resolve) => setTimeout(() => resolve(), millis));
    }
  };
  Host.connection = null;
  Host.apiRequestSeq = 0;
  Host.originMismatchWarned = false;

  // examples/vanillats/js/build/src/ts/core/api.js
  var SearchQueryType;
  (function(SearchQueryType2) {
    SearchQueryType2["Page"] = "page";
    SearchQueryType2["Asset"] = "asset";
    SearchQueryType2["Any"] = "any";
  })(SearchQueryType || (SearchQueryType = {}));
  var PluginData = class {
    /**
     * Creates an instance of PluginData.
     * @param params - Configuration object containing projectId, meta, defaultData, and autoformInputs
     */
    constructor(params) {
      var _a;
      this.dataLoaded = null;
      this.meta = params.meta;
      this.defaultData = params.defaultData;
      this.autoformInputs = (_a = params.autoformInputs) !== null && _a !== void 0 ? _a : [];
      this.project = params.projectId;
      this.data = {
        apiVersion: "1.1",
        autoform: {}
      };
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
          const checkedRadios = document.querySelectorAll(`input[type=radio][name=${CSS.escape(elInput.name)}]:checked`);
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
          const checkedCheckboxes = document.querySelectorAll(`input[type=checkbox][name=${CSS.escape(elInput.name)}]:checked`);
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
                const allCheckboxes = document.querySelectorAll(`input[type=checkbox][name=${CSS.escape(elInput.name)}]`);
                if (allCheckboxes.length === 1) {
                  input.addEventListener("change", async () => {
                    await changeHandler(input);
                  });
                } else if (allCheckboxes.length > 1) {
                  input.addEventListener("change", async () => {
                    await pipedHandler(input);
                  });
                }
              } else if (input.type == "radio") {
                input.addEventListener("change", async () => {
                  await radioHandler(input);
                });
              } else {
                input.addEventListener("change", async () => {
                  await changeHandler(input);
                });
              }
              break;
            case "textarea":
              const textarea = el;
              textarea.addEventListener("change", async () => {
                await changeHandler(textarea);
              });
              textarea.addEventListener("input", async () => {
                await changeHandler(textarea);
              });
              break;
            case "select":
              const select = el;
              select.addEventListener("change", async () => {
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
      var _a, _b;
      var _c, _d, _e;
      let pluginUrl = window.location.href;
      if (pluginUrl === "about:srcdoc") {
        pluginUrl = `/reports/${(_c = (_a = window.parent.document.getElementById("report")) === null || _a === void 0 ? void 0 : _a.dataset.report) !== null && _c !== void 0 ? _c : ""}/`;
      }
      const kwargs = {
        "pluginUrl": pluginUrl
      };
      const startTime = (/* @__PURE__ */ new Date()).getTime();
      const result = await Host.postApiRequest("GetPluginData", kwargs);
      const endTime = (/* @__PURE__ */ new Date()).getTime();
      try {
        Host.logTiming(`Loaded options: ${JSON.stringify(kwargs)}`, endTime - startTime);
        const jsonResponseData = result["data"];
        const jsonResponseDataEmpty = Object.keys(jsonResponseData).length === 0;
        const merged = {};
        for (const k in this.defaultData) {
          merged[k] = this.defaultData[k];
        }
        for (const k in jsonResponseData) {
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
          const defaultProjectData = (_d = (_b = this.defaultData["autoform"]) === null || _b === void 0 ? void 0 : _b[this.project]) !== null && _d !== void 0 ? _d : {};
          this.data["autoform"][this.project] = defaultProjectData;
        }
      }
      const radioGroups = [];
      for (let el of this.autoformInputs) {
        if (el === null) {
          continue;
        }
        const name = el.name;
        const val = (_e = this.data["autoform"][this.project][name]) !== null && _e !== void 0 ? _e : null;
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
        const hasCheck = document.querySelector(`input[name=${CSS.escape(inputName)}]:checked`) !== null;
        if (!hasCheck) {
          const firstRadio = document.querySelector(`input[name=${CSS.escape(inputName)}]`);
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
      const result = await Host.postApiRequest("SetPluginData", kwargs);
      return;
    }
  };
  var SearchQuery = class {
    /**
     * Creates an instance of SearchQuery. Only project and query are
     * required, remaining params have sensible defaults.
     * @param params - Configuration object containing project, query, fields, type, includeExternal, and includeNoRobots
     */
    constructor(params) {
      var _a, _b, _c, _d, _e;
      this.includeExternal = true;
      this.includeNoRobots = false;
      this.project = params.project;
      this.query = params.query;
      if (typeof params.fields === "string") {
        this.fields = params.fields.split("|");
      } else {
        this.fields = (_a = params.fields) !== null && _a !== void 0 ? _a : [];
      }
      this.type = (_b = params.type) !== null && _b !== void 0 ? _b : SearchQueryType.Any;
      this.includeExternal = (_c = params.includeExternal) !== null && _c !== void 0 ? _c : true;
      this.includeNoRobots = (_d = params.includeNoRobots) !== null && _d !== void 0 ? _d : false;
      this.perPage = (_e = params.perPage) !== null && _e !== void 0 ? _e : SearchQuery.maxPerPage;
      if (params.sort !== void 0 && SearchQuery.validSorts.indexOf(params.sort) >= 0) {
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
      return `${this.project}~${this.fields.join("|")}~${this.type}~${this.includeExternal}~${this.includeNoRobots}`;
    }
  };
  SearchQuery.maxPerPage = 100;
  SearchQuery.validSorts = ["?", "id", "-id", "time", "-time", "status", "-status", "url", "-url"];
  var Search = class {
    /**
     * Executes a search query.
     * @param query - The search query to execute
     * @param resultsMap - Map of existing results
     * @param resultHandler - Function to handle each search result
     * @param options - Optional configuration for pagination, progress display, and custom messages
     * @returns A promise that resolves to a boolean indicating if results were from cache
     */
    static async execute(query, resultsMap, resultHandler, options) {
      Host.logWarning(Search.executeDeprecationWarning);
      const timeStart = (/* @__PURE__ */ new Date()).getTime();
      const { paginate = false, showProgress = true, progressMessage = "Processing..." } = options !== null && options !== void 0 ? options : {};
      if (resultsMap && Search.resultsCache.get(resultsMap) === query.getHaystackCacheKey()) {
        const resultTotal2 = resultsMap.size;
        if (showProgress === true) {
          const eventStart = new CustomEvent("ProcessingMessage", { detail: { action: "set", message: progressMessage } });
          document.dispatchEvent(eventStart);
        }
        await Host.sleep(16);
        for (const result of resultsMap.values()) {
          await resultHandler(result);
        }
        Host.logTiming(`Processed ${resultTotal2.toLocaleString()} search result(s)`, (/* @__PURE__ */ new Date()).getTime() - timeStart);
        if (showProgress === true) {
          const msg = { detail: { action: "clear" } };
          const eventFinished = new CustomEvent("ProcessingMessage", msg);
          document.dispatchEvent(eventFinished);
        }
        return true;
      } else if (resultsMap) {
        Search.resultsCache.set(resultsMap, query.getHaystackCacheKey());
      }
      const kwargs = {
        "project": query.project,
        "query": query.query,
        "external": query.includeExternal,
        "type": query.type,
        "offset": 0,
        "fields": query.fields,
        "norobots": query.includeNoRobots,
        "sort": query.sort,
        "perpage": query.perPage
      };
      let responseJson = await Host.postApiRequest("GetResources", kwargs);
      const resultTotal = responseJson["__meta__"]["results"]["total"];
      let results = responseJson.results;
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        await Search.handleResult(result, resultTotal, resultHandler, showProgress);
      }
      while (responseJson["__meta__"]["results"]["pagination"]["nextOffset"] !== null && paginate === true) {
        const next = responseJson["__meta__"]["results"]["pagination"]["nextOffset"];
        kwargs["offset"] = next;
        if (query.sort === "?" && next > 0) {
          console.warn("Random sort (?) with pagination generates fresh randomness on each page. Consider maxing perpage (100) and using 1 page of results when sampling.");
        }
        responseJson = await Host.postApiRequest("GetResources", kwargs);
        results = responseJson.results;
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          await Search.handleResult(result, resultTotal, resultHandler, showProgress);
        }
      }
      Host.logTiming(`Loaded/processed ${resultTotal.toLocaleString()} search result(s)`, (/* @__PURE__ */ new Date()).getTime() - timeStart);
      return false;
    }
    /**
     * Streams search results as an async iterator, paginating internally.
     * The streamlined alternative to execute():
     *
     *     for await (const result of Search.results(query)) { ... }
     *
     * No implicit caching, progress events are opt-in — break out of the
     * loop anytime to stop fetching.
     * @param query - The search query to execute
     * @param options - Optional; showProgress emits SearchResultHandled events
     * @returns An async generator yielding each SearchResult
     */
    static async *results(query, options) {
      var _a;
      const showProgress = (_a = options === null || options === void 0 ? void 0 : options.showProgress) !== null && _a !== void 0 ? _a : false;
      const kwargs = {
        "project": query.project,
        "query": query.query,
        "external": query.includeExternal,
        "type": query.type,
        "offset": 0,
        "fields": query.fields,
        "norobots": query.includeNoRobots,
        "sort": query.sort,
        "perpage": query.perPage
      };
      while (true) {
        const responseJson = await Host.postApiRequest("GetResources", kwargs);
        const resultTotal = responseJson["__meta__"]["results"]["total"];
        for (const jsonResult of responseJson.results) {
          const searchResult = new SearchResult(jsonResult);
          yield searchResult;
          if (showProgress) {
            Search.dispatchResultHandled(searchResult.result, resultTotal);
          }
        }
        const nextOffset = responseJson["__meta__"]["results"]["pagination"]["nextOffset"];
        if (nextOffset === null) {
          return;
        }
        if (query.sort === "?" && kwargs["offset"] === 0) {
          console.warn("Random sort (?) with pagination generates fresh randomness on each page. Consider maxing perpage (100) and using 1 page of results when sampling.");
        }
        kwargs["offset"] = nextOffset;
      }
    }
    /**
     * Handles a single search result.
     * @param jsonResult - The JSON representation of the search result.
     * @param resultTotal - The total number of results.
     * @param resultHandler - Function to handle the search result.
     * @param showProgress - Whether to emit a SearchResultHandled progress event.
     */
    static async handleResult(jsonResult, resultTotal, resultHandler, showProgress) {
      const searchResult = new SearchResult(jsonResult);
      await resultHandler(searchResult);
      if (showProgress) {
        Search.dispatchResultHandled(searchResult.result, resultTotal);
      }
    }
    /**
     * Dispatches the SearchResultHandled progress event.
     * @param resultNum - The 1-based position of the handled result.
     * @param resultTotal - The total number of results.
     */
    static dispatchResultHandled(resultNum, resultTotal) {
      const event = new CustomEvent("SearchResultHandled", { detail: { resultNum, resultTotal } });
      document.dispatchEvent(event);
    }
  };
  Search.executeDeprecationWarning = `"execute" search method is deprecated, use "results" instead.`;
  Search.resultsCache = /* @__PURE__ */ new WeakMap();
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
      var _a, _b;
      this.result = jsonResult.result;
      this.id = jsonResult.id;
      this.url = (_a = jsonResult.url) !== null && _a !== void 0 ? _a : "";
      this.name = (_b = jsonResult.name) !== null && _b !== void 0 ? _b : "";
      this.processedContent = "";
      for (const field of SearchResult.optionalFields) {
        if (field in jsonResult) {
          const value = jsonResult[field];
          if (field === "created" || field === "modified") {
            this[field] = new Date(value);
          } else {
            this[field] = value;
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
      var _a;
      const out = [];
      let element = null;
      const texts = HtmlUtils.getDocumentCleanTextIterator(this.getContent());
      element = texts.iterateNext();
      while (element !== null) {
        let elementValue = SearchResult.normalizeContentString((_a = element.nodeValue) !== null && _a !== void 0 ? _a : "");
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
  SearchResult.optionalFields = [
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
  var Crawl = class {
    /**
     * Creates an instance of Crawl.
     * @param params - Configuration object containing id, project, created, modified, complete, time, and report
     */
    constructor(params) {
      var _a, _b, _c, _d, _e;
      this.id = -1;
      this.project = -1;
      this.created = null;
      this.modified = null;
      this.time = -1;
      this.report = null;
      this.id = params.id;
      this.project = params.project;
      this.created = (_a = params.created) !== null && _a !== void 0 ? _a : null;
      this.modified = (_b = params.modified) !== null && _b !== void 0 ? _b : null;
      this.complete = (_c = params.complete) !== null && _c !== void 0 ? _c : false;
      this.time = (_d = params.time) !== null && _d !== void 0 ? _d : -1;
      this.report = (_e = params.report) !== null && _e !== void 0 ? _e : null;
    }
    /**
     * Gets the timings from the crawl report.
     * @returns The timings object, or null (InterroBot pre-2.6).
     */
    getTimings() {
      return this.getReportDetailByKey("timings");
    }
    /**
     * Gets the sizes from the crawl report.
     * @returns The sizes object, or null (InterroBot pre-2.6).
     */
    getSizes() {
      return this.getReportDetailByKey("sizes");
    }
    /**
     * Gets the counts from the crawl report.
     * @returns The counts object, or null (InterroBot pre-2.6).
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
     * @param params - Configuration object containing id, created, modified, name, type, url, urls, and imageDataUri
     */
    constructor(params) {
      this.id = -1;
      this.created = null;
      this.modified = null;
      this.name = null;
      this.type = null;
      this.url = null;
      this.urls = null;
      this.imageDataUri = null;
      this.id = params.id;
      this.name = params.name;
      this.type = params.type;
      this.created = params.created;
      this.modified = params.modified;
      this.url = params.url;
      this.urls = params.urls;
      this.imageDataUri = params.imageDataUri;
    }
    /**
     * Gets the data URI of the project image.
     * @returns The image data URI.
     */
    getImageDataUri() {
      var _a;
      return (_a = this.imageDataUri) !== null && _a !== void 0 ? _a : "";
    }
    /**
     * Gets the display title of the project.
     * @returns The display title (hostname of the project URL).
     */
    getDisplayTitle() {
      if (this.name) {
        return this.name;
      } else if (this.url) {
        Host.logWarning(Project.urlDeprecationWarning);
        return new URL(this.url).hostname;
      } else {
        Host.logWarning(`project ${this.id} display title unavailable, "name" empty`);
        return "";
      }
    }
    getDisplayUrl() {
      if (this.urls) {
        const firstUrl = this.urls[0];
        const urlCount = this.urls.length;
        const more = urlCount > 1 ? ` + ${urlCount - 1} more` : "";
        return `${firstUrl}${more}`;
      } else if (this.url) {
        Host.logWarning(Project.urlDeprecationWarning);
        return new URL(this.url).hostname;
      } else {
        Host.logWarning(`project ${this.id} display url unavailable, "urls" empty`);
        return "";
      }
    }
    /**
     * Gets a project by its ID from the API.
     * @param id - The project ID.
     * @returns A promise that resolves to a Project instance.
     * @throws If no project matches the id.
     */
    static async getApiProject(id) {
      const kwargs = {
        "projects": [id],
        "fields": ["image", "created", "modified", "urls"]
      };
      const projects = await Host.postApiRequest("GetProjects", kwargs);
      const results = projects.results;
      for (let i = 0; i < results.length; i++) {
        const project = results[i];
        if (project.id === id) {
          const created = new Date(project.created);
          const modified = new Date(project.modified);
          const name = project.name || project.url;
          const imageDataUri = project.image;
          const urls = project.urls || null;
          return new Project({
            id,
            created,
            modified,
            name,
            imageDataUri,
            urls
          });
        }
      }
      throw new Error(`project id=${id} not found`);
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
      const response = await Host.postApiRequest("GetCrawls", kwargs);
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
  Project.urlDeprecationWarning = `"url" field is deprecated, use "name" or "urls" instead.`;
  Project.urlDeprectionWarning = Project.urlDeprecationWarning;

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
      let primeTouch;
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
      Host.postToHost({
        reportTouch: touchData
      });
    }
  };

  // examples/vanillats/js/build/src/ts/core/plugin.js
  var DarkMode;
  (function(DarkMode2) {
    DarkMode2[DarkMode2["Light"] = 0] = "Light";
    DarkMode2[DarkMode2["Dark"] = 1] = "Dark";
  })(DarkMode || (DarkMode = {}));
  var Plugin = class {
    /**
     * Initializes the plugin class.
     * @param classtype - The plugin subclass to instantiate when the page is ready.
     * @returns A promise resolving to the instance of the initialized class.
     */
    static async initialize(classtype) {
      const createAndConfigure = () => {
        const instance = new classtype();
        Plugin.postMeta(instance.getInstanceMeta());
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
        Plugin.postToHost({
          reportHeight: constrainedHeight
        });
      }
    }
    /**
     * Posts a request to open a resource link.
     * @param resource - The resource identifier.
     * @param openInBrowser - Whether to open the link in a browser.
     */
    static postOpenResourceLink(resource, openInBrowser) {
      Plugin.postToHost({
        reportLink: {
          openInBrowser,
          resource
        }
      });
    }
    /**
     * Posts plugin metadata to the parent frame.
     * @param meta - The metadata object to post.
     */
    static postMeta(meta) {
      Plugin.postToHost({
        reportMeta: meta
      });
    }
    /**
     * Wraps data in the host message envelope and delivers it to the host
     * frame. See Host.postToHost().
     * @param data - The payload, e.g. { reportHeight: 640 }.
     */
    static postToHost(data) {
      Host.postToHost(data);
    }
    /**
     * Sends an API request to the parent frame. See Host.postApiRequest().
     * @param apiMethod - The API method to call.
     * @param apiKwargs - The arguments for the API call.
     * @param timeoutMillis - Milliseconds before the request rejects (default 300000).
     * @returns A promise that resolves with the API response.
     */
    static async postApiRequest(apiMethod, apiKwargs, timeoutMillis = 3e5) {
      return Host.postApiRequest(apiMethod, apiKwargs, timeoutMillis);
    }
    /**
     * Logs timing information to the console.
     * @param msg - The message to log.
     * @param millis - The time in milliseconds.
     */
    static logTiming(msg, millis) {
      Host.logTiming(msg, millis);
    }
    /**
     * Logs warning information to the console.
     * @param msg - The message to log.
     */
    static logWarning(msg, ex = null) {
      Host.logWarning(msg, ex);
    }
    /**
     * Sleeps for the specified number of milliseconds. Useful to give the
     * main thread a break to paint (e.g. progress ui) mid-processing.
     * @param millis - The number of milliseconds to sleep.
     */
    static async sleep(millis) {
      return Host.sleep(millis);
    }
    /** @deprecated casing, use getStaticBasePath() */
    static GetStaticBasePath() {
      return Plugin.getStaticBasePath();
    }
    static getStaticBasePath() {
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
      var _a, _b, _c, _d, _e;
      this.data = null;
      this.projectId = -1;
      this.mode = DarkMode.Light;
      this.project = null;
      let paramProject;
      let paramMode;
      let paramOrigin;
      if (this.parentIsOrigin()) {
        const ifx = window.parent.document.getElementById("report");
        paramProject = parseInt((_a = ifx === null || ifx === void 0 ? void 0 : ifx.dataset.project) !== null && _a !== void 0 ? _a : "", 10);
        paramMode = parseInt((_b = ifx === null || ifx === void 0 ? void 0 : ifx.dataset.mode) !== null && _b !== void 0 ? _b : "", 10);
        paramOrigin = (_c = ifx === null || ifx === void 0 ? void 0 : ifx.dataset.origin) !== null && _c !== void 0 ? _c : null;
      } else {
        const urlSearchParams = new URLSearchParams(window.location.search);
        paramProject = parseInt((_d = urlSearchParams.get("project")) !== null && _d !== void 0 ? _d : "", 10);
        paramMode = parseInt((_e = urlSearchParams.get("mode")) !== null && _e !== void 0 ? _e : "", 10);
        paramOrigin = urlSearchParams.get("origin");
      }
      Host.setConnection(new PluginConnection(document.location.href, paramOrigin));
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
      return Plugin.sleep(ms);
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
      return this.constructor.meta;
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
     * Gets the plugin's project. Cached after first fetch.
     * @returns A promise that resolves with the current Project.
     * @throws If the project can't be retrieved — an unrecoverable
     *   state, the host supplied the project id at load.
     */
    async getProject() {
      if (this.project === null) {
        this.project = await Project.getApiProject(this.projectId);
      }
      return this.project;
    }
    /**
     * Streams search results for this plugin's project, paginating
     * internally. The simplest path from query to results:
     *
     *     for await (const result of this.search("headers: text/html", { fields: ["name"] })) {
     *         // result is a SearchResult
     *     }
     *
     * @param query - The query, exactly as you'd type it into InterroBot search.
     * @param options - Optional SearchQuery params (fields, type, sort, etc.); project and query come from context.
     * @returns An async generator yielding each SearchResult.
     */
    search(query, options) {
      return Search.results(new SearchQuery({
        project: this.projectId,
        query,
        ...options
      }));
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
      var _a;
      const project = await this.getProject();
      const encodedTitle = HtmlUtils.htmlEncode(project.getDisplayTitle());
      const encodedMetaTitle = HtmlUtils.htmlEncode((_a = this.getInstanceMeta()["title"]) !== null && _a !== void 0 ? _a : "");
      this.render(`
            <div class="main__heading">
                <div class="main__heading__icon">
                    <img id="projectIcon" src="${HtmlUtils.htmlEncode(project.getImageDataUri())}" alt="Icon for ${encodedTitle}" />
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
      var _a;
      const titleWords = /* @__PURE__ */ new Map();
      for await (const result of this.search("headers: text/html", { fields: ["name"], includeExternal: false })) {
        const terms = result.name.trim().split(/[\s\-—]+/g);
        for (const term of terms) {
          titleWords.set(term, ((_a = titleWords.get(term)) !== null && _a !== void 0 ? _a : 0) + 1);
        }
      }
      await this.report(titleWords);
    }
    /**
     * Generates and displays a report based on the processed data.
     * @param titleWords - A map of title words and their counts.
     */
    async report(titleWords) {
      var _a;
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
        const count = (_a = titleWordsRemap.get(term)) !== null && _a !== void 0 ? _a : 0;
        const truncatedTerm = term.length > 24 ? term.substring(0, 24) + "\u2026" : term;
        tableRows.push(`<tr><td>${HtmlUtils.htmlEncode(truncatedTerm)}</td><td>${count.toLocaleString()}</td></tr>`);
      }
      const resultsElement = document.querySelector(".main__results");
      if (resultsElement) {
        resultsElement.innerHTML = tableRows.length === 0 ? `<p>No results found.</p>` : `<div><section><table style="max-width:340px">
                <thead><tr><th>Term</th><th>Count</th></tr></thead>
                <tbody>${tableRows.join("")}</tbody>
                </table></section></div>`;
      }
      Plugin.postContentHeight();
    }
    parentIsOrigin() {
      try {
        if (!window.parent || window.parent === window) {
          return false;
        }
        return Boolean(window.parent.document);
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

  // examples/vanillats/js/build/examples/vanillats/ts/interrobot-plugin.js
  var Core;
  (function(Core2) {
    Core2.Project = Project;
    Core2.SearchQueryType = SearchQueryType;
    Core2.SearchQuery = SearchQuery;
    Core2.Search = Search;
    Core2.SearchResult = SearchResult;
    Core2.PluginData = PluginData;
    Core2.HtmlUtils = HtmlUtils;
    Core2.Plugin = Plugin;
  })(Core || (Core = {}));
  window.InterroBot = {
    Core
  };
})();
