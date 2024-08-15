class HtmlProcessingWidget {

    private baseElement: HTMLElement;
    private total: number;
    private loaded: number;
    private prefix: string;
    
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

    public constructor(prefix: string) {

        this.prefix = prefix;
        this.total = 0;
        this.loaded = 0;
        this.baseElement = document.createElement("div") as HTMLElement;
        this.baseElement.id = "processingWidget";
        this.baseElement.classList.add("processing", "hidden");
        this.baseElement.innerHTML = ``;

        document.addEventListener("SearchResultHandled", async (ev: CustomEvent) => {

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
            this.baseElement.innerHTML = evdPercent > 100 ? "" : `${ this.prefix }
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

    public clearMessage(): void {
        this.baseElement.classList.remove("throbbing");
    }

    public getBaseElement(): HTMLElement {
        return this.baseElement;
    }

    public setPrefix(prefix: string): void {
        this.prefix = prefix;
    }

    public setMessage(msg: string): void {        
        this.baseElement.innerHTML = `${msg}`;
        this.baseElement.classList.add("throbbing");
    }
}

export { HtmlProcessingWidget };
