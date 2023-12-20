class HtmlProcessingWidget {

    private baseElement: HTMLElement;
    private total: number;
    private loaded: number;
    private prefix: string;
    
    public static createElement(parentElement: HTMLElement, prefix: string): HtmlProcessingWidget {

        const widget: HtmlProcessingWidget = new HtmlProcessingWidget(prefix);
        parentElement.appendChild(widget.getBaseElement());
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

            this.baseElement.innerHTML = `${ this.prefix }
                <span class="resultNum">##</span>/<span class="resultTotal">##</span>
                (<span class="percentTotal">##</span>)`;
            this.total = ev.detail.resultTotal;
            this.loaded = ev.detail.resultNum;
            const percent = Math.ceil((this.loaded / this.total) * 100);

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
                percentTotal.innerText = `${percent}%`;
            }
            // (qs(".resultNum") as HTMLElement).innerText = `${ev.detail.resultNum.toLocaleString()}`;
            // (qs(".resultTotal") as HTMLElement).innerText = `${ev.detail.resultTotal.toLocaleString()}`;
            // (qs(".percentTotal") as HTMLElement).innerText = `${percent}%`;

            if ([0, 100].indexOf(percent) >= 0) {
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
