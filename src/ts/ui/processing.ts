/**
 * Represents a widget for displaying HTML processing status.
 * @class
 */
class HtmlProcessingWidget {
    /** The base HTML element of the widget */
    private baseElement: HTMLElement;
    /** The total number of items to process */
    private total: number;
    /** The number of items currently processed */
    private loaded: number;
    /** The prefix text to display before the progress information */
    private prefix: string;
    /** Whether widget HTML is displayed */
    private active: boolean;

    /**
     * Creates a new HtmlProcessingWidget and appends it to the specified parent element.
     * @param {HTMLElement} parentElement - The parent element to which the widget will be appended.
     * @param {string} prefix - The prefix text to display before the progress information.
     * @returns {HtmlProcessingWidget} A new instance of HtmlProcessingWidget.
     */
    public static createElement(parentElement: HTMLElement, prefix: string): HtmlProcessingWidget {
        const widget: HtmlProcessingWidget = new HtmlProcessingWidget(prefix);
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
    public constructor(prefix: string) {
        this.prefix = prefix;
        this.total = 0;
        this.loaded = 0;
        this.active = true;
        this.baseElement = document.createElement("div") as HTMLElement;
        this.baseElement.id = "processingWidget";
        this.baseElement.classList.add("processing", "hidden");
        this.baseElement.innerHTML = ``;

        document.addEventListener("SearchResultHandled", async (ev: CustomEvent) => {
            if (this.active === false) {
                return;
            }
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

            const resultNum = (this.baseElement.querySelector(".resultNum") as HTMLElement);
            if (resultNum) {
                resultNum.innerText = `${ev.detail.resultNum.toLocaleString()}`;
            }
            const resultTotal = (this.baseElement.querySelector(".resultTotal") as HTMLElement);
            if (resultTotal) {
                resultTotal.innerText = `${ev.detail.resultTotal.toLocaleString()}`;
            }
            const percentTotal = (this.baseElement.querySelector(".percentTotal") as HTMLElement);
            if (percentTotal) {
                percentTotal.innerText = `${evdPercent}%`;
            }

            if ([0, 100].indexOf(evdPercent) >= 0) {
                this.baseElement.classList.remove("throbbing");
            } else {
                this.baseElement.classList.add("throbbing");
            }
        });

        document.addEventListener("ProcessingMessage", async (ev: CustomEvent) => {
            if (this.active === false) {
                return;
            }
            const action: string = ev.detail.action;
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
    public clearMessage(): void {
        this.baseElement.classList.remove("throbbing");
    }

    /**
     * Returns the base HTML element of the widget.
     * @public
     * @returns {HTMLElement} The base HTML element of the widget.
     */
    public getBaseElement(): HTMLElement {
        return this.baseElement;
    }

    /**
     * Sets a new prefix for the widget.
     * @public
     * @param {string} prefix - The new prefix to set.
     */
    public setPrefix(prefix: string): void {
        this.prefix = prefix;
    }

    /**
     * Sets a new message for the widget and adds the throbbing effect.
     * @public
     * @param {string} msg - The message to display in the widget.
     */
    public setMessage(msg: string): void {
        this.baseElement.innerHTML = `${msg}`;
        this.baseElement.classList.add("throbbing");
    }

    public setActive(active: boolean): void {
        this.active = active;
    }
}

export { HtmlProcessingWidget };
