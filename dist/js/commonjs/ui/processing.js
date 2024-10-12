"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlProcessingWidget = void 0;
/**
 * Represents a widget for displaying HTML processing status.
 * @class
 */
class HtmlProcessingWidget {
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
        }
        else {
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
            const evdPercent = Math.ceil((evdLoaded / evdTotal) * 100);
            const currentPercent = Math.ceil((this.loaded / this.total) * 100);
            if (evdPercent > 100.0 || currentPercent === 100.0) {
                // out of order or freak event, close up shop (rather, keep shop closed)
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
            }
            else {
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
}
exports.HtmlProcessingWidget = HtmlProcessingWidget;
