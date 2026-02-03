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
    static logWarning(msg, ex = null) {
      const newlinedError = ex ? `
${ex}` : "";
      console.warn(`\u{1F916} ${msg}${newlinedError}`);
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
      const fields = ["name"];
      const internalHtmlPagesQuery = new SearchQuery({
        project: projectId,
        query: freeQueryString,
        fields,
        type: SearchQueryType.Any,
        includeExternal: false,
        includeNoRobots: false
      });
      const options = {
        paginate: true,
        showProgress: false,
        progressMessage: "Processing\u2026"
      };
      await Search.execute(internalHtmlPagesQuery, resultsMap, async (result) => {
        await exampleResultHandler(result, titleWords);
      }, options);
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
     * @param params - Configuration object containing project, query, fields, type, includeExternal, and includeNoRobots
     */
    constructor(params) {
      var _a, _b, _c;
      this.includeExternal = true;
      this.includeNoRobots = false;
      this.project = params.project;
      this.query = params.query;
      if (typeof params.fields === "string") {
        this.fields = params.fields.split("|");
      } else {
        this.fields = params.fields;
      }
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
      const timeStart = (/* @__PURE__ */ new Date()).getTime();
      const { paginate = false, showProgress = true, progressMessage = "Processing..." } = options !== null && options !== void 0 ? options : {};
      if (query.getHaystackCacheKey() === Search.resultsHaystackCacheKey && resultsMap) {
        const resultTotal2 = resultsMap.size;
        if (showProgress === true) {
          const eventStart = new CustomEvent("ProcessingMessage", { detail: { action: "set", message: progressMessage } });
          document.dispatchEvent(eventStart);
        }
        await Search.sleep(16);
        let i = 0;
        await resultsMap.forEach(async (result, resultId) => {
          await resultHandler(result);
        });
        Plugin.logTiming(`Processed ${resultTotal2.toLocaleString()} search result(s)`, (/* @__PURE__ */ new Date()).getTime() - timeStart);
        if (showProgress === true) {
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
        "type": query.type,
        "offset": 0,
        "fields": query.fields,
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
      while (responseJson["__meta__"]["results"]["pagination"]["nextOffset"] !== null && paginate === true) {
        const next = responseJson["__meta__"]["results"]["pagination"]["nextOffset"];
        kwargs["offset"] = next;
        if (query.sort === "?" && next > 0) {
          console.warn("Random sort (?) with pagination generates fresh randomness on each page. Consider maxing perpage (100) and using 1 page of results when sampling.");
        }
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
     * @param params - Configuration object containing id, project, created, modified, complete, time, and report
     */
    constructor(params) {
      this.id = -1;
      this.project = -1;
      this.created = null;
      this.modified = null;
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
        "fields": ["image", "created", "modified", "urls"]
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
      this.active = true;
      this.baseElement = document.createElement("div");
      this.baseElement.id = "processingWidget";
      this.baseElement.classList.add("processing", "hidden");
      this.baseElement.innerHTML = ``;
      document.addEventListener("SearchResultHandled", async (ev) => {
        if (this.active === false) {
          return;
        }
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
        if (this.active === false) {
          return;
        }
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
    setActive(active) {
      this.active = active;
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
     * @deprecated Use create() instead. This method will be removed at some point tbd.
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
      console.warn("createElement() is deprecated, use create()");
      const pagedTable = new HtmlResultsTable(project, perPage, header, headings, results, resultsSort, rowRenderer, cellRenderer, cellHandler, exportExtra);
      parentElement === null || parentElement === void 0 ? void 0 : parentElement.appendChild(pagedTable.baseElement);
      Plugin.postContentHeight();
      return pagedTable;
    }
    static create(config) {
      const {
        container,
        project,
        headings,
        results,
        perPage = 20,
        // sensible default
        header = "",
        resultsSort = new HTMLResultsTableSort("ID", SortOrder.Ascending, "ID", SortOrder.Ascending),
        rowRenderer = null,
        cellRenderer = null,
        cellHandler = null,
        exportExtra = null
      } = config;
      const pagedTable = new HtmlResultsTable(project, perPage, header, headings, results, resultsSort, rowRenderer, cellRenderer, cellHandler, exportExtra);
      container === null || container === void 0 ? void 0 : container.appendChild(pagedTable.baseElement);
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
          sortableLabel = `<a tabindex="0" class="sortable" data-heading="${HtmlUtils.htmlEncode(heading)}" href="#">${HtmlUtils.htmlEncode(encodedLabel)}</a>`;
          sortableChevronLink = `<a tabindex="-1" title="${encodedLabel}" class="sortable" data-heading="${HtmlUtils.htmlEncode(heading)}" href="#">
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
            cellContents = `<a tabindex="0" class="ulink" data-id="${HtmlUtils.htmlEncode(row[headingIdIndex])}" 
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
                        <button class="icon">${exportIconChar}</button>
                        <ul class="export__ulink">
                            <li><a tabindex="0" class="ulink" href="#" data-format="csv">Export CSV</a></li>
                            <li><a tabindex="0" class="ulink" href="#" data-format="xlsx">Export Excel</a></li>
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
        pages.push(new HTMLResultsTablePage("\u25C0", this.resultsOffset - this.perPage, this.perPage, true));
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
        pages.push(new HTMLResultsTablePage("\u25B6", this.resultsOffset + this.perPage, this.perPage, true));
        let modLast = this.resultsCount - this.resultsCount % this.perPage;
        modLast = modLast == this.resultsCount ? modLast - this.perPage : modLast;
        pages.push(new HTMLResultsTablePage("\u25B6\u25B6", modLast, this.perPage, false));
      }
      return pages;
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
      result["content"] = `<a tabindex="0" class= "ulink" 
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
        "content": `<a tabindex="0" href="${HtmlUtils.htmlEncode(interrobotPageDetail)}"
                data-id="${HtmlUtils.htmlEncode(rowData["ID"])}" 
                class="ulink">${HtmlUtils.htmlEncode(cellValue)}</a>`
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
  var Ui;
  (function(Ui2) {
    Ui2.HtmlProcessingWidget = HtmlProcessingWidget;
    Ui2.HtmlResultsTable = HtmlResultsTable;
    Ui2.Templates = Templates;
  })(Ui || (Ui = {}));
  window.InterroBot = {
    Core,
    Ui
  };
})();
