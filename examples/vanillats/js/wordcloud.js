(() => {
  // examples/vanillats/js/build/src/ts/core/html.js
  var HtmlUtils = class _HtmlUtils {
    static getDocument(html) {
      return new DOMParser().parseFromString(html, "text/html");
    }
    static getDocumentCleanText(html) {
      const dom = this.getDocument(html);
      const textUnfriendly = dom.querySelectorAll("script, style, svg, noscript, iframe");
      for (let i = textUnfriendly.length - 1; i >= 0; i--) {
        textUnfriendly[i].parentElement.removeChild(textUnfriendly[i]);
      }
      return dom;
    }
    static getDocumentCleanTextIterator(html) {
      const dom = _HtmlUtils.getDocumentCleanText(html);
      const xpath = "//text() | //meta[@name='description']/@content | //@alt";
      const texts = dom.evaluate(xpath, dom, null, XPathResult.ANY_TYPE, null);
      return texts;
    }
    static getElementTextIterator(dom, element) {
      const xpath = ".//text()";
      const texts = dom.evaluate(xpath, element, null, XPathResult.ANY_TYPE, null);
      return texts;
    }
    static getElementTextOnly(dom, element) {
      const xpr = _HtmlUtils.getElementTextIterator(dom, element);
      const texts = [];
      let node = xpr.iterateNext();
      while (node) {
        texts.push(node.nodeValue.trim());
        node = xpr.iterateNext();
      }
      return texts.join(" ");
    }
    static isUrl(str) {
      return str.match(_HtmlUtils.urlRegex) !== null;
    }
    static htmlEncode(str) {
      return new Option(str).innerHTML;
    }
  };
  HtmlUtils.urlsRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_\:]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/g;
  HtmlUtils.urlRegex = /^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_\:]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)$/;

  // examples/vanillats/js/build/src/ts/core/api.js
  var SearchQueryType;
  (function(SearchQueryType2) {
    SearchQueryType2[SearchQueryType2["Page"] = 0] = "Page";
    SearchQueryType2[SearchQueryType2["Asset"] = 1] = "Asset";
    SearchQueryType2[SearchQueryType2["Any"] = 2] = "Any";
  })(SearchQueryType || (SearchQueryType = {}));
  var PluginData = class {
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
          const value = el.checked === void 0 ? el.value : el.checked;
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
    async setDataField(key, value, push) {
      if (this.data[key] !== value) {
        this.data[key] = value;
      }
      if (push === true) {
        await this.updateData();
      }
    }
    async getData() {
      if (this.dataLoaded !== null) {
        return this.data;
      } else {
        await this.loadData();
        return this.data;
      }
    }
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
    getDataSlug() {
      const key = this.getPluginUrl();
      const b64Key = btoa(key);
      return b64Key;
    }
    getPluginUrl() {
      return `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    }
  };
  var SearchQuery = class {
    constructor(project, query, fields, type, includeExternal) {
      this.project = project;
      this.query = query;
      this.fields = fields;
      this.type = type;
      this.includeExternal = includeExternal;
    }
    getHaystackCacheKey() {
      return `${this.project}~${this.fields}~${this.type}~${this.includeExternal}`;
    }
  };
  var Search = class _Search {
    static async execute(query, existingResults, processingMessage, resultHandler) {
      const timeStart = (/* @__PURE__ */ new Date()).getTime();
      processingMessage = processingMessage !== null && processingMessage !== void 0 ? processingMessage : "Processing...";
      if (query.getHaystackCacheKey() === _Search.resultsHaystackCacheKey && existingResults) {
        const resultTotal2 = existingResults.size;
        const eventStart = new CustomEvent("ProcessingMessage", { detail: { action: "set", message: processingMessage } });
        document.dispatchEvent(eventStart);
        await _Search.sleep(16);
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
        _Search.resultsHaystackCacheKey = query.getHaystackCacheKey();
        _Search.resultsCacheTotal = 0;
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
      _Search.resultsCacheTotal = resultTotal;
      let results = responseJson.results;
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        await _Search.handleResult(result, resultTotal, resultHandler);
      }
      while (responseJson["__meta__"]["results"]["pagination"]["nextOffset"] !== null) {
        const next = responseJson["__meta__"]["results"]["pagination"]["nextOffset"];
        kwargs["offset"] = next;
        responseJson = await Plugin.postApiRequest("GetResources", kwargs);
        results = responseJson.results;
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          await _Search.handleResult(result, resultTotal, resultHandler);
        }
      }
      Plugin.logTiming(`Loaded/processed ${resultTotal.toLocaleString()} search result(s)`, (/* @__PURE__ */ new Date()).getTime() - timeStart);
      return false;
    }
    static async sleep(millis) {
      return new Promise((resolve) => setTimeout(() => resolve(), millis));
    }
    static async handleResult(jsonResult, resultTotal, resultHandler) {
      const searchResult = new SearchResult(jsonResult);
      await resultHandler(searchResult);
      const resultNum = searchResult.result;
      const event = new CustomEvent("SearchResultHandled", { detail: { resultNum, resultTotal } });
      document.dispatchEvent(event);
    }
  };
  var SearchResult = class _SearchResult {
    static normalizeContentWords(input) {
      const out = [];
      if (input !== "") {
        out.push.apply(out, input.split(/\s+/));
      }
      return out;
    }
    static normalizeContentString(input) {
      const words = _SearchResult.normalizeContentWords(input);
      return words.join(" ");
    }
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
    hasProcessedContent() {
      return this.processedContent != "";
    }
    getProcessedContent() {
      return this.processedContent;
    }
    setProcessedContent(processedContent) {
      this.processedContent = processedContent;
    }
    getContent() {
      return this.content;
    }
    getContentTextOnly() {
      const out = [];
      let element = null;
      const texts = HtmlUtils.getDocumentCleanTextIterator(this.getContent());
      element = texts.iterateNext();
      while (element !== null) {
        let elementValue = _SearchResult.normalizeContentString(element.nodeValue);
        if (elementValue !== "") {
          const elementValueWords = elementValue.split(" ").filter((word) => word !== "");
          if (elementValueWords.length > 0) {
            out.push.apply(out, elementValueWords);
          }
        }
        element = texts.iterateNext();
      }
      let pageText = out.join(" ");
      pageText = pageText.replace(_SearchResult.wordPunctuationRe, "");
      pageText = pageText.replace(_SearchResult.wordWhitespaceRe, " ");
      return pageText;
    }
    getHeaders() {
      return this.headers;
    }
    getUrlPath() {
      const url = new URL(this.url);
      return url.pathname;
    }
    clearFulltextFields() {
      this.content = "";
      this.headers = "";
    }
  };
  SearchResult.wordPunctuationRe = /\s+(?=[\.,;:!\?] )/g;
  SearchResult.wordWhitespaceRe = /\s+/g;
  var Crawl = class {
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
    getTimings() {
      return this.getReportDetailByKey("timings");
    }
    getSizes() {
      return this.getReportDetailByKey("sizes");
    }
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
  var Project = class _Project {
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
    getImageDataUri() {
      return this.imageDataUri;
    }
    getDisplayTitle() {
      return new URL(this.url).hostname;
    }
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
          return new _Project(id, created, modified, url, imageDataUri);
        }
      }
      return null;
    }
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
    // pass touch events up to iframe container, proxies the navigation show/hide
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
    getIframeSrc() {
      return this.iframeSrc;
    }
    getHostOrigin() {
      return this.hostOrigin;
    }
    getPluginOrigin() {
      return this.pluginOrigin;
    }
    toString() {
      return `host = ${this.hostOrigin}; plugin = ${this.pluginOrigin}`;
    }
  };
  var Plugin = class _Plugin {
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
    static postContentHeight() {
      const mainResults = document.querySelector(".main__results");
      let currentScrollHeight = document.body.scrollHeight;
      if (mainResults) {
        currentScrollHeight = Number(mainResults.getBoundingClientRect().bottom);
      }
      if (currentScrollHeight !== _Plugin.contentScrollHeight) {
        const msg = {
          target: "interrobot",
          data: {
            reportHeight: currentScrollHeight
          }
        };
        _Plugin.routeMessage(msg);
      }
    }
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
      _Plugin.routeMessage(msg);
    }
    static postMeta(meta) {
      const msg = {
        target: "interrobot",
        data: {
          reportMeta: meta
        }
      };
      _Plugin.routeMessage(msg);
    }
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
          _Plugin.routeMessage(msg);
        });
      };
      await getPromisedResult();
      return result;
    }
    static logTiming(msg, millis) {
      const seconds = (millis / 1e3).toFixed(3);
      console.log(`\u{1F916} [${seconds}s] ${msg}`);
    }
    static routeMessage(msg) {
      let parentOrigin = "";
      if (_Plugin.connection) {
        parentOrigin = _Plugin.connection.getHostOrigin();
        window.parent.postMessage(msg, parentOrigin);
      } else {
        window.parent.postMessage(msg);
      }
    }
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
      _Plugin.connection = new PluginConnection(document.location.href, paramOrigin);
      if (isNaN(paramProject)) {
        const errorMessage = `missing project url argument`;
        throw new Error(errorMessage);
      }
      this.data = null;
      this.projectId = paramProject;
      this.mode = isNaN(paramMode) || paramMode !== 1 ? DarkMode.Light : DarkMode.Dark;
      _Plugin.contentScrollHeight = 0;
      const modeClass = DarkMode[this.mode].toLowerCase();
      document.body.classList.remove("light", "dark");
      document.body.classList.add(modeClass);
      const tp = new TouchProxy();
    }
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    getProjectId() {
      return this.projectId;
    }
    async init(meta) {
      _Plugin.postMeta(meta);
      window.addEventListener("load", _Plugin.postContentHeight);
      window.addEventListener("resize", _Plugin.postContentHeight);
    }
    async initData(meta, defaultData, autoform) {
      this.data = new PluginData(this.getProjectId(), meta, defaultData, autoform);
      await this.data.loadData();
    }
    async initAndGetData(meta, defaultData, autoform) {
      await this.initData(meta, defaultData, autoform);
      return this.data;
    }
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
    render(html) {
      document.body.innerHTML = html;
    }
    async index() {
      this.init(_Plugin.meta);
      const project = await Project.getApiProject(this.getProjectId());
      const encodedTitle = HtmlUtils.htmlEncode(project.getDisplayTitle());
      const encodedMetaTitle = HtmlUtils.htmlEncode(_Plugin.meta["title"]);
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
      _Plugin.postContentHeight();
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
    "url": "https://example.com/path/to/plugin-page/",
    "title": "InterroBot Base Plugin",
    "category": "Core Example",
    "version": "1.0",
    "author": "InterroBot",
    "description": `Welcome to InterroBot plugin development. This base-class Plugin can already 
        query the database, draw conclusions, and report back. It's just few tweaks away from being 
        your own creation.

This is the default plugin description. Set meta: {} values
        in the source to update these display values.`
  };

  // examples/vanillats/js/build/src/ts/ui/processing.js
  var HtmlProcessingWidget = class _HtmlProcessingWidget {
    static createElement(parentElement, prefix) {
      const widget = new _HtmlProcessingWidget(prefix);
      const widgetBaseElement = widget.getBaseElement();
      if (parentElement && widgetBaseElement) {
        parentElement.appendChild(widgetBaseElement);
      } else {
        console.warn(`unable to create processing widget: parent [${parentElement}], base [${widgetBaseElement}]`);
      }
      return widget;
    }
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
    clearMessage() {
      this.baseElement.classList.remove("throbbing");
    }
    getBaseElement() {
      return this.baseElement;
    }
    setPrefix(prefix) {
      this.prefix = prefix;
    }
    setMessage(msg) {
      this.baseElement.innerHTML = `${msg}`;
      this.baseElement.classList.add("throbbing");
    }
  };

  // examples/vanillats/js/build/src/ts/ui/templates.js
  var Templates = class _Templates {
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
    static standardForm(formHtml) {
      return `<div class="main__form">${formHtml}</div>`;
    }
    static standardResults() {
      return `<div class="main__results"></div>`;
    }
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
      const lastId = (_a = _Templates.cellHandlerSameAsLastMemo[cellHeading]) !== null && _a !== void 0 ? _a : "";
      const classes = [];
      if (i > 0 && lastId === currentId) {
        classes.push("sameaslast");
      }
      _Templates.cellHandlerSameAsLastMemo[cellHeading] = currentId;
      return { "classes": classes, "content": `${HtmlUtils.htmlEncode(cellValue)}` };
    }
    static cellRendererSameAsLastLink(cellValue, rowData, i) {
      const result = _Templates.cellRendererSameAsLast(cellValue, rowData, i);
      result["content"] = `<a class= "ulink" 
            data-id="${HtmlUtils.htmlEncode(rowData["ID"])}" 
            href="${HtmlUtils.htmlEncode(cellValue)}">${HtmlUtils.htmlEncode(cellValue)}</a>`;
      return result;
    }
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
    static cellRendererWrappedContent(cellValue, rowData, i) {
      return {
        "classes": ["wrap"],
        "content": `${HtmlUtils.htmlEncode(cellValue)}`
      };
    }
  };
  Templates.cellHandlerSameAsLastMemo = {};

  // examples/vanillats/js/build/examples/vanillats/ts/wordcloud.js
  var Wordcloud = class _Wordcloud extends Plugin {
    constructor() {
      super();
      this.progress = null;
      this.init(_Wordcloud.meta);
      this.index();
    }
    async index() {
      const project = await Project.getApiProject(this.getProjectId());
      this.render(`
            ${Templates.standardHeading(project, _Wordcloud.meta["title"])}
            ${Templates.standardForm(`
            <p>Finds interesting site keywords, generates a wordcloud.</p>
            <form class="main__form__standard main__form__ltr" id="LinkForm">
                <label>
                    <span>Strategy</span>
                    <select name="strategy">
                        <option value="0">Jargon</option>
                    </select>                 
                </label>
                <label>
                    <span>Min Word Length</span>
                    <select name="perPage">
                        <option value="3" selected>3 characters</option>
                        <option value="4">4 characters</option>
                        <option value="5">5 characters</option>
                    </select>                 
                </label>
                <div><button class="submit">Report</button></div>
            </form>
            <div id="LinkFormProgress"></div>`)}
            ${Templates.standardResults()}
        `);
      const strategySelect = document.querySelector("select[name='strategy']");
      const perPageSelect = document.querySelector("select[name='perPage']");
      const progressWrapper = document.getElementById("LinkFormProgress");
      this.progress = HtmlProcessingWidget.createElement(progressWrapper, "Scanning: ");
      const defaultData = {};
      const autoformFields = [strategySelect, perPageSelect];
      await this.initData(_Wordcloud.meta, defaultData, autoformFields);
      this.perPage = Number(strategySelect.value);
      const button = document.querySelector("button");
      button.addEventListener("click", async (ev) => {
        ev.preventDefault();
        button.setAttribute("disabled", "disabled");
        try {
          await this.process();
        } finally {
          button.removeAttribute("disabled");
        }
      });
      Plugin.postContentHeight();
    }
    async process() {
      await this.report();
    }
    async report() {
    }
  };
  Wordcloud.meta = {
    "url": "https://interro.bot",
    "title": "Word Cloud",
    "category": "Fun",
    "version": "0.0.9",
    "author": "InterroBot",
    "synopsis": `create a wordcloud from website content`,
    "description": `Gonna be great.


            Check it out.`
  };
  Plugin.initialize(Wordcloud);
})();
